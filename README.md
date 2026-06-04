# Project-Name-PRO1001-Frontend-Essentials

## Project description

FRAM is a responsive frontend prototype for a sustainable food delivery service.

The solution includes 3 pages:

- `index.html` (landing page)
- `products.html` (product overview + map)
- `chat.html` (contact/chat experience)

Built with HTML, CSS, and JavaScript only (runs entirely in the browser).

## Setup and installation

### Prerequisites

- Modern browser (Chrome, Edge, Safari, Firefox)
- Optional: VS Code + Live Server

### Installation

1. Clone the repository: `git clone <repository-url>`
2. Open the project folder.
3. No package install is needed.

## Run locally

- Quick: open `index.html` in a browser.
- Recommended: run Live Server from project root and open the local URL.

## Project structure

- `index.html` — main page
- `products.html` — product listing + farms map
- `chat.html` — chatbot/contact page
- `styles.css` — shared styling and responsive layout
- `menu.js` — mobile menu and keyboard handling
- `newsletter.js` — form validation
- `farm-map.js` — external map integration
- `chatbot.js` — chatbot logic with fallback replies

## API integration

### Chosen API

- OpenStreetMap/Overpass API (used in `farm-map.js`)

### Limitations, ethics, and bias

- Public endpoint can be rate-limited or unavailable.
- If API fails, map still shows base markers (graceful fallback).
- Data quality depends on community-maintained OSM data.
- Rural coverage can be less detailed than urban areas.
- Only public map data is queried; no personal data is sent.

### API key note

- Overpass does not require an API key in this project.
- If a real chatbot endpoint is added later, do not commit secrets to the repo.

## Accessibility and performance (summary)

- Target: WCAG 2.1 AA
- Keyboard navigation and ARIA state updates are implemented in interactive components.
- Performance was improved with lighter font loading, responsive images, and deferred non-critical map assets.

## Known limitations

- No backend/database (frontend-only prototype).
- Farm markers are currently hardcoded.
- Chatbot uses keyword fallback unless an external endpoint is configured.

## Future improvements

- Connect products/chat to a real backend API.
- Move hardcoded content into API/CMS.
- Add automated accessibility and regression tests.

## Commit history

The repository follows meaningful commit types:

- `feat:` new features
- `fix:` bug fixes
- `style:` visual/style-only changes
- `perf:` performance improvements
- `docs:` documentation updates

## Resources used

- Course material and assignment brief
- Figma design
- MDN documentation
- Leaflet documentation
- OpenStreetMap / Overpass documentation
- Lighthouse + browser DevTools
- GitHub Copilot (AI support for ideation/troubleshooting; final decisions were manually reviewed)
