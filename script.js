/* ==========================================================================
   BONFIRE ADVENTURES — SHARED SITE BEHAVIOUR
   Loaded on every page after data.js. Exposes window.Bonfire with helpers
   used by page-specific scripts (packages.html, hotels.html, etc.)
   ========================================================================== */

const Bonfire = (function () {
  const WHATSAPP_NUMBER = "254753192833"; // Bonfire Advisor line (primary) — displayed as 0753 192833

  /* ---------------- navigation ---------------- */
  function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // highlight current page link
    const path = location.pathname.split("/").pop() || "index.html";
    nav.querySelectorAll("a").forEach(function (a) {
      const href = a.getAttribute("href").split("/").pop();
      if (href === path) a.classList.add("is-active");
    });
  }

  /* ---------------- destinations mega-menu (desktop) / accordion (mobile) ---------------- */
  // Built once per page load, straight from BONFIRE_DATA, so Kenya / Africa /
  // International always reflect the live destination list — nothing here is
  // hand-duplicated markup that could drift out of sync with data.js.
  function initDestMegaMenu() {
    const link = document.querySelector('.main-nav a[href$="destinations.html"]');
    if (!link || link.parentElement.classList.contains('nav-item-mega')) return;
    const prefix = pagePrefix();
    const kenyaCats = ["Coast & Islands", "Wildlife & Safari", "Lakes & Nature", "Mountains & Highlands", "City & Culture"];
    const africa = BONFIRE_DATA.DESTINATIONS.filter(function (d) { return d.continent === "Africa"; });
    const intl = BONFIRE_DATA.DESTINATIONS.filter(function (d) { return d.continent === "International"; });

    function col(title, emoji, linksHTML) {
      return '<div class="mega-col"><h4>' + emoji + ' ' + title + '</h4><div class="mega-links">' + linksHTML + '</div></div>';
    }
    const kenyaLinks = kenyaCats.map(function (c) {
      return '<a href="' + prefix + 'pages/destinations.html?continent=Kenya&category=' + encodeURIComponent(c) + '">' + c + '</a>';
    }).join('');
    const africaLinks = africa.map(function (d) {
      return '<a href="' + prefix + 'pages/destinations.html?id=' + d.id + '">' + d.name + '</a>';
    }).join('') + '<a href="' + prefix + 'pages/destinations.html?continent=Africa">All Africa destinations</a>';
    const intlLinks = intl.map(function (d) {
      return '<a href="' + prefix + 'pages/destinations.html?id=' + d.id + '">' + d.name + '</a>';
    }).join('') + '<a href="' + prefix + 'pages/destinations.html?continent=International">All International destinations</a>';

    const mega = document.createElement('div');
    mega.className = 'mega-menu';
    mega.innerHTML =
      col('Kenya', '🇰🇪', kenyaLinks) +
      col('Africa', '🌍', africaLinks) +
      col('International', '✈️', intlLinks);

    const wrap = document.createElement('div');
    wrap.className = 'nav-item-mega';
    link.parentElement.insertBefore(wrap, link);
    wrap.appendChild(link);
    wrap.appendChild(mega);

    // Mobile: tapping the Destinations link toggles the accordion instead
    // of navigating away, so the same markup serves both breakpoints.
    link.addEventListener('click', function (e) {
      if (window.matchMedia('(max-width: 920px)').matches) {
        e.preventDefault();
        wrap.classList.toggle('is-open');
      }
    });
  }

  function initFooterYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------------- WhatsApp / Advisor ---------------- */
  function buildWhatsAppLink(details) {
    const lines = [];
    lines.push("Hi Bonfire Adventures, I'd like to enquire about:");
    if (details.product) lines.push("Product: " + details.product);
    if (details.destination) lines.push("Destination: " + details.destination);
    if (details.dates) lines.push("Dates: " + details.dates);
    if (details.travellers) lines.push("Travellers: " + details.travellers);
    if (details.budget) lines.push("Budget: " + details.budget);
    if (details.options) lines.push("Options: " + details.options);
    if (details.custom) lines.push(details.custom);
    const text = encodeURIComponent(lines.join("\n"));
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text;
  }

  // Exact template requested for hotel/B&B enquiries — hotel + destination
  // are inserted automatically, the guest never has to type them.
  function buildHotelWhatsAppLink(hotelName, destinationName) {
    const msg = "Hello Bonfire Adventures, I am interested in booking " + hotelName +
      " in " + destinationName + ". Please help me with availability, current pricing and booking.";
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg);
  }

  function callBonfireLink() {
    return "tel:+" + WHATSAPP_NUMBER;
  }

  function initWhatsAppButtons() {
    document.querySelectorAll("[data-whatsapp]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        if (btn.hasAttribute("data-hotel-whatsapp")) {
          const hotelName = btn.getAttribute("data-hotel-whatsapp") || "";
          const destName = btn.getAttribute("data-destination") || "";
          btn.setAttribute("href", buildHotelWhatsAppLink(hotelName, destName));
          return;
        }
        const details = {
          product: btn.getAttribute("data-product") || "",
          destination: btn.getAttribute("data-destination") || "",
          custom: btn.getAttribute("data-message") || ""
        };
        btn.setAttribute("href", buildWhatsAppLink(details));
      });
    });
  }

  /* ---------------- path helper ---------------- */
  // Card renderers are used both on index.html (site root) and on pages inside
  // /pages/ (packages.html, hotels.html, destinations.html, find-your-trip.html).
  // Links and image URLs in data.js are written root-relative ("pages/…",
  // "assets/…"), so on a /pages/ document they need a "../" prefix or they
  // resolve to a broken doubled path (e.g. pages/pages/packages.html).
  function pagePrefix() {
    return location.pathname.indexOf("/pages/") !== -1 ? "../" : "";
  }

  /* ---------------- formatting helpers ---------------- */
  const formatKES = BONFIRE_DATA.formatKES;

  function stars(rating) {
    const full = Math.round(rating);
    return "★".repeat(full) + "☆".repeat(5 - full);
  }

  /* ---------------- card renderers ---------------- */
  function packageCardHTML(pkg) {
    const dest = BONFIRE_DATA.getDestinationById(pkg.destinationId);
    const img = pkg.image ? pkg.image : (dest && dest.images && dest.images[0] ? dest.images[0].src : "");
    const prefix = pagePrefix();
    const isInternational = pkg.flightsIncluded !== undefined;
    const ratingHTML = pkg.rating ? '<span class="rating">★ ' + pkg.rating + ' (' + pkg.reviewCount + ')</span>' : '';
    const priceHTML = pkg.price == null
      ? '<span class="price-on-request">PRICE ON REQUEST</span>'
      : formatKES(pkg.price) + '<br><small>' + pkg.priceBasis + '</small>';
    const flightBadge = isInternational
      ? '<div class="flight-visa-badges">' +
          '<span class="' + (pkg.flightsIncluded ? 'fv-yes' : 'fv-no') + '">Flights ' + (pkg.flightsIncluded ? 'included' : 'excluded') + '</span>' +
          '<span class="' + (pkg.visaIncluded ? 'fv-yes' : 'fv-no') + '">Visa ' + (pkg.visaIncluded ? 'included' : 'excluded') + '</span>' +
        '</div>'
      : '';
    return (
      '<article class="card" data-analytics="package-card" data-id="' + pkg.id + '">' +
        '<div class="card-media"' + (img ? ' data-bg="' + prefix + img + '"' : '') + '><span class="badge">' + pkg.duration + '</span>' +
          ratingHTML + '</div>' +
        '<div class="card-body">' +
          '<div class="card-loc">' + (dest ? dest.name : pkg.region) + ' · ' + pkg.region + '</div>' +
          '<h3 class="card-title">' + pkg.name + '</h3>' +
          '<p class="card-desc">' + pkg.desc + '</p>' +
          '<div class="card-tags">' + pkg.experiences.slice(0, 3).map(function (t) { return "<span>" + t + "</span>"; }).join("") + '</div>' +
          flightBadge +
          '<div class="card-foot">' +
            '<div class="price">' + priceHTML + '</div>' +
            '<div class="card-actions">' +
              '<a class="btn btn-ghost btn-sm" href="' + prefix + 'pages/packages.html?id=' + pkg.id + '" data-analytics="package-view">View</a>' +
              '<a class="btn btn-primary btn-sm" data-whatsapp data-product="' + pkg.name + '" data-destination="' + (dest ? dest.name : pkg.region) + '" target="_blank" rel="noopener" data-analytics="request-quote">Request Quote</a>' +
            '</div>' +
          '</div>' +
          '<label class="card-compare-toggle"><input type="checkbox" data-compare-add data-compare-type="package" data-compare-id="' + pkg.id + '"> Add to Compare</label>' +
        '</div>' +
      '</article>'
    );
  }

  function hotelCardHTML(h) {
    const priceHTML = h.price
      ? formatKES(h.price) + '<br><small>' + h.priceBasis + '</small>'
      : '<span style="font-size:.85rem;">Check Availability</span>';
    const prefix = pagePrefix();
    return (
      '<article class="card card--compact" data-analytics="hotel-card" data-id="' + h.id + '">' +
        '<div class="card-media card-media--sm" data-bg="' + prefix + h.image + '"><span class="badge">' + h.accommodationType + '</span></div>' +
        '<div class="card-body">' +
          '<div class="card-loc">' + h.town + ' · ' + h.region + '</div>' +
          '<h3 class="card-title card-title--sm">' + h.name + '</h3>' +
          '<div class="card-foot">' +
            '<div class="price">' + priceHTML + '</div>' +
            '<div class="card-actions">' +
              '<a class="btn btn-ghost btn-sm" href="' + prefix + 'pages/hotels.html?id=' + h.id + '" data-analytics="hotel-view">Details</a>' +
              '<a class="btn btn-primary btn-sm" data-whatsapp data-hotel-whatsapp="' + h.name + '" data-destination="' + h.town + '" target="_blank" rel="noopener" data-analytics="request-quote">Contact</a>' +
            '</div>' +
          '</div>' +
          '<label class="card-compare-toggle"><input type="checkbox" data-compare-add data-compare-type="hotel" data-compare-id="' + h.id + '"> Add to Compare</label>' +
        '</div>' +
      '</article>'
    );
  }

  // Resolves a representative image for a deal from its linked package
  // (via the package's destination photography) or linked hotel — deals
  // have no photography of their own, so we reuse the same real assets
  // the package/hotel card already shows, never a placeholder.
  function dealImage(deal) {
    if (deal.hotelId) {
      const hotel = BONFIRE_DATA.getHotelById(deal.hotelId);
      if (hotel && hotel.image) return hotel.image;
    }
    if (deal.packageId) {
      const pkg = BONFIRE_DATA.getPackageById(deal.packageId);
      if (pkg && pkg.image) return pkg.image;
      const dest = pkg && BONFIRE_DATA.getDestinationById(pkg.destinationId);
      if (dest && dest.images && dest.images[0]) return dest.images[0].src;
    }
    return "";
  }

  function dealCardHTML(deal) {
    const savings = deal.originalPrice - deal.dealPrice;
    const img = dealImage(deal);
    const prefix = pagePrefix();
    return (
      '<article class="card" data-analytics="deal-card" data-id="' + deal.id + '">' +
        '<div class="card-media"' + (img ? ' data-bg="' + prefix + img + '"' : '') + '><span class="badge">' + deal.category + '</span>' +
          '<span class="rating">Save ' + formatKES(savings) + '</span></div>' +
        '<div class="card-body">' +
          '<div class="card-loc">Valid until ' + new Date(deal.validUntil).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) + '</div>' +
          '<h3 class="card-title">' + deal.title + '</h3>' +
          '<p class="card-desc">Travel period: ' + deal.travelPeriod + '</p>' +
          '<div class="card-tags">' + deal.inclusions.slice(0, 3).map(function (t) { return "<span>" + t + "</span>"; }).join("") + '</div>' +
          '<div class="card-foot">' +
            '<div class="price"><span class="was">' + formatKES(deal.originalPrice) + '</span>' + formatKES(deal.dealPrice) + '<br><small>per person</small></div>' +
            '<div class="card-actions">' +
              '<a class="btn btn-ghost btn-sm" href="' + prefix + 'pages/deals.html?id=' + deal.id + '" data-analytics="deal-view">View</a>' +
              '<a class="btn btn-primary btn-sm" data-whatsapp data-product="' + deal.title + '" target="_blank" rel="noopener" data-analytics="deal-claim">Claim Deal</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function reviewCardHTML(r) {
    return (
      '<div class="review-card">' +
        '<div class="review-stars">' + stars(r.rating) + '</div>' +
        '<p class="review-quote">"' + r.text + '"</p>' +
        '<div class="review-name">' + r.name + '</div>' +
        '<div class="review-meta">' + r.context + '</div>' +
      '</div>'
    );
  }

  function emptyStateHTML(opts) {
    opts = opts || {};
    return (
      '<div class="empty-state">' +
        '<div class="icon">' + (opts.icon || "🧭") + '</div>' +
        '<h3>' + (opts.title || "No results found") + '</h3>' +
        '<p>' + (opts.text || "Try a broader search, flexible dates, or talk to a Travel Advisor.") + '</p>' +
        '<div class="empty-actions">' +
          '<a class="btn btn-outline btn-sm" href="' + (opts.altHref || "../index.html") + '">' + (opts.altLabel || "Browse all") + '</a>' +
          '<a class="btn btn-whatsapp btn-sm" data-whatsapp data-message="' + (opts.waMessage || "I could not find what I was looking for, please help me plan a custom trip.") + '" target="_blank" rel="noopener">Ask a Travel Advisor</a>' +
        '</div>' +
      '</div>'
    );
  }

  /* ---------------- compare list (persisted) ---------------- */
  const COMPARE_KEY = "bonfire_compare_list";

  function getCompareList() {
    try {
      return JSON.parse(localStorage.getItem(COMPARE_KEY)) || [];
    } catch (e) { return []; }
  }

  function saveCompareList(list) {
    try { localStorage.setItem(COMPARE_KEY, JSON.stringify(list)); } catch (e) {}
    updateCompareBadge();
  }

  function addToCompare(type, id) {
    const list = getCompareList();
    if (list.some(function (i) { return i.type === type && i.id === id; })) return list;
    if (list.length >= 4) {
      alert("You can compare up to 4 items at a time. Remove one first.");
      return list;
    }
    list.push({ type: type, id: id });
    saveCompareList(list);
    return list;
  }

  function removeFromCompare(type, id) {
    const list = getCompareList().filter(function (i) { return !(i.type === type && i.id === id); });
    saveCompareList(list);
    return list;
  }

  function clearCompare() { saveCompareList([]); }

  function updateCompareBadge() {
    const badge = document.querySelector("[data-compare-count]");
    if (badge) badge.textContent = getCompareList().length;
  }

  function initCompareToggles() {
    document.addEventListener("change", function (e) {
      const el = e.target;
      if (!el.matches("[data-compare-add]")) return;
      const type = el.getAttribute("data-compare-type");
      const id = el.getAttribute("data-compare-id");
      if (el.checked) addToCompare(type, id);
      else removeFromCompare(type, id);
    });
    // reflect existing state on load
    const list = getCompareList();
    document.querySelectorAll("[data-compare-add]").forEach(function (el) {
      const type = el.getAttribute("data-compare-type");
      const id = el.getAttribute("data-compare-id");
      if (list.some(function (i) { return i.type === type && i.id === id; })) el.checked = true;
    });
    updateCompareBadge();
  }

  /* ---------------- global search (header) ---------------- */
  // Each entry carries a `keywords` string — region, experiences, traveller
  // type, duration, town, category — pulled from real data fields, so a
  // natural-language query like "honeymoon in Kenya" or "3 day Maasai Mara
  // safari" can match on the underlying tags even though no single field
  // contains that exact phrase. Nothing here is a real language model —
  // it's token overlap against real attributes, which is the ceiling for a
  // static client-side site with no backend/AI API.
  function buildSearchIndex() {
    const idx = [];
    const prefix = pagePrefix();
    BONFIRE_DATA.PACKAGES.forEach(function (p) {
      const dest = BONFIRE_DATA.getDestinationById(p.destinationId);
      idx.push({
        type: "Package", label: p.name, sub: p.region,
        href: prefix + "pages/packages.html?id=" + p.id,
        keywords: [p.region, dest ? dest.name : "", p.duration, p.experiences.join(" "), p.travellerType.join(" "), p.accommodation].join(" ")
      });
    });
    BONFIRE_DATA.HOTELS.forEach(function (h) {
      idx.push({
        type: "Hotel/B&B", label: h.name, sub: h.town,
        href: prefix + "pages/hotels.html?id=" + h.id,
        keywords: [h.town, h.region, h.accommodationType, (h.amenities || []).join(" ")].join(" ")
      });
    });
    BONFIRE_DATA.DESTINATIONS.forEach(function (d) {
      idx.push({
        type: "Destination", label: d.name, sub: d.category,
        href: prefix + "pages/destinations.html?id=" + d.id,
        keywords: [d.category, d.region, d.tagline, (d.experiences || []).join(" ")].join(" ")
      });
    });
    BONFIRE_DATA.DEALS.forEach(function (d) {
      idx.push({
        type: "Deal", label: d.title, sub: d.category,
        href: prefix + "pages/deals.html?id=" + d.id,
        keywords: [d.category, d.travelPeriod, (d.inclusions || []).join(" ")].join(" ")
      });
    });
    return idx;
  }

  const SEARCH_STOPWORDS = ["a", "an", "the", "in", "of", "for", "to", "on", "at", "with", "and", "kenya"];

  function initGlobalSearch() {
    // Site header markup includes a desktop search field, and — inside the
    // mobile nav dropdown — a second field pointing at the same data, so the
    // same search is reachable on mobile. Both are wired up identically here.
    const inputs = document.querySelectorAll("[data-global-search]");
    if (!inputs.length) return;
    inputs.forEach(function (input) {
      const results = input.closest(".header-search") ? input.closest(".header-search").querySelector("[data-global-search-results]") : null;
      if (!results) return;
      initGlobalSearchInstance(input, results);
    });
  }

  function initGlobalSearchInstance(input, results) {
    const index = buildSearchIndex().map(function (i) {
      return Object.assign({}, i, { haystack: (i.label + " " + i.sub + " " + i.keywords).toLowerCase() });
    });
    function render(items) {
      if (!items.length) { results.innerHTML = '<div class="gs-empty">No matches — try a broader term or ask an Advisor.</div>'; results.hidden = false; return; }
      results.innerHTML = items.slice(0, 8).map(function (i) {
        return '<a class="gs-item" href="' + i.href + '"><span class="gs-type">' + i.type + '</span>' + i.label + '<span class="gs-sub">' + i.sub + '</span></a>';
      }).join("");
      results.hidden = false;
    }
    input.addEventListener("input", function () {
      const raw = input.value.trim().toLowerCase();
      if (!raw) { results.hidden = true; return; }

      // Whole-phrase substring match still wins outright (fastest path for
      // an exact name/place lookup); otherwise fall back to token scoring
      // so a multi-word natural query still surfaces relevant results.
      const direct = index.filter(function (i) { return i.haystack.indexOf(raw) !== -1; });
      if (direct.length) { render(direct); return; }

      const tokens = raw.split(/\s+/).filter(function (t) { return t.length > 1 && SEARCH_STOPWORDS.indexOf(t) === -1; });
      if (!tokens.length) { render([]); return; }

      const scored = index
        .map(function (i) {
          const hits = tokens.filter(function (t) { return i.haystack.indexOf(t) !== -1; }).length;
          return { item: i, hits: hits };
        })
        .filter(function (s) { return s.hits > 0; })
        .sort(function (a, b) { return b.hits - a.hits; })
        .map(function (s) { return s.item; });

      render(scored);
    });
    document.addEventListener("click", function (e) {
      if (!results.contains(e.target) && e.target !== input) results.hidden = true;
    });
  }

  /* ---------------- mobile sticky action bar ---------------- */
  // Injected once per page load. "Book" defaults to Find Your Trip — the
  // one page every product ultimately funnels through — since the bar has
  // no page-specific context to hand off (a package/hotel detail page's
  // own on-page CTAs already handle that more specifically).
  function initMobileActionBar() {
    if (document.querySelector(".mobile-action-bar")) return;
    const prefix = pagePrefix();
    const bar = document.createElement("div");
    bar.className = "mobile-action-bar";
    bar.innerHTML =
      '<div class="mobile-action-bar-inner">' +
        '<a class="mab-primary" data-whatsapp data-message="Hi, I\'d like to speak with a Travel Advisor." target="_blank" rel="noopener"><span class="mab-icon">💬</span>WhatsApp</a>' +
        '<a href="' + callBonfireLink() + '"><span class="mab-icon">📞</span>Call</a>' +
        '<a href="' + prefix + 'pages/packages.html"><span class="mab-icon">🧭</span>Book</a>' +
      '</div>';
    document.body.appendChild(bar);
  }

  /* ---------------- lazy background images ---------------- */
  // Cards/galleries use CSS background-image (not <img>) throughout the
  // site, so native loading="lazy" doesn't apply. This defers the actual
  // fetch until an element carrying data-bg is near the viewport. Safe to
  // call repeatedly after any re-render — already-loaded elements drop
  // their data-bg attribute so they're never re-queued.
  //
  // IMPORTANT: this file's own DOMContentLoaded handler (init(), below)
  // always calls this once, and every page's inline render script also
  // calls it right after building its cards. Both calls can legitimately
  // see the same not-yet-loaded elements (the inline call runs first,
  // synchronously, before DOMContentLoaded fires). If we naively created a
  // second IntersectionObserver on those same elements, both observers
  // fire when the element scrolls into view; whichever callback runs
  // second reads an already-removed data-bg attribute and sets
  // background-image to a bogus "url('null')", which is what caused
  // images to flash in and then vanish. The data-bg-pending marker below
  // makes repeated calls idempotent: an element already queued by an
  // earlier call is skipped instead of being handed to a second observer.
  function initLazyBackgrounds() {
    const els = document.querySelectorAll("[data-bg]:not([data-bg-pending])");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        const bg = el.getAttribute("data-bg");
        if (bg) el.style.backgroundImage = "url('" + bg + "')";
        el.removeAttribute("data-bg");
      });
      return;
    }
    const io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const bg = el.getAttribute("data-bg");
        if (bg) {
          el.style.backgroundImage = "url('" + bg + "')";
          el.removeAttribute("data-bg");
        }
        el.removeAttribute("data-bg-pending");
        obs.unobserve(el);
      });
    }, { rootMargin: "200px 0px" });
    els.forEach(function (el) { el.setAttribute("data-bg-pending", ""); io.observe(el); });
  }

  /* ---------------- init ---------------- */
  function init() {
    initNav();
    initDestMegaMenu();
    initFooterYear();
    initMobileActionBar();
    initWhatsAppButtons();
    initCompareToggles();
    initGlobalSearch();
    initLazyBackgrounds();
  }

  document.addEventListener("DOMContentLoaded", init);

  return {
    formatKES: formatKES,
    stars: stars,
    buildWhatsAppLink: buildWhatsAppLink,
    buildHotelWhatsAppLink: buildHotelWhatsAppLink,
    callBonfireLink: callBonfireLink,
    initWhatsAppButtons: initWhatsAppButtons,
    initLazyBackgrounds: initLazyBackgrounds,
    packageCardHTML: packageCardHTML,
    hotelCardHTML: hotelCardHTML,
    dealCardHTML: dealCardHTML,
    reviewCardHTML: reviewCardHTML,
    emptyStateHTML: emptyStateHTML,
    getCompareList: getCompareList,
    addToCompare: addToCompare,
    removeFromCompare: removeFromCompare,
    clearCompare: clearCompare,
    updateCompareBadge: updateCompareBadge
  };
})();
