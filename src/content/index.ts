import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';
import { ExtensionMessenger } from '../shared/messaging';

console.log('[Page Copilot] Content script injected successfully!');

// Set up message listener for content script context
ExtensionMessenger.addListener((message) => {
  console.log('[Page Copilot Content] Received message:', message);

  if (message.type === 'GET_PAGE_CONTEXT') {
    const selectedText = window.getSelection()?.toString().trim() || '';
    const title = document.title || '';
    const descriptionMeta = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    
    if (selectedText) {
      handleHighlightSelection(selectedText);

      console.log('[Page Copilot Content] Using selected text context of length:', selectedText.length);
      return {
        title,
        description: descriptionMeta,
        text: `[User's Highlighted/Selected Text]:\n${selectedText}`,
      };
    }

    // Try extracting clean content using Mozilla's Readability and Turndown
    try {
      const docClone = document.cloneNode(true) as Document;
      const reader = new Readability(docClone);
      const article = reader.parse();
      if (article && article.content) {
        console.log('[Page Copilot Content] Extracted clean HTML via Readability');
        
        let markdownText = '';
        try {
          const turndownService = new TurndownService({
            headingStyle: 'atx',
            hr: '---',
            bulletListMarker: '-',
            codeBlockStyle: 'fenced'
          });
          markdownText = turndownService.turndown(article.content);
        } catch (turndownErr) {
          console.warn('[Page Copilot Content] Turndown conversion failed, falling back to textContent:', turndownErr);
          markdownText = article.textContent || '';
        }

        if (markdownText.trim()) {
          return {
            title: article.title || title,
            description: article.excerpt || descriptionMeta,
            text: markdownText.trim().substring(0, 18000), // Limit context size to ~4k tokens to be lightweight & performant
          };
        }
      }
    } catch (e) {
      console.warn('[Page Copilot Content] Readability extraction failed, falling back to innerText:', e);
    }

    const textContext = document.body?.innerText || '';
    return {
      title,
      description: descriptionMeta,
      text: textContext.substring(0, 18000), // Limit context size to ~4k tokens to be lightweight & performant
    };
  }

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

  // Premium highlight styling (aligned with Apple Notes brand yellow accent #FFCC00)
  mark.style.backgroundColor = 'rgba(255, 204, 0, 0.25)';
  mark.style.borderBottom = '2px solid #FFCC00';
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
