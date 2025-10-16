const state = {
  devices: [],
  categories: [],
  brands: [],
  loaded: false
};

const filterState = {
  query: '',
  advanced: '',
  types: new Set(),
  chips: new Set(),
  frequencies: new Set(),
  compat: new Set(),
  brands: new Set(),
  price: new Set(),
  rating: new Set(),
  sort: 'featured'
};

const PRICE_BUCKETS = {
  low: device => device.priceDKK < 400,
  mid: device => device.priceDKK >= 400 && device.priceDKK <= 800,
  high: device => device.priceDKK > 800
};

const page = () => document.body?.dataset?.page || '';

const toastHub = {
  el: null,
  init() {
    this.el = document.getElementById('toasts');
  },
  show(message) {
    if (!this.el) return;
    const node = document.createElement('div');
    node.className = 'toast';
    node.textContent = message;
    this.el.appendChild(node);
    requestAnimationFrame(() => node.classList.add('show'));
    setTimeout(() => {
      node.classList.remove('show');
      setTimeout(() => node.remove(), 300);
    }, 2800);
  }
};

function toast(message) {
  toastHub.show(message);
}

function formatDKK(value) {
  const number = Number(value) || 0;
  return `DKK ${Math.round(number).toLocaleString('da-DK')}`;
}

function fetchJSON(path) {
  return fetch(path, { cache: 'no-store' }).then(r => {
    if (!r.ok) throw new Error(`Failed to load ${path}`);
    return r.json();
  });
}

async function loadData() {
  const [devices, categories] = await Promise.all([
    fetchJSON('/data/devices.json'),
    fetchJSON('/data/categories.json')
  ]);
  state.devices = Array.isArray(devices) ? devices : [];
  state.categories = Array.isArray(categories) ? categories : [];
  state.brands = [...new Set(state.devices.map(d => d.brand).filter(Boolean))].sort();
  state.loaded = true;
}

function initGlobalSearch() {
  const form = document.getElementById('global-search');
  if (!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const input = document.getElementById('global-search-input');
    const term = input?.value?.trim();
    const target = '/enheder.html' + (term ? `?q=${encodeURIComponent(term)}` : '');
    window.location.href = target;
  });
}

function buildDeviceCard(device) {
  const tags = [device.type, ...(device.tags || [])].slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('');
  const compat = (device.compatibility || []).map(c => `<span class="tag">${compatibilityLabel(c)}</span>`).join('');
  return `
    <article class="device-card" data-id="${device.id}">
      <img src="${device.images?.[0] || 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80'}" loading="lazy" decoding="async" alt="${device.name}">
      <div class="meta">
        <span class="rating">⭐ ${device.rating.toFixed(1)}</span>
        <span>${device.reviewsCount} anmeldelser</span>
      </div>
      <h3>${device.name}</h3>
      <p class="lead">${device.bestFor || ''}</p>
      <div>${tags}</div>
      <div>${compat}</div>
      <div class="meta">
        <span>${formatDKK(device.priceDKK)}</span>
        <span>${device.brand}</span>
      </div>
      <div class="input-group" style="margin-top:auto;">
        <button class="btn primary" data-view-device="${device.id}">Se detaljer</button>
        <button class="btn ghost" data-copy-link="${device.id}">Kopiér link</button>
      </div>
    </article>`;
}

function compatibilityLabel(value) {
  const map = {
    'home-assistant': 'Home Assistant',
    iobroker: 'IOBroker',
    fibaro: 'Fibaro HC'
  };
  return map[value] || value;
}

function bindDeviceCardActions(root = document) {
  root.addEventListener('click', event => {
    const viewBtn = event.target.closest('[data-view-device]');
    if (viewBtn) {
      const id = viewBtn.dataset.viewDevice;
      window.location.href = `/device.html?id=${encodeURIComponent(id)}`;
    }
    const copyBtn = event.target.closest('[data-copy-link]');
    if (copyBtn) {
      const id = copyBtn.dataset.copyLink;
      const url = `${window.location.origin}/device.html?id=${encodeURIComponent(id)}`;
      navigator.clipboard?.writeText(url).then(() => toast('Link kopieret')).catch(() => toast('Kunne ikke kopiere link'));
    }
  });
}

function renderLanding() {
  const heroSearch = document.getElementById('hero-search');
  const heroBtn = document.getElementById('hero-search-btn');
  const suggestions = document.getElementById('hero-suggestions');
  if (heroSearch && heroBtn) {
    const buildSuggestions = term => {
      const text = term.trim().toLowerCase();
      let matches = state.devices;
      if (text) {
        matches = state.devices.filter(device => device.name.toLowerCase().includes(text) || device.brand.toLowerCase().includes(text));
      }
      suggestions.innerHTML = matches.slice(0, 5).map(device => `<button class="suggestion" data-view-device="${device.id}">${device.name}</button>`).join('');
    };
    heroSearch.addEventListener('input', () => buildSuggestions(heroSearch.value || ''));
    heroBtn.addEventListener('click', () => {
      const term = heroSearch.value.trim();
      const url = term ? `/enheder.html?q=${encodeURIComponent(term)}` : '/enheder.html';
      window.location.href = url;
    });
    buildSuggestions('');
  }

  const dkPopular = document.getElementById('dk-popular');
  if (dkPopular) {
    const items = state.devices.filter(device => device.highlightDK).slice(0, 8);
    dkPopular.innerHTML = items.map(buildDeviceCard).join('');
  }

  const latestGrid = document.getElementById('latest-grid');
  if (latestGrid) {
    const newest = [...state.devices].reverse().slice(0, 6);
    latestGrid.innerHTML = newest.map(buildDeviceCard).join('');
  }

  const caseGrid = document.getElementById('case-grid');
  if (caseGrid) {
    const cases = [
      {
        title: 'Elektrisk gulvvarme i rækkehus',
        body: 'Heatit Z-TRM3 styrer gulvvarme i badeværelse. Sammen med Home Assistant automatisk sænkning ved udluftning.'
      },
      {
        title: 'Alarm med keypad',
        body: 'Ring Keypad v2 kombineret med Aeotec sirene giver tryghed. Scener aktiverer lys ved alarm.'
      },
      {
        title: 'Energiovervågning',
        body: 'Aeotec Heavy Duty Switch monitorerer varmepumpe og rapporterer forbrug til elmåler-dashboard.'
      }
    ];
    caseGrid.innerHTML = cases.map(item => `
      <article class="device-card">
        <h3>${item.title}</h3>
        <p>${item.body}</p>
      </article>`).join('');
  }

  const addForm = document.forms['add-device'];
  if (addForm) {
    const success = document.getElementById('add-device-success');
    const typeSelect = addForm.querySelector('select[name="type"]');
    if (typeSelect) {
      typeSelect.innerHTML += state.categories.map(cat => `<option value="${cat.id}">${cat.label}</option>`).join('');
    }
    addForm.addEventListener('submit', event => {
      event.preventDefault();
      addForm.querySelector('button[type="submit"]').disabled = true;
      setTimeout(() => {
        addForm.reset();
        addForm.querySelector('button[type="submit"]').disabled = false;
        if (success) success.hidden = false;
        toast('Tak for dit bidrag!');
      }, 400);
    });
  }

  const tooltip = document.getElementById('tooltip-onboard');
  if (tooltip) {
    setTimeout(() => tooltip.classList.remove('hidden'), 1200);
    tooltip.addEventListener('click', () => tooltip.classList.add('hidden'));
  }
}

function initDirectory() {
  populateTypeFilters();
  populateBrandFilters();
  bindFilterEvents();
  applyParamsToFilters();
  renderDirectory();
}

function populateTypeFilters() {
  const container = document.getElementById('filter-types');
  if (!container) return;
  container.innerHTML = state.categories.map(cat => `<button class="filter-chip" data-type="${cat.id}">${cat.label}</button>`).join('');
}

function populateBrandFilters() {
  const container = document.getElementById('filter-brand');
  if (!container) return;
  container.innerHTML = state.brands.map(brand => `<button class="filter-chip" data-brand="${brand}">${brand}</button>`).join('');
}

function bindFilterEvents() {
  document.addEventListener('click', event => {
    const chip = event.target.closest('.filter-chip');
    if (!chip) return;
    if (chip.dataset.type) toggleSet(filterState.types, chip.dataset.type, chip);
    if (chip.dataset.chip) toggleSet(filterState.chips, chip.dataset.chip, chip);
    if (chip.dataset.frequency) toggleSet(filterState.frequencies, chip.dataset.frequency, chip);
    if (chip.dataset.compat) toggleSet(filterState.compat, chip.dataset.compat, chip);
    if (chip.dataset.brand) toggleSet(filterState.brands, chip.dataset.brand, chip);
    if (chip.dataset.price) toggleSet(filterState.price, chip.dataset.price, chip);
    if (chip.dataset.rating) toggleSet(filterState.rating, chip.dataset.rating, chip);
    updateURLFromFilters();
    renderDirectory();
  });

  const searchInput = document.getElementById('directory-search');
  const suggestions = document.getElementById('directory-suggestions');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      filterState.query = searchInput.value.trim();
      updateURLFromFilters();
      renderDirectory();
      suggestions.innerHTML = suggestionMarkup(filterState.query);
    });
  }

  const advancedBtn = document.getElementById('advanced-search-btn');
  if (advancedBtn) {
    advancedBtn.addEventListener('click', () => {
      const advanced = document.getElementById('advanced-search');
      filterState.advanced = advanced?.value.trim() || '';
      updateURLFromFilters();
      renderDirectory();
      toast('Avanceret søgning anvendt');
    });
  }

  const sortSelect = document.getElementById('directory-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      filterState.sort = sortSelect.value;
      updateURLFromFilters();
      renderDirectory();
    });
  }

  const resetBtn = document.getElementById('directory-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      Object.assign(filterState, {
        query: '',
        advanced: '',
        types: new Set(),
        chips: new Set(),
        frequencies: new Set(),
        compat: new Set(),
        brands: new Set(),
        price: new Set(),
        rating: new Set(),
        sort: 'featured'
      });
      document.querySelectorAll('.filter-chip.active').forEach(node => node.classList.remove('active'));
      const search = document.getElementById('directory-search');
      const advanced = document.getElementById('advanced-search');
      if (search) search.value = '';
      if (advanced) advanced.value = '';
      const sort = document.getElementById('directory-sort');
      if (sort) sort.value = 'featured';
      updateURLFromFilters();
      renderDirectory();
    });
  }

  const saveBtn = document.getElementById('save-search');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      navigator.clipboard?.writeText(window.location.href).then(() => toast('Søgning kopieret')).catch(() => toast('Kunne ikke kopiere link'));
    });
  }
}

function suggestionMarkup(term) {
  const q = term.toLowerCase();
  const matches = state.devices.filter(device => device.name.toLowerCase().includes(q)).slice(0, 5);
  return matches.map(device => `<button class="suggestion" data-view-device="${device.id}">${device.name}</button>`).join('');
}

function toggleSet(set, value, node) {
  if (set.has(value)) {
    set.delete(value);
    node?.classList.remove('active');
  } else {
    set.add(value);
    node?.classList.add('active');
  }
}

function applyParamsToFilters() {
  const params = new URLSearchParams(window.location.search);
  filterState.query = params.get('q') || '';
  filterState.sort = params.get('sort') || 'featured';
  const multi = name => (params.get(name)?.split(',').filter(Boolean) || []);
  filterState.types = new Set(multi('types'));
  filterState.chips = new Set(multi('chips'));
  filterState.frequencies = new Set(multi('freq'));
  filterState.compat = new Set(multi('compat'));
  filterState.brands = new Set(multi('brands'));
  filterState.price = new Set(multi('price'));
  filterState.rating = new Set(multi('rating'));
  filterState.advanced = params.get('adv') || '';

  const searchInput = document.getElementById('directory-search');
  if (searchInput) searchInput.value = filterState.query;
  const advanced = document.getElementById('advanced-search');
  if (advanced) advanced.value = filterState.advanced;
  const sort = document.getElementById('directory-sort');
  if (sort) sort.value = filterState.sort;

  const markActive = (selector, set) => {
    document.querySelectorAll(selector).forEach(node => {
      const value = node.dataset.type || node.dataset.chip || node.dataset.frequency || node.dataset.compat || node.dataset.brand || node.dataset.price || node.dataset.rating;
      if (set.has(value)) node.classList.add('active');
    });
  };
  markActive('[data-type]', filterState.types);
  markActive('[data-chip]', filterState.chips);
  markActive('[data-frequency]', filterState.frequencies);
  markActive('[data-compat]', filterState.compat);
  markActive('[data-brand]', filterState.brands);
  markActive('[data-price]', filterState.price);
  markActive('[data-rating]', filterState.rating);
}

function updateURLFromFilters() {
  const params = new URLSearchParams();
  if (filterState.query) params.set('q', filterState.query);
  if (filterState.sort !== 'featured') params.set('sort', filterState.sort);
  const setParam = (key, set) => {
    if (set.size > 0) params.set(key, Array.from(set).join(','));
  };
  setParam('types', filterState.types);
  setParam('chips', filterState.chips);
  setParam('freq', filterState.frequencies);
  setParam('compat', filterState.compat);
  setParam('brands', filterState.brands);
  setParam('price', filterState.price);
  setParam('rating', filterState.rating);
  if (filterState.advanced) params.set('adv', filterState.advanced);
  const query = params.toString();
  const url = query ? `?${query}` : location.pathname;
  window.history.replaceState({}, '', url);
}

function renderDirectory() {
  const grid = document.getElementById('directory-grid');
  const empty = document.getElementById('directory-empty');
  if (!grid) return;
  let results = [...state.devices];

  if (filterState.query) {
    const q = filterState.query.toLowerCase();
    results = results.filter(device => [device.name, device.brand, ...(device.tags || [])].join(' ').toLowerCase().includes(q));
  }
  if (filterState.advanced) {
    const q = filterState.advanced.toLowerCase();
    results = results.filter(device => device.description.toLowerCase().includes(q) || (device.bestFor || '').toLowerCase().includes(q));
  }
  if (filterState.types.size) {
    results = results.filter(device => filterState.types.has(device.type));
  }
  if (filterState.chips.size) {
    results = results.filter(device => filterState.chips.has(device.chip));
  }
  if (filterState.frequencies.size) {
    results = results.filter(device => filterState.frequencies.has(device.frequency));
  }
  if (filterState.compat.size) {
    results = results.filter(device => {
      const compat = new Set(device.compatibility || []);
      return Array.from(filterState.compat).every(entry => compat.has(entry));
    });
  }
  if (filterState.brands.size) {
    results = results.filter(device => filterState.brands.has(device.brand));
  }
  if (filterState.price.size) {
    results = results.filter(device => Array.from(filterState.price).some(bucket => PRICE_BUCKETS[bucket]?.(device)));
  }
  if (filterState.rating.size) {
    const min = Math.max(...Array.from(filterState.rating).map(Number));
    results = results.filter(device => device.rating >= min);
  }

  switch (filterState.sort) {
    case 'price-asc':
      results.sort((a, b) => a.priceDKK - b.priceDKK);
      break;
    case 'price-desc':
      results.sort((a, b) => b.priceDKK - a.priceDKK);
      break;
    case 'rating':
      results.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      results = results.reverse();
      break;
    default:
      results.sort((a, b) => Number(b.highlightDK) - Number(a.highlightDK));
      break;
  }

  document.getElementById('directory-count')?.replaceChildren(document.createTextNode(String(results.length)));

  if (results.length === 0) {
    grid.innerHTML = '';
    empty?.removeAttribute('hidden');
    const suggestions = document.getElementById('empty-suggestions');
    if (suggestions) {
      suggestions.innerHTML = state.devices.slice(0, 5).map(device => `<button class="suggestion" data-view-device="${device.id}">${device.name}</button>`).join('');
    }
    return;
  }

  empty?.setAttribute('hidden', '');
  grid.innerHTML = results.map(buildDeviceCard).join('');
}

function initDevice() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const device = state.devices.find(item => item.id === id) || state.devices[0];
  const view = document.getElementById('device-view');
  if (!view) return;
  if (!device) {
    view.innerHTML = '<p>Enhed ikke fundet.</p>';
    return;
  }
  document.title = `${device.name} – Z-Wave Compatibility Hub`;
  view.innerHTML = `
    <div class="gallery">
      <img src="${device.images?.[0] || 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80'}" alt="${device.name}" loading="lazy">
      <div class="device-card">
        <h1>${device.name}</h1>
        <div class="meta">
          <span class="rating">⭐ ${device.rating.toFixed(1)}</span>
          <span>${device.reviewsCount} danske anmeldelser</span>
        </div>
        <p>${device.description}</p>
        <div class="meta">
          <span>${formatDKK(device.priceDKK)}</span>
          <span>${device.brand}</span>
          <span>${device.chip}-serie</span>
        </div>
        <div>${(device.compatibility || []).map(compatibilityLabel).map(text => `<span class="tag">${text}</span>`).join('')}</div>
        <div class="input-group" style="margin-top:1rem;">
          <button class="btn primary" data-open-retailers>Se forhandlere</button>
          <a class="btn ghost" href="/enheder.html">Tilbage</a>
        </div>
      </div>
    </div>
    <aside class="specs">
      <h2>Specifikationer</h2>
      <ul class="spec-list">
        <li><span>Type</span><span>${device.type}</span></li>
        <li><span>Chip</span><span>${device.chip}-serie</span></li>
        <li><span>Frekvens</span><span>${device.frequency.toUpperCase()}</span></li>
        <li><span>Kompatibilitet</span><span>${(device.compatibility || []).map(compatibilityLabel).join(', ')}</span></li>
        <li><span>Levering</span><span>${device.shipping?.notes || ''}</span></li>
      </ul>
      <h3>Forhandlere</h3>
      <ul class="spec-list">
        ${(device.purchase || []).map(entry => `<li><span>${entry.retailer}</span><span><a href="${entry.url}" target="_blank" rel="noopener">${formatDKK(entry.priceDKK)}</a></span></li>`).join('')}
      </ul>
    </aside>
    <aside class="reviews">
      <h2>Danske anmeldelser</h2>
      ${(device.danishReviews && device.danishReviews.length)
        ? device.danishReviews.map(review => `<div class="review-card"><strong>${review.user}</strong><div class="rating">⭐ ${review.rating}</div><p>${review.text}</p><small>${review.date}</small></div>`).join('')
        : '<p>Der er endnu ingen danske anmeldelser.</p>'}
    </aside>`;

  const related = document.getElementById('device-related');
  if (related) {
    const matches = state.devices.filter(item => item.id !== device.id && (item.type === device.type || item.brand === device.brand)).slice(0, 3);
    related.innerHTML = matches.map(buildDeviceCard).join('');
  }
}

function initCommunity() {
  const panels = document.getElementById('community-panels');
  if (panels) {
    const stats = [
      {
        title: 'Top anmeldere',
        body: `${totalReviews()} danske anmeldelser på tværs af ${state.devices.length} enheder.`
      },
      {
        title: 'Verificeret kompatibilitet',
        body: `${state.devices.filter(d => (d.compatibility || []).includes('home-assistant')).length} enheder testet med Home Assistant.`
      },
      {
        title: 'Importerede enheder',
        body: `${state.devices.filter(d => d.shipping?.import && d.shipping.import.includes('told')).length} kræver særlig import – vi markerer dem tydeligt.`
      }
    ];
    panels.innerHTML = stats.map(item => `<article class="device-card"><h3>${item.title}</h3><p>${item.body}</p></article>`).join('');
  }

  const reviewsTarget = document.getElementById('community-reviews');
  if (reviewsTarget) {
    const reviews = [];
    state.devices.forEach(device => {
      (device.danishReviews || []).forEach(review => {
        reviews.push({ device, review });
      });
    });
    reviews.sort((a, b) => (b.review.date || '').localeCompare(a.review.date || ''));
    reviewsTarget.innerHTML = reviews.slice(0, 6).map(entry => `
      <article class="device-card">
        <h3>${entry.device.name}</h3>
        <div class="rating">⭐ ${entry.review.rating}</div>
        <p>${entry.review.text}</p>
        <small>${entry.review.user} – ${entry.review.date}</small>
      </article>`).join('');
  }
}

function initAbout() {
  // currently no dynamic behaviour required
}

function totalReviews() {
  return state.devices.reduce((acc, device) => acc + (device.danishReviews?.length || 0), 0);
}

async function init() {
  toastHub.init();
  try {
    await loadData();
  } catch (error) {
    console.error(error);
    toast('Kunne ikke indlæse data');
    return;
  }
  initGlobalSearch();
  bindDeviceCardActions(document);
  switch (page()) {
    case 'landing':
      renderLanding();
      break;
    case 'directory':
      initDirectory();
      break;
    case 'device':
      initDevice();
      break;
    case 'community':
      initCommunity();
      break;
    case 'about':
      initAbout();
      break;
    default:
      break;
  }
}

document.addEventListener('DOMContentLoaded', init);
