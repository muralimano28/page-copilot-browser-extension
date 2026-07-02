import browser from 'webextension-polyfill';
import { ExtensionMessenger, ExtensionMessage } from '../shared/messaging';
import { ExtensionStorage } from '../shared/storage';

// Handle extension installation/update
browser.runtime.onInstalled.addListener(async (details) => {
  console.log('[Background] Extension installed or updated:', details.reason);
  
  // Set initial settings if they don't exist
  const currentSettings = await ExtensionStorage.getAll();
  console.log('[Background] Current settings on install:', currentSettings);
  
  // Create an alarm for periodic tasks (Rule 7: use alarms, never state variable timers)
  browser.alarms.create('periodic-extension-check', { periodInMinutes: 60 });
});

// Alarm handler
browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'periodic-extension-check') {
    console.log('[Background] Ephemeral worker background check fired.');
  }
});

// Setup Message listener
ExtensionMessenger.addListener(async (message, sender) => {
  console.log('[Background] Received message:', message);

  switch (message.type) {
    case 'GET_PAGE_SUMMARY':
      return await handleGetPageSummary(sender);

    case 'NOTIFICATION':
      await showNotification(message.payload.title, message.payload.message);
      return { success: true };

    default:
      console.warn(`[Background] Unhandled message type:`, message);
      return { error: 'Unhandled message type' };
  }
});

/**
 * Handle a page summary request. Simulates asynchronous copilot logic.
 */
async function handleGetPageSummary(sender: browser.Runtime.MessageSender): Promise<{ summary: string }> {
  // Simulate AI computation latency
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const tabTitle = sender.tab?.title || 'Unknown Webpage';
  
  // Ensure the page title is parsed correctly
  return {
    summary: `[AI Copilot] Analyzed "${tabTitle}". This boilerplate is production-ready, featuring TypeScript type-safety, structured SOLID modules, and robust cross-browser message channels.`,
  };
}

/**
 * Creates a browser notification.
 * Uses a real PNG icon path as required by Chrome Extension guidelines.
 */
async function showNotification(title: string, message: string): Promise<void> {
  try {
    await browser.notifications.create('copilot-notice', {
      type: 'basic',
      iconUrl: 'icons/icon-48.png', // Must point to a real file, copied during build
      title: title,
      message: message,
    });
  } catch (err) {
    console.error('[Background] Failed to show notification:', err);
  }
}
