const DB = {
  products: [],
  stores: [],
  categories: [],
  countries: [],
  shippingConfig: null
};

const STORAGE_KEY_WISHLIST = 'selekti_wishlist';
const STORAGE_KEY_PROFILE = 'selekti_profile';

const storage = (() => {
  try {
    const testKey = '__selekti_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch (err) {
    const fallback = {};
    return {
      getItem: key => Object.prototype.hasOwnProperty.call(fallback, key) ? fallback[key] : null,
      setItem: (key, value) => { fallback[key] = String(value); },
      removeItem: key => { delete fallback[key]; }
    };
  }
})();

const wishlist = {
  get() {
    try {
      const raw = storage.getItem(STORAGE_KEY_WISHLIST);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  },
  set(items) {
    storage.setItem(STORAGE_KEY_WISHLIST, JSON.stringify(items));
    renderWishlist();
    updateWishlistBadge();
    syncWishlistButtons();
  },
  toggle(item) {
    const list = this.get();
    const index = list.findIndex(entry => entry.id === item.id);
    if (index >= 0) {
      list.splice(index, 1);
      toast('Fjernet fra ønskeliste');
    } else {
      list.push(item);
      toast('Tilføjet til ønskeliste');
    }
    this.set(list);
  },
  clear() {
    this.set([]);
    toast('Ønskeliste ryddet');
  },
  has(id) {
    return this.get().some(entry => entry.id === id);
  }
};

const toasts = {
  container: null,
  init() {
    this.container = document.getElementById('toasts');
  },
  push(message) {
    if (!this.container) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    this.container.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 300);
    }, 3200);
  }
};

function toast(message) {
  toasts.push(message);
}

const quoteCache = new Map();
let quoteSequence = 0;
const QUOTE_ENDPOINT = '/.netlify/functions/aiLinkQuote';
const QUOTE_TIMEOUT = 8000;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function formatDKK(value) {
  const number = Number.isFinite(Number(value)) ? Number(value) : 0;
  return `DKK ${Math.round(number).toLocaleString('da-DK')}`;
}

function storeQuote(quote) {
  const id = `quote-${++quoteSequence}`;
  quoteCache.set(id, quote);
  return id;
}

function getStoredQuote(id) {
  return quoteCache.get(id);
}

function updateWishlistField(name, value) {
  const field = document.querySelector(`#sheet-wishlist [name="${name}"]`);
  if (field) field.value = value ?? '';
}

function prefillWishlistWithQuote(quote) {
  if (!quote) return;
  const detected = quote.detected || {};
  const estimate = quote.estimate || {};
  updateWishlistField('product_url', detected.url || quote.url || '');
  updateWishlistField('detected_title', detected.title || '');
  updateWishlistField('detected_price_dkk', Number.isFinite(detected.priceDKK) ? Math.round(detected.priceDKK) : '');
  updateWishlistField('detected_currency', detected.priceOriginal?.currency || '');
  updateWishlistField('detected_zone', detected.zone || estimate.zoneCode || '');
  updateWishlistField('detected_weight', Number.isFinite(detected.weightKg) ? detected.weightKg : '');
  updateWishlistField('estimated_total_dkk', Number.isFinite(estimate.totalDKK) ? Math.round(estimate.totalDKK) : '');
}

async function requestQuote(url, zone) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), QUOTE_TIMEOUT);
  try {
    const payload = { url };
    if (zone) payload.zone = zone;
    const response = await fetch(QUOTE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({ ok: false, error: 'INVALID_JSON' }));
    if (!response.ok) {
      return { ok: false, error: data.error || 'NETWORK', url };
    }
    if (data && typeof data === 'object') {
      data.url = url;
      if (data.detected) {
        data.detected.url = data.detected.url || url;
      }
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      return { ok: false, error: 'TIMEOUT', url };
    }
    return { ok: false, error: 'NETWORK', url };
  } finally {
    clearTimeout(timer);
  }
}

function getZoneLabel(code) {
  if (!code) return '';
  const zone = DB.shippingConfig?.zones?.find(entry => entry.code === code);
  return zone ? zone.label : code;
}

function renderQuoteMarkup(quote, { context = 'hero' } = {}) {
  const detected = quote.detected || {};
  const estimate = quote.estimate || {};
  const breakdown = [
    ['Vare', Number.isFinite(detected.priceDKK) ? detected.priceDKK : estimate.itemDKK],
    ['Fragt', estimate.freightDKK],
    ['Service', estimate.serviceDKK],
    ['Told', estimate.dutyDKK],
    ['Moms', estimate.vatDKK]
  ].filter(([, value]) => Number.isFinite(value));
  const storedId = storeQuote(quote);
  const metaParts = [];
  if (detected.store) metaParts.push(detected.store);
  if (detected.zone || estimate.zoneCode) metaParts.push(getZoneLabel(detected.zone || estimate.zoneCode));
  if (Number.isFinite(detected.weightKg)) metaParts.push(`${detected.weightKg} kg est.`);
  const noteText = quote.notes?.length ? quote.notes.join(' • ') : 'Estimat. Endelig pris bekræftes på mail.';
  const image = detected.images?.[0];
  const originalPrice = detected.priceOriginal;
  const originalLabel = originalPrice?.amount && originalPrice?.currency
    ? `Fundet pris: ${originalPrice.amount} ${originalPrice.currency}`
    : 'Fundet pris';

  return `
    <article class="quote-card" data-quote-id="${storedId}">
      ${image ? `<figure class="aspect-[3/2] overflow-hidden rounded-2xl bg-soft"><img src="${escapeHtml(image)}" alt="${escapeHtml(detected.title || 'Produkt')}" loading="lazy" decoding="async" class="h-full w-full object-cover"/></figure>` : ''}
      <div>
        <p class="text-xs uppercase tracking-wide text-ink/50">${escapeHtml(originalLabel)}</p>
        <h3>${escapeHtml(detected.title || 'Vi fandt produktet')}</h3>
      </div>
      ${metaParts.length ? `<div class="quote-meta">${metaParts.map(item => escapeHtml(item)).join(' • ')}</div>` : ''}
      ${breakdown.length ? `<ul class="quote-breakdown">${breakdown.map(([label, value]) => `<li><span>${escapeHtml(label)}</span><span>${formatDKK(value)}</span></li>`).join('')}</ul>` : ''}
      <div class="quote-total">${formatDKK(estimate.totalDKK ?? detected.priceDKK ?? 0)}</div>
      <p class="quote-notes">${escapeHtml(noteText)}</p>
      <div class="flex flex-wrap gap-2">
        <button class="btn primary small" data-quote-continue="${storedId}" data-context="${escapeHtml(context)}">Fortsæt</button>
      </div>
    </article>
  `;
}

function renderQuoteError(url, error, { context = 'hero' } = {}) {
  const messages = {
    UNREADABLE_PAGE: 'Vi kunne ikke læse produktet automatisk. Indsæt pris og vægt i formularen, så sender vi din totalpris.',
    TIMEOUT: 'Forbindelsen brugte for lang tid. Du kan stadig sende linket til os manuelt.',
    NETWORK: 'Der opstod en midlertidig fejl. Prøv igen, eller indsæt pris manuelt.'
  };
  const storedId = storeQuote({ ok: false, url, error });
  const description = messages[error] || 'Vi kunne ikke hente detaljer automatisk. Fortsæt og tilføj pris manuelt.';
  return `
    <article class="quote-card" data-quote-id="${storedId}">
      <h3>Fortsæt uden automatisk estimat</h3>
      <p class="quote-notes">${escapeHtml(description)}</p>
      <div class="flex flex-wrap gap-2">
        <button class="btn primary small" data-quote-continue="${storedId}" data-context="${escapeHtml(context)}">Fortsæt</button>
      </div>
    </article>
  `;
}

document.addEventListener('DOMContentLoaded', init);

async function init() {
  toasts.init();
  initSheets();
  initGlobalHandlers();
  initAuthMock();
  initGlobalSearch();
  await loadData();
  renderWishlist();
  updateWishlistBadge();
  syncWishlistButtons();
  document.querySelectorAll('form[data-netlify]').forEach(handleNetlifyForm);
  initEstimator();
  initChatbot();

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
}

async function loadData() {
  const files = [
    { key: 'products', file: 'products.json', fallback: [] },
    { key: 'stores', file: 'stores.json', fallback: [] },
    { key: 'categories', file: 'categories.json', fallback: [] },
    { key: 'countries', file: 'countries.json', fallback: [] },
    { key: 'shippingConfig', file: 'shipping-config.json', fallback: null }
  ];

  await Promise.all(files.map(async entry => {
    try {
      const res = await fetch(`/data/${entry.file}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(res.statusText);
      DB[entry.key] = await res.json();
    } catch (err) {
      DB[entry.key] = entry.fallback;
      console.error(`Kunne ikke indlæse ${entry.file}:`, err);
    }
  }));
}

function initSheets() {
  const dim = document.getElementById('sheet-dim');
  const sheets = document.querySelectorAll('[data-sheet]');

  function openSheet(id) {
    const sheet = document.getElementById(id);
    if (!sheet) return;
    sheet.classList.add('open');
    sheet.classList.remove('hidden');
    dim?.classList.remove('hidden');
    dim?.classList.add('visible');
    sheet.setAttribute('aria-hidden', 'false');
  }

  function closeAllSheets() {
    sheets.forEach(sheet => {
      sheet.classList.remove('open');
      sheet.setAttribute('aria-hidden', 'true');
      setTimeout(() => sheet.classList.add('hidden'), 200);
    });
    dim?.classList.remove('visible');
    setTimeout(() => dim?.classList.add('hidden'), 200);
  }

  document.body.addEventListener('click', event => {
    const openTarget = event.target.closest('[data-open]');
    if (openTarget) {
      const sheetId = openTarget.dataset.open;
      if (sheetId) {
        if (sheetId === 'sheet-wishlist') {
          const input = document.querySelector('#sheet-wishlist input[name="product_url"]');
          if (openTarget.dataset.prefillUrl) {
            if (input) {
              input.value = openTarget.dataset.prefillUrl;
              input.focus();
            }
            prefillWishlistWithQuote({ detected: { url: openTarget.dataset.prefillUrl } });
          } else {
            prefillWishlistWithQuote({ detected: { url: input?.value || '' } });
          }
        }
        openSheet(sheetId);
      }
    }

    const closeTarget = event.target.closest('[data-close]');
    if (closeTarget) {
      closeAllSheets();
    }

    const wishlistToggle = event.target.closest('[data-add-to-wishlist]');
    if (wishlistToggle) {
      const dataset = wishlistToggle.dataset;
      wishlist.toggle({
        id: dataset.id,
        title: dataset.title,
        img: dataset.img,
        priceDKK: Number(dataset.price || 0),
        url: dataset.url
      });
      wishlistToggle.classList.toggle('active');
    }

    const quoteContinue = event.target.closest('[data-quote-continue]');
    if (quoteContinue) {
      const quote = getStoredQuote(quoteContinue.dataset.quoteContinue);
      if (quote) {
        prefillWishlistWithQuote(quote);
      } else if (quoteContinue.dataset.url) {
        prefillWishlistWithQuote({ detected: { url: quoteContinue.dataset.url } });
      }
      openSheet('sheet-wishlist');
      const urlField = document.querySelector('#sheet-wishlist input[name="product_url"]');
      urlField?.focus();
      return;
    }
  });

  dim?.addEventListener('click', closeAllSheets);
  window.addEventListener('keyup', event => {
    if (event.key === 'Escape') closeAllSheets();
  });

  window.openSheet = openSheet;
  window.closeSheets = closeAllSheets;
}

function initGlobalHandlers() {
  document.getElementById('wishlist-open')?.addEventListener('click', () => openSheet('sheet-wishlist'));
  document.getElementById('wishlist-clear')?.addEventListener('click', () => wishlist.clear());
}

function initAuthMock() {
  const loginButtons = document.querySelectorAll('[data-auth-action]');
  loginButtons.forEach(button => {
    button.addEventListener('click', () => {
      const hasProfile = Boolean(storage.getItem(STORAGE_KEY_PROFILE));
      if (hasProfile) {
        storage.removeItem(STORAGE_KEY_PROFILE);
        toast('Logget ud');
        updateAuthState();
      } else {
        storage.setItem(STORAGE_KEY_PROFILE, '1');
        toast('Logget ind (demo)');
        updateAuthState();
      }
    });
  });

  updateAuthState();
}

function updateAuthState() {
  const isLoggedIn = Boolean(storage.getItem(STORAGE_KEY_PROFILE));
  document.querySelectorAll('[data-auth-state="label"]').forEach(el => {
    el.textContent = isLoggedIn ? 'Min konto' : 'Log ind';
  });
}

function initGlobalSearch() {
  const form = document.getElementById('global-search');
  if (!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const input = document.getElementById('global-search-input');
    const query = input?.value?.trim() || '';
    const url = new URL(window.location.origin + '/butikker.html');
    if (query) {
      url.searchParams.set('q', query);
    }
    window.location.href = url.toString();
  });
}

function initEstimator() {
  const form = document.getElementById('est-form');
  if (!form) return;

  const totalEl = document.getElementById('est-total');
  const detailEl = document.getElementById('est-breakdown');
  const zoneSelect = form.querySelector('[name="zone"]');

  if (totalEl) totalEl.textContent = 'Indtast varepris';
  if (detailEl) detailEl.innerHTML = '';

  if (zoneSelect && DB.shippingConfig?.zones?.length) {
    zoneSelect.innerHTML = DB.shippingConfig.zones
      .map(zone => `<option value="${zone.code}">${zone.label}</option>`)
      .join('');
  }

  const handleUpdate = (event) => {
    if (event) event.preventDefault();
    const itemDKK = Number(form.querySelector('[name="item_dkk"]')?.value || 0);
    const weightKg = Number(form.querySelector('[name="weight_kg"]')?.value || 0);
    const zoneCode = (form.querySelector('[name="zone"]')?.value || 'EU').toUpperCase();

    if (!itemDKK) {
      if (totalEl) totalEl.textContent = 'Indtast varepris';
      if (detailEl) detailEl.innerHTML = '';
      return;
    }

    const result = computeEstimate({ itemDKK, weightKg, zoneCode });
    if (totalEl) totalEl.textContent = `DKK ${result.total.toLocaleString('da-DK')}`;
    if (detailEl) {
      const map = [
        ['Vare', result.breakdown.item],
        ['Fragt', result.breakdown.freight],
        ['Service', result.breakdown.service],
        ['Told', result.breakdown.duty],
        ['Moms', result.breakdown.vat]
      ];
      detailEl.innerHTML = map
        .map(([label, value]) => `<li>${label}: DKK ${Number(value).toLocaleString('da-DK')}</li>`)
        .join('');
    }
  };

  form.addEventListener('submit', handleUpdate);
  form.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('change', handleUpdate);
    input.addEventListener('input', event => {
      if (event.target.name === 'item_dkk') handleUpdate();
    });
  });

  handleUpdate();
}

function computeEstimate({ itemDKK, weightKg = 0, zoneCode = 'EU' }) {
  const cfg = DB.shippingConfig;
  const zone = cfg?.zones?.find(entry => entry.code === zoneCode) || { vat: 0.25, dutyDefault: 0.03 };
  const weights = cfg?.weights || [];
  const freightTable = cfg?.freight || {};
  const rate = cfg?.service?.rate ?? 0.12;
  const minService = cfg?.service?.minDKK ?? 49;

  const weight = Number.isFinite(weightKg) && weightKg > 0 ? weightKg : 0.01;
  let freight = 0;
  if (weights.length) {
    const zoneFreight = freightTable[zoneCode] || freightTable[zoneCode.toUpperCase()] || [];
    const index = weights.findIndex(limit => weight <= limit);
    const safeIndex = index >= 0 ? index : weights.length - 1;
    freight = zoneFreight[safeIndex] ?? zoneFreight[zoneFreight.length - 1] ?? 0;
  }

  const service = Math.max(Math.round(itemDKK * rate), minService);
  const dutiable = itemDKK + freight;
  const duty = Math.round(dutiable * (zone.dutyDefault ?? 0.03));
  const vat = Math.round((dutiable + duty + service) * (zone.vat ?? 0.25));
  const total = Math.round(itemDKK + freight + duty + vat + service);

  return {
    total,
    breakdown: {
      item: itemDKK,
      freight,
      service,
      duty,
      vat
    }
  };
}

function initChatbot() {
  const toggle = document.getElementById('chatbot-toggle');
  const panel = document.getElementById('chatbot-panel');
  const closeBtn = document.getElementById('chatbot-close');
  const form = document.getElementById('chatbot-form');
  const input = document.getElementById('chatbot-input');
  const messages = document.getElementById('chatbot-messages');
  if (!toggle || !panel || !form || !input || !messages) return;

  const suggestions = Array.from(document.querySelectorAll('[data-chat-suggestion]'));
  toggle.setAttribute('aria-expanded', 'false');

  function setPanel(open) {
    if (open) {
      panel.classList.remove('hidden');
      panel.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      setTimeout(() => input.focus(), 50);
    } else {
      panel.classList.add('hidden');
      panel.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
    }
  }

  function appendMessage(role, text, { html = false } = {}) {
    const row = document.createElement('div');
    row.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;
    const bubble = document.createElement('div');
    bubble.className = `max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${role === 'user' ? 'bg-ink text-white' : 'bg-soft text-ink'}`;
    if (html) {
      bubble.innerHTML = text;
    } else {
      bubble.textContent = text;
    }
    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
    return { row, bubble };
  }

  function appendAssistantQuote(html) {
    const row = document.createElement('div');
    row.className = 'flex justify-start';
    row.innerHTML = html;
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
    return row;
  }

  async function respondTo(text) {
    const lower = text.toLowerCase();
    const urlMatch = text.match(/https?:\/\/[^\s]+/i);
    if (urlMatch) {
      const pending = appendMessage('assistant', 'Jeg analyserer linket…');
      const quote = await requestQuote(urlMatch[0]);
      pending?.row?.remove();
      if (quote?.ok) {
        appendAssistantQuote(renderQuoteMarkup(quote, { context: 'chatbot' }));
      } else {
        appendAssistantQuote(renderQuoteError(urlMatch[0], quote?.error, { context: 'chatbot' }));
      }
      return;
    }
    const responses = [
      {
        keywords: ['japan', 'jp'],
        reply: 'Japan-guiden ligger klar – klik på Japan i forsiden eller gå direkte til japan.html for topbutikker og produkter.'
      },
      {
        keywords: ['usa', 'us', 'amerika'],
        reply: 'For amerikanske fund anbefaler vi B&H, StockX og Huckberry. Se hele listen på usa.html eller filtrer i butikker.html.'
      },
      {
        keywords: ['uk', 'storbritannien', 'england'],
        reply: 'Storbritannien-siden viser Apple Store UK, END. og Selfridges. Brug butiksoversigten med country=UK for alle produkter.'
      },
      {
        keywords: ['korea', 'sydkorea', 'kr'],
        reply: 'Vores Sydkorea-katalog samler k-beauty og streetwear. Kig forbi sydkorea.html eller filtrer efter KR i oversigten.'
      },
      {
        keywords: ['kina', 'cn', 'china'],
        reply: 'Designmarkedet fra Shanghai og gadget-butikker er klar på kina.html. Du kan også filtrere efter Kina i butikker.html.'
      },
      {
        keywords: ['indien', 'india', 'in'],
        reply: 'Indien-siden samler håndværk og tech fra Bangalore til Delhi. Besøg indien.html for inspiration.'
      },
      {
        keywords: ['levering', 'fragt', 'totalpris'],
        reply: 'Vi viser altid én totalpris. Alle detaljer om levering og priser finder du på om-os.html under FAQ.'
      },
      {
        keywords: ['selekti+', 'abonnement', 'plus'],
        reply: 'Selekti+ giver fri fragt, behovsbokse og priority support. Læs mere i Selekti+-sektionen på forsiden eller udfyld ventelisten via sheetet.'
      },
      {
        keywords: ['partner', 'butik', 'samarbejde'],
        reply: 'Klik på bliv-partner.html for at se programmet og sende en ansøgning. Vi onboarder normalt på 48–72 timer.'
      },
      {
        keywords: ['wishlist', 'ønskeliste', 'favorit'],
        reply: 'Tryk på hjerterne på produkterne for at gemme dem i ønskelisten. Du kan altid åbne listen via knappen i headeren.'
      }
    ];

    const entry = responses.find(item => item.keywords.some(keyword => lower.includes(keyword)));
    if (entry) {
      appendMessage('assistant', entry.reply);
    } else {
      appendMessage('assistant', 'Jeg hjælper dig gerne videre. Stil et spørgsmål om et land, levering eller hvordan du bestiller via Selekti.');
    }
  }

  if (!messages.dataset.bootstrapped) {
    appendMessage('assistant', 'Hej! Jeg er din Selekti-guide. Spørg mig om butikker, lande eller hvordan du bestiller, så viser jeg vejen.');
    messages.dataset.bootstrapped = 'true';
  }

  toggle.addEventListener('click', () => {
    const open = panel.classList.contains('hidden');
    setPanel(open);
  });

  closeBtn?.addEventListener('click', () => setPanel(false));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.classList.contains('hidden')) {
      setPanel(false);
    }
  });

  suggestions.forEach(button => {
    button.addEventListener('click', () => {
      const question = button.dataset.chatSuggestion;
      if (!question) return;
      setPanel(true);
      input.value = question;
      input.focus();
    });
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    appendMessage('user', text);
    input.value = '';
    await respondTo(text);
  });
}

function initLanding() {
  renderFeaturedStores('#landing-featured-stores', store => store.featured);
  renderFeaturedProducts('#landing-featured-products');
  renderGuides();
  const heroEst = document.getElementById('hero-est');
  if (heroEst) {
    const res = computeEstimate({ itemDKK: 1500, weightKg: 1.2, zoneCode: 'JP' });
    heroEst.textContent = `DKK ${res.total.toLocaleString('da-DK')}`;
  }
  const heroLinkForm = document.getElementById('hero-link-form');
  const heroLinkInput = document.getElementById('hero-link-input');
  const heroQuote = document.getElementById('hero-quote');
  if (heroLinkForm) {
    heroLinkForm.addEventListener('submit', async event => {
      event.preventDefault();
      const link = heroLinkInput?.value?.trim();
      if (!link) {
        toast('Indsæt et gyldigt produktlink.');
        heroLinkInput?.focus();
        return;
      }
      let parsed;
      try {
        parsed = new URL(link);
      } catch (err) {
        toast('Linket ser ikke rigtigt ud. Prøv igen.');
        heroLinkInput?.focus();
        return;
      }
      if (heroQuote) {
        heroQuote.classList.remove('hidden');
        heroQuote.innerHTML = '<div class="quote-loading">Vi analyserer linket…</div>';
      }
      const quote = await requestQuote(parsed.href);
      if (heroLinkInput) {
        heroLinkInput.value = parsed.href;
      }
      if (heroQuote) {
        if (quote?.ok) {
          heroQuote.innerHTML = renderQuoteMarkup(quote, { context: 'hero' });
        } else {
          heroQuote.innerHTML = renderQuoteError(parsed.href, quote?.error, { context: 'hero' });
        }
      }
    });
  }
}

function renderFeaturedStores(selector, filterFn) {
  const container = document.querySelector(selector);
  if (!container) return;
  const stores = DB.stores.filter(filterFn || (() => true)).slice(0, 6);
  if (!stores.length) {
    container.innerHTML = '<p class="text-sm text-ink/60">Ingen butikker at vise endnu.</p>';
    return;
  }
  container.innerHTML = stores.map(store => `
    <article class="rounded-3xl bg-white ring-1 ring-black/5 shadow-soft p-5 flex flex-col gap-4">
      <div class="flex items-center gap-3">
        <img src="${store.logo}" alt="${store.name}" loading="lazy" decoding="async" class="h-12 w-12 rounded-xl object-cover">
        <div>
          <h3 class="text-lg font-semibold">${store.name}</h3>
          <p class="text-xs text-ink/60">${store.tags.join(' • ')}</p>
        </div>
      </div>
      <p class="text-sm text-ink/70">${store.deliveryHint}</p>
      <div class="flex flex-wrap gap-2">
        <a href="butikker.html?store=${encodeURIComponent(store.id)}" class="btn primary small">Se produkter</a>
        <button class="btn ghost small" data-open="sheet-wishlist" data-prefill-url="${store.url}">Bestil via link</button>
      </div>
    </article>
  `).join('');
}

function renderFeaturedProducts(selector) {
  const container = document.querySelector(selector);
  if (!container) return;
  const products = DB.products.filter(product => product.featured).slice(0, 12);
  container.innerHTML = products.map(renderProductCard).join('');
}

function renderGuides() {
  const container = document.getElementById('landing-guides');
  if (!container) return;
  const guides = DB.countries.map(country => ({
    country,
    url: `/${(country.slug || country.code || '').toLowerCase()}.html`,
    title: `Guide til shopping i ${country.label}`,
    summary: `Få tips til populære butikker og levering fra ${country.label}.`
  }));
  container.innerHTML = guides.map(guide => `
    <article class="rounded-3xl bg-white ring-1 ring-black/5 shadow-soft p-6 flex flex-col gap-3">
      <h3 class="text-lg font-semibold">${guide.title}</h3>
      <p class="text-sm text-ink/70">${guide.summary}</p>
      <a class="text-sm font-medium text-ocean" href="${guide.url}">Læs guiden →</a>
    </article>
  `).join('');
}

function initDirectory() {
  hydrateDirectoryFromParams();
  bindDirectoryControls();
  renderDirectoryFeatured();
  renderDirectory();

  const estEl = document.getElementById('directory-hero-est');
  if (estEl) {
    const res = computeEstimate({ itemDKK: 899, weightKg: 0.8, zoneCode: 'US' });
    estEl.textContent = `DKK ${res.total.toLocaleString('da-DK')}`;
  }
}

function hydrateDirectoryFromParams() {
  const params = getParams();
  const searchInput = document.getElementById('directory-search-input');
  if (searchInput) searchInput.value = params.get('q') || '';
  const searchCountry = document.getElementById('directory-search-country');
  if (searchCountry) searchCountry.value = params.get('country') || '';
  const sortSelect = document.getElementById('directory-sort');
  if (sortSelect) sortSelect.value = params.get('sort') || 'popular';

  document.querySelectorAll('[data-filter="country"]').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.value === params.get('country'));
  });
}

function bindDirectoryControls() {
  const searchForm = document.getElementById('directory-search');
  searchForm?.addEventListener('submit', event => {
    event.preventDefault();
    const term = document.getElementById('directory-search-input')?.value || '';
    setParam('q', term.trim());
    setParam('country', document.getElementById('directory-search-country')?.value || '');
    renderDirectory();
  });

  document.querySelectorAll('[data-filter="country"]').forEach(chip => {
    chip.addEventListener('click', () => {
      const current = getParams().get('country');
      const value = chip.dataset.value;
      setParam('country', current === value ? '' : value);
      hydrateDirectoryFromParams();
      renderDirectory();
    });
  });

  const filterForm = document.getElementById('directory-filters');
  filterForm?.addEventListener('change', () => {
    const params = new FormData(filterForm);
    const categories = params.getAll('category');
    const countries = params.getAll('country');
    const brands = params.getAll('brand');
    const sizes = params.getAll('size');
    setParam('cat', categories.join(','));
    setParam('countries', countries.join(','));
    setParam('brands', brands.join(','));
    setParam('sizes', sizes.join(','));
    renderDirectory();
  });

  document.getElementById('directory-reset')?.addEventListener('click', () => {
    ['q', 'country', 'cat', 'countries', 'brands', 'sizes', 'priceMin', 'priceMax', 'store', 'sort'].forEach(key => setParam(key, ''));
    hydrateDirectoryFromParams();
    if (filterForm) filterForm.reset();
    renderDirectory();
  });

  const sortSelect = document.getElementById('directory-sort');
  sortSelect?.addEventListener('change', event => {
    setParam('sort', event.target.value);
    renderDirectory();
  });

  document.querySelectorAll('[data-row-prev]').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.target;
      const row = document.getElementById(id);
      row?.scrollBy({ left: -320, behavior: 'smooth' });
    });
  });
  document.querySelectorAll('[data-row-next]').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.target;
      const row = document.getElementById(id);
      row?.scrollBy({ left: 320, behavior: 'smooth' });
    });
  });
}

function renderDirectory() {
  const params = getParams();
  const q = (params.get('q') || '').toLowerCase();
  const country = params.get('country') || '';
  const categoryParam = params.get('cat') || '';
  const multiCountries = (params.get('countries') || '').split(',').filter(Boolean);
  const brands = (params.get('brands') || '').split(',').filter(Boolean);
  const sizes = (params.get('sizes') || '').split(',').filter(Boolean);
  const store = params.get('store') || '';
  const sort = params.get('sort') || 'popular';

  let list = [...DB.products];

  if (q) {
    list = list.filter(product => {
      const storeName = DB.stores.find(store => store.id === product.storeId)?.name || '';
      return [product.title, product.tags?.join(' '), storeName].join(' ').toLowerCase().includes(q);
    });
  }

  if (country) {
    list = list.filter(product => product.country.toLowerCase() === country.toLowerCase());
  }

  if (categoryParam) {
    const categories = categoryParam.split(',').filter(Boolean);
    if (categories.length) {
      list = list.filter(product => categories.includes(product.category));
    }
  }

  if (multiCountries.length) {
    list = list.filter(product => multiCountries.includes(product.country.toLowerCase()));
  }

  if (brands.length) {
    list = list.filter(product => brands.some(brand => product.tags?.includes(brand)));
  }

  if (sizes.length) {
    list = list.filter(product => sizes.some(size => product.tags?.includes(size)));
  }

  if (store) {
    list = list.filter(product => product.storeId === store);
  }

  switch (sort) {
    case 'price_asc':
      list.sort((a, b) => a.priceDKK - b.priceDKK);
      break;
    case 'price_desc':
      list.sort((a, b) => b.priceDKK - a.priceDKK);
      break;
    case 'new':
      list = list.slice().reverse();
      break;
    default:
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      break;
  }

  const countEl = document.getElementById('directory-count');
  if (countEl) {
    countEl.textContent = list.length ? `${list.length} produkter` : '0 produkter';
  }

  updateDirectoryActiveFilters({ q, country, categoryParam, multiCountries, brands, sizes, store });

  const grid = document.getElementById('directory-grid');
  const emptyState = document.getElementById('directory-empty');
  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = '';
    emptyState?.classList.remove('hidden');
    renderDirectorySuggestions();
    return;
  }

  emptyState?.classList.add('hidden');
  grid.innerHTML = list.map(renderProductCard).join('');
  syncWishlistButtons();
}

function renderDirectoryFeatured() {
  const container = document.getElementById('directory-featured');
  if (!container) return;
  const featuredStores = DB.stores.filter(store => store.featured).slice(0, 6);
  if (!featuredStores.length) {
    container.innerHTML = '<p class="text-sm text-ink/60">Ingen kampagner aktive lige nu.</p>';
    return;
  }
  container.innerHTML = featuredStores.map(store => `
    <article class="min-w-[260px] max-w-[280px] rounded-3xl bg-white p-5 ring-1 ring-black/5 shadow-soft">
      <div class="flex items-center gap-3">
        <img src="${store.logo}" alt="${store.name}" loading="lazy" decoding="async" class="h-12 w-12 rounded-xl object-cover">
        <div>
          <h3 class="text-base font-semibold">${store.name}</h3>
          <p class="text-xs text-ink/60">${store.tags.join(' • ')}</p>
        </div>
      </div>
      <p class="mt-3 text-sm text-ink/70">${store.deliveryHint}</p>
      <div class="mt-4 flex flex-wrap gap-2">
        <a href="butikker.html?store=${encodeURIComponent(store.id)}" class="btn primary small">Se produkter</a>
        <button class="btn ghost small" data-open="sheet-wishlist" data-prefill-url="${store.url}">Bestil via link</button>
      </div>
    </article>
  `).join('');
}

function renderDirectorySuggestions() {
  const suggestions = document.getElementById('directory-suggestions');
  if (!suggestions) return;
  const categoryChips = DB.categories.slice(0, 3).map(category => `
    <a class="chip" href="butikker.html?cat=${encodeURIComponent(category.id)}">${category.label}</a>
  `);
  const countryChips = DB.countries.slice(0, 3).map(country => `
    <a class="chip" href="butikker.html?country=${encodeURIComponent(country.code.toLowerCase())}">${country.label}</a>
  `);
  suggestions.innerHTML = [...categoryChips, ...countryChips].join('');
}

function updateDirectoryActiveFilters({ q, country, categoryParam, multiCountries, brands, sizes, store }) {
  const container = document.getElementById('active-filters');
  if (!container) return;
  const chips = [];
  if (q) chips.push(`<span class="chip">Søg: ${q}</span>`);
  if (country) chips.push(`<span class="chip">Land: ${country.toUpperCase()}</span>`);
  if (categoryParam) chips.push(`<span class="chip">Kategori: ${categoryParam}</span>`);
  if (multiCountries.length) chips.push(`<span class="chip">Lande: ${multiCountries.join(', ').toUpperCase()}</span>`);
  if (brands.length) chips.push(`<span class="chip">Tags: ${brands.join(', ')}</span>`);
  if (sizes.length) chips.push(`<span class="chip">Størrelser: ${sizes.join(', ')}</span>`);
  if (store) {
    const storeName = DB.stores.find(s => s.id === store)?.name || store;
    chips.push(`<span class="chip">Butik: ${storeName}</span>`);
  }
  container.innerHTML = chips.join('');
}

function renderProductCard(product) {
  const store = DB.stores.find(entry => entry.id === product.storeId);
  const storeName = store ? store.name : 'Butik';
  const isActive = wishlist.has(product.id);
  return `
    <article class="rounded-3xl bg-white ring-1 ring-black/5 shadow-soft overflow-hidden card">
      <div class="aspect-[4/5] bg-soft overflow-hidden">
        <img src="${product.img}" alt="${product.title}" loading="lazy" decoding="async" class="h-full w-full object-cover">
      </div>
      <div class="p-4 space-y-2">
        <p class="text-xs uppercase tracking-wide text-ink/50">${storeName}</p>
        <h3 class="text-base font-semibold leading-tight">${product.title}</h3>
        <p class="text-sm text-ink/70">DKK ${product.priceDKK.toLocaleString('da-DK')}</p>
        <div class="flex gap-2 pt-2">
          <button class="wishlist-btn${isActive ? ' active' : ''}" aria-label="Tilføj til ønskeliste"
            data-add-to-wishlist
            data-id="${product.id}"
            data-title="${product.title}"
            data-img="${product.img}"
            data-price="${product.priceDKK}"
            data-url="${product.url}">♡</button>
          <button class="btn primary small font-medium" data-open="sheet-wishlist" data-prefill-url="${product.url}">Bestil via link</button>
        </div>
      </div>
    </article>
  `;
}

function initCountry() {
  const countryCode = document.body.dataset.country || getParams().get('country');
  if (!countryCode) return;
  const stores = DB.stores.filter(store => store.country.toLowerCase() === countryCode.toLowerCase());
  const products = DB.products.filter(product => product.country.toLowerCase() === countryCode.toLowerCase());
  const storeGrid = document.getElementById('country-store-grid');
  const productGrid = document.getElementById('country-product-grid');
  if (storeGrid) {
    storeGrid.innerHTML = stores.map(store => `
      <article class="rounded-3xl bg-white ring-1 ring-black/5 shadow-soft p-5 flex flex-col gap-3">
        <div class="flex items-center gap-3">
          <img src="${store.logo}" alt="${store.name}" loading="lazy" decoding="async" class="h-12 w-12 rounded-xl object-cover">
          <div>
            <h3 class="text-lg font-semibold">${store.name}</h3>
            <p class="text-xs text-ink/60">${store.tags.join(' • ')}</p>
          </div>
        </div>
        <p class="text-sm text-ink/70">${store.deliveryHint}</p>
        <a href="butikker.html?store=${encodeURIComponent(store.id)}" class="text-sm font-medium text-ocean">Gå til butik →</a>
      </article>
    `).join('');
  }
  if (productGrid) {
    productGrid.innerHTML = products.map(renderProductCard).join('');
  }
}

function initPartners() {
  document.querySelectorAll('form[data-netlify]').forEach(handleNetlifyForm);
}

function initAbout() {
  document.querySelectorAll('form[data-netlify]').forEach(handleNetlifyForm);
}

function handleNetlifyForm(form) {
  if (form.dataset.netlifyBound === 'true') return;
  form.dataset.netlifyBound = 'true';
  const submitButton = form.querySelector('button[type="submit"]');
  const successTarget = form.dataset.successTarget ? document.getElementById(form.dataset.successTarget) : null;
  if (submitButton && !submitButton.dataset.originalText) {
    submitButton.dataset.originalText = submitButton.textContent || '';
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.dataset.loading = 'true';
      submitButton.textContent = 'Sender…';
    }

    try {
      const formData = new FormData(form);
      const response = await fetch(form.getAttribute('action') || '/', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        form.reset();
        if (successTarget) successTarget.classList.remove('hidden');
        if (form.dataset.hideOnSuccess === 'true') {
          form.classList.add('hidden');
        }
        toast('Tak for din besked – vi vender tilbage snart.');
      } else {
        throw new Error('Netværksfejl');
      }
    } catch (err) {
      toast('Noget gik galt – prøv igen.');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.dataset.loading = 'false';
        submitButton.textContent = submitButton.dataset.originalText || 'Send';
      }
    }
  });
}

function renderWishlist() {
  const listEl = document.getElementById('wishlist-list');
  const emptyEl = document.getElementById('wishlist-empty');
  const actionsEl = document.getElementById('wishlist-actions');
  const itemsJson = document.querySelector('#sheet-wishlist input[name="items_json"]');
  if (!listEl || !emptyEl || !actionsEl) return;
  const items = wishlist.get();
  if (!items.length) {
    listEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
    actionsEl.classList.add('hidden');
  } else {
    emptyEl.classList.add('hidden');
    actionsEl.classList.remove('hidden');
    listEl.innerHTML = items.map(item => `
      <article class="flex items-center gap-3 rounded-2xl bg-white ring-1 ring-black/5 p-3">
        <img src="${item.img}" alt="${item.title}" loading="lazy" decoding="async" class="h-16 w-16 rounded-xl object-cover">
        <div class="flex-1">
          <p class="text-sm font-medium">${item.title}</p>
          <p class="text-xs text-ink/60">DKK ${Number(item.priceDKK || 0).toLocaleString('da-DK')}</p>
        </div>
        <button class="text-xs text-ocean" type="button" data-remove-wishlist="${item.id}">Fjern</button>
      </article>
    `).join('');
    listEl.querySelectorAll('[data-remove-wishlist]').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.dataset.removeWishlist;
        wishlist.set(wishlist.get().filter(item => item.id !== id));
      });
    });
  }
  if (itemsJson) itemsJson.value = JSON.stringify(items);
}

function updateWishlistBadge() {
  const badge = document.getElementById('wishlist-count');
  if (!badge) return;
  badge.textContent = String(wishlist.get().length);
}

function syncWishlistButtons() {
  const ids = new Set(wishlist.get().map(item => item.id));
  document.querySelectorAll('[data-add-to-wishlist]').forEach(button => {
    if (ids.has(button.dataset.id)) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}

function getParams() {
  return new URLSearchParams(window.location.search);
}

function setParam(key, value) {
  const params = getParams();
  if (value === undefined || value === null || value === '') {
    params.delete(key);
  } else {
    params.set(key, value);
  }
  const query = params.toString();
  const newUrl = `${window.location.pathname}${query ? `?${query}` : ''}`;
  window.history.replaceState({}, '', newUrl);
}
