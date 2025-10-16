const DB = {
  products: [],
  stores: [],
  categories: [],
  countries: [],
  shipping: null
};

const state = {
  wishlist: [],
  quotes: new Map(),
  chatOpen: false
};

const WIS_KEY = 'selekti_wishlist';

document.addEventListener('DOMContentLoaded', () => {
  initSheets();
  initGlobalSearch();
  initAuthMock();
  initWishlist();
  initChatbot();
  loadData().then(() => {
    const page = document.body.dataset.page;
    switch (page) {
      case 'landing':
        initLanding();
        break;
      case 'directory':
        initDirectory();
        break;
      case 'country':
        initCountry();
        break;
      case 'partners':
        initPartners();
        break;
      case 'about':
        initAbout();
        break;
      default:
        break;
    }
  }).catch(console.error);
});

async function loadData() {
  const files = ['products', 'stores', 'categories', 'countries'];
  await Promise.all(files.map(async key => {
    try {
      const res = await fetch(`/data/${key}.json`, { cache: 'no-store' });
      DB[key] = await res.json();
    } catch (err) {
      console.error('Failed to load', key, err);
      DB[key] = [];
    }
  }));
  try {
    const res = await fetch('/data/shipping-config.json', { cache: 'no-store' });
    DB.shipping = await res.json();
  } catch (err) {
    console.error('Failed to load shipping config', err);
    DB.shipping = null;
  }
}

function initGlobalSearch() {
  const form = document.querySelector('#global-search');
  if (!form) return;
  form.addEventListener('submit', evt => {
    evt.preventDefault();
    const input = form.querySelector('#global-search-input');
    const value = input ? input.value.trim() : '';
    const target = value ? `/butikker.html?q=${encodeURIComponent(value)}` : '/butikker.html';
    window.location.href = target;
  });
}

function initAuthMock() {
  const authButtons = document.querySelectorAll('[data-auth-action]');
  authButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      toast('Login er ikke aktivt i denne version – brug ønskelisten for at komme i gang');
    });
  });
}

function initSheets() {
  const dim = document.querySelector('#sheet-dim');
  if (dim) {
    dim.addEventListener('click', closeSheets);
  }
  document.body.addEventListener('click', evt => {
    const openBtn = evt.target.closest('[data-open]');
    if (openBtn) {
      evt.preventDefault();
      const id = openBtn.dataset.open;
      if (id === 'sheet-wishlist') {
        const prefill = openBtn.dataset.prefillUrl;
        if (prefill) {
          const input = document.querySelector('#wishlist-product-url');
          if (input) input.value = prefill;
        }
      }
      openSheet(id);
    }
    const closeBtn = evt.target.closest('[data-close]');
    if (closeBtn) {
      evt.preventDefault();
      closeSheets();
    }
    const toggle = evt.target.closest('[data-toggle="est-breakdown"]');
    if (toggle) {
      const list = document.querySelector('#est-breakdown');
      if (list) {
        list.hidden = !list.hidden;
      }
    }
    const addWishlistBtn = evt.target.closest('[data-add-to-wishlist]');
    if (addWishlistBtn) {
      evt.preventDefault();
      toggleWishlistItem(datasetToProduct(addWishlistBtn.dataset));
    }
    const prefillBtn = evt.target.closest('[data-prefill-url]');
    if (prefillBtn) {
      const url = prefillBtn.dataset.prefillUrl;
      if (url) {
        const input = document.querySelector('#wishlist-product-url');
        if (input) input.value = url;
      }
    }
  });
}

function openSheet(id) {
  const sheet = document.querySelector(`#${id}`);
  const dim = document.querySelector('#sheet-dim');
  if (!sheet) return;
  sheet.classList.add('open');
  sheet.removeAttribute('hidden');
  if (dim) {
    dim.classList.add('visible');
    dim.removeAttribute('hidden');
  }
}

function closeSheets() {
  document.querySelectorAll('.sheet.open').forEach(sheet => sheet.classList.remove('open'));
  const dim = document.querySelector('#sheet-dim');
  if (dim) {
    dim.classList.remove('visible');
    dim.setAttribute('hidden', '');
  }
  setTimeout(() => {
    document.querySelectorAll('.sheet').forEach(sheet => {
      sheet.classList.remove('open');
      sheet.setAttribute('hidden', '');
    });
  }, 200);
}

function initWishlist() {
  try {
    const stored = localStorage.getItem(WIS_KEY);
    state.wishlist = stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.warn('Wishlist storage unavailable', err);
    state.wishlist = [];
  }
  renderWishlist();
  updateWishlistBadge();
  const form = document.querySelector('#wishlist-form');
  if (form) {
    form.addEventListener('submit', evt => {
      evt.preventDefault();
      submitNetlifyForm(form);
    });
  }
  const clearBtn = document.querySelector('#wishlist-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      state.wishlist = [];
      persistWishlist();
      toast('Ønskeliste ryddet');
    });
  }
}

function datasetToProduct(data) {
  return {
    id: data.id,
    title: data.title,
    img: data.img,
    priceDKK: Number(data.price) || 0,
    url: data.url
  };
}

function toggleWishlistItem(item) {
  const index = state.wishlist.findIndex(entry => entry.id === item.id);
  if (index >= 0) {
    state.wishlist.splice(index, 1);
    toast('Fjernet fra ønskeliste');
  } else {
    state.wishlist.push(item);
    toast('Tilføjet til ønskeliste');
  }
  persistWishlist();
}

function persistWishlist() {
  try {
    localStorage.setItem(WIS_KEY, JSON.stringify(state.wishlist));
  } catch (err) {
    console.warn('Unable to persist wishlist', err);
  }
  renderWishlist();
  updateWishlistBadge();
}

function renderWishlist() {
  const list = document.querySelector('#wishlist-list');
  const empty = document.querySelector('#wishlist-empty');
  const actions = document.querySelector('#wishlist-actions');
  const jsonField = document.querySelector('#wishlist-json');
  if (!list || !empty) return;
  list.innerHTML = '';
  if (state.wishlist.length === 0) {
    empty.hidden = false;
    if (actions) actions.hidden = true;
  } else {
    empty.hidden = true;
    if (actions) actions.hidden = false;
    const frag = document.createDocumentFragment();
    state.wishlist.forEach(item => {
      const article = document.createElement('article');
      article.className = 'card wishlist-item';
      article.innerHTML = `
        <img src="${item.img || 'https://via.placeholder.com/320x200?text=Selekti'}" alt="${item.title}" loading="lazy" />
        <div class="wishlist-item-body">
          <h3>${item.title}</h3>
          <p>${item.priceDKK ? `Ca. ${item.priceDKK.toLocaleString('da-DK')} kr.` : ''}</p>
          <div class="wishlist-item-actions">
            <a class="btn ghost" href="${item.url}" target="_blank" rel="noopener">Åbn butik</a>
            <button class="btn primary" data-remove="${item.id}">Fjern</button>
          </div>
        </div>`;
      frag.appendChild(article);
    });
    list.appendChild(frag);
    list.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-remove');
        state.wishlist = state.wishlist.filter(item => item.id !== id);
        persistWishlist();
      });
    });
  }
  if (jsonField) {
    jsonField.value = JSON.stringify(state.wishlist);
  }
}

function updateWishlistBadge() {
  const badge = document.querySelector('#wishlist-count');
  if (badge) badge.textContent = String(state.wishlist.length);
}

function initLanding() {
  renderFeaturedStores();
  renderFeaturedProducts();
  renderGuides();
  initEstimator();
  initHeroEstimator();
  initWishlistSubmitButton();
}

function initWishlistSubmitButton() {
  document.querySelectorAll('form[data-netlify="true"]').forEach(form => {
    if (!form.dataset.boundSubmit) {
      form.dataset.boundSubmit = 'true';
      form.addEventListener('submit', evt => {
        evt.preventDefault();
        submitNetlifyForm(form);
      });
    }
  });
}

function renderFeaturedStores() {
  const container = document.querySelector('#featured-stores');
  if (!container) return;
  container.innerHTML = '';
  const stores = DB.stores.filter(store => store.featured || store.premium).sort((a, b) => (b.premium ? 1 : 0) - (a.premium ? 1 : 0));
  stores.slice(0, 8).forEach(store => {
    const card = document.createElement('article');
    card.className = 'card store-card';
    card.innerHTML = `
      <div class="store-card-header">
        <img src="${store.logo || 'https://via.placeholder.com/120?text=Store'}" alt="${store.name}" loading="lazy" />
        ${store.premium ? '<span class="badge">Premium-partner</span>' : ''}
      </div>
      <div class="store-card-body">
        <h3>${store.name}</h3>
        <p>${store.deliveryHint || ''}</p>
        <div class="store-card-actions">
          <a class="btn primary" href="/butikker.html?store=${encodeURIComponent(store.id)}">Se produkter</a>
          <button class="btn ghost" data-open="sheet-wishlist" data-prefill-url="${store.url}">Bestil via link</button>
        </div>
      </div>`;
    container.appendChild(card);
  });
}

function renderFeaturedProducts() {
  const container = document.querySelector('#featured-products');
  if (!container) return;
  container.innerHTML = '';
  const products = DB.products.filter(product => product.featured).slice(0, 12);
  products.forEach(product => {
    container.appendChild(productCard(product));
  });
}

function renderGuides() {
  const guidesContainer = document.querySelector('#landing-guides');
  if (!guidesContainer) return;
  const guides = [
    { country: 'JP', title: 'Guide: Japanske sneakers', url: '/japan.html', video: 'https://www.youtube.com/embed/1' },
    { country: 'KR', title: 'Guide: K-Beauty essentials', url: '/sydkorea.html', video: 'https://www.youtube.com/embed/2' },
    { country: 'US', title: 'Guide: Kameraudstyr fra USA', url: '/usa.html', video: 'https://www.youtube.com/embed/3' }
  ];
  guidesContainer.innerHTML = guides.map(guide => `
    <article class="card guide-card">
      <div class="guide-media">
        <iframe src="${guide.video}" title="${guide.title}" loading="lazy" allowfullscreen></iframe>
      </div>
      <div class="guide-body">
        <h3>${guide.title}</h3>
        <a class="btn ghost" href="${guide.url}">Se landesiden</a>
      </div>
    </article>`).join('');
}

function initEstimator() {
  const form = document.querySelector('#est-form');
  const zoneSelect = document.querySelector('#est-zone');
  const totalEl = document.querySelector('#est-total');
  const breakdownEl = document.querySelector('#est-breakdown');
  if (!form || !zoneSelect || !totalEl) return;
  if (DB.shipping?.zones) {
    zoneSelect.innerHTML = DB.shipping.zones.map(zone => `<option value="${zone.code}">${zone.label}</option>`).join('');
  }
  form.addEventListener('submit', evt => {
    evt.preventDefault();
    const price = Number(document.querySelector('#est-price')?.value || 0);
    const weight = Number(document.querySelector('#est-weight')?.value || 0);
    const zone = zoneSelect.value || 'US';
    const estimate = computeEstimate({ itemDKK: price, weightKg: weight, zone });
    totalEl.textContent = `DKK ${estimate.total.toLocaleString('da-DK')}`;
    if (breakdownEl) {
      breakdownEl.innerHTML = Object.entries(estimate.breakdown).map(([key, value]) => `<li>${labelForBreakdown(key)}: DKK ${value.toLocaleString('da-DK')}</li>`).join('');
      breakdownEl.hidden = false;
    }
  });
}

function labelForBreakdown(key) {
  const labels = {
    item: 'Vare',
    freight: 'Fragt',
    service: 'Service',
    duty: 'Told (est.)',
    vat: 'Moms'
  };
  return labels[key] || key;
}

function computeEstimate({ itemDKK, weightKg, zone }) {
  const config = DB.shipping;
  if (!config) {
    return { total: Math.round(itemDKK || 0), breakdown: { item: Math.round(itemDKK || 0) } };
  }
  const zoneConfig = config.zones.find(z => z.code === zone) || config.zones[0];
  const weights = config.weights || [];
  const freightTable = config.freight?.[zoneConfig.code] || [];
  const index = weights.findIndex(limit => weightKg <= limit);
  const freight = freightTable[index >= 0 ? index : freightTable.length - 1] || freightTable[freightTable.length - 1] || 0;
  const service = Math.max(Math.round((config.service?.rate || 0.12) * itemDKK), config.service?.minDKK || 49);
  const duty = Math.round((zoneConfig.dutyDefault || 0.03) * (itemDKK + freight));
  const vat = Math.round((zoneConfig.vat || 0) * (itemDKK + freight + duty + service));
  const total = Math.round(itemDKK + freight + service + duty + vat);
  return { total, breakdown: { item: Math.round(itemDKK), freight, service, duty, vat } };
}

function initHeroEstimator() {
  const heroForm = document.querySelector('#hero-link');
  if (!heroForm) return;
  heroForm.addEventListener('submit', evt => {
    evt.preventDefault();
    const input = document.querySelector('#hero-url');
    if (!input?.value) return;
    requestQuote(input.value, { context: 'hero' });
  });
  const heroEst = document.querySelector('#hero-est');
  if (heroEst && DB.products.length > 0) {
    heroEst.textContent = `DKK ${DB.products[0].priceDKK.toLocaleString('da-DK')}`;
  }
}

function requestQuote(url, { context }) {
  const quoteContainer = context === 'hero' ? document.querySelector('#hero-quote') : null;
  if (quoteContainer) {
    quoteContainer.innerHTML = '<div class="card quote-card loading">Henter prisestimat…</div>';
  }
  fetch('/.netlify/functions/aiLinkQuote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  })
    .then(res => res.json())
    .then(data => {
      if (!data.ok) throw new Error(data.error || 'Kunne ikke hente pris');
      const enriched = { ...data, requestUrl: url };
      state.quotes.set(url, enriched);
      if (quoteContainer) {
        quoteContainer.innerHTML = renderQuoteCard(enriched);
      }
      if (context === 'chat') {
        addChatMessage('bot', 'Her er dit estimat:');
        addChatQuote(enriched);
      }
      prefillWishlistFromQuote(enriched);
    })
    .catch(err => {
      console.error(err);
      if (quoteContainer) {
        quoteContainer.innerHTML = '<p class="quote-error">Kunne ikke læse siden. Indtast pris og vægt manuelt i estimatoren.</p>';
      }
      if (context === 'chat') {
        addChatMessage('bot', 'Kunne ikke læse linket – indtast pris og vægt manuelt i estimatoren.');
      }
      toast('Kunne ikke hente pris – prøv igen eller udfyld pris manuelt');
    });
}

function renderQuoteCard(data) {
  const { detected = {}, estimate = {}, requestUrl } = data;
  const breakdown = estimate.breakdown || {};
  const itemValue = coalesceNumber(estimate.itemDKK, breakdown.item);
  const freightValue = coalesceNumber(estimate.freightDKK, breakdown.freight);
  const serviceValue = coalesceNumber(estimate.serviceDKK, breakdown.service);
  const dutyValue = coalesceNumber(estimate.dutyDKK, breakdown.duty);
  const vatValue = coalesceNumber(estimate.vatDKK, breakdown.vat);
  return `
    <article class="card quote-card">
      <div class="quote-header">
        <img src="${(detected.images && detected.images[0]) || 'https://via.placeholder.com/200?text=Selekti'}" alt="${detected.title || 'Produkt'}" loading="lazy" />
        <div>
          <h3>${detected.title || 'Produkt fundet'}</h3>
          <p>Original pris: ${detected.priceOriginal ? `${detected.priceOriginal.amount} ${detected.priceOriginal.currency}` : 'ukendt'}</p>
          <p>Estimat: <strong>${formatDKK(estimate.totalDKK)}</strong></p>
        </div>
      </div>
      <ul class="quote-breakdown">
        <li>Vare: ${formatDKK(itemValue)}</li>
        <li>Fragt: ${formatDKK(freightValue)}</li>
        <li>Service: ${formatDKK(serviceValue)}</li>
        <li>Told (est.): ${formatDKK(dutyValue)}</li>
        <li>Moms: ${formatDKK(vatValue)}</li>
      </ul>
      <button class="btn primary" data-open="sheet-wishlist" data-prefill-url="${detected.url || requestUrl || ''}">Fortsæt</button>
    </article>`;
}

function coalesceNumber(...values) {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }
  return undefined;
}

function formatDKK(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '–';
  }
  return `DKK ${Math.round(value).toLocaleString('da-DK')}`;
}

function prefillWishlistFromQuote(data) {
  const input = document.querySelector('#wishlist-product-url');
  const fallbackUrl = data.detected?.url || data.requestUrl;
  if (input && fallbackUrl) {
    input.value = fallbackUrl;
  }
}

function productCard(product) {
  const article = document.createElement('article');
  article.className = 'card product-card';
  article.innerHTML = `
    <img src="${product.img}" alt="${product.title}" loading="lazy" />
    <div class="product-card-body">
      <p class="product-store">${storeName(product.storeId)}</p>
      <h3>${product.title}</h3>
      <p class="product-price">DKK ${product.priceDKK.toLocaleString('da-DK')}</p>
      <div class="product-actions">
        <button class="btn ghost" data-add-to-wishlist data-id="${product.id}" data-title="${product.title}" data-img="${product.img}" data-price="${product.priceDKK}" data-url="${product.url}">♡</button>
        <button class="btn primary" data-open="sheet-wishlist" data-prefill-url="${product.url}">Bestil via link</button>
      </div>
    </div>`;
  return article;
}

function storeName(id) {
  const store = DB.stores.find(s => s.id === id);
  return store ? store.name : '';
}

function initDirectory() {
  initWishlistSubmitButton();
  populateFilters();
  renderDirectory();
  const searchForm = document.querySelector('#directory-search');
  if (searchForm) {
    searchForm.addEventListener('submit', evt => {
      evt.preventDefault();
      const input = document.querySelector('#directory-search-input');
      setParam('q', input?.value || '');
      renderDirectory();
    });
  }
}

function populateFilters() {
  const countriesRow = document.querySelector('#filter-countries');
  const catsRow = document.querySelector('#filter-categories');
  if (countriesRow) {
    countriesRow.innerHTML = DB.countries.map(country => `<button class="badge" data-filter="country" data-value="${country.code}">${country.label}</button>`).join('');
  }
  if (catsRow) {
    catsRow.innerHTML = DB.categories.map(cat => `<button class="badge" data-filter="cat" data-value="${cat.id}">${cat.label}</button>`).join('');
  }
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.filter;
      const value = btn.dataset.value;
      const current = getParams().get(key);
      setParam(key, current === value ? '' : value);
      renderDirectory();
    });
  });
  const select = document.querySelector('#directory-sort');
  if (select) {
    select.addEventListener('change', () => {
      setParam('sort', select.value);
      renderDirectory();
    });
  }
}

function getParams() {
  return new URLSearchParams(window.location.search);
}

function setParam(key, value) {
  const params = getParams();
  if (!value) params.delete(key); else params.set(key, value);
  const queryString = params.toString();
  const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
  window.history.replaceState({}, '', newUrl);
}

function renderDirectory() {
  const params = getParams();
  const q = (params.get('q') || '').toLowerCase();
  const country = params.get('country');
  const cat = params.get('cat');
  const storeId = params.get('store');
  const sort = params.get('sort') || 'popular';
  const searchInput = document.querySelector('#directory-search-input');
  if (searchInput) searchInput.value = q;
  const sortSelect = document.querySelector('#directory-sort');
  if (sortSelect) sortSelect.value = sort;

  updateFilterActiveStates();

  let list = [...DB.products];
  if (q) {
    list = list.filter(product => [product.title, product.tags?.join(' '), storeName(product.storeId)].join(' ').toLowerCase().includes(q));
  }
  if (country) list = list.filter(product => product.country === country);
  if (cat) list = list.filter(product => product.category === cat);
  if (storeId) list = list.filter(product => product.storeId === storeId);

  list = sortProducts(list, sort);

  const grid = document.querySelector('#directory-grid');
  const countEl = document.querySelector('#directory-count');
  const empty = document.querySelector('#directory-empty');
  if (!grid) return;
  grid.innerHTML = '';
  if (countEl) countEl.textContent = `${list.length} produkter`;
  const activeFilters = document.querySelector('#active-filters');
  if (activeFilters) {
    const active = [];
    if (country) {
      const label = DB.countries.find(item => item.code === country)?.label || country;
      active.push({ key: 'country', label });
    }
    if (cat) {
      const label = DB.categories.find(item => item.id === cat)?.label || cat;
      active.push({ key: 'cat', label });
    }
    if (storeId) {
      const label = storeName(storeId) || storeId;
      active.push({ key: 'store', label });
    }
    if (active.length) {
      activeFilters.innerHTML = active.map(filter => `<button type="button" data-remove-filter="${filter.key}">${filter.label} ✕</button>`).join('');
    } else {
      activeFilters.innerHTML = '';
    }
    activeFilters.querySelectorAll('[data-remove-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        setParam(btn.dataset.removeFilter, '');
        renderDirectory();
      });
    });
  }
  if (list.length === 0) {
    if (empty) {
      empty.removeAttribute('hidden');
      const suggestions = document.querySelector('#empty-suggestions');
      if (suggestions) {
        const suggestionCountries = DB.countries.slice(0, 4).map(country => `<a class="badge" href="/butikker.html?country=${country.code}">${country.label}</a>`);
        const suggestionCats = DB.categories.slice(0, 4).map(catItem => `<a class="badge" href="/butikker.html?cat=${catItem.id}">${catItem.label}</a>`);
        suggestions.innerHTML = [...suggestionCountries, ...suggestionCats].join('');
      }
    }
  } else {
    if (empty) empty.setAttribute('hidden', '');
    const frag = document.createDocumentFragment();
    list.forEach(product => frag.appendChild(productCard(product)));
    grid.appendChild(frag);
  }
  renderDirectoryFeatured();
}

function updateFilterActiveStates() {
  const params = getParams();
  document.querySelectorAll('[data-filter]').forEach(btn => {
    const key = btn.dataset.filter;
    const value = btn.dataset.value;
    btn.classList.toggle('active', params.get(key) === value);
  });
}

function sortProducts(list, sort) {
  switch (sort) {
    case 'price_asc':
      return list.slice().sort((a, b) => a.priceDKK - b.priceDKK);
    case 'price_desc':
      return list.slice().sort((a, b) => b.priceDKK - a.priceDKK);
    case 'new':
      return list.slice().reverse();
    default:
      return list.slice().sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }
}

function renderDirectoryFeatured() {
  const container = document.querySelector('#directory-featured');
  if (!container) return;
  container.innerHTML = '';
  const stores = DB.stores.filter(store => store.premium).slice(0, 6);
  const products = DB.products.filter(product => product.featured).slice(0, 6);
  if (stores.length === 0 && products.length === 0) {
    container.setAttribute('hidden', '');
    return;
  }
  container.removeAttribute('hidden');
  stores.forEach(store => {
    const card = document.createElement('article');
    card.className = 'card store-card';
    card.innerHTML = `
      <div class="store-card-header">
        <img src="${store.logo || 'https://via.placeholder.com/120?text=Store'}" alt="${store.name}" loading="lazy" />
        <span class="badge">Premium-partner</span>
      </div>
      <div class="store-card-body">
        <h3>${store.name}</h3>
        <p>${store.deliveryHint || ''}</p>
        <a class="btn primary" href="/butikker.html?store=${encodeURIComponent(store.id)}">Vis produkter</a>
      </div>`;
    container.appendChild(card);
  });
  products.forEach(product => container.appendChild(productCard(product)));
}

function initCountry() {
  const code = document.body.dataset.country;
  if (!code) return;
  const storeRow = document.querySelector('#country-stores');
  const productGrid = document.querySelector('#country-products');
  if (storeRow) {
    storeRow.innerHTML = '';
    DB.stores.filter(store => store.country === code).forEach(store => {
      const card = document.createElement('article');
      card.className = 'card store-card';
      card.innerHTML = `
        <div class="store-card-header">
          <img src="${store.logo || 'https://via.placeholder.com/120?text=Store'}" alt="${store.name}" loading="lazy" />
        </div>
        <div class="store-card-body">
          <h3>${store.name}</h3>
          <p>${store.deliveryHint || ''}</p>
          <div class="store-card-actions">
            <a class="btn primary" href="/butikker.html?store=${encodeURIComponent(store.id)}">Se produkter</a>
            <button class="btn ghost" data-open="sheet-wishlist" data-prefill-url="${store.url}">Bestil via link</button>
          </div>
        </div>`;
      storeRow.appendChild(card);
    });
  }
  if (productGrid) {
    productGrid.innerHTML = '';
    DB.products.filter(product => product.country === code).slice(0, 12).forEach(product => productGrid.appendChild(productCard(product)));
  }
  initWishlistSubmitButton();
}

function initPartners() {
  initWishlistSubmitButton();
  const form = document.querySelector('form[name="partner-apply"]');
  if (form) {
    form.addEventListener('submit', evt => {
      evt.preventDefault();
      submitNetlifyForm(form);
    });
  }
}

function initAbout() {
  initWishlistSubmitButton();
}

function submitNetlifyForm(form) {
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;
  const errorMsg = form.querySelector('.form-error');
  if (errorMsg) errorMsg.hidden = true;
  const formData = new FormData(form);
  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(formData).toString()
  })
    .then(() => {
      form.reset();
      let success = form.querySelector('.form-success');
      if (!success) {
        success = document.createElement('p');
        success.className = 'form-success note';
        form.appendChild(success);
      }
      success.textContent = 'Tak! Vi vender tilbage hurtigst muligt.';
      success.hidden = false;
      toast('Tak! Vi vender tilbage hurtigst muligt.');
    })
    .catch(err => {
      console.error(err);
      let failure = form.querySelector('.form-error');
      if (!failure) {
        failure = document.createElement('p');
        failure.className = 'form-error note';
        form.appendChild(failure);
      }
      failure.textContent = 'Noget gik galt – prøv igen senere.';
      failure.hidden = false;
      toast('Noget gik galt – prøv igen senere.');
    })
    .finally(() => {
      if (submitBtn) submitBtn.disabled = false;
    });
}

function toast(message) {
  const container = document.querySelector('#toasts');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 200);
  }, 3200);
}

function ensureChatMarkup() {
  if (document.querySelector('#chat-toggle')) return;
  const toggle = document.createElement('button');
  toggle.id = 'chat-toggle';
  toggle.type = 'button';
  toggle.className = 'chat-toggle';
  toggle.textContent = 'Chat med Selekti';
  const panel = document.createElement('aside');
  panel.id = 'chatbot';
  panel.className = 'chatbot';
  panel.setAttribute('hidden', '');
  panel.setAttribute('aria-live', 'polite');
  panel.innerHTML = `
    <div class="chat-header">
      <div class="chat-title">
        <img src="/assets/illustrations/magpie.svg" alt="Selekti maskot" />
        <div>
          <h3>Selekti guide</h3>
          <p>Indsæt et link – jeg estimerer totalprisen</p>
        </div>
      </div>
      <button class="btn ghost" type="button" data-close-chat>Luk</button>
    </div>
    <div id="chat-log" class="chat-log">
      <div class="chat-empty">
        <img src="/assets/illustrations/magpie.svg" alt="Selekti maskot" />
        <p>Hej! Indsæt et produktlink eller stil et spørgsmål.</p>
      </div>
    </div>
    <form id="chat-form" class="chat-form">
      <label class="sr-only" for="chat-input">Din besked</label>
      <input id="chat-input" type="text" placeholder="Indtast spørgsmål eller indsæt link" required />
      <button class="btn primary" type="submit">Send</button>
    </form>`;
  document.body.appendChild(toggle);
  document.body.appendChild(panel);
}

function initChatbot() {
  ensureChatMarkup();
  const toggle = document.querySelector('#chat-toggle');
  const panel = document.querySelector('#chatbot');
  const close = document.querySelector('[data-close-chat]');
  const form = document.querySelector('#chat-form');
  if (!toggle || !panel || !form) return;
  toggle.addEventListener('click', () => {
    state.chatOpen = !state.chatOpen;
    panel.hidden = !state.chatOpen;
    if (state.chatOpen) {
      document.querySelector('#chat-input')?.focus();
    }
  });
  if (close) {
    close.addEventListener('click', () => {
      state.chatOpen = false;
      panel.hidden = true;
      toggle.focus();
    });
  }
  form.addEventListener('submit', evt => {
    evt.preventDefault();
    const input = document.querySelector('#chat-input');
    if (!input?.value) return;
    addChatMessage('user', input.value);
    handleChat(input.value.trim());
    input.value = '';
  });
}

function addChatMessage(role, text) {
  const log = document.querySelector('#chat-log');
  if (!log) return;
  const empty = log.querySelector('.chat-empty');
  if (empty) empty.remove();
  const div = document.createElement('div');
  div.className = `chat-message ${role}`;
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function addChatQuote(data) {
  const log = document.querySelector('#chat-log');
  if (!log) return;
  const empty = log.querySelector('.chat-empty');
  if (empty) empty.remove();
  const wrapper = document.createElement('div');
  wrapper.className = 'chat-quote';
  wrapper.innerHTML = renderQuoteCard(data);
  log.appendChild(wrapper);
  log.scrollTop = log.scrollHeight;
}

function handleChat(message) {
  const urlMatch = message.match(/https?:\/\/[\w./?=&%-]+/i);
  if (urlMatch) {
    addChatMessage('bot', 'Jeg henter et estimat – et øjeblik…');
    requestQuote(urlMatch[0], { context: 'chat' });
    return;
  }
  const lower = message.toLowerCase();
  if (lower.includes('levering')) {
    addChatMessage('bot', 'Levering fra EU tager typisk 2–5 hverdage, UK/US/JP 5–12 hverdage og Kina/Indien 10–18 hverdage.');
  } else if (lower.includes('selekti+')) {
    addChatMessage('bot', 'Selekti+ er en venteliste i denne version. Skriv dig op på forsiden for at få besked ved åbning.');
  } else if (lower.includes('partner')) {
    addChatMessage('bot', 'Du kan ansøge om partnerskab via siden “Bliv partner”. Vi svarer inden for 24–48 timer.');
  } else {
    addChatMessage('bot', 'Tak for dit spørgsmål! Indsæt gerne et link for at få et præcist estimat, eller se vores FAQ på Om os-siden.');
  }
}
