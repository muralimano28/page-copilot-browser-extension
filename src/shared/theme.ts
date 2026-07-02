import { ExtensionStorage } from './storage';

/**
 * Applies the stored theme ('light', 'dark', or 'system') to the document body.
 */
export async function applyTheme(): Promise<void> {
  const theme = await ExtensionStorage.get('theme');
  document.body.classList.remove('light-theme', 'dark-theme');
  
  if (theme === 'light') {
    document.body.classList.add('light-theme');
  } else if (theme === 'dark') {
    document.body.classList.add('dark-theme');
  }
}
