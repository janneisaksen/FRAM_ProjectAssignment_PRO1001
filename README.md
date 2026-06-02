# Project-Name-PRO1001-Frontend-Essentials

Desktop-first landing page for FRAM, designed for a standard 1920×1080 screen and structured with a 12-column CSS grid.

## Files

- `index.html` – semantic page structure for hero, feature panels, process section, products, and newsletter.
- `styles.css` – desktop-first styling, spacing, typography, and 12-column grid system.

## Run locally

Open `index.html` directly in the browser, or use a local live server in VS Code for easier previewing.

## Design notes

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

## Limitations and considerations

- Farm coordinates are fixed in the code and may need manual adjustment if exact pin positions should change.
- OpenStreetMap/Overpass data can be incomplete, outdated, or unevenly mapped depending on the area and contributor activity.
- The external API is rate-limited and dependent on network availability, so enrichment is treated as optional.
- The map only uses public map data and does not store personal user data.
- Because the enrichment data comes from community-maintained sources, names and nearby points of interest may reflect mapping bias or local coverage gaps.
