# Chrome Web Store Listing — Page Copilot

> Last Updated: 2026-07-02

## Store Listing

**Extension Name**
Page Copilot

**Short Description**
AI-powered side panel assistant. Ask questions and get answers about any webpage using Google Gemini, OpenAI, or Claude.

**Detailed Description**
Page Copilot is your AI-powered companion that lives in your browser's side panel, letting you chat directly with any web page. Instantly extract key insights, summarize dense articles, or ask questions about specific paragraphs.

Features:
- Seamless Side Panel Chat: Clean iOS/macOS inspired conversational interface that opens directly in your sidebar.
- Precision Context Parsing: Uses Mozilla Readability to clean page noise and Turndown to send context in highly structured Markdown format to the LLM.
- Selection Priority: Simply highlight any text on the page to ask questions about that specific section, or default to the entire page.
- Choose Your Model: Connect Gemini 3.5 Flash, 3.1 Pro, GPT-4o, or Claude in settings.
- Private Credentials: API keys are stored securely inside your local browser storage and never touch third-party servers.

How to use it:
1. Click the Page Copilot extension icon to launch the side panel.
2. Select your text of interest, or leave selection empty to chat about the full page.
3. Enter your query or prompt into the chatbot field and press Send.
4. Go to Settings (gear icon) to input your API keys and customize the interface themes.

**Category**
Productivity

**Single Purpose**
Enables users to select or extract webpage content and query it using customized LLM providers inside the sidebar.

**Primary Language**
English

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon | 128×128 PNG | 🟡 Needs export | `icons/icon-128.png` |
| Screenshot 1 | 1280×800 | ⬜ Not created | |
| Screenshot 2 | 1280×800 | ⬜ Not created | |

### Screenshot Notes
- Screenshot 1: The Page Copilot sidebar open next to a long news article, displaying a summary reply.
- Screenshot 2: Highlighted text on a page being summarized inside the sidebar.
- Screenshot 3: Settings page showing API Key fields and Apple HIG Inset grouped listings.

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Used to persist extension configurations, theme state, model selection, and user credentials (API keys) securely on-device. |
| `scripting` | permissions | Required to execute highlights on selected text blocks inside webpage DOMs. |
| `tabs` | permissions | Required to inspect active tab URLs/titles for context metadata and send page context messages from the side panel. |
| `sidePanel` | permissions | Required to configure and mount the native Chrome side panel container for the assistant. |
| `alarms` | permissions | Required to set up periodic timers that manage background service worker lifecycle updates. |
| `<all_urls>` | host_permissions | Allows the content script to extract DOM content (via Readability) and highlight text selections on any site the user navigates to. |

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** Yes (Stored locally, credentials sent directly to user-configured LLM providers only).

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Authentication info | Yes | Yes (directly to provider) | Stored API keys are used to authenticate requests to Gemini, OpenAI, or Anthropic. | No |
| Website content | Yes | Yes (directly to provider) | Selected text or parsed HTML elements are sent to the LLM as user-initiated context. | No |

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Privacy Policy

**Privacy Policy URL**
`https://github.com/muralimano28/page-copilot-browser-extension/blob/main/PRIVACY_POLICY.md` (Placeholder placeholder)

## Distribution

**Visibility**: Public
**Regions**: All regions
**Pricing**: Free

## Developer Info

**Publisher Name**
Page Copilot Team

**Contact Email**
muralimano28@gmail.com

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-07-02 | Initial release supporting side panel, Gemini `@google/genai` integration, and Readability+Turndown extraction. | Draft |
