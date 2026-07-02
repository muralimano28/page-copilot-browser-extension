import browser from 'webextension-polyfill';

export type ExtensionMessage =
  | { type: 'GET_PAGE_SUMMARY'; payload?: never }
  | { type: 'PAGE_SUMMARY_RESPONSE'; payload: { summary: string } }
  | { type: 'HIGHLIGHT_SELECTION'; payload: { text: string } }
  | { type: 'NOTIFICATION'; payload: { title: string; message: string } };

/**
 * Type-safe messenger wrapper. Ensures message schemas are strictly validated
 * at compile time to avoid cross-context communication bugs.
 */
export class ExtensionMessenger {
  /**
   * Sends a message to the extension background/service worker.
   */
  static async sendMessage<R = any>(message: ExtensionMessage): Promise<R> {
    try {
      return await browser.runtime.sendMessage(message) as R;
    } catch (error) {
      console.error('[ExtensionMessenger] Error sending message:', error);
      throw error;
    }
  }

  /**
   * Listens for messages from other parts of the extension.
   * Return a Promise to send a response back asynchronously, or return a non-promise value for synchronous reply.
   */
  static addListener(
    callback: (
      message: ExtensionMessage,
      sender: browser.Runtime.MessageSender
    ) => Promise<any> | any
  ): void {
    browser.runtime.onMessage.addListener((message, sender) => {
      const result = callback(message as ExtensionMessage, sender);
      if (result instanceof Promise) {
        return result; // webextension-polyfill automatically resolves this Promise back to sender
      }
      if (result !== undefined) {
        return Promise.resolve(result);
      }
      return undefined;
    });
  }
}
