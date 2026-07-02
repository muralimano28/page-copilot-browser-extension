import browser from 'webextension-polyfill';
import { ExtensionStorage } from '../shared/storage';
import { ExtensionMessenger } from '../shared/messaging';
import { applyTheme } from '../shared/theme';

// Elements
const modelBadge = document.getElementById('model-badge') as HTMLSpanElement;
const btnOptions = document.getElementById('btn-options') as HTMLButtonElement;
const chatThread = document.getElementById('chat-thread') as HTMLDivElement;
const chatLoading = document.getElementById('chat-loading') as HTMLDivElement;
const queryInput = document.getElementById('query-input') as HTMLTextAreaElement;
const btnSend = document.getElementById('btn-send') as HTMLButtonElement;
const sidebarModelSelect = document.getElementById('select-sidebar-model') as HTMLSelectElement;

// Conversation History State
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
const messageHistory: ChatMessage[] = [];

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Apply visual theme
    await applyTheme();

    // Display model badge and populate dropdown models
    const settings = await ExtensionStorage.getAll();
    updateModelBadge(settings.selectedModel);
    populateSidebarModels(settings.selectedModel);

    // Event Listeners
    btnOptions.addEventListener('click', handleOpenOptions);
    btnSend.addEventListener('click', handleSendMessage);
    queryInput.addEventListener('input', handleQueryInput);
    queryInput.addEventListener('keydown', handleKeydown);

    // Initial input adjustment
    handleQueryInput();
  } catch (error) {
    console.error('[Sidebar] Initialization failed:', error);
  }
});

// Dynamically populate available models depending on selected provider
function populateSidebarModels(provider: 'gemini' | 'openai' | 'anthropic'): void {
  sidebarModelSelect.innerHTML = '';
  
  const modelsMap = {
    gemini: [
      { value: 'gemini-2.5-flash', text: 'Gemini 2.5 Flash (Fast/Eco)' },
      { value: 'gemini-2.5-pro', text: 'Gemini 2.5 Pro (Power)' },
      { value: 'gemini-2.0-flash', text: 'Gemini 2.0 Flash' },
      { value: 'gemini-1.5-flash', text: 'Gemini 1.5 Flash' },
      { value: 'gemini-1.5-pro', text: 'Gemini 1.5 Pro' }
    ],
    openai: [
      { value: 'gpt-4o-mini', text: 'GPT-4o Mini (Fast)' },
      { value: 'gpt-4o', text: 'GPT-4o (Strong)' }
    ],
    anthropic: [
      { value: 'claude-3-5-sonnet-20240620', text: 'Claude 3.5 Sonnet' },
      { value: 'claude-3-5-haiku-20241022', text: 'Claude 3.5 Haiku' }
    ]
  };

  const list = modelsMap[provider] || [];
  list.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.value;
    opt.innerText = m.text;
    sidebarModelSelect.appendChild(opt);
  });
}

// Sync badge name based on stored model
function updateModelBadge(model: 'gemini' | 'openai' | 'anthropic'): void {
  const modelNames = {
    gemini: 'Google Gemini',
    openai: 'OpenAI GPT-4o',
    anthropic: 'Claude 3.5 Sonnet'
  };
  modelBadge.innerText = modelNames[model] || 'Copilot';
}

// Adjust textarea height dynamically & enable send button
function handleQueryInput(): void {
  // Auto-resize input height
  queryInput.style.height = 'auto';
  queryInput.style.height = `${queryInput.scrollHeight}px`;

  const query = queryInput.value.trim();
  btnSend.disabled = !query;
}

// Open extension settings options page
async function handleOpenOptions(): Promise<void> {
  try {
    await browser.runtime.openOptionsPage();
  } catch (err) {
    console.error('[Sidebar] Failed to open options page:', err);
  }
}

// Handle key inputs - Enter key triggers send (without Shift)
function handleKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (queryInput.value.trim()) {
      handleSendMessage();
    }
  }
}

// Send current query and query active page context
async function handleSendMessage(): Promise<void> {
  const query = queryInput.value.trim();
  if (!query) return;

  // Clear input
  queryInput.value = '';
  handleQueryInput();

  // Hide welcome guide if first message
  const welcome = document.querySelector('.welcome-container');
  if (welcome) {
    welcome.classList.add('hidden');
  }

  // Render User Message bubble
  appendMessageBubble('user', query);

  // Show thinking loading indicator
  chatLoading.classList.remove('hidden');
  scrollToBottom();

  try {
    // 1. Get DOM content from active tab
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

    let pageContext = { title: '', description: '', text: '' };

    if (tab?.id) {
      try {
        // Send message to Content Script on tab
        pageContext = await browser.tabs.sendMessage(tab.id, { type: 'GET_PAGE_CONTEXT' });
      } catch (err) {
        console.warn('[Sidebar] Failed to get context from page DOM script. Defaulting to tab details:', err);
        pageContext = {
          title: tab.title || 'Unknown Webpage',
          description: '',
          text: `Unable to read page DOM context. This occurs on internal browser pages (e.g. chrome://, about:), PDF files, or pages loaded prior to extension installation. Details: ${err instanceof Error ? err.message : String(err)}`
        };
      }
    } else {
      pageContext = {
        title: 'Unknown Tab',
        description: '',
        text: 'No active browser tab detected.'
      };
    }

    console.log("[Sidebar] Page context: ", pageContext);

    // 2. Add current message to temp history list
    const currentPayload = [...messageHistory, { role: 'user', content: query } as ChatMessage];

    // 3. Dispatch completion request to background script
    const result = await ExtensionMessenger.sendMessage<any>({
      type: 'SEND_CHAT_QUERY',
      payload: {
        messages: currentPayload,
        pageContext: pageContext,
        model: sidebarModelSelect.value
      }
    });

    // Hide loader
    chatLoading.classList.add('hidden');

    if (result && result.error) {
      appendErrorBubble(result.error);
    } else if (result && result.text) {
      // Save valid exchange to history
      messageHistory.push({ role: 'user', content: query });
      messageHistory.push({ role: 'assistant', content: result.text });

      appendMessageBubble('assistant', result.text);
    } else {
      appendErrorBubble('No response received from model endpoint.');
    }
  } catch (error: any) {
    chatLoading.classList.add('hidden');
    console.error('[Sidebar] Failed to execute query:', error);
    appendErrorBubble(`Failed to complete request: ${error.message || error}`);
  }

  scrollToBottom();
}

// Append Chat Message Bubble to scroll view
function appendMessageBubble(role: 'user' | 'assistant', text: string): void {
  const bubble = document.createElement('div');
  bubble.className = `message-bubble ${role}`;
  bubble.innerText = text;
  chatThread.appendChild(bubble);
}

// Append Chat Error bubble
function appendErrorBubble(errText: string): void {
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble error-msg';
  bubble.innerText = `Error: ${errText}`;
  chatThread.appendChild(bubble);
}

// Scroll chat thread to bottom
function scrollToBottom(): void {
  chatThread.scrollTop = chatThread.scrollHeight;
}
