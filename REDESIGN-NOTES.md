# Bonfire Adventures — Redesign Notes

Summary of the Destinations-first / Kenya–Africa–International redesign,
built on top of the existing project (nothing rebuilt from scratch).

## 1. Files changed
- `data.js` — added `continent` field ("Kenya" / "Africa" / "International")
  to every destination; added a `CONTINENTS` list; added 6 new destinations
  (South Africa, Cairo, Dubai, Malaysia, China, Bali); added 6 new packages
  (p19–p24) with full duration/accommodation/price/meals/transport/
  activities/inclusions/exclusions fields, plus `flightsIncluded` /
  `visaIncluded` flags; added `formatPackagePrice()` helper so an
  unconfirmed price always renders as "Price on request", never a
  fabricated figure; added "City" to `EXPERIENCES` so the new international
  destinations are filterable by it.
- `script.js` — `packageCardHTML()` now shows a flights/visa badge row and
  a price-on-request state; added a data-driven Destinations mega-menu
  (`initDestMegaMenu()`) built straight from `BONFIRE_DATA`, shown as a
  desktop dropdown and a mobile accordion; the mobile bottom action bar's
  "Book" shortcut now points at Packages instead of the removed Find Your
  Trip category.
- `styles.css` — appended a new block (nothing above it removed) with
  styles for the mega-menu, continent tabs, the homepage continent tiles,
  flight/visa badges, the price-on-request pill, the Included / Not
  Included two-column layout on package detail pages, and the notice
  banner used on `find-your-trip.html`.
- `index.html` — hero copy rewritten ("Discover Kenya. Experience Africa.
  See the World.") with Explore Destinations / View Packages / WhatsApp
  buttons; homepage section order changed to Hero → **Where Will You Go?**
  (Kenya / Africa / International tiles) → Popular Destinations → Featured
  Packages → Hotels & B&Bs Highlights → Deals → Experiences → Honeymoon
  banner → (existing trust/reviews sections, unchanged); primary nav
  reduced to the 4 required categories; Find Your Trip removed from nav,
  hero, footer and the honeymoon banner CTA (now links to
  `packages.html?experience=Honeymoon`).
- `pages/destinations.html` — added continent tabs (Kenya / Africa /
  International) above the existing category chips; category chips are
  now scoped to whichever continent is active; supports
  `?continent=` and `?category=` deep links from the mega-menu.
- `pages/packages.html` — nav updated; package detail view now renders a
  clear ✅ Included / 🚫 Not Included two-column layout, plus a flights/visa
  badge row for international packages; price-on-request handled instead
  of a fabricated number; the old "Request Booking" button that pointed at
  Find Your Trip was removed (WhatsApp + a Contact-form link remain); the
  no-results empty state now clears filters instead of linking to Find
  Your Trip; deep-linking `?traveller=` added alongside the existing
  `?experience=`.
- `pages/hotels.html`, `pages/deals.html`, `pages/compare.html`,
  `pages/contact.html` — nav updated only; all 122 accommodation records,
  regional grouping, and pricing-basis display are untouched.
- `pages/find-your-trip.html` — kept (not deleted, so no link anywhere on
  the internet breaks) but removed from every nav/menu; a banner now
  explains its filters have moved into Packages, Hotels & B&Bs, and
  Destinations, each of which already has the same destination/budget/
  experience filtering.
- `IMAGE-CHECKLIST.md` — appended the 6 new destination + 6 new package
  image slots.

## 2. Files added
- `assets/images/destinations/{south-africa,cairo,dubai,malaysia,china,bali}/…-1.jpg`
  — placeholder photography, clearly labelled "Photograph coming soon",
  not disguised as real photos.
- `assets/images/packages/{dubai-city-desert-escape, malaysia-kl-langkawi-discovery,
  china-beijing-shanghai-highlights, south-africa-cape-kruger-safari,
  cairo-pyramids-nile-tour, bali-island-romance-retreat}.jpg` — same,
  package-specific placeholders.
- `REDESIGN-NOTES.md` (this file).

## 3. Existing files/content preserved
- All 23 pre-existing Kenyan destinations — untouched, unrenamed, just
  tagged `continent: "Kenya"`.
- All 18 pre-existing packages (p1–p18), all 122 hotel records, all deals,
  reviews, and existing images/paths — none renamed or moved.
- Booking/contact functionality, the site-wide WhatsApp number and
  `data-whatsapp` buttons, responsive behaviour, and the existing
  image-loading fix (`initLazyBackgrounds`, no remove-on-error pattern).
- All working links — `find-your-trip.html` still resolves; nothing 404s.

## 4. Where the six new destination photographs go
See the "NEW — Africa & International destinations" section at the
bottom of `IMAGE-CHECKLIST.md` for the exact 12 file paths (6 destination
hero photos + 6 package cover photos).

## 5. How the new destination data is organized
Everything lives in `data.js`, the single existing data source — nothing
is hard-coded per-page. Each destination now carries a `continent` field
("Kenya" | "Africa" | "International") alongside its existing `category`,
`region`, `tagline`, `experiences` and `images`. Packages reference
destinations by `destinationId`, exactly as before; the six new packages
add `flightsIncluded` / `visaIncluded` booleans and an `activities` array
used only by international-style packages.

## 6. Replacing the placeholders with final photographs
Drop your photo in with the **exact same filename** shown in
`IMAGE-CHECKLIST.md` (overwriting the placeholder). No HTML, CSS or
`data.js` changes are required — every path is already wired in.
Landscape orientation, 1200px+ wide, is recommended.

## 7. Confirmation — nothing existing was renamed or deleted
All 23 original Kenyan destinations, all 18 original packages and all 122
hotel records keep their original `id`s, filenames and image paths. The
only removals were: Find Your Trip as a primary nav/homepage category
(the page itself still exists and works), and nothing else.

## 8. Confirmation — image-disappearing issue
The site's existing `initLazyBackgrounds()` lazy-load system (IntersectionObserver-based,
no "remove image on error" logic, correct relative paths) was already in
place before this redesign and was not altered; all new sections (mega-menu,
continent tiles) use the same `data-bg` mechanism, so they get the same
reliable load-on-scroll behaviour, including after refresh, direct URL
loads, and in-app navigation.
