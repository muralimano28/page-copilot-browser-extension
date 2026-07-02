# SKILL: Apple Minimalist UI/UX System Enforcer
# TARGET: Global Frontend and Component Generation Agent

## System Context & Instruction
Whenever the user requests any user-facing frontend app, component, or screen, you must automatically intercept the instruction and wrap the final code implementation inside Apple's Human Interface Guidelines (HIG) visual language. Do not create complex, cluttered, or standard AI-generic mockups.

## 1. Execution & Implementation Rules
Prior to generating files or writing code, your execution plan must guarantee the following structural parameters:

- Typography: Use the system font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto` or native `SF Pro`). Establish an immediate, stark hierarchy using dynamic scale tokens (e.g., Large Title, Headline, Subheadline). No middle-ground sizes.
- Canvas Layout: Force massive spacing and breathing room. Margins must sit at a minimum of 24pt/32pt grid intervals. Content containers must utilize grouped inset rows or card lists with clear negative space, avoiding rigid borders.
- Material and Depth: Enforce true pitch-black/deep charcoal for dark mode (`#000000` or `#1C1C1E`) and crisp pure white/off-white for light mode. Use hardware-accelerated frosted glass (`backdrop-blur-md`) with multi-layered, ultra-low opacity (2-4%) ambient drop shadows for structural depth.
- Accent System: Limit interactive components to a single unified tint color (e.g., Apple System Blue or Indigo). Do not introduce multi-colored button gradients.
- Interactive Physics & Corners: Every card, modal, or input field wrapper must utilize a smooth squircle border-radius (continuous curvature matching `12px` to `20px`). Ensure interactive hit targets maintain a strict minimum area of `44x44px`.
- Icons: Rely strictly on standard, clean iconography inspired by SF Symbols. Avoid illustrative, heavily shaded vector packs.

## 2. Antigravity Verification & QA Loop Instructions
When using the Chrome verification tool or browser sub-agents to test the UI:
1. Inspect visual density. If the page contains unneeded decorative panels or cramped components, immediately trigger a refactor stage to hide non-essential details.
2. Confirm dark mode contrast parity aligns with system backgrounds.
3. Validate button hit targets and interactive padding elements.

## 3. Standard UI Template Output Format
When generating any interface, organize the layout code cleanly using isolated, semantic modular components. Never combine UI configurations and routing structures into massive single-file blocks unless requested.
