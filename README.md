# Project-Name-PRO1001-Frontend-Essentials

## Project description

FRAM is a responsive frontend concept for local farm produce delivery. The project includes:

- Landing page (`index.html`)
- Produce page with interactive map (`products.html` + `farm-map.js`)
- Chat page with local fallback chatbot (`chat.html` + `chatbot.js`)

The layout is built with a 12-column CSS Grid system and component-level Flexbox. Typography uses `Frank Ruhl Libre` and `Arimo`.

## Setup and installation instructions

### Prerequisites

- A modern browser (Chrome, Edge, Safari, Firefox)
- Optional: VS Code + Live Server extension for local preview

### Installation

1. Clone the repository:
	- `git clone <repository-url>`
2. Open the folder in VS Code.
3. No package installation is required (pure HTML/CSS/JavaScript project).

## How to run the application locally

You can run the project in either of these ways:

### Option 1 (quick)

- Open `index.html` directly in your browser.

### Option 2 (recommended)

- Start a local dev server (e.g. VS Code Live Server) from the project root.
- Open the served URL in your browser.

Then navigate between pages:

- `index.html`
- `products.html`
- `chat.html`

## Browser-only scope

This project runs entirely in the browser (HTML/CSS/JavaScript). No backend, database, or deployment is required for grading.

## API keys and configuration

- Overpass API integration in `farm-map.js` does not require an API key.
- The optional chatbot endpoint in `chatbot.js` should use a placeholder URL in source code (never commit secrets).
- If a real endpoint is added later, keep secrets outside the repository and document setup in a local-only config process.

## Project structure

- `index.html` — landing page
- `products.html` — produce overview + map section
- `chat.html` — chatbot UI
- `styles.css` — shared design tokens, layout, typography, responsive rules
- `menu.js` — mobile/overlay navigation behavior
- `newsletter.js` — newsletter form validation
- `farm-map.js` — Leaflet map + optional Overpass enrichment
- `chatbot.js` — chatbot logic + fallback responses

## API considerations

### Overpass API used by `farm-map.js`

**Limitations**

- Public Overpass endpoints can be rate-limited, slow, or temporarily unavailable.
- The map still works without enrichment, but nearby place context may be incomplete.
- Returned OSM data depends on community maintenance and may be outdated in rural areas.

**Ethical considerations**

- The project only queries publicly available map data and does not send personal user data.
- The request should be used sparingly because Overpass is a shared public resource.
- OpenStreetMap attribution is required and is already shown in the map UI.

**Potential biases**

- Rural areas can have less detailed OSM coverage than cities, so results may be uneven.
- The query focuses on shops, tourism, and amenities, which can underrepresent agricultural context.
- Place naming and tagging may vary by region and language, affecting consistency.

### Optional chatbot endpoint used by `chatbot.js`

**Limitations**

- No live endpoint is configured by default, so the chatbot falls back to local keyword responses.
- Responses are not context-aware and do not preserve conversation history.

**Ethical considerations**

- The bot should be presented as an automated system, not a human agent.
- If an endpoint is added later, only the minimum necessary user message data should be sent.

**Potential biases**

- Keyword matching works better for some topics and languages than others.
- Fallback replies reflect the assumptions of the predefined topic categories.

## Accessibility and performance notes

- Accessibility target: WCAG 2.1 Level AA.
- Keyboard navigation is supported for menu and interactive controls.
- ARIA attributes are used for menu state, map status, and chatbot status updates.
- Performance was improved by reducing font payload, deferring non-critical map assets, and using responsive image sizing.

## Development process and resources used

### Development process

- Implemented core pages first, then responsive behavior.
- Added external API integration (map) with graceful fallback.
- Iterated on accessibility, contrast, and keyboard interactions.
- Performed performance tuning with Lighthouse feedback.

### Challenges and solutions

- Challenge: external API reliability/rate limits.
	- Solution: graceful degradation + user feedback when enrichment is unavailable.
- Challenge: balancing design fidelity with mobile performance.
	- Solution: deferred assets, responsive image sizing, reduced blocking requests.
- Challenge: maintaining accessibility while preserving visual style.
	- Solution: adjusted contrast, semantic structure, and ARIA state messaging.

### Resources used

- Course material and assignment brief
- Figma design specification
- MDN documentation (HTML/CSS/JavaScript, accessibility, async)
- Leaflet documentation
- OpenStreetMap / Overpass API documentation
- Lighthouse and browser developer tools
- AI-assisted support (GitHub Copilot) for brainstorming, wording suggestions, and troubleshooting ideas; all final code and documentation decisions were manually reviewed and validated.

## Known limitations and future improvements

### Known limitations

- Public Overpass API can be rate-limited or temporarily unavailable.
- Farm markers are currently fixed/hardcoded.
- Chatbot uses keyword fallback when no live endpoint is configured.
- No backend persistence for cart, user account, or newsletter subscriptions.

### Future improvements

- Add a backend API for real-time stock, pricing, and ordering.
- Replace hardcoded farm data with CMS/API-managed content.
- Add server-side caching for Overpass/map enrichment data.
- Improve chatbot with contextual/multi-turn support.
- Add automated tests (accessibility, regression, and interaction tests).

## Commit history

The repository uses conventional, meaningful commit messages such as:

- `feat:` for new features
- `fix:` for bug/accessibility/performance fixes
- `style:` for styling-only updates
- `perf:` for performance-specific improvements

This supports a clear and traceable development history.

## Technical notes

### Layout system

- Main layout: CSS Grid (`grid-template-columns: repeat(12, minmax(0, 1fr))`)
- Component alignment: Flexbox

### Map integration

- Leaflet + OpenStreetMap tiles
- Optional Overpass API enrichment (graceful fallback on failure)

### Chatbot integration

- Optional API endpoint support
- Local keyword fallback when endpoint is not configured
