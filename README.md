# FRAM — PRO1001 Frontend Essentials

## Project description

FRAM is a responsive frontend prototype for a sustainable food delivery service.
The project is built with plain HTML, CSS, and JavaScript, and runs fully in the browser.

Pages:
- `index.html` — landing page
- `products.html` — produce overview and farm map
- `chat.html` — chatbot/help page

## Features

- Responsive layout (mobile-first, with tablet/desktop breakpoints)
- Accessible mobile menu with keyboard focus trap (`js/menu.js`)
- Newsletter form with client-side validation and success message (`js/newsletter.js`)
- Interactive farm map (`js/farm-map.js`)
	- Leaflet loaded on demand for better performance
	- Overpass API enrichment with graceful fallback
- Chat UI with local keyword-based fallback replies (`js/chatbot.js`)

## Technologies used

- HTML5 (semantic structure)
- CSS3 (custom properties, Flexbox, Grid, media queries)
- JavaScript (ES6+)
- Leaflet (map rendering)
- Overpass API / OpenStreetMap data

## API integration

### Overpass API (map)
- Used in `js/farm-map.js` to fetch nearby map context.
- API calls are cached in `sessionStorage` for 12 hours.
- If the API fails or is unavailable, the map still works with local farm markers.

### Chat endpoint (optional)
- `js/chatbot.js` supports an optional endpoint via `data-chat-endpoint`.
- If no endpoint is provided, chatbot uses local keyword replies.

## Setup instructions

1. Clone the repository:
	 `git clone <repository-url>`
2. Open the project folder.
3. No package installation is required.

## Run locally

- Quick start: open `index.html` directly in a browser.
- Recommended: run with VS Code Live Server from the project root.

## Accessibility and quality notes

- WCAG 2.1 AA color contrast updates are included.
- Keyboard navigation is supported for menu and forms.
- ARIA attributes are used for menu state, live feedback, and validation states.

## Known limitations

- Frontend-only prototype (no backend or database).
- Product data and farm list are hardcoded.
- Overpass API can be rate-limited.
- Chatbot fallback is rule-based and limited to predefined topics.

## Future improvements

- Connect products, basket, and chat to real backend APIs.
- Move product/farm content to a CMS or data service.
- Add automated tests (accessibility + UI regression).
- Add persistent cart and checkout flow.

## Project structure

- `index.html`
- `products.html`
- `chat.html`
- `css/styles.css`
- `js/menu.js`
- `js/newsletter.js`
- `js/farm-map.js`
- `js/chatbot.js`

## Commit history

Commit messages follow these types:

- `feat:` new features
- `fix:` bug fixes
- `style:` visual/CSS-only changes
- `perf:` performance improvements
- `docs:` documentation updates

## Resources

- Course material and assignment brief
- Figma design file
- Leaflet documentation
- OpenStreetMap / Overpass API documentation
- Google Lighthouse
- GitHub Copilot (used for ideation and troubleshooting; all decisions were manually reviewed)
