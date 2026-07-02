# Page Copilot 🚀

Page Copilot is an open-source, privacy-first, serverless browser extension that acts as your AI sidekick. It mounts directly inside your browser's native **Side Panel** (Chrome) or **Sidebar** (Firefox) to let you chat with and query webpage contents instantly.

---

## Key Features
* 💬 **Conversational Side Panel**: Interactive, Apple HIG-inspired chatbot UI right beside your main tab.
* 📝 **Precision Parsing (Readability & Markdown)**: Automatically cleans scripts, sidebars, and ads from page HTML (using `@mozilla/readability`) and converts clean content to structured Markdown (using `turndown`) before sending it to the LLM.
* 🔍 **Smart Selection Priority**: Highlight any phrase or block of text on the page to automatically ask questions about *just* that section. If no text is selected, the copilot falls back to analyzing the entire page.
* 🤖 **Multi-Provider Support**: Choose your preferred model provider. Features built-in support for Google Gemini (utilizing the official `@google/genai` SDK), OpenAI, and Anthropic.
* 🔑 **Privacy-First (No Servers)**: Zero backend footprint. Your API keys are stored securely on-device using local extension storage and sent directly to the AI provider.

---

## Supported Models
* **Google Gemini**: Gemini 3.5 Flash, Gemini 3.1 Pro (Preview), Gemini 3.1 Flash-Lite, Gemini 2.5 Flash, Gemini 2.5 Pro, Gemini 2.0 Flash, Gemini 2.0 Flash-Lite
* **OpenAI**: GPT-4o, GPT-4o Mini
* **Anthropic**: Claude 3.5 Sonnet, Claude 3.5 Haiku

---

## Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* npm

### Installation & Build
1. Clone this repository:
   ```bash
   git clone https://github.com/muralimano28/page-copilot-browser-extension.git
   cd page-copilot-browser-extension
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension for development or production:
   ```bash
   npm run build
   ```
   This generates production-ready directories:
   * `dist-chrome/` (for Chrome, Brave, Edge, Opera)
   * `dist-firefox/` (for Firefox)

---

## Loading the Extension in Your Browser

### Chrome / Chromium-based Browsers
1. Navigate to `chrome://extensions/` in your browser.
2. Toggle the **Developer mode** switch in the top-right corner.
3. Click the **Load unpacked** button.
4. Select the `dist-chrome/` directory from the project root.
5. Click the extension icon on your toolbar to open the Side Panel!

### Firefox
1. Navigate to `about:debugging#/runtime/this-firefox` in Firefox.
2. Click the **Load Temporary Add-on...** button.
3. Select the `manifest.json` file inside the `dist-firefox/` folder.
4. Open the extension sidebar from your toolbar or extensions menu!

---

## Security & Privacy
Page Copilot does not maintain any remote databases or telemetry servers.
* **Credentials**: Your API keys are stored in `chrome.storage.local`.
* **API Requests**: Network requests for completions are sent directly from your browser to the provider's server endpoint. 
For more details, see the [Privacy Policy](PRIVACY_POLICY.md).

---

## License
This project is open-source and available under the [MIT License](LICENSE).
