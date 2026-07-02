import browser from 'webextension-polyfill';
import { GoogleGenAI } from '@google/genai';
import { ExtensionMessenger } from '../shared/messaging';
import { ExtensionStorage } from '../shared/storage';

// Handle extension installation/update
browser.runtime.onInstalled.addListener(async (details) => {
  console.log('[Background] Extension installed or updated:', details.reason);

  // Set initial settings if they don't exist
  const currentSettings = await ExtensionStorage.getAll();
  console.log('[Background] Current settings on install:', currentSettings);

  // Configure Chrome side panel to open on action click
  if (typeof chrome !== 'undefined' && chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
      .catch(err => console.error('[Background] Failed to set sidePanel behavior:', err));
  }

  // Create an alarm for periodic tasks
  browser.alarms.create('periodic-extension-check', { periodInMinutes: 60 });
});

// Open sidebar programmatically on action click for Firefox
browser.action.onClicked.addListener(async () => {
  if (typeof (browser as any).sidebarAction !== 'undefined' && (browser as any).sidebarAction.open) {
    try {
      await (browser as any).sidebarAction.open();
    } catch (err) {
      console.error('[Background] Failed to open Firefox sidebar:', err);
    }
  }
});

// Alarm handler
browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'periodic-extension-check') {
    console.log('[Background] Ephemeral worker background check fired.');
  }
});

// Setup Message listener
ExtensionMessenger.addListener(async (message) => {
  console.log('[Background] Received message:', message);

  switch (message.type) {
    case 'SEND_CHAT_QUERY':
      return await handleSendChatQuery(
        message.payload.messages, 
        message.payload.pageContext, 
        message.payload.model
      );

    default:
      console.warn(`[Background] Unhandled message type:`, message);
      return { error: 'Unhandled message type' };
  }
});

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface PageContext {
  title: string;
  description: string;
  text: string;
}

/**
 * Routes chat message completion requests to the chosen provider (Gemini, OpenAI, or Anthropic).
 */
async function handleSendChatQuery(
  messages: ChatMessage[], 
  pageContext: PageContext, 
  targetModel?: string
): Promise<{ text: string } | { error: string }> {
  try {
    const settings = await ExtensionStorage.getAll();
    const model = settings.selectedModel;

    // Define System context instructions
    const systemPrompt = `You are "Page Copilot", a helpful browser assistant. Help the user interact with and answer questions about the current web page.
Page Context:
- Title: ${pageContext.title || 'Untitled Page'}
- Description: ${pageContext.description || 'No description available'}
- Page text content:
---
${pageContext.text || 'No text content available on this page.'}
---

Answer queries based on the provided page context. Be precise, clear, and direct.`;

    if (model === 'gemini') {
      const apiKey = settings.geminiApiKey;
      if (!apiKey) {
        return { error: 'Please enter a Gemini API Key in the settings options page.' };
      }

      const ai = new GoogleGenAI({ apiKey });

      // Split messages into history and last query
      const lastMessage = messages[messages.length - 1];
      const history = messages.slice(0, messages.length - 1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      // Initialize the chat session
      const chat = ai.chats.create({
        model: targetModel || 'gemini-2.5-flash',
        config: {
          systemInstruction: systemPrompt,
        },
        history: history
      });

      // Send the query
      const result = await chat.sendMessage({ message: lastMessage.content });
      const completion = result.text;
      
      if (!completion) {
        return { error: 'Empty or invalid response structure received from Gemini.' };
      }
      return { text: completion };

    }
    // else if (model === 'openai') {
    //   const apiKey = settings.openaiApiKey;
    //   if (!apiKey) {
    //     return { error: 'Please enter an OpenAI API Key in the settings options page.' };
    //   }

    //   const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${apiKey}`
    //     },
    //     body: JSON.stringify({
    //       model: 'gpt-4o-mini',
    //       messages: [
    //         { role: 'system', content: systemPrompt },
    //         ...messages.map(m => ({ role: m.role, content: m.content }))
    //       ]
    //     })
    //   });

    //   if (!response.ok) {
    //     const errText = await response.text();
    //     console.error('[Background] OpenAI API Error Response:', errText);
    //     return { error: `OpenAI API returned status ${response.status}: ${errText}` };
    //   }

    //   const data = await response.json();
    //   const completion = data.choices?.[0]?.message?.content;
    //   if (!completion) {
    //     return { error: 'Empty response received from OpenAI.' };
    //   }
    //   return { text: completion };

    // } else if (model === 'anthropic') {
    //   const apiKey = settings.anthropicApiKey;
    //   if (!apiKey) {
    //     return { error: 'Please enter an Anthropic API Key in the settings options page.' };
    //   }

    //   // Anthropic does not support "system" in the messages array, it uses a top-level parameter
    //   const response = await fetch('https://api.anthropic.com/v1/messages', {
    //     method: 'POST',
    //     headers: {
    //       'content-type': 'application/json',
    //       'x-api-key': apiKey,
    //       'anthropic-version': '2023-06-01'
    //     },
    //     body: JSON.stringify({
    //       model: 'claude-3-5-sonnet-20240620',
    //       max_tokens: 1024,
    //       system: systemPrompt,
    //       messages: messages.map(m => ({
    //         role: m.role === 'assistant' ? 'assistant' : 'user',
    //         content: m.content
    //       }))
    //     })
    //   });

    //   if (!response.ok) {
    //     const errText = await response.text();
    //     console.error('[Background] Anthropic API Error Response:', errText);
    //     return { error: `Anthropic API returned status ${response.status}: ${errText}` };
    //   }

    //   const data = await response.json();
    //   const completion = data.content?.[0]?.text;
    //   if (!completion) {
    //     return { error: 'Empty response received from Anthropic.' };
    //   }
    //   return { text: completion };
    // }

    return { error: 'Unsupported model provider selected.' };
  } catch (err: any) {
    console.error('[Background] Chat API call failed:', err);
    return { error: `Network/API connection failure: ${err.message || err}` };
  }
}
