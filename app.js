const FX_RATES = {
  DKK: 1,
  EUR: 7.45,
  USD: 6.95,
  GBP: 8.65,
  SEK: 0.64,
  NOK: 0.66,
  JPY: 0.046,
  CNY: 0.96,
  HKD: 0.89,
  KRW: 0.0051
};

const FX_SNAPSHOT_DATE = "01-08-2024";
const WISHLIST_KEY = "selekti_wishlist";
const PREFILL_KEY = "selekti_prefill";

const STORE_CATALOG = [
  {
    id: "bhphoto",
    name: "B&H Photo Video",
    country: "USA",
    countryCode: "us",
    currency: "USD",
    category: "electronics",
    avgBasket: 4500,
    leadTime: "5-7 dage",
    logo: "https://logo.clearbit.com/bhphotovideo.com",
    link: "https://www.bhphotovideo.com/"
  },
  {
    id: "endclothing",
    name: "END.",
    country: "Storbritannien",
    countryCode: "gb",
    currency: "GBP",
    category: "fashion",
    avgBasket: 1800,
    leadTime: "4-6 dage",
    logo: "https://logo.clearbit.com/endclothing.com",
    link: "https://www.endclothing.com/"
  },
  {
    id: "thomann",
    name: "Thomann",
    country: "Tyskland",
    countryCode: "de",
    currency: "EUR",
    category: "creator",
    avgBasket: 3200,
    leadTime: "3-5 dage",
    logo: "https://logo.clearbit.com/thomann.de",
    link: "https://www.thomann.de/"
  },
  {
    id: "mercishop",
    name: "Merci Paris",
    country: "Frankrig",
    countryCode: "fr",
    currency: "EUR",
    category: "accessories",
    avgBasket: 1400,
    leadTime: "4-6 dage",
    logo: "https://logo.clearbit.com/merci-merci.com",
    link: "https://www.merci-merci.com/"
  },
  {
    id: "normann",
    name: "Normann Copenhagen",
    country: "Danmark",
    countryCode: "dk",
    currency: "DKK",
    category: "home",
    avgBasket: 1200,
    leadTime: "1-3 dage",
    logo: "https://logo.clearbit.com/normann-copenhagen.com",
    link: "https://www.normann-copenhagen.com/"
  },
  {
    id: "sneakersnstuff",
    name: "Sneakersnstuff",
    country: "Sverige",
    countryCode: "se",
    currency: "SEK",
    category: "fashion",
    avgBasket: 1600,
    leadTime: "3-5 dage",
    logo: "https://logo.clearbit.com/sneakersnstuff.com",
    link: "https://www.sneakersnstuff.com/"
  },
  {
    id: "fjellsport",
    name: "Fjellsport",
    country: "Norge",
    countryCode: "no",
    currency: "NOK",
    category: "sport",
    avgBasket: 2100,
    leadTime: "4-6 dage",
    logo: "https://logo.clearbit.com/fjellsport.no",
    link: "https://www.fjellsport.no/"
  },
  {
    id: "ktown4u",
    name: "KTown4U",
    country: "Sydkorea",
    countryCode: "kr",
    currency: "KRW",
    category: "toys",
    avgBasket: 900,
    leadTime: "7-9 dage",
    logo: "https://logo.clearbit.com/ktown4u.com",
    link: "https://www.ktown4u.com/"
  },
  {
    id: "xiaomi",
    name: "Xiaomi Official",
    country: "Kina",
    countryCode: "cn",
    currency: "CNY",
    category: "electronics",
    avgBasket: 2600,
    leadTime: "6-9 dage",
    logo: "https://logo.clearbit.com/mi.com",
    link: "https://www.mi.com/global"
  },
  {
    id: "onthelist",
    name: "OnTheList",
    country: "Hongkong",
    countryCode: "hk",
    currency: "HKD",
    category: "accessories",
    avgBasket: 1100,
    leadTime: "6-8 dage",
    logo: "https://logo.clearbit.com/onthelist.com",
    link: "https://www.onthelist-store.com/"
  },
  {
    id: "article",
    name: "Article",
    country: "Canada",
    countryCode: "ca",
    currency: "USD",
    category: "home",
    avgBasket: 3800,
    leadTime: "6-8 dage",
    logo: "https://logo.clearbit.com/article.com",
    link: "https://www.article.com/"
  },
  {
    id: "muji",
    name: "MUJI",
    country: "Japan",
    countryCode: "jp",
    currency: "JPY",
    category: "home",
    avgBasket: 900,
    leadTime: "7-10 dage",
    logo: "https://logo.clearbit.com/muji.com",
    link: "https://www.muji.com/jp/"
  }
];

const formatDKK = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK"
  }).format(Math.round(value));
};

const encode = (data) =>
  Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join("&");

class WishlistManager {
  constructor() {
    this.items = this.load();
    this.dialog = document.getElementById("wishlistDialog");
    this.list = document.getElementById("wishlistItems");
    this.badge = document.querySelectorAll(".wishlist-badge");
    this.clearBtn = document.getElementById("clearWishlist");
    this.closeBtn = document.querySelector(".dialog__close");
    this.buttons = document.querySelectorAll(".wishlist-button");
    this.focusTrapElements = [];
    this.boundKeyHandler = this.onKey.bind(this);
    this.attachEvents();
    this.render();
  }

  load() {
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Kunne ikke læse ønskeliste", error);
      return [];
    }
  }

  save() {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(this.items));
    this.render();
  }

  add(item) {
    if (this.items.some((entry) => entry.id === item.id)) {
      return;
    }
    this.items.push(item);
    this.save();
  }

  remove(id) {
    this.items = this.items.filter((entry) => entry.id !== id);
    this.save();
  }

  clear() {
    this.items = [];
    this.save();
  }

  render() {
    this.badge.forEach((el) => {
      el.textContent = String(this.items.length);
    });

    if (!this.list) return;
    this.list.innerHTML = "";

    if (!this.items.length) {
      const empty = document.createElement("p");
      empty.textContent = "Ingen produkter i ønskelisten endnu.";
      empty.className = "section-subtitle";
      this.list.append(empty);
      return;
    }

    this.items.forEach((item) => {
      const wrapper = document.createElement("div");
      wrapper.className = "wishlist-item";
      wrapper.innerHTML = `
        <strong>${item.name}</strong>
        <span class="section-subtitle" style="margin-bottom:0">${item.store}</span>
        <div class="wishlist-actions">
          <button type="button" data-action="prefill" data-id="${item.id}">Få totalpris</button>
          <button type="button" data-action="remove" data-id="${item.id}">Fjern</button>
        </div>
      `;
      this.list.append(wrapper);
    });
  }

  attachEvents() {
    if (this.clearBtn) {
      this.clearBtn.addEventListener("click", () => {
        this.clear();
      });
    }

    if (this.closeBtn && this.dialog) {
      this.closeBtn.addEventListener("click", () => this.close());
    }

    if (this.dialog) {
      this.dialog.addEventListener("click", (event) => {
        if (event.target === this.dialog) {
          this.close();
        }
      });
    }

    this.buttons.forEach((btn) =>
      btn.addEventListener("click", () => {
        this.open();
      })
    );

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.matches("[data-action='remove']")) {
        const id = target.getAttribute("data-id");
        if (id) {
          this.remove(id);
        }
      }
      if (target.matches("[data-action='prefill']")) {
        const id = target.getAttribute("data-id");
        const item = this.items.find((entry) => entry.id === id);
        if (item) {
          this.prefill(item);
        }
      }
    });
  }

  open() {
    if (!this.dialog) return;
    this.dialog.setAttribute("aria-hidden", "false");
    this.dialog.querySelector(".dialog__panel")?.focus({ preventScroll: true });
    document.addEventListener("keydown", this.boundKeyHandler);
  }

  close() {
    if (!this.dialog) return;
    this.dialog.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", this.boundKeyHandler);
  }

  onKey(event) {
    if (event.key === "Escape") {
      this.close();
    }
  }

  prefill(item) {
    const quoteLink = document.getElementById("productLink");
    if (quoteLink) {
      quoteLink.value = item.url;
      quoteLink.focus();
      this.close();
      return;
    }
    sessionStorage.setItem(PREFILL_KEY, JSON.stringify(item));
    window.location.href = "/index.html#totalpris";
  }
}

const wishlist = new WishlistManager();

const fetchJSON = async (path) => {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Kunne ikke hente ${path}`);
  }
  return response.json();
};

const populateSelect = (select, options) => {
  if (!select) return;
  options.forEach((option) => {
    const element = document.createElement("option");
    element.value = option.value;
    element.textContent = option.label;
    if (option.dataset) {
      Object.entries(option.dataset).forEach(([key, value]) => {
        element.dataset[key] = value;
      });
    }
    select.append(element);
  });
};

const dutyLookup = (categories, categoryId) => {
  const match = categories.find((item) => item.id === categoryId);
  if (match) return match.dutyRate;
  const fallback = categories.find((item) => item.id === "default");
  return fallback ? fallback.dutyRate : 0.05;
};

const calculateQuote = ({ price, shipping, currency, categoryId, categories }) => {
  if (!currency || !FX_RATES[currency]) {
    throw new Error("Valuta understøttes ikke.");
  }

  if (!price || price <= 0) {
    return null;
  }

  const rate = FX_RATES[currency];
  const productDKK = price * rate;
  const shippingDKK = (shipping || 0) * rate;
  const serviceFee = Math.max(49, 0.12 * (productDKK + shippingDKK));
  const dutyRate = dutyLookup(categories, categoryId);
  const duty = productDKK * dutyRate;
  const vatBase = productDKK + shippingDKK + duty + serviceFee;
  const vat = vatBase * 0.25;
  const total = productDKK + shippingDKK + serviceFee + duty + vat;

  return {
    rate,
    productDKK,
    shippingDKK,
    serviceFee,
    duty,
    vat,
    total
  };
};

const initQuoteForm = (categories, countries) => {
  const form = document.getElementById("quoteForm");
  if (!form) return;

  const categorySelect = document.getElementById("categorySelect");
  const currencySelect = document.getElementById("currencySelect");
  const storeSelect = document.getElementById("storeSelect");
  const calculateBtn = document.getElementById("calculateBtn");
  const submitBtn = document.getElementById("submitQuote");
  const errorEl = document.getElementById("calcError");
  const successEl = document.getElementById("quoteSuccess");

  populateSelect(categorySelect, categories.map((item) => ({ value: item.id, label: item.name })));
  populateSelect(currencySelect, Object.keys(FX_RATES).map((code) => ({ value: code, label: code })));
  populateSelect(
    storeSelect,
    countries.map((store) => ({
      value: store.code,
      label: store.name,
      dataset: { currency: store.currency, category: store.category }
    }))
  );

  const snapshotEl = document.getElementById("fxSnapshot");
  if (snapshotEl) {
    snapshotEl.value = JSON.stringify(FX_RATES);
  }

  const fxDateEl = document.getElementById("fxDate");
  if (fxDateEl) {
    fxDateEl.textContent = FX_SNAPSHOT_DATE;
  }

  const lineItems = {
    product: document.getElementById("lineItemProduct"),
    shipping: document.getElementById("lineItemShipping"),
    service: document.getElementById("lineItemService"),
    duty: document.getElementById("lineItemDuty"),
    vat: document.getElementById("lineItemVat"),
    total: document.getElementById("lineItemTotal")
  };

  const hiddenFields = {
    fxRate: document.getElementById("fxRate"),
    serviceFee: document.getElementById("serviceFeeDkk"),
    duty: document.getElementById("dutyDkk"),
    vat: document.getElementById("vatDkk"),
    total: document.getElementById("totalDkk")
  };

  const resetBreakdown = () => {
    Object.values(lineItems).forEach((el) => {
      if (el) el.textContent = "—";
    });
    if (hiddenFields.fxRate) hiddenFields.fxRate.value = "";
    if (hiddenFields.serviceFee) hiddenFields.serviceFee.value = "";
    if (hiddenFields.duty) hiddenFields.duty.value = "";
    if (hiddenFields.vat) hiddenFields.vat.value = "";
    if (hiddenFields.total) hiddenFields.total.value = "";
    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = "";
    }
    if (successEl) {
      successEl.hidden = true;
    }
    if (submitBtn) submitBtn.disabled = true;
  };

  const applyQuote = (quote) => {
    if (!quote) {
      resetBreakdown();
      if (submitBtn) submitBtn.disabled = true;
      return;
    }

    lineItems.product.textContent = formatDKK(quote.productDKK);
    lineItems.shipping.textContent = formatDKK(quote.shippingDKK);
    lineItems.service.textContent = formatDKK(quote.serviceFee);
    lineItems.duty.textContent = formatDKK(quote.duty);
    lineItems.vat.textContent = formatDKK(quote.vat);
    lineItems.total.textContent = formatDKK(quote.total);

    if (hiddenFields.fxRate) hiddenFields.fxRate.value = quote.rate.toString();
    if (hiddenFields.serviceFee) hiddenFields.serviceFee.value = quote.serviceFee.toFixed(2);
    if (hiddenFields.duty) hiddenFields.duty.value = quote.duty.toFixed(2);
    if (hiddenFields.vat) hiddenFields.vat.value = quote.vat.toFixed(2);
    if (hiddenFields.total) hiddenFields.total.value = quote.total.toFixed(2);

    if (submitBtn) submitBtn.disabled = false;
  };

  resetBreakdown();

  const prefill = sessionStorage.getItem(PREFILL_KEY);
  if (prefill) {
    try {
      const item = JSON.parse(prefill);
      const linkInput = document.getElementById("productLink");
      if (linkInput) {
        linkInput.value = item.url;
      }
      sessionStorage.removeItem(PREFILL_KEY);
    } catch (error) {
      sessionStorage.removeItem(PREFILL_KEY);
    }
  }

  const prefillCurrency = sessionStorage.getItem(`${PREFILL_KEY}_currency`);
  if (prefillCurrency && FX_RATES[prefillCurrency]) {
    currencySelect.value = prefillCurrency;
    sessionStorage.removeItem(`${PREFILL_KEY}_currency`);
  }

  const prefillCategory = sessionStorage.getItem(`${PREFILL_KEY}_category`);
  if (prefillCategory) {
    categorySelect.value = prefillCategory;
    sessionStorage.removeItem(`${PREFILL_KEY}_category`);
  }

  const prefillStore = sessionStorage.getItem(`${PREFILL_KEY}_store`);
  if (prefillStore) {
    storeSelect.value = prefillStore;
    storeSelect.dispatchEvent(new Event("change"));
    sessionStorage.removeItem(`${PREFILL_KEY}_store`);
  }

  if (storeSelect) {
    storeSelect.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLSelectElement)) return;
      const selectedOption = target.options[target.selectedIndex];
      if (selectedOption && selectedOption.dataset.currency) {
        currencySelect.value = selectedOption.dataset.currency;
      }
      if (selectedOption && selectedOption.dataset.category) {
        categorySelect.value = selectedOption.dataset.category;
      }
    });
  }

  const handleCalculate = () => {
    const productPrice = parseFloat(document.getElementById("productPrice")?.value || "0");
    const shippingPrice = parseFloat(document.getElementById("shippingPrice")?.value || "0");
    const currency = currencySelect.value;
    const categoryId = categorySelect.value || "default";

    try {
      const quote = calculateQuote({
        price: productPrice,
        shipping: shippingPrice,
        currency,
        categoryId,
        categories
      });

      if (!quote) {
        if (errorEl) {
          errorEl.textContent = "Vareprisen skal være større end 0 for at beregne.";
          errorEl.hidden = false;
        }
        applyQuote(null);
        return;
      }

      if (productPrice + shippingPrice <= 0) {
        if (errorEl) {
          errorEl.textContent = "Tilføj varepris eller fragt for at beregne.";
          errorEl.hidden = false;
        }
        applyQuote(null);
        return;
      }

      if (errorEl) {
        errorEl.hidden = true;
      }

      applyQuote(quote);
    } catch (error) {
      if (errorEl) {
        errorEl.textContent = error.message;
        errorEl.hidden = false;
      }
      applyQuote(null);
    }
  };

  calculateBtn?.addEventListener("click", handleCalculate);

  ["productPrice", "shippingPrice", "currencySelect", "categorySelect"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", () => {
      if (submitBtn) submitBtn.disabled = true;
    });
    document.getElementById(id)?.addEventListener("change", () => {
      if (submitBtn) submitBtn.disabled = true;
    });
  });

  storeSelect?.addEventListener("change", () => {
    if (submitBtn) submitBtn.disabled = true;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    handleCalculate();
    if (submitBtn?.disabled) return;

    const formData = new FormData(form);
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode(Object.fromEntries(formData))
      });
      form.reset();
      resetBreakdown();
      if (successEl) successEl.hidden = false;
    } catch (error) {
      if (errorEl) {
        errorEl.textContent = "Noget gik galt ved afsendelse. Prøv igen.";
        errorEl.hidden = false;
      }
    }
  });
};

const initStoreCatalog = (categories) => {
  const storeGrid = document.getElementById("storeGrid");
  if (!storeGrid) return;

  const filterCountry = document.getElementById("filterCountry");
  const filterCategory = document.getElementById("filterCategory");
  const filterSort = document.getElementById("filterSort");

  const countries = Array.from(new Set(STORE_CATALOG.map((store) => store.country)));
  populateSelect(filterCountry, countries.map((country) => ({ value: country, label: country })));
  populateSelect(filterCategory, categories.map((item) => ({ value: item.id, label: item.name })));

  const render = () => {
    const selectedCountry = filterCountry?.value === "alle" ? null : filterCountry?.value;
    const selectedCategory = filterCategory?.value === "alle" ? null : filterCategory?.value;
    const sort = filterSort?.value || "recent";

    let items = [...STORE_CATALOG];

    if (selectedCountry) {
      items = items.filter((store) => store.country === selectedCountry);
    }

    if (selectedCategory) {
      items = items.filter((store) => store.category === selectedCategory);
    }

    if (sort === "price-asc") {
      items.sort((a, b) => a.avgBasket - b.avgBasket);
    }
    if (sort === "price-desc") {
      items.sort((a, b) => b.avgBasket - a.avgBasket);
    }

    storeGrid.innerHTML = "";

    items.forEach((store) => {
      const card = document.createElement("article");
      card.className = "card store-card";
      card.innerHTML = `
        <img src="${store.logo}" alt="Logo for ${store.name}" loading="lazy" />
        <div>
          <h3>${store.name}</h3>
          <p class="section-subtitle" style="margin-bottom:0">${store.country} · ${store.currency}</p>
        </div>
        <div class="store-meta">
          <span class="badge">Kategori: ${lookupCategoryName(categories, store.category)}</span>
          <span class="badge">Lead time: ${store.leadTime}</span>
          <span class="badge">Gns. kurv: ${formatDKK(store.avgBasket)}</span>
        </div>
        <div class="product-actions">
          <a class="nav__cta" href="${store.link}" target="_blank" rel="noopener">Besøg butik</a>
          <button type="button" data-prefill-store="${store.id}" data-country="${store.countryCode || ""}" data-currency="${store.currency}" data-category="${store.category}" data-link="${store.link}">Få totalpris</button>
        </div>
      `;
      storeGrid.append(card);
    });
  };

  render();
  [filterCountry, filterCategory, filterSort].forEach((input) => input?.addEventListener("change", render));

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.matches("[data-prefill-store]")) {
      const currency = target.getAttribute("data-currency");
      const category = target.getAttribute("data-category");
      const link = target.getAttribute("data-link") || "";
      sessionStorage.setItem(
        PREFILL_KEY,
        JSON.stringify({ id: target.dataset.prefillStore, url: link })
      );
      if (currency) sessionStorage.setItem(`${PREFILL_KEY}_currency`, currency);
      if (category) sessionStorage.setItem(`${PREFILL_KEY}_category`, category);
      const storeCode = target.getAttribute("data-country");
      if (storeCode) sessionStorage.setItem(`${PREFILL_KEY}_store`, storeCode);
      window.location.href = "/index.html#totalpris";
    }
  });
};

const lookupCategoryName = (categories, id) => {
  const match = categories.find((item) => item.id === id);
  return match ? match.name : "Andet";
};

const initProductLists = (products, categories) => {
  const popularWrapper = document.getElementById("popularProducts");
  const catalogWrapper = document.getElementById("catalogProducts");
  const emptyState = document.getElementById("productEmpty");

  const renderCard = (product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" loading="lazy" />
      <div>
        <strong>${product.name}</strong>
        <p class="section-subtitle" style="margin-bottom:0">${product.store} · ${product.currency} ${product.price}</p>
        <span class="badge">${lookupCategoryName(categories, product.category)}</span>
      </div>
      <div class="product-actions">
        <a class="nav__cta" href="${product.url}" target="_blank" rel="noopener">Se produkt</a>
        <button type="button" data-add-wishlist="${product.id}">Til ønskeliste</button>
      </div>
    `;
    return card;
  };

  if (popularWrapper) {
    products.slice(0, 6).forEach((product) => popularWrapper.append(renderCard(product)));
  }

  if (catalogWrapper) {
    const renderCatalog = (items) => {
      catalogWrapper.innerHTML = "";
      if (!items.length && emptyState) {
        emptyState.hidden = false;
        return;
      }
      if (emptyState) emptyState.hidden = true;
      items.forEach((product) => catalogWrapper.append(renderCard(product)));
    };

    renderCatalog(products);

    const filterCountry = document.getElementById("filterCountry");
    const filterCategory = document.getElementById("filterCategory");

    const handleWishlistAdd = (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.matches("[data-add-wishlist]") || target.closest("[data-add-wishlist]")) {
        const id = target.getAttribute("data-add-wishlist") || target.closest("[data-add-wishlist]")?.getAttribute("data-add-wishlist");
        const product = products.find((item) => item.id === id);
        if (product) {
          wishlist.add({ id: product.id, name: product.name, url: product.url, store: product.store });
        }
      }
    };

    catalogWrapper.addEventListener("click", handleWishlistAdd);
    popularWrapper?.addEventListener("click", handleWishlistAdd);

    const applyFilters = () => {
      const selectedCountry = filterCountry?.value === "alle" ? null : filterCountry?.value;
      const selectedCategory = filterCategory?.value === "alle" ? null : filterCategory?.value;

      let filtered = [...products];
      if (selectedCategory) {
        filtered = filtered.filter((product) => product.category === selectedCategory);
      }
      if (selectedCountry) {
        filtered = filtered.filter((product) => product.store.toLowerCase().includes(selectedCountry.toLowerCase()));
      }
      renderCatalog(filtered);
    };

    filterCountry?.addEventListener("change", applyFilters);
    filterCategory?.addEventListener("change", applyFilters);
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.matches("[data-add-wishlist]") || target.closest("[data-add-wishlist]")) {
      const id = target.getAttribute("data-add-wishlist") || target.closest("[data-add-wishlist]")?.getAttribute("data-add-wishlist");
      const product = products.find((item) => item.id === id);
      if (product) {
        wishlist.add({ id: product.id, name: product.name, url: product.url, store: product.store });
      }
    }
  });
};

const initSwipe = (products) => {
  const openBtn = document.getElementById("openSwipe");
  const overlay = document.getElementById("swipeOverlay");
  const card = document.getElementById("swipeCard");
  const title = document.getElementById("swipeTitle");
  const meta = document.getElementById("swipeMeta");
  const image = document.getElementById("swipeImage");
  const view = document.getElementById("swipeView");

  if (!openBtn || !overlay || !card || !title || !meta || !image || !view) return;

  let index = 0;
  let pointerId = null;
  let startX = 0;
  let currentX = 0;

  const updateCard = () => {
    if (index >= products.length) {
      title.textContent = "Ingen flere produkter.";
      meta.textContent = "Opdater kataloget for at se nye forslag.";
      image.src = "assets/logo-selekti.svg";
      image.alt = "Selekti";
      view.href = "/butikker.html";
      card.dataset.finished = "true";
      return;
    }
    const product = products[index];
    title.textContent = product.name;
    meta.textContent = `${product.store} · ${product.currency} ${product.price}`;
    image.src = product.image;
    image.alt = product.name;
    view.href = product.url;
    card.dataset.finished = "false";
  };

  const close = () => {
    overlay.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", handleKey);
  };

  const open = () => {
    overlay.setAttribute("aria-hidden", "false");
    updateCard();
    document.addEventListener("keydown", handleKey);
  };

  const handleKey = (event) => {
    if (event.key === "Escape") {
      close();
    }
  };

  const accept = () => {
    if (index >= products.length) return;
    const product = products[index];
    wishlist.add({ id: product.id, name: product.name, url: product.url, store: product.store });
    index += 1;
    updateCard();
  };

  const skip = () => {
    if (index >= products.length) return;
    index += 1;
    updateCard();
  };

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      close();
    }
  });

  overlay.querySelector("[data-swipe='save']")?.addEventListener("click", accept);
  overlay.querySelector("[data-swipe='skip']")?.addEventListener("click", skip);

  card.addEventListener("pointerdown", (event) => {
    if (card.dataset.finished === "true") return;
    pointerId = event.pointerId;
    startX = event.clientX;
    currentX = startX;
    card.setPointerCapture(pointerId);
  });

  card.addEventListener("pointermove", (event) => {
    if (pointerId !== event.pointerId) return;
    currentX = event.clientX;
    const delta = currentX - startX;
    card.style.transform = `translateX(${delta}px) rotate(${delta / 20}deg)`;
  });

  card.addEventListener("pointerup", (event) => {
    if (pointerId !== event.pointerId) return;
    const delta = currentX - startX;
    card.style.transition = "transform 0.2s ease";
    card.style.transform = "translateX(0) rotate(0)";
    setTimeout(() => {
      card.style.transition = "";
    }, 200);
    if (delta > 120) {
      accept();
    } else if (delta < -120) {
      skip();
    }
    pointerId = null;
  });

  openBtn.addEventListener("click", () => {
    index = 0;
    open();
  });
};

const initPartnerForm = () => {
  const form = document.getElementById("partnerForm");
  if (!form) return;
  const successEl = document.getElementById("partnerSuccess");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode(Object.fromEntries(formData))
      });
      form.reset();
      if (successEl) successEl.hidden = false;
    } catch (error) {
      alert("Der opstod en fejl ved afsendelse. Prøv igen.");
    }
  });
};

const boot = async () => {
  try {
    const [categories, countries, products] = await Promise.all([
      fetchJSON("data/categories.json"),
      fetchJSON("data/countries.json"),
      fetchJSON("data/products.json")
    ]);

    initQuoteForm(categories, countries);
    initStoreCatalog(categories);
    initProductLists(products, categories);
    initSwipe(products);
    initPartnerForm();
  } catch (error) {
    console.error(error);
  }
};

document.addEventListener("DOMContentLoaded", boot);
