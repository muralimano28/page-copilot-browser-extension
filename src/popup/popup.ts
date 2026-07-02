import browser from 'webextension-polyfill';
import { ExtensionStorage } from '../shared/storage';
import { ExtensionMessenger } from '../shared/messaging';
import { applyTheme } from '../shared/theme';

// Elements
const toggleEnabled = document.getElementById('toggle-enabled') as HTMLInputElement;
const statusText = document.getElementById('status-text') as HTMLSpanElement;
const btnOptions = document.getElementById('btn-options') as HTMLButtonElement;
const btnSummarize = document.getElementById('btn-summarize') as HTMLButtonElement;
const summaryPlaceholder = document.getElementById('summary-placeholder') as HTMLParagraphElement;
const summaryLoading = document.getElementById('summary-loading') as HTMLDivElement;
const summaryText = document.getElementById('summary-text') as HTMLParagraphElement;

const noteInput = document.getElementById('note-input') as HTMLInputElement;
const btnHighlight = document.getElementById('btn-highlight') as HTMLButtonElement;
const btnAddNote = document.getElementById('btn-add-note') as HTMLButtonElement;
const btnClearNotes = document.getElementById('btn-clear-notes') as HTMLButtonElement;
const notesList = document.getElementById('notes-list') as HTMLUListElement;

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Apply theme
    await applyTheme();

    // Restore settings
    const settings = await ExtensionStorage.getAll();
    toggleEnabled.checked = settings.copilotEnabled;
    updateStatusUI(settings.copilotEnabled);
    renderNotes(settings.savedNotes);

    // Set listeners
    toggleEnabled.addEventListener('change', handleToggleEnabled);
    btnOptions.addEventListener('click', handleOpenOptions);
    btnSummarize.addEventListener('click', handleSummarizePage);
    btnHighlight.addEventListener('click', handleHighlightOnPage);
    btnAddNote.addEventListener('click', handleSaveNote);
    btnClearNotes.addEventListener('click', handleClearAllNotes);
  } catch (error) {
    console.error('[Popup] Failed initialization:', error);
  }
});

// Update Status UI
function updateStatusUI(enabled: boolean): void {
  if (enabled) {
    statusText.innerText = 'Active';
    statusText.classList.add('active');
  } else {
    statusText.innerText = 'Disabled';
    statusText.classList.remove('active');
  }
}

// Handles toggle event
async function handleToggleEnabled(): Promise<void> {
  const enabled = toggleEnabled.checked;
  await ExtensionStorage.set('copilotEnabled', enabled);
  updateStatusUI(enabled);
}

// Opens option page
async function handleOpenOptions(): Promise<void> {
  await browser.runtime.openOptionsPage();
}

// Handles Page Summarization via Background Script
async function handleSummarizePage(): Promise<void> {
  summaryPlaceholder.classList.add('hidden');
  summaryText.classList.add('hidden');
  summaryLoading.classList.remove('hidden');
  
  try {
    const response = await ExtensionMessenger.sendMessage<{ summary: string }>({
      type: 'GET_PAGE_SUMMARY',
    });
    
    summaryText.innerText = response.summary;
    summaryText.classList.remove('hidden');
  } catch (error) {
    console.error('[Popup] Failed to retrieve page summary:', error);
    summaryText.innerText = 'Error: Failed to fetch summary. Ensure you are on a valid webpage context.';
    summaryText.classList.remove('hidden');
  } finally {
    summaryLoading.classList.add('hidden');
  }
}

// Sends message to Content Script to highlight selected text
async function handleHighlightOnPage(): Promise<void> {
  const noteVal = noteInput.value.trim();
  
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      alert('Error: Active tab not found.');
      return;
    }
    
    // Check if the tab has a valid web URL (exclude internal browser urls)
    if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('about:') || tab.url.startsWith('edge://'))) {
      alert('Cannot run highlights on internal browser pages.');
      return;
    }
    
    // Send message directly to the content script of active tab
    const response = await browser.tabs.sendMessage(tab.id, {
      type: 'HIGHLIGHT_SELECTION',
      payload: { text: noteVal },
    });
    
    if (response?.success) {
      if (noteVal) {
        await addNote(noteVal);
        noteInput.value = '';
      } else {
        // Fetch selected text from active tab as a fallback note
        const results = await browser.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => window.getSelection()?.toString() || '',
        });
        const selectedText = results[0]?.result?.trim();
        if (selectedText) {
          await addNote(`Highlight: "${selectedText}"`);
        }
      }
    } else {
      alert('No text is currently selected on the page. Please highlight text on the web page first.');
    }
  } catch (error) {
    console.error('[Popup] Highlight interaction failed:', error);
    alert('Unable to interact with page. Try reloading the webpage to re-inject the content script.');
  }
}

// Save custom note locally
async function handleSaveNote(): Promise<void> {
  const text = noteInput.value.trim();
  if (!text) return;

  await addNote(text);
  noteInput.value = '';
}

// Add Note Helper
async function addNote(text: string): Promise<void> {
  const notes = await ExtensionStorage.get('savedNotes');
  const updatedNotes = [text, ...notes];
  await ExtensionStorage.set('savedNotes', updatedNotes);
  renderNotes(updatedNotes);
}

// Clear all notes
async function handleClearAllNotes(): Promise<void> {
  await ExtensionStorage.set('savedNotes', []);
  renderNotes([]);
}

// Delete single note
async function handleDeleteNote(index: number): Promise<void> {
  const notes = await ExtensionStorage.get('savedNotes');
  notes.splice(index, 1);
  await ExtensionStorage.set('savedNotes', notes);
  renderNotes(notes);
}

// Render Notes List
function renderNotes(notes: string[]): void {
  notesList.innerHTML = '';
  
  if (notes.length === 0) {
    btnClearNotes.classList.add('hidden');
    const emptyLi = document.createElement('li');
    emptyLi.className = 'empty-list-msg';
    emptyLi.innerText = 'No saved notes yet.';
    notesList.appendChild(emptyLi);
    return;
  }
  
  btnClearNotes.classList.remove('hidden');
  
  notes.forEach((note, index) => {
    const li = document.createElement('li');
    
    const noteTextSpan = document.createElement('span');
    noteTextSpan.innerText = note;
    li.appendChild(noteTextSpan);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-note-btn';
    deleteBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor">
        <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v-40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
      </svg>
    `;
    deleteBtn.addEventListener('click', () => handleDeleteNote(index));
    li.appendChild(deleteBtn);
    
    notesList.appendChild(li);
  });
}
