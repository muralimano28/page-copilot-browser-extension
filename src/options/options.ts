import { ExtensionStorage } from '../shared/storage';
import { applyTheme } from '../shared/theme';

// Elements
const themeSelect = document.getElementById('select-theme') as HTMLSelectElement;
const modelSelect = document.getElementById('select-model') as HTMLSelectElement;

const geminiApiKeyInput = document.getElementById('gemini-api-key') as HTMLInputElement;
const openaiApiKeyInput = document.getElementById('openai-api-key') as HTMLInputElement;
const anthropicApiKeyInput = document.getElementById('anthropic-api-key') as HTMLInputElement;

const geminiGroup = document.getElementById('gemini-key-group') as HTMLDivElement;
const openaiGroup = document.getElementById('openai-key-group') as HTMLDivElement;
const anthropicGroup = document.getElementById('anthropic-key-group') as HTMLDivElement;

const btnSave = document.getElementById('btn-save') as HTMLButtonElement;
const btnReset = document.getElementById('btn-reset') as HTMLButtonElement;
const saveStatus = document.getElementById('save-status') as HTMLSpanElement;

let saveTimeoutId: number | null = null;

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Apply theme
    await applyTheme();

    // Restore settings
    const settings = await ExtensionStorage.getAll();
    themeSelect.value = settings.theme;
    modelSelect.value = settings.selectedModel;
    geminiApiKeyInput.value = settings.geminiApiKey || '';
    openaiApiKeyInput.value = settings.openaiApiKey || '';
    anthropicApiKeyInput.value = settings.anthropicApiKey || '';

    // Handle initial visibility of key groups
    toggleApiKeyGroups(settings.selectedModel);

    // Listeners
    modelSelect.addEventListener('change', handleModelChange);
    btnSave.addEventListener('click', handleSaveSettings);
    btnReset.addEventListener('click', handleResetSettings);
  } catch (error) {
    console.error('[Options] Failed options page initialization:', error);
  }
});

// Show/Hide API Key forms depending on selected model
function toggleApiKeyGroups(model: 'gemini' | 'openai' | 'anthropic'): void {
  geminiGroup.classList.add('hidden');
  openaiGroup.classList.add('hidden');
  anthropicGroup.classList.add('hidden');

  if (model === 'gemini') {
    geminiGroup.classList.remove('hidden');
  } else if (model === 'openai') {
    openaiGroup.classList.remove('hidden');
  } else if (model === 'anthropic') {
    anthropicGroup.classList.remove('hidden');
  }
}

// Handle model dropdown changes live
function handleModelChange(): void {
  const model = modelSelect.value as 'gemini' | 'openai' | 'anthropic';
  toggleApiKeyGroups(model);
}

// Save Settings
async function handleSaveSettings(): Promise<void> {
  const theme = themeSelect.value as 'light' | 'dark' | 'system';
  const model = modelSelect.value as 'gemini' | 'openai' | 'anthropic';
  const geminiKey = geminiApiKeyInput.value.trim();
  const openaiKey = openaiApiKeyInput.value.trim();
  const anthropicKey = anthropicApiKeyInput.value.trim();

  try {
    await ExtensionStorage.set('theme', theme);
    await ExtensionStorage.set('selectedModel', model);
    await ExtensionStorage.set('geminiApiKey', geminiKey);
    await ExtensionStorage.set('openaiApiKey', openaiKey);
    await ExtensionStorage.set('anthropicApiKey', anthropicKey);

    // Apply saved theme immediately
    await applyTheme();

    // Show visual save confirmation toast
    if (saveTimeoutId) {
      window.clearTimeout(saveTimeoutId);
    }
    
    saveStatus.classList.remove('hidden');
    
    saveTimeoutId = window.setTimeout(() => {
      saveStatus.classList.add('hidden');
    }, 2400);

  } catch (error) {
    console.error('[Options] Failed to save settings:', error);
    alert('Error: Failed to save changes.');
  }
}

// Reset Settings
async function handleResetSettings(): Promise<void> {
  const confirmReset = confirm(
    'Are you sure you want to restore default configurations? This will permanently delete your API keys, theme preferences, and saved highlights.'
  );
  if (!confirmReset) return;

  try {
    await ExtensionStorage.clear();
    // Refresh page to load defaults from the clean storage instance
    window.location.reload();
  } catch (error) {
    console.error('[Options] Failed to reset storage:', error);
    alert('Error: Failed to clear storage.');
  }
}
