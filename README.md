# Bonfire Adventures — Website (v1, static)

A mobile-first, static HTML/CSS/JS build of the Bonfire Adventures travel
platform: Packages, Find Your Trip, Explore by Budget, Destinations,
Hotels & B&Bs, Deals, Compare and Global Search, all driven from one shared
inventory file.

## Structure

```
/
├── index.html              Homepage
├── styles.css               All styles (design tokens at the top)
├── script.js                 Shared behaviour: nav, WhatsApp links, card
│                              renderers, compare list, global search
├── data.js                   Master inventory (packages, hotels, deals,
│                              destinations, reviews) — single source of
│                              truth for every page
├── pages/
│   ├── packages.html         Package catalogue + filters + detail view
│   ├── find-your-trip.html   Guided trip finder
│   ├── destinations.html     Explore Kenya + destination detail
│   ├── hotels.html           Hotels & B&Bs (region → town → area) + detail
│   ├── deals.html            Deals by category (expiry-aware)
│   ├── compare.html          Side-by-side package/hotel comparison
│   └── contact.html          Enquiry form + WhatsApp Advisor
└── assets/
    ├── images/  icons/  logos/   (placeholders — add real photography here)
```

## Data architecture

All product data lives in `data.js` as `BONFIRE_DATA`. Packages, hotels,
deals, destinations and reviews are each defined once and referenced by id
everywhere else (Packages, Find Your Trip, Budget, Destinations, Hotels,
Deals, Compare and Search all read from the same arrays). To add real
inventory, edit the arrays in `data.js` — no other file needs to change
structurally.

**All prices, ratings, reviews and availability in `data.js` are clearly
labelled sample/demo data.** Replace with real Bonfire data (or wire the
same shape up to a live API) before launch.

## Notable behaviour

- **WhatsApp / Advisor**: every "Request Quote" / "Advisor" button builds a
  prefilled `wa.me` link via `Bonfire.buildWhatsAppLink()` in `script.js`.
  Update `WHATSAPP_NUMBER` at the top of that file with the real number.
- **Compare**: uses `localStorage` (key `bonfire_compare_list`) so a
  selection persists across pages, up to 4 items.
- **Deals**: `BONFIRE_DATA.getActiveDeals()` filters out anything past its
  `validUntil` date, so expired deals never render as active/bookable.
- **Hotels & B&Bs hierarchy**: `BONFIRE_DATA.REGIONS` defines
  Region → Town → Area; `hotels.html` progressively reveals towns and areas
  as a region/town is picked, plus a "Search Anywhere" reset.

## Extending

- New destination, package, hotel or deal → add an object to the relevant
  array in `data.js`.
- New page → copy an existing page in `pages/`, keep the same header/footer
  markup and `<script src="../data.js">` / `<script src="../script.js">`
  include order.
- Images referenced in `data.js` (e.g. `"diani.jpg"`) are filenames only —
  drop matching files into `assets/images/` and update card/detail
  templates in `script.js` to render `<img>` tags once real photography is
  available.
