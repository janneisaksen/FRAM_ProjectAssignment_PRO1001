# Project-Name-PRO1001-Frontend-Essentials

Desktop-first landing page for FRAM, designed for a standard 1920×1080 screen and structured with a 12-column CSS grid.

## Files

- `index.html` – semantic page structure for hero, feature panels, process section, products, and newsletter.
- `styles.css` – desktop-first styling, spacing, typography, and 12-column grid system.

## Run locally

Open `index.html` directly in the browser, or use a local live server in VS Code for easier previewing.

## Layout — CSS Grid and Flexbox

Both CSS Grid and Flexbox are used throughout `styles.css` for layout management.

### CSS Grid
The entire page is built on a **12-column CSS Grid** system via `.section-grid`:

```css
grid-template-columns: repeat(12, minmax(0, 1fr));
```

Grid is used for:
- The global page shell and all major page sections (hero, intro panels, how-it-works, products, newsletter)
- Responsive column spanning via utility classes (`.span-4`, `.span-6`, `.span-8`, `.span-12`) that collapse to full width on mobile
- The topbar and site-menu header layouts
- The farm map section, placing the content and map side by side on desktop

### Flexbox
Flexbox is used for component-level alignment and flow wherever items need to be arranged in a single axis:

- Navigation links in `.site-menu__links` (`flex-direction: column`)
- The menu button hamburger lines
- Chat bubbles, chatbot form, and send button alignment
- Product card metadata rows (name + price side by side)
- Status pills, breadcrumbs, and inline UI elements
- The map loading overlay (centering the spinner)
- Process steps and newsletter form field stacking

### Summary
| Concern | Technique |
|---|---|
| Full-page section layout | CSS Grid (12-column) |
| Responsive column spanning | CSS Grid (`grid-column`) |
| Component-level alignment | Flexbox |
| Single-axis flow (nav, form fields) | Flexbox |

- Built with a 12-column grid using `grid-template-columns: repeat(12, minmax(0, 1fr))`.
- Optimized first for desktop width, with smaller breakpoints included for tablet and mobile.
- Visual direction is inspired by the provided FRAM concept with a more polished desktop layout.
- Typography uses `Frank Ruhl Libre` for logo/accent text and `Arimo` for headings, interface, and body text.
- Brand colors follow the supplied palette: `#F7F2ED`, `#FFFFFF`, `#0B0A08`, `#DC4131`, `#E1EAF0`, and `#068F51`.

## Produce map

- The produce page uses Leaflet with OpenStreetMap tiles for an interactive map.
- Three farm locations are hardcoded in `farm-map.js` with fixed coordinates: Braastad Gaard, Haakenstad Gård, and Øvre Kjekshus Gård.
- A single async `fetch()` request calls the Overpass API to enrich the map with nearby OSM place names; it does not determine the farm coordinates.
- If the API fails, the map still loads with the fixed markers and shows a user-facing error state.

## API documentation

### Overpass API — `farm-map.js`

Used to enrich farm markers with nearby named places from OpenStreetMap.

**Limitations**
- The public endpoint has shared rate limits; repeated requests may return HTTP 429. A production site should cache responses server-side or use a self-hosted instance.
- OSM data is crowd-sourced and may be outdated for rural areas. Businesses that have closed or moved may still appear.
- No SLA — if the service is down the map degrades gracefully: markers still render and enrichment is skipped.
- Requests time out after 15 seconds.

**Ethical considerations**
- OSM data is used under the Open Database Licence (ODbL). The required `© OpenStreetMap contributors` attribution is shown inside the Leaflet map.
- No user data is transmitted — only the bounding box of publicly known farm coordinates.
- The query runs once on page load to minimise load on shared public infrastructure.

**Potential biases**
- OSM data density is lower in rural areas, so the nearest-point result may be less meaningful or missing.
- Tags in this region are primarily in Norwegian, which may not reflect how all users refer to local places.
- The query targets shops, tourism and amenities only — agricultural features such as farm stands are not included, which under-represents the rural context.

---

### Chatbot fallback — `chatbot.js`

No live API endpoint is configured. All responses are generated client-side by a keyword-matching fallback.

**Limitations**
- The fallback can only answer questions matching predefined keyword categories: farms, produce, orders, delivery, and price. All other questions receive a generic reply.
- Without a live endpoint there is no access to real-time stock, pricing or delivery slot data.
- Requests to an external endpoint time out after 10 seconds.
- No conversation memory — each message is sent without prior context, so multi-turn conversations are not supported.

**Ethical considerations**
- The bot identifies itself as "FRAM", not as a human, so users are always aware they are interacting with an automated system.
- Only the raw message text is sent to any configured endpoint — no user identifiers or session data are included.
- Automated responses may be incorrect or outdated; important decisions should be confirmed through official channels.

**Potential biases**
- Keyword patterns recognise a mix of English and Norwegian. Users writing in other languages will consistently receive the generic fallback reply.
- Topic categories reflect the developer's assumptions about user intent. Questions about sustainability, allergens or accessibility are not handled.
- Multiple candidate replies per category are selected at random, which can feel inconsistent to returning users.
