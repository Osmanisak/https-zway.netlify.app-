const DATA = {
  products: [],
  categories: [],
  countries: [],
  countryLabel: new Map()
};

const WISHLIST_KEY = 'selekti_wishlist';
let wishlist = [];
let lastDialogTrigger = new WeakMap();

const formatCurrency = (value) =>
  typeof value === 'number' && !Number.isNaN(value)
    ? new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK' }).format(value)
    : '—';

const readWishlist = () => {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => item && typeof item.link === 'string');
    }
  } catch (error) {
    console.warn('Kunne ikke læse ønskeliste', error);
  }
  return [];
};

const persistWishlist = () => {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  } catch (error) {
    console.warn('Kunne ikke gemme ønskeliste', error);
  }
  updateWishlistUI();
};

const updateWishlistUI = () => {
  document.querySelectorAll('[data-wish-badge]').forEach((el) => {
    el.textContent = String(wishlist.length);
  });

  const itemsWrap = document.getElementById('wishlist-items');
  const emptyState = document.getElementById('wishlist-empty');
  const shareBtn = document.getElementById('wishlist-share');
  if (!itemsWrap || !emptyState) return;

  if (wishlist.length === 0) {
    itemsWrap.hidden = true;
    emptyState.hidden = false;
    if (shareBtn) shareBtn.hidden = true;
  } else {
    itemsWrap.hidden = false;
    emptyState.hidden = true;
    itemsWrap.innerHTML = '';
    wishlist
      .slice()
      .sort((a, b) => b.added - a.added)
      .forEach((item) => {
        const row = document.createElement('div');
        row.className = 'wishlist-item';
        const link = document.createElement('a');
        link.href = item.link;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = item.link;
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn btn-ghost';
        removeBtn.type = 'button';
        removeBtn.dataset.removeLink = item.link;
        removeBtn.textContent = 'Fjern';
        row.append(link, removeBtn);
        itemsWrap.appendChild(row);
      });
    if (shareBtn) shareBtn.hidden = false;
  }

  document.querySelectorAll('[data-wishlist-link]').forEach((btn) => {
    const link = btn.getAttribute('data-wishlist-link');
    const isSaved = wishlist.some((item) => item.link === link);
    btn.classList.toggle('btn-primary', isSaved);
    btn.classList.toggle('btn-ghost', !isSaved);
    btn.setAttribute('aria-pressed', isSaved ? 'true' : 'false');
    btn.textContent = isSaved ? '♡ På ønskeliste' : '♡ Ønskeliste';
  });

  const hiddenField = document.querySelector('input[name="items_json"]');
  if (hiddenField) {
    hiddenField.value = JSON.stringify(wishlist);
  }
};

const toggleWishlist = (link) => {
  if (!link) return;
  const index = wishlist.findIndex((item) => item.link === link);
  if (index > -1) {
    wishlist.splice(index, 1);
  } else {
    wishlist.push({ link, added: Date.now() });
  }
  persistWishlist();
};

const ensureWishlist = (link) => {
  if (!link || wishlist.some((item) => item.link === link)) return;
  wishlist.push({ link, added: Date.now() });
  persistWishlist();
};

const fetchJSON = async (path) => {
  try {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`Kunne ikke hente ${path}`, error);
    return null;
  }
};

const loadData = async () => {
  const [products, categories, countries] = await Promise.all([
    fetchJSON('/data/products.json'),
    fetchJSON('/data/categories.json'),
    fetchJSON('/data/countries.json')
  ]);

  if (Array.isArray(products)) {
    DATA.products = products.filter((p) => p && typeof p.url === 'string');
  }
  if (Array.isArray(categories)) {
    DATA.categories = categories;
  }
  if (Array.isArray(countries)) {
    DATA.countries = countries;
    DATA.countryLabel = new Map(countries.map((c) => [c.code, c.label]));
  }
};

const initYear = () => {
  const now = new Date().getFullYear();
  document.querySelectorAll('#year').forEach((el) => {
    el.textContent = String(now);
  });
};

const dialogFocusable = (dialog) =>
  dialog.querySelector(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

const openDialog = (dialog, trigger) => {
  if (!dialog) return;
  if (trigger) {
    lastDialogTrigger.set(dialog, trigger);
  }
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }
  const first = dialogFocusable(dialog);
  if (first) first.focus();
};

const closeDialog = (dialog) => {
  if (!dialog) return;
  dialog.close();
  const trigger = lastDialogTrigger.get(dialog);
  if (trigger) trigger.focus();
};

const handleDialogSetup = () => {
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeDialog(dialog);
    });
  });

  document.body.addEventListener('click', (event) => {
    const openWishlist = event.target.closest('[data-open-wishlist]');
    if (openWishlist) {
      event.preventDefault();
      const dialog = document.getElementById('wishlistDialog');
      const url = openWishlist.getAttribute('data-prefill-url');
      if (url) {
        const input = document.getElementById('wishlist-link');
        if (input) input.value = url;
      }
      openDialog(dialog, openWishlist);
      return;
    }

    const openWishlistButtons = event.target.closest('#wishlistOpen, #wishlistOpenMobile');
    if (openWishlistButtons) {
      event.preventDefault();
      openDialog(document.getElementById('wishlistDialog'), openWishlistButtons);
      return;
    }

    const closeBtn = event.target.closest('[data-close-dialog]');
    if (closeBtn) {
      const dialog = closeBtn.closest('dialog');
      closeDialog(dialog);
      return;
    }

    const toggleBtn = event.target.closest('[data-wishlist-link]');
    if (toggleBtn) {
      event.preventDefault();
      const link = toggleBtn.getAttribute('data-wishlist-link');
      toggleWishlist(link);
      return;
    }

    const removeBtn = event.target.closest('[data-remove-link]');
    if (removeBtn) {
      event.preventDefault();
      const link = removeBtn.getAttribute('data-remove-link');
      const index = wishlist.findIndex((item) => item.link === link);
      if (index > -1) {
        wishlist.splice(index, 1);
        persistWishlist();
      }
      return;
    }
  });

  const shareButton = document.getElementById('wishlist-share');
  if (shareButton) {
    shareButton.addEventListener('click', async () => {
      if (!wishlist.length) return;
      const text = wishlist.map((item) => item.link).join('\n');
      try {
        await navigator.clipboard.writeText(text);
        shareButton.textContent = 'Kopieret!';
        setTimeout(() => {
          shareButton.textContent = 'Kopiér alle links';
        }, 2000);
      } catch (error) {
        shareButton.textContent = 'Kunne ikke kopiere';
        setTimeout(() => {
          shareButton.textContent = 'Kopiér alle links';
        }, 2500);
      }
    });
  }
};

const handleEstimator = () => {
  const form = document.getElementById('estimator');
  if (!form) return;
  const priceInput = document.getElementById('est-price');
  const shipInput = document.getElementById('est-ship');
  const output = document.getElementById('est-total');
  const breakdown = document.getElementById('est-breakdown');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const price = Number.parseFloat(priceInput.value.replace(',', '.')) || 0;
    const ship = Number.parseFloat(shipInput.value.replace(',', '.')) || 0;

    if (price <= 0) {
      output.textContent = '—';
      breakdown.innerHTML = '';
      return;
    }

    const service = Math.max(49, 0.12 * (price + ship));
    const duty = 0.05 * price;
    const vat = 0.25 * (price + ship + duty + service);
    const total = Math.round(price + ship + duty + service + vat);

    output.textContent = formatCurrency(total);
    breakdown.innerHTML = `
      <li>Vare: ${formatCurrency(price)}</li>
      <li>Fragt: ${formatCurrency(ship)}</li>
      <li>Service (12%, min. 49 kr.): ${formatCurrency(Math.round(service))}</li>
      <li>Told (5%): ${formatCurrency(Math.round(duty))}</li>
      <li>Moms 25%: ${formatCurrency(Math.round(vat))}</li>
    `;
  });
};

const renderProductCard = (product) => {
  const price = typeof product.price === 'number' ? formatCurrency(product.price) : '';
  const country = DATA.countryLabel.get(product.country) || product.country || '';
  const isSaved = wishlist.some((item) => item.link === product.url);
  return `
    <article class="card-product" data-product-id="${product.id}">
      <figure>
        <img src="${product.image}" alt="${product.title}" loading="lazy" decoding="async">
      </figure>
      <div class="content">
        <div class="meta">
          <span>${product.store}</span>
          <span class="badge">${country}</span>
        </div>
        <h3>${product.title}</h3>
        ${price ? `<div class="meta"><span class="price">${price}</span><button class="btn ${
          isSaved ? 'btn-primary' : 'btn-ghost'
        }" type="button" data-wishlist-link="${product.url}" aria-pressed="${isSaved}">${
    isSaved ? '♡ På ønskeliste' : '♡ Ønskeliste'
  }</button></div>` : ''}
        <div class="actions">
          <button class="btn btn-primary" type="button" data-open-wishlist data-prefill-url="${product.url}">Bestil via link</button>
          <a class="btn btn-ghost" href="${product.url}" target="_blank" rel="noopener">Se produkt</a>
        </div>
      </div>
    </article>
  `;
};

const renderFeatured = () => {
  const container = document.getElementById('featured-card');
  if (!container) return;
  const [featured] = DATA.products;
  if (!featured) {
    container.innerHTML = '<div class="muted">Tilføj produkter i data/products.json for at se fremhævede elementer.</div>';
    return;
  }
  container.innerHTML = renderProductCard(featured);
  updateWishlistUI();
};

const renderLatest = () => {
  const grid = document.getElementById('latest-grid');
  if (!grid) return;
  const latest = DATA.products
    .slice()
    .sort((a, b) => new Date(b.added || 0) - new Date(a.added || 0))
    .slice(0, 3);
  grid.innerHTML = latest.map(renderProductCard).join('');
  updateWishlistUI();
};

const initLanding = () => {
  handleEstimator();
  renderFeatured();
  renderLatest();
  initExplore();
};

const initFilters = () => {
  const countrySelect = document.getElementById('filter-country');
  const categorySelect = document.getElementById('filter-category');
  if (!countrySelect || !categorySelect) return;

  DATA.countries.forEach((country) => {
    const option = document.createElement('option');
    option.value = country.code;
    option.textContent = country.label;
    countrySelect.appendChild(option);
  });

  DATA.categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.label;
    categorySelect.appendChild(option);
  });
};

const initDirectory = () => {
  initFilters();
  const params = new URLSearchParams(location.search);
  const state = {
    q: params.get('q') || '',
    country: params.get('country') || '',
    category: params.get('category') || params.get('cat') || '',
    sort: params.get('sort') || ''
  };

  const searchInput = document.getElementById('products-search');
  const countrySelect = document.getElementById('filter-country');
  const categorySelect = document.getElementById('filter-category');
  const sortSelect = document.getElementById('filter-sort');
  const form = document.getElementById('filters');
  const countEl = document.getElementById('products-count');
  const grid = document.getElementById('products-grid');
  const empty = document.getElementById('products-empty');
  const suggestions = document.getElementById('empty-suggestions');

  if (searchInput) searchInput.value = state.q;
  if (countrySelect) countrySelect.value = state.country;
  if (categorySelect) categorySelect.value = state.category;
  if (sortSelect) sortSelect.value = state.sort;

  const writeStateToURL = () => {
    const next = new URLSearchParams();
    if (state.q) next.set('q', state.q);
    if (state.country) next.set('country', state.country);
    if (state.category) next.set('category', state.category);
    if (state.sort) next.set('sort', state.sort);
    const qs = next.toString();
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  };

  const applyFilters = () => {
    let list = DATA.products.slice();
    if (state.q) {
      const q = state.q.toLowerCase();
      list = list.filter((product) =>
        [product.title, product.store]
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }
    if (state.country) {
      list = list.filter((product) => product.country === state.country);
    }
    if (state.category) {
      list = list.filter((product) => product.category === state.category);
    }
    switch (state.sort) {
      case 'price-asc':
        list.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        list.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.added || 0) - new Date(a.added || 0));
        break;
      default:
        break;
    }

    if (countEl) countEl.textContent = `${list.length} produkter`;

    if (!list.length) {
      if (grid) grid.innerHTML = '';
      if (empty) empty.hidden = false;
      if (suggestions) {
        suggestions.innerHTML = '';
        DATA.categories.slice(0, 4).forEach((category) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'chip';
          btn.textContent = category.label;
          btn.addEventListener('click', () => {
            state.category = category.id;
            if (categorySelect) categorySelect.value = category.id;
            writeStateToURL();
            applyFilters();
          });
          suggestions.appendChild(btn);
        });
      }
      return;
    }

    if (empty) empty.hidden = true;
    if (grid) grid.innerHTML = list.map(renderProductCard).join('');
    updateWishlistUI();
  };

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      state.q = searchInput.value.trim();
      writeStateToURL();
      applyFilters();
    });
  }
  if (countrySelect) {
    countrySelect.addEventListener('change', () => {
      state.country = countrySelect.value;
      writeStateToURL();
      applyFilters();
    });
  }
  if (categorySelect) {
    categorySelect.addEventListener('change', () => {
      state.category = categorySelect.value;
      writeStateToURL();
      applyFilters();
    });
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      state.sort = sortSelect.value;
      writeStateToURL();
      applyFilters();
    });
  }

  applyFilters();
};

const initPartnerForm = () => {
  const form = document.getElementById('partner-form');
  if (!form) return;
  const status = document.getElementById('partner-status');
  const submitButton = form.querySelector('button[type="submit"]');
  const originalLabel = submitButton ? submitButton.textContent : '';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sender…';
    }
    if (status) status.textContent = '';

    const formData = new FormData(form);
    try {
      await fetch(form.getAttribute('action') || '/', {
        method: 'POST',
        body: formData
      });
      form.reset();
      if (status) status.textContent = 'Tak! Vi vender tilbage inden for 24 timer.';
    } catch (error) {
      if (status) status.textContent = 'Noget gik galt. Prøv igen.';
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel;
      }
    }
  });
};

const initWishlistForm = () => {
  const form = document.getElementById('wishlist-form');
  if (!form) return;
  const status = document.getElementById('wishlist-status');
  const submitButton = form.querySelector('button[type="submit"]');
  const originalLabel = submitButton ? submitButton.textContent : '';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sender…';
    }
    if (status) status.textContent = '';

    const formData = new FormData(form);
    formData.set('items_json', JSON.stringify(wishlist));

    try {
      await fetch(form.getAttribute('action') || '/', {
        method: 'POST',
        body: formData
      });
      form.reset();
      updateWishlistUI();
      if (status) status.textContent = 'Tak! Vi vender tilbage med din totalpris.';
    } catch (error) {
      if (status) status.textContent = 'Noget gik galt. Prøv igen.';
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel;
      }
    }
  });
};

let swipeState = {
  products: [],
  current: null
};

const buildSwipeCard = (product) => {
  const card = document.createElement('article');
  card.className = 'swipe-card';
  card.dataset.link = product.url;
  card.innerHTML = `
    <figure><img src="${product.image}" alt="${product.title}" loading="lazy" decoding="async"></figure>
    <div class="info">
      <div>
        <h3 style="margin:0;">${product.title}</h3>
        <p class="muted" style="margin:0;">${product.store} · ${DATA.countryLabel.get(product.country) || product.country}</p>
        <p style="margin:0;font-weight:600;">${typeof product.price === 'number' ? formatCurrency(product.price) : ''}</p>
      </div>
    </div>
  `;
  card._product = product;
  attachSwipeHandlers(card);
  return card;
};

const attachSwipeHandlers = (card) => {
  let startX = 0;
  let currentX = 0;
  let activePointer = null;
  const resetCard = () => {
    card.style.transition = 'transform 0.3s ease';
    card.style.transform = 'translate3d(0,0,0)';
    requestAnimationFrame(() => {
      card.style.transition = '';
    });
  };

  const onPointerMove = (event) => {
    if (activePointer === null) return;
    currentX = event.clientX - startX;
    card.style.transform = `translate3d(${currentX}px, ${currentX * 0.05}px, 0) rotate(${currentX * 0.04}deg)`;
  };

  const finalize = () => {
    card.removeEventListener('pointermove', onPointerMove);
  };

  const onPointerUp = () => {
    if (activePointer === null) return;
    finalize();
    card.releasePointerCapture(activePointer);
    if (Math.abs(currentX) > 120) {
      handleSwipeAction(currentX > 0 ? 'save' : 'skip');
    } else {
      resetCard();
    }
    activePointer = null;
  };

  card.addEventListener('pointerdown', (event) => {
    if (activePointer !== null) return;
    event.preventDefault();
    activePointer = event.pointerId;
    startX = event.clientX;
    currentX = 0;
    card.setPointerCapture(activePointer);
    card.addEventListener('pointermove', onPointerMove);
    card.addEventListener('pointerup', onPointerUp, { once: true });
    card.addEventListener('pointercancel', () => { onPointerUp(); }, { once: true });
  });
};

const setActiveSwipeCard = () => {
  const dialog = document.getElementById('swipe-wrap');
  const stack = dialog?.querySelector('.swipe-stack');
  if (!stack) return;
  const cards = Array.from(stack.querySelectorAll('.swipe-card'));
  cards.forEach((card, index) => {
    card.style.zIndex = String(cards.length - index);
  });
  swipeState.current = cards[0] || null;
  if (!swipeState.current && stack.children.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
      <img src="/assets/illustrations/mascot.svg" alt="">
      <p>Ingen flere produkter lige nu.</p>
    `;
    stack.appendChild(empty);
  }
};

const handleSwipeAction = (action) => {
  const dialog = document.getElementById('swipe-wrap');
  const stack = dialog?.querySelector('.swipe-stack');
  if (!stack) return;
  const card = swipeState.current;
  if (!card || !card._product) return;
  const link = card._product.url;
  if (action === 'save') {
    ensureWishlist(link);
  }
  card.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
  const translateX = action === 'save' ? 320 : -320;
  card.style.transform = `translate3d(${translateX}px, -40px, 0) rotate(${action === 'save' ? 18 : -18}deg)`;
  card.style.opacity = '0';
  setTimeout(() => {
    card.remove();
    setActiveSwipeCard();
  }, 320);
};

const openExplore = (trigger) => {
  const dialog = document.getElementById('swipe-wrap');
  const stack = dialog?.querySelector('.swipe-stack');
  if (!dialog || !stack) return;
  stack.innerHTML = '';
  const deck = DATA.products
    .slice()
    .sort((a, b) => new Date(b.added || 0) - new Date(a.added || 0))
    .slice(0, 15);
  if (!deck.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
      <img src="/assets/illustrations/mascot.svg" alt="">
      <p>Tilføj produkter i data/products.json for at aktivere udforskning.</p>
    `;
    stack.appendChild(empty);
  } else {
    deck.reverse().forEach((product) => {
      const card = buildSwipeCard(product);
      stack.appendChild(card);
    });
  }
  openDialog(dialog, trigger);
  setActiveSwipeCard();
};

const initExplore = () => {
  const fab = document.getElementById('explore-fab');
  const dialog = document.getElementById('swipe-wrap');
  if (!fab || !dialog) return;
  const closeBtn = document.getElementById('swipe-close');
  const skipBtn = document.getElementById('swipe-skip');
  const saveBtn = document.getElementById('swipe-save');
  const viewBtn = document.getElementById('swipe-view');

  fab.addEventListener('click', () => openExplore(fab));
  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeDialog(dialog));
  }
  if (skipBtn) {
    skipBtn.addEventListener('click', () => handleSwipeAction('skip'));
  }
  if (saveBtn) {
    saveBtn.addEventListener('click', () => handleSwipeAction('save'));
  }
  if (viewBtn) {
    viewBtn.addEventListener('click', () => {
      if (!swipeState.current || !swipeState.current._product) return;
      window.open(swipeState.current._product.url, '_blank', 'noopener');
    });
  }
};

const initGlobalSearch = () => {
  const headerSearch = document.getElementById('global-search');
  if (!headerSearch) return;
  const input = document.getElementById('global-search-input');
  headerSearch.addEventListener('submit', (event) => {
    event.preventDefault();
    const term = input?.value.trim();
    const target = term ? `/butikker.html?q=${encodeURIComponent(term)}` : '/butikker.html';
    location.href = target;
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  initYear();
  wishlist = readWishlist();
  updateWishlistUI();
  handleDialogSetup();
  initWishlistForm();
  initPartnerForm();
  initGlobalSearch();

  await loadData();
  updateWishlistUI();

  const page = document.body.dataset.page;
  switch (page) {
    case 'landing':
      initLanding();
      break;
    case 'directory':
      initDirectory();
      break;
    case 'partners':
      // nothing extra beyond forms
      break;
    default:
      break;
  }
});
