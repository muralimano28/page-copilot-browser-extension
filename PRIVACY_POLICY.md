# Privacy Policy for Page Copilot

Last updated: 2026-07-02

This privacy policy explains how **Page Copilot** handles and protects your data. Page Copilot is committed to ensuring that your privacy is protected.

## 1. What Data We Collect
Page Copilot is designed to be a lightweight, serverless extension. We only collect the following information when you interact with the extension:
* **API Credentials**: To connect to language models, you must provide your own API keys (e.g., Google Gemini, OpenAI, or Anthropic). These keys are stored directly on your device.
* **Webpage and Text Context**: When you run a query, the extension extracts either your active highlighted text selection or the readable text content of the active tab. This content is used solely as context for the language model.
* **Settings & Preferences**: We store your selected model provider, active model, and visual theme preference (light/dark/system).

## 2. How Data Is Stored
All data (including your API keys, preferences, and session history) is stored **locally on your device** using the browser's extension storage API (`chrome.storage.local`). We do not host or operate any central servers. Your data never touches our infrastructure.

## 3. How Data Is Used and Transmitted
* Your context and API keys are transmitted **directly from your browser** to your chosen model provider's API endpoints (Google, OpenAI, or Anthropic) to generate chat completions.
* We do **not** intercept, read, or collect this information.
* We do **not** use telemetry, tracking scripts, or analytics services.

## 4. Third-Party Services
Depending on which provider you configure, your data is processed according to their respective privacy agreements:
* **Google Gemini API**: [Google Privacy Policy](https://policies.google.com/privacy)
* **OpenAI API**: [OpenAI Privacy Policy](https://openai.com/privacy/)
* **Anthropic Claude API**: [Anthropic Privacy Policy](https://www.anthropic.com/privacy)

## 5. Data Sharing and Sale
* We **never** sell, trade, rent, or share your personal data, credentials, or webpage context with any third parties. 
* Data is only transmitted to the specific LLM API provider that you explicitly select and configure in the settings.

## 6. Data Retention and Deletion
Since all data is stored locally, you have full control over its retention:
* You can clear or update your API keys at any time via the Settings page.
* Uninstalling the extension will automatically wipe all local storage data associated with Page Copilot from your device.

## 7. Changes to This Policy
We may update this Privacy Policy from time to time. Any changes will be posted directly to this file in our repository.

## 8. Contact
If you have any questions or concerns about this privacy policy, please open an issue in our repository or contact: **muralimano28@gmail.com**
