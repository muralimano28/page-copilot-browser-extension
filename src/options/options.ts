import { ExtensionStorage } from '../shared/storage';
import { applyTheme } from '../shared/theme';

// Elements
const apiKeyInput = document.getElementById('api-key') as HTMLInputElement;
const themeSelect = document.getElementById('select-theme') as HTMLSelectElement;
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
    apiKeyInput.value = settings.userApiKey || '';
    themeSelect.value = settings.theme;

    // Listeners
    btnSave.addEventListener('click', handleSaveSettings);
    btnReset.addEventListener('click', handleResetSettings);
  } catch (error) {
    console.error('[Options] Failed options page initialization:', error);
  }
});

// Save Settings
async function handleSaveSettings(): Promise<void> {
  const apiKey = apiKeyInput.value.trim();
  const theme = themeSelect.value as 'light' | 'dark' | 'system';

  try {
    await ExtensionStorage.set('userApiKey', apiKey);
    await ExtensionStorage.set('theme', theme);

    // Apply saved theme immediately
    await applyTheme();

    // Show visual save confirmation toast (Rule 5: async operations error-caught)
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
    'Are you sure you want to restore default configurations? This will permanently delete your API keys, notes, and custom settings.'
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
