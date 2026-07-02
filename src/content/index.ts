import { ExtensionMessenger } from '../shared/messaging';

console.log('[Page Copilot] Content script injected successfully!');

// Set up message listener for content script context
ExtensionMessenger.addListener((message) => {
  console.log('[Page Copilot Content] Received message:', message);

  if (message.type === 'HIGHLIGHT_SELECTION') {
    return handleHighlightSelection(message.payload.text);
  }
  return undefined;
});

/**
 * Safely handles highlighting text in the DOM.
 * Follows Chrome Extension Rule 6: Batch DOM updates using requestAnimationFrame.
 */
function handleHighlightSelection(textToHighlight: string): { success: boolean } {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !selection.toString().trim()) {
    console.warn('[Page Copilot] No text selected to highlight.');
    return { success: false };
  }

  const range = selection.getRangeAt(0);
  const mark = document.createElement('mark');
  
  // Premium highlight styling
  mark.style.backgroundColor = 'rgba(233, 64, 87, 0.25)';
  mark.style.borderBottom = '2px solid #E94057';
  mark.style.borderRadius = '3px';
  mark.style.color = 'inherit';
  mark.style.padding = '1px 3px';
  mark.style.transition = 'all 0.3s ease';

  // Perform DOM modifications in requestAnimationFrame to prevent layout thrashing
  requestAnimationFrame(() => {
    try {
      range.surroundContents(mark);
      console.log(`[Page Copilot] Highlighted text selection: "${textToHighlight}"`);
    } catch (error) {
      console.error('[Page Copilot] Failed to wrap DOM contents with highlight tag:', error);
    }
  });

  return { success: true };
}
