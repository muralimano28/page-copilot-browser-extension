# Chrome Web Store Listing — Page Copilot

> Last Updated: 2026-07-02

## Store Listing

**Extension Name**
Page Copilot

**Short Description**
An AI-powered web assistant that generates page summaries and lets you highlight and save notes on any website.

**Detailed Description**
Page Copilot is your AI-powered companion for web browsing. It helps you read faster, capture key details, and stay organized.

Key Features:
- Instant Summarization: Generate a clean, structured summary of any webpage in seconds using simulated AI model analytics.
- Text Highlight Tool: Highlight and label key text selections directly in the webpage DOM.
- Local Notes Manager: Save, edit, and clear custom notes and snippets. All data is kept 100% private.
- Cross-Browser: Built using standards that run identically on Chrome and Firefox.

How to Use:
1. Navigate to any webpage you want to summarize or highlight.
2. Click the Page Copilot icon in your browser toolbar to open the extension popup.
3. Click "Analyze Page" to extract and summarize key points.
4. Select any text on the webpage, type a note, and click "Highlight" to highlight the selection in red/pink and save it to your local notes.
5. Access your notes lists directly in the popup, or open "Settings" to customize options.

Privacy Notice:
We value your privacy. All notes, highlights, and API keys are stored locally on your device using sandboxed extension storage. No user data is sent to external servers unless you specify an AI API credential, in which case queries are sent directly to the model provider.

**Category**
Productivity

**Single Purpose**
Generates summaries and highlights text selections on web pages to capture notes.

**Primary Language**
English

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon | 128×128 PNG | ✅ Ready | `src/icons/icon-128.png` |
| Screenshot 1 | 1280×800 | ⬜ Not created | |
| Small Promo Tile | 440×280 | ⬜ Not created | |

### Screenshot Notes
- Screenshot 1: Active popup window displaying a completed page analysis and active local notes log, showing the modern dark theme design.
- Screenshot 2: Injected content script action, illustrating highlighted text in a web article.

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Allows saving user settings (theme, toggles, API keys) and local notes log, persisting them across sessions. |
| `scripting` | permissions | Enables the programmatic injection of the highlight DOM wrapper script into the active browser tab. |
| `tabs` | permissions | Enables reading the URL and page title of the active tab to provide context-aware page summaries and validate targets. |
| `<all_urls>` | host_permissions | Allows injecting the content script and analyzing page context on web pages matching the user's active browsing. |

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No

All operations run locally or communicate directly with user-specified endpoints. No developer-facing analytics or logs are collected.

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Privacy Policy

**Privacy Policy URL**
Not applicable (No data collection or off-device transmission).

## Distribution

**Visibility**: Public
**Regions**: All regions
**Pricing**: Free

## Developer Info

**Publisher Name**
Developer Team

**Contact Email**
developer@example.com

**Homepage URL**
https://github.com/mano/page-copilot-browser-extension

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-07-02 | Initial release boilerplate containing popups, options, background worker, and content scripts. | Draft |

## Review Notes

### Known Issues / Limitations
- None. Designed strictly around Manifest V3.
