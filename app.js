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

const now = new Date();
const FX_SNAPSHOT_DATE = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;
const WISHLIST_KEY = "selekti_wishlist";
const PREFILL_KEY = "selekti_prefill";

const formatDKK = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK"
  }).format(Math.round(value));
};

const toDKK = (value, currency) => {
  if (typeof value !== "number" || Number.isNaN(value)) return NaN;
  const rate = FX_RATES[currency];
  if (!rate) return NaN;
  return value * rate;
};

const parseAmount = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const normalized = value.replace(/,/g, ".");
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
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
    this.boundKeyHandler = this.onKey.bind(this);
    this.attachEvents();
    this.render();
  }

  normalize(item) {
    if (!item || typeof item !== "object") return null;
    const normalized = {
      id: item.id,
      name: item.name || "Ukendt produkt",
      url: item.url || "",
      store: item.store || "",
      price: parseAmount(item.price) || 0,
      currency: (() => {
        const candidate = typeof item.currency === "string" ? item.currency.toUpperCase() : "";
        if (candidate && FX_RATES[candidate]) return candidate;
        return candidate || "USD";
      })(),
      shipping: parseAmount(item.shipping) || 0,
      category: item.category || "default",
      storeCode: item.storeCode || "",
      image: item.image || ""
    };
    if (!normalized.id) return null;
    return normalized;
  }

  load() {
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((item) => this.normalize(item))
        .filter((item) => item !== null);
    } catch (error) {
      console.error("Kunne ikke læse ønskeliste", error);
      return [];
    }
  }

  save() {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(this.items));
    this.render();
  }

  exists(id) {
    return this.items.some((entry) => entry.id === id);
  }

  add(item) {
    const normalized = this.normalize(item);
    if (!normalized) return;
    if (this.exists(normalized.id)) return;
    this.items.push(normalized);
    this.save();
  }

  toggle(item) {
    const normalized = this.normalize(item);
    if (!normalized) return false;
    if (this.exists(normalized.id)) {
      this.remove(normalized.id);
      return false;
    }
    this.items.push(normalized);
    this.save();
    return true;
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

    document.dispatchEvent(
      new CustomEvent("wishlist:updated", { detail: this.items.map((item) => item.id) })
    );

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
      const dkkValue = toDKK(item.price, item.currency);
      let foreignPrice = `${item.currency || ""} ${item.price}`;
      try {
        foreignPrice = new Intl.NumberFormat("da-DK", {
          style: "currency",
          currency: item.currency || "USD"
        }).format(item.price);
      } catch (error) {
        foreignPrice = `${item.currency || ""} ${item.price.toFixed(2)}`;
      }
      wrapper.innerHTML = `
        <strong>${item.name}</strong>
        <span class="section-subtitle" style="margin-bottom:0">${item.store || ""}</span>
        <span class="section-subtitle" style="margin-bottom:0">${foreignPrice} • ${formatDKK(dkkValue)}</span>
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
    const normalized = this.normalize(item);
    if (!normalized) return;
    const quoteLink = document.getElementById("productLink");
    if (quoteLink) {
      quoteLink.value = normalized.url;
      const storeSelect = document.getElementById("storeSelect");
      if (storeSelect && normalized.storeCode) {
        const option = Array.from(storeSelect.options).find((opt) => opt.value === normalized.storeCode);
        if (option) {
          storeSelect.value = normalized.storeCode;
          storeSelect.dispatchEvent(new Event("change"));
        }
      }
      const currencySelect = document.getElementById("currencySelect");
      if (currencySelect && normalized.currency) {
        currencySelect.value = normalized.currency;
        currencySelect.dispatchEvent(new Event("change"));
      }
      const categorySelect = document.getElementById("categorySelect");
      if (categorySelect && normalized.category) {
        categorySelect.value = normalized.category;
        categorySelect.dispatchEvent(new Event("change"));
      }
      const priceInput = document.getElementById("productPrice");
      if (priceInput) {
        priceInput.value = normalized.price ? normalized.price.toString() : "";
      }
      const shippingInput = document.getElementById("shippingPrice");
      if (shippingInput) {
        shippingInput.value = normalized.shipping ? normalized.shipping.toString() : "0";
      }
      const calculateBtn = document.getElementById("calculateBtn");
      calculateBtn?.focus();
      this.close();
      return;
    }
    sessionStorage.setItem(PREFILL_KEY, JSON.stringify(normalized));
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
  const existingValues = new Set(Array.from(select.options).map((opt) => opt.value));
  options.forEach((option) => {
    if (existingValues.has(option.value)) return;
    const element = document.createElement("option");
    element.value = option.value;
    element.textContent = option.label;
    if (option.dataset) {
      Object.entries(option.dataset).forEach(([key, value]) => {
        element.dataset[key] = value;
      });
    }
    element.dataset.dynamic = "true";
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
    dutyRate,
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
  const priceInput = document.getElementById("productPrice");
  const shippingInput = document.getElementById("shippingPrice");
  const calculateBtn = document.getElementById("calculateBtn");
  const submitBtn = document.getElementById("submitQuote");
  const errorEl = document.getElementById("calcError");
  const successEl = document.getElementById("quoteSuccess");

  populateSelect(
    categorySelect,
    categories.map((item) => ({ value: item.id, label: item.name }))
  );
  populateSelect(
    currencySelect,
    Object.keys(FX_RATES).map((code) => ({ value: code, label: code }))
  );
  populateSelect(
    storeSelect,
    countries.map((store) => ({
      value: store.code,
      label: store.name,
      dataset: {
        currency: store.currency,
        category: store.category,
        shipping: store.defaultShipping ?? "",
        country: store.countryCode || ""
      }
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
    product: document.getElementById("productDkk"),
    shipping: document.getElementById("shippingDkk"),
    serviceFee: document.getElementById("serviceFeeDkk"),
    dutyRate: document.getElementById("dutyRate"),
    duty: document.getElementById("dutyDkk"),
    vat: document.getElementById("vatDkk"),
    total: document.getElementById("totalDkk")
  };

  const resetBreakdown = () => {
    Object.values(lineItems).forEach((el) => {
      if (el) el.textContent = "—";
    });
    Object.values(hiddenFields).forEach((field) => {
      if (field) field.value = "";
    });
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
      return;
    }

    lineItems.product.textContent = formatDKK(quote.productDKK);
    lineItems.shipping.textContent = formatDKK(quote.shippingDKK);
    lineItems.service.textContent = formatDKK(quote.serviceFee);
    lineItems.duty.textContent = formatDKK(quote.duty);
    lineItems.vat.textContent = formatDKK(quote.vat);
    lineItems.total.textContent = formatDKK(quote.total);

    if (hiddenFields.fxRate) hiddenFields.fxRate.value = quote.rate.toString();
    if (hiddenFields.product) hiddenFields.product.value = quote.productDKK.toFixed(2);
    if (hiddenFields.shipping) hiddenFields.shipping.value = quote.shippingDKK.toFixed(2);
    if (hiddenFields.serviceFee) hiddenFields.serviceFee.value = quote.serviceFee.toFixed(2);
    if (hiddenFields.dutyRate) hiddenFields.dutyRate.value = quote.dutyRate.toString();
    if (hiddenFields.duty) hiddenFields.duty.value = quote.duty.toFixed(2);
    if (hiddenFields.vat) hiddenFields.vat.value = quote.vat.toFixed(2);
    if (hiddenFields.total) hiddenFields.total.value = quote.total.toFixed(2);

    if (submitBtn) submitBtn.disabled = false;
  };

  const setError = (message) => {
    if (!errorEl) return;
    if (!message) {
      errorEl.hidden = true;
      errorEl.textContent = "";
      return;
    }
    errorEl.hidden = false;
    errorEl.textContent = message;
  };

  const updateActionState = () => {
    const price = parseAmount(priceInput?.value || 0);
    const currencyValid = Boolean(currencySelect?.value && FX_RATES[currencySelect.value]);
    const categoryValid = Boolean(categorySelect?.value);
    const canCalculate = price > 0 && currencyValid && categoryValid;
    if (calculateBtn) calculateBtn.disabled = !canCalculate;
    if (!canCalculate && submitBtn) submitBtn.disabled = true;
    return canCalculate;
  };

  const handleCalculate = () => {
    const price = parseAmount(priceInput?.value || 0);
    const shipping = parseAmount(shippingInput?.value || 0);
    const currency = currencySelect?.value;
    const categoryId = categorySelect?.value || "default";

    if (!updateActionState()) {
      if (price <= 0) {
        setError("Vareprisen skal være større end 0 for at beregne.");
      }
      resetBreakdown();
      return;
    }

    try {
      const quote = calculateQuote({
        price,
        shipping,
        currency,
        categoryId,
        categories
      });

      if (!quote) {
        setError("Vareprisen skal være større end 0 for at beregne.");
        resetBreakdown();
        return;
      }

      setError("");
      applyQuote(quote);
    } catch (error) {
      setError(error.message);
      resetBreakdown();
    }
  };

  const clearSuccess = () => {
    if (successEl) successEl.hidden = true;
  };

  const applyPrefill = (payload) => {
    if (!payload || typeof payload !== "object") return;
    const linkInput = document.getElementById("productLink");
    if (linkInput && payload.url) {
      linkInput.value = payload.url;
    }
    if (storeSelect && payload.storeCode) {
      const option = Array.from(storeSelect.options).find((opt) => opt.value === payload.storeCode);
      if (option) {
        storeSelect.value = payload.storeCode;
        storeSelect.dispatchEvent(new Event("change"));
      }
    }
    if (currencySelect && payload.currency && FX_RATES[payload.currency]) {
      currencySelect.value = payload.currency;
      currencySelect.dispatchEvent(new Event("change"));
    }
    if (categorySelect && payload.category) {
      categorySelect.value = payload.category;
      categorySelect.dispatchEvent(new Event("change"));
    }
    if (priceInput && typeof payload.price !== "undefined") {
      priceInput.value = payload.price ? payload.price.toString() : "";
    }
    if (shippingInput && typeof payload.shipping !== "undefined") {
      shippingInput.value = payload.shipping ? payload.shipping.toString() : "0";
    }
    updateActionState();
  };

  resetBreakdown();
  updateActionState();

  const prefill = sessionStorage.getItem(PREFILL_KEY);
  if (prefill) {
    try {
      const item = JSON.parse(prefill);
      applyPrefill(item);
    } catch (error) {
      console.error("Kunne ikke læse prefill-data", error);
    }
    sessionStorage.removeItem(PREFILL_KEY);
  }

  storeSelect?.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    const selectedOption = target.options[target.selectedIndex];
    if (selectedOption?.dataset.currency) {
      currencySelect.value = selectedOption.dataset.currency;
    }
    if (selectedOption?.dataset.category) {
      categorySelect.value = selectedOption.dataset.category;
    }
    if (shippingInput) {
      const shippingValue = selectedOption?.dataset.shipping;
      shippingInput.value = shippingValue && shippingValue !== "" ? shippingValue : "0";
    }
    updateActionState();
    if (submitBtn) submitBtn.disabled = true;
    clearSuccess();
  });

  [priceInput, shippingInput, currencySelect, categorySelect].forEach((input) => {
    input?.addEventListener("input", () => {
      updateActionState();
      if (submitBtn) submitBtn.disabled = true;
      clearSuccess();
    });
    input?.addEventListener("change", () => {
      updateActionState();
      if (submitBtn) submitBtn.disabled = true;
      clearSuccess();
    });
  });

  calculateBtn?.addEventListener("click", () => {
    clearSuccess();
    handleCalculate();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearSuccess();
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
      if (shippingInput) shippingInput.value = "0";
      resetBreakdown();
      updateActionState();
      if (successEl) successEl.hidden = false;
    } catch (error) {
      setError("Noget gik galt ved afsendelse. Prøv igen.");
    }
  });
};

const productCache = new Map();

const registerProducts = (products) => {
  products.forEach((product) => {
    productCache.set(product.id, product);
  });
};

const lookupCategoryName = (categories, id) => {
  const match = categories.find((item) => item.id === id);
  return match ? match.name : "Andet";
};

const formatForeignPriceDisplay = (price, currency) =>
  new Intl.NumberFormat("da-DK", { style: "currency", currency }).format(price);

const buildWishlistItem = (product) => ({
  id: product.id,
  name: product.name,
  url: product.url,
  store: product.storeCountry ? `${product.store} · ${product.storeCountry}` : product.store,
  price: product.price,
  currency: product.currency,
  shipping: product.shipping,
  category: product.category,
  storeCode: product.storeCode || "",
  image: product.image
});

const priceInDKK = (product) => {
  const value = toDKK(product.price, product.currency);
  return Number.isNaN(value) ? 0 : value;
};

const updateWishlistButton = (button, isActive) => {
  if (!button) return;
  button.textContent = isActive ? "✓ På ønskelisten" : "♡ Ønskeliste";
  button.setAttribute("aria-pressed", isActive ? "true" : "false");
  button.classList.toggle("wishlist-active", isActive);
};

const syncWishlistButtons = (productId) => {
  const isActive = wishlist.exists(productId);
  document.querySelectorAll(`[data-wishlist-toggle='${productId}']`).forEach((button) => {
    updateWishlistButton(button, isActive);
  });
};

const createProductCard = (product, categories) => {
  const card = document.createElement("article");
  card.className = "product-card";
  const dkkValue = toDKK(product.price, product.currency);
  const dkkDisplay = Number.isNaN(dkkValue) ? "" : formatDKK(dkkValue);
  card.innerHTML = `
    <img src="${product.image}" alt="${product.imageAlt || product.name}" loading="lazy" />
    <div>
      <strong>${product.name}</strong>
      <p class="section-subtitle" style="margin-bottom:0">${product.store} · ${product.storeCountry}</p>
      <p class="section-subtitle" style="margin-bottom:0">${formatForeignPriceDisplay(product.price, product.currency)}${dkkDisplay ? ` • fra ${dkkDisplay}` : ""}</p>
      <span class="badge">${lookupCategoryName(categories, product.category)}</span>
    </div>
    <div class="product-actions">
      <a class="nav__cta" href="${product.url}" target="_blank" rel="noopener">Se</a>
      <button type="button" data-wishlist-toggle="${product.id}" aria-pressed="false">♡ Ønskeliste</button>
      <button type="button" data-prefill-product="${product.id}">Få totalpris</button>
    </div>
  `;
  return card;
};

const renderProductGrid = (container, items, categories) => {
  if (!container) return;
  container.innerHTML = "";
  items.forEach((product) => {
    const card = createProductCard(product, categories);
    container.append(card);
    syncWishlistButtons(product.id);
  });
};

const showSkeletons = (container, count = 6) => {
  if (!container) return;
  container.innerHTML = "";
  for (let index = 0; index < count; index += 1) {
    const skeleton = document.createElement("div");
    skeleton.className = "skeleton-card";
    container.append(skeleton);
  }
};

const initProductCatalog = (products, categories) => {
  const storeGrid = document.getElementById("storeGrid");
  if (!storeGrid) return;

  const filterCountry = document.getElementById("filterCountry");
  const filterCategory = document.getElementById("filterCategory");
  const filterSort = document.getElementById("filterSort");
  const emptyState = document.getElementById("productEmpty");
  const resetFiltersBtn = document.getElementById("resetProductFilters");

  const uniqueCountries = Array.from(
    new Map(
      products.map((product) => [product.storeCountryCode, product.storeCountry])
    )
  )
    .filter(([code]) => code)
    .sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB, "da"));

  populateSelect(
    filterCountry,
    uniqueCountries.map(([code, name]) => ({ value: code, label: name }))
  );
  populateSelect(
    filterCategory,
    categories.map((item) => ({ value: item.id, label: item.name }))
  );

  const render = () => {
    const selectedCountry = filterCountry?.value && filterCountry.value !== "alle" ? filterCountry.value : null;
    const selectedCategory = filterCategory?.value && filterCategory.value !== "alle" ? filterCategory.value : null;
    const sort = filterSort?.value || "recent";

    let items = [...products];
    if (selectedCountry) {
      items = items.filter((product) => product.storeCountryCode === selectedCountry);
    }
    if (selectedCategory) {
      items = items.filter((product) => product.category === selectedCategory);
    }

    if (sort === "price-asc") {
      items.sort((a, b) => priceInDKK(a) - priceInDKK(b));
    } else if (sort === "price-desc") {
      items.sort((a, b) => priceInDKK(b) - priceInDKK(a));
    } else {
      items.sort((a, b) => Date.parse(b.added || "") - Date.parse(a.added || ""));
    }

    if (!items.length) {
      storeGrid.innerHTML = "";
      if (emptyState) emptyState.hidden = false;
      return;
    }

    if (emptyState) emptyState.hidden = true;
    renderProductGrid(storeGrid, items, categories);
  };

  [filterCountry, filterCategory, filterSort].forEach((input) => {
    input?.addEventListener("change", render);
  });

  resetFiltersBtn?.addEventListener("click", () => {
    if (filterCountry) filterCountry.value = "alle";
    if (filterCategory) filterCategory.value = "alle";
    if (filterSort) filterSort.value = "recent";
    render();
  });

  render();
};

const initProductShowcase = (containerId, products, categories, limit = 6) => {
  const container = document.getElementById(containerId);
  if (!container) return;
  const sorted = [...products].sort((a, b) => Date.parse(b.added || "") - Date.parse(a.added || ""));
  const subset = typeof limit === "number" ? sorted.slice(0, limit) : sorted;
  renderProductGrid(container, subset, categories);
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

  const queue = [...products].sort((a, b) => Date.parse(b.added || "") - Date.parse(a.added || ""));
  let index = 0;
  let pointerId = null;
  let startX = 0;
  let currentX = 0;

  const updateCard = () => {
    if (index >= queue.length) {
      title.textContent = "Ingen flere produkter.";
      meta.textContent = "Opdater kataloget for at se nye forslag.";
      image.src = "assets/logo-selekti.svg";
      image.alt = "Selekti";
      view.href = "/butikker.html";
      card.dataset.finished = "true";
      return;
    }
    const product = queue[index];
    title.textContent = product.name;
    const priceDisplay = formatForeignPriceDisplay(product.price, product.currency);
    const dkkValue = toDKK(product.price, product.currency);
    const dkkDisplay = Number.isNaN(dkkValue) ? "" : ` (${formatDKK(dkkValue)})`;
    meta.textContent = `${product.store} · ${product.storeCountry} • ${priceDisplay}${dkkDisplay}`;
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
    if (index >= queue.length) return;
    const product = queue[index];
    wishlist.add(buildWishlistItem(product));
    syncWishlistButtons(product.id);
    index += 1;
    updateCard();
  };

  const skip = () => {
    if (index >= queue.length) return;
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

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const wishlistBtn = target.closest("[data-wishlist-toggle]");
  if (wishlistBtn) {
    const productId = wishlistBtn.getAttribute("data-wishlist-toggle");
    if (productId) {
      const product = productCache.get(productId);
      if (product) {
        wishlist.toggle(buildWishlistItem(product));
        syncWishlistButtons(productId);
      }
    }
  }

  const prefillBtn = target.closest("[data-prefill-product]");
  if (prefillBtn) {
    const productId = prefillBtn.getAttribute("data-prefill-product");
    if (productId) {
      const product = productCache.get(productId);
      if (product) {
        wishlist.prefill(buildWishlistItem(product));
      }
    }
  }
});

document.addEventListener("wishlist:updated", (event) => {
  const ids = Array.isArray(event.detail) ? new Set(event.detail) : new Set();
  document.querySelectorAll("[data-wishlist-toggle]").forEach((button) => {
    const productId = button.getAttribute("data-wishlist-toggle");
    updateWishlistButton(button, productId ? ids.has(productId) : false);
  });
});

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

const applyLoadingStates = () => {
  showSkeletons(document.getElementById("storeGrid"));
  showSkeletons(document.getElementById("catalogProducts"));
  showSkeletons(document.getElementById("popularProducts"));
  const swipeTitle = document.getElementById("swipeTitle");
  const swipeMeta = document.getElementById("swipeMeta");
  const swipeImage = document.getElementById("swipeImage");
  if (swipeTitle) swipeTitle.textContent = "Henter produkter...";
  if (swipeMeta) swipeMeta.textContent = "Vent et øjeblik mens vi finder produkter.";
  if (swipeImage) {
    swipeImage.src = "assets/logo-selekti.svg";
    swipeImage.alt = "Selekti";
  }
};

const boot = async () => {
  applyLoadingStates();
  try {
    const [categories, countries, products] = await Promise.all([
      fetchJSON("data/categories.json"),
      fetchJSON("data/countries.json"),
      fetchJSON("data/products.json")
    ]);

    registerProducts(products);
    initQuoteForm(categories, countries);
    initProductCatalog(products, categories);
    initProductShowcase("popularProducts", products, categories, 6);
    initProductShowcase("catalogProducts", products, categories, 6);
    initSwipe(products);
    initPartnerForm();
  } catch (error) {
    console.error(error);
  }
};

document.addEventListener("DOMContentLoaded", boot);
