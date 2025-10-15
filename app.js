(function(window, document){
  'use strict';

  const IMG_FALLBACK = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><rect width='100%25' height='100%25' fill='%23f6f8fb'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2364748b' font-family='Inter' font-size='32'>Selekti</text></svg>";

  const COUNTRY_LINKS = {
    eu: { slug: 'eu', name: 'Europa', path: 'butikker.html', flag: '🇪🇺' },
    usa: { slug: 'usa', name: 'USA', path: 'usa.html', flag: '🇺🇸' },
    uk: { slug: 'uk', name: 'Storbritannien', path: 'uk.html', flag: '🇬🇧' },
    japan: { slug: 'japan', name: 'Japan', path: 'japan.html', flag: '🇯🇵' },
    sydkorea: { slug: 'sydkorea', name: 'Sydkorea', path: 'sydkorea.html', flag: '🇰🇷' },
    kina: { slug: 'kina', name: 'Kina', path: 'kina.html', flag: '🇨🇳' },
    indien: { slug: 'indien', name: 'Indien', path: 'indien.html', flag: '🇮🇳' }
  };

  const COUNTRY_ALIASES = {
    eu: ['eu', 'europa'],
    usa: ['usa', 'us', 'america', 'amerika', 'forenede stater'],
    uk: ['uk', 'storbritannien', 'england', 'britain'],
    japan: ['japan', 'jp'],
    sydkorea: ['sydkorea', 'korea', 'south korea', 'southkorea'],
    kina: ['kina', 'china', 'cn'],
    indien: ['indien', 'india']
  };

  const STORES = [
    { id: 'us-nyc-camera', name: 'NYC Camera Store', city: 'New York', country: 'USA', countrySlug: 'usa', badge: 'Pro gear med totalpris', tags: ['Elektronik', 'Hi-Fi'], img: 'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&w=1200&q=80', rating: 4.8, sponsored: true },
    { id: 'us-coast-sneaker', name: 'Pacific Sneaker Club', city: 'Los Angeles', country: 'USA', countrySlug: 'usa', badge: 'Limited releases', tags: ['Tøj & Sneakers'], img: 'https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=1200&q=80', rating: 4.6, sponsored: true },
    { id: 'jp-tokyo-streetwear', name: 'Tokyo Streetwear', city: 'Tokyo', country: 'Japan', countrySlug: 'japan', badge: 'Drop alarm', tags: ['Tøj & Sneakers'], img: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', rating: 4.7, sponsored: true },
    { id: 'jp-osaka-audio', name: 'Osaka Audio Lab', city: 'Osaka', country: 'Japan', countrySlug: 'japan', badge: 'Hi-Fi specialister', tags: ['Hi-Fi', 'Elektronik'], img: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80', rating: 4.9 },
    { id: 'uk-audio-boutique', name: 'London Vinyl House', city: 'London', country: 'Storbritannien', countrySlug: 'uk', badge: 'Kurateret lyd', tags: ['Hi-Fi', 'Vinyl'], img: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80', rating: 4.9, sponsored: true },
    { id: 'uk-style-atelier', name: 'Manchester Style Atelier', city: 'Manchester', country: 'Storbritannien', countrySlug: 'uk', badge: 'Modetendenser', tags: ['Accessories', 'Tøj'], img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80', rating: 4.5 },
    { id: 'kr-seoul-beauty', name: 'Seoul Beauty Lab', city: 'Seoul', country: 'Sydkorea', countrySlug: 'sydkorea', badge: 'K-Beauty kurateret', tags: ['Skønhed', 'K-Beauty'], img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80', rating: 4.8, sponsored: true },
    { id: 'kr-busan-tech', name: 'Busan Tech Market', city: 'Busan', country: 'Sydkorea', countrySlug: 'sydkorea', badge: 'Smart hjem', tags: ['Elektronik'], img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', rating: 4.6 },
    { id: 'cn-shanghai-design', name: 'Shanghai Design Market', city: 'Shanghai', country: 'Kina', countrySlug: 'kina', badge: 'Indie brands', tags: ['Design', 'Interiør'], img: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=1200&q=80', rating: 4.7, sponsored: true },
    { id: 'cn-shenzhen-gadget', name: 'Shenzhen Gadget Hub', city: 'Shenzhen', country: 'Kina', countrySlug: 'kina', badge: 'Teknologi', tags: ['Elektronik', 'Gadgets'], img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', rating: 4.5 },
    { id: 'in-delhi-craft', name: 'Delhi Craft Collective', city: 'Delhi', country: 'Indien', countrySlug: 'indien', badge: 'Håndværk', tags: ['Hjem', 'Design'], img: 'https://images.unsplash.com/photo-1529929654850-443046a0544e?auto=format&fit=crop&w=1200&q=80', rating: 4.6, sponsored: true },
    { id: 'in-bangalore-gaming', name: 'Bangalore Gaming Forge', city: 'Bengaluru', country: 'Indien', countrySlug: 'indien', badge: 'Gaming gear', tags: ['Elektronik'], img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80', rating: 4.5 }
  ];

  const PRODUCTS = [
    { id: 'p-us-gimbal', title: 'Pro kamera-gimbal (travel size)', price: 1549, cat: 'electronics', brand: 'AxisPro', sizes: ['onesize'], popularity: 94, launched: '2024-04-05', img: 'https://images.unsplash.com/photo-1526178618720-6a67cf02c4b7?auto=format&fit=crop&w=1200&q=80', storeId: 'us-nyc-camera', countrySlug: 'usa', readyNow: false },
    { id: 'p-us-sneaker', title: 'West Coast runner – eksklusiv farve', price: 1199, cat: 'apparel', brand: 'Coast Collective', sizes: ['42','43','44'], popularity: 89, launched: '2024-02-18', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80', storeId: 'us-coast-sneaker', countrySlug: 'usa', readyNow: false },
    { id: 'p-jp-headphones', title: 'Audio Lab reference-hovedtelefoner', price: 1899, cat: 'hifi', brand: 'Osaka Audio', sizes: ['onesize'], popularity: 96, launched: '2024-01-30', img: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=80', storeId: 'jp-osaka-audio', countrySlug: 'japan', readyNow: false },
    { id: 'p-jp-streetwear', title: 'Tokyo street-jakke med limited patch', price: 1399, cat: 'apparel', brand: 'Tokyo Street', sizes: ['36','38','40'], popularity: 92, launched: '2024-03-22', img: 'https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=1200&q=80', storeId: 'jp-tokyo-streetwear', countrySlug: 'japan', readyNow: false },
    { id: 'p-uk-dac', title: 'Kompakt DAC/AMP (Hi-Res USB-C)', price: 899, cat: 'hifi', brand: 'London Vinyl', sizes: ['onesize'], popularity: 87, launched: '2023-11-05', img: 'https://images.unsplash.com/photo-1545127398-14699f92334d?auto=format&fit=crop&w=1200&q=80', storeId: 'uk-audio-boutique', countrySlug: 'uk', readyNow: false },
    { id: 'p-uk-accessory', title: 'Britisk lædertaske – håndlavet', price: 1599, cat: 'accessories', brand: 'Manchester Atelier', sizes: ['onesize'], popularity: 85, launched: '2024-02-02', img: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=1200&q=80', storeId: 'uk-style-atelier', countrySlug: 'uk', readyNow: true },
    { id: 'p-kr-serum', title: 'Glass skin serum (klinisk testet)', price: 329, cat: 'beauty', brand: 'Seoul Lab', sizes: ['onesize'], popularity: 93, launched: '2024-03-08', img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80', storeId: 'kr-seoul-beauty', countrySlug: 'sydkorea', readyNow: false },
    { id: 'p-kr-smart', title: 'Smart home hub med AI-stemmer', price: 1049, cat: 'electronics', brand: 'Busan Smart', sizes: ['onesize'], popularity: 84, launched: '2024-01-12', img: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1200&q=80', storeId: 'kr-busan-tech', countrySlug: 'sydkorea', readyNow: true },
    { id: 'p-cn-ceramics', title: 'Shanghai keramik-sæt i begrænset oplag', price: 749, cat: 'design', brand: 'Shanghai Design', sizes: ['onesize'], popularity: 88, launched: '2024-04-01', img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80', storeId: 'cn-shanghai-design', countrySlug: 'kina', readyNow: true },
    { id: 'p-cn-gadget', title: 'Foldbar skrivebordslampe med Qi-lader', price: 589, cat: 'electronics', brand: 'Shenzhen Gadget', sizes: ['onesize'], popularity: 83, launched: '2024-02-27', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', storeId: 'cn-shenzhen-gadget', countrySlug: 'kina', readyNow: true },
    { id: 'p-in-textiles', title: 'Delhi håndvævet tæppe (2x3 m)', price: 2099, cat: 'design', brand: 'Delhi Collective', sizes: ['onesize'], popularity: 82, launched: '2023-12-15', img: 'https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=1200&q=80', storeId: 'in-delhi-craft', countrySlug: 'indien', readyNow: false },
    { id: 'p-in-peripheral', title: 'Pro gaming mus med hall-sensor', price: 799, cat: 'electronics', brand: 'Bangalore Forge', sizes: ['onesize'], popularity: 90, launched: '2024-03-05', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80', storeId: 'in-bangalore-gaming', countrySlug: 'indien', readyNow: true }
  ];

  const FEATURED = [
    { storeId: 'jp-tokyo-streetwear', headline: 'Tokyo Streetwear', blurb: 'Eksklusive collabs lanceres først hos Selekti – sikr dig næste drop med totalpris fra Tokyo.', cta: 'Se nye drops', color: 'from-ocean to-grape' },
    { storeId: 'cn-shanghai-design', headline: 'Shanghai Design Market', blurb: 'Indie designere fra Shanghai håndplukker interiør med danske mål – klar til din stue.', cta: 'Opdag kollektionen', color: 'from-amber to-mint' },
    { storeId: 'us-nyc-camera', headline: 'NYC Camera Store', blurb: 'Professionelt udstyr, forsikret og klar til levering – vi håndterer told og papirarbejdet.', cta: 'Find udstyr', color: 'from-ink to-ocean' }
  ];

  const VIDEO_GUIDES = [
    { id: 'guide-japan-sneakers', title: 'Guide: Sådan shopper du sneakers i Japan', partner: 'Tokyo Streetwear', countrySlug: 'japan', video: 'https://www.youtube.com/embed/9bZkp7q19f0', description: 'Lær hvordan Selekti sikrer autentiske releases og hurtig levering fra Japan.' },
    { id: 'guide-usa-gear', title: 'Guide: Kamera gear fra USA', partner: 'NYC Camera Store', countrySlug: 'usa', video: 'https://www.youtube.com/embed/ysz5S6PUM-U', description: 'Se hvordan vores team tester gear og pakker sikkert til Danmark.' },
    { id: 'guide-korea-beauty', title: 'Guide: K-Beauty rutiner', partner: 'Seoul Beauty Lab', countrySlug: 'sydkorea', video: 'https://www.youtube.com/embed/ktvTqknDobU', description: 'Ekspertråd fra Seoul Beauty Lab om at bygge din perfekte hudplejerutine.' }
  ];

  const state = {
    currentCountry: '',
    storageFallback: {},
    directory: {
      searchTerm: '',
      searchCountry: ''
    }
  };

  const storage = (() => {
    try {
      const key = 'selekti_test';
      window.localStorage.setItem(key, '1');
      window.localStorage.removeItem(key);
      return window.localStorage;
    } catch (err) {
      return {
        getItem: key => Object.prototype.hasOwnProperty.call(state.storageFallback, key) ? state.storageFallback[key] : null,
        setItem: (key, value) => { state.storageFallback[key] = String(value); },
        removeItem: key => { delete state.storageFallback[key]; }
      };
    }
  })();

  function readJson(key, fallback){
    try {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function renderDirectoryProductsList(products){
    const container = document.getElementById('directory-products');
    const emptyEl = document.getElementById('directory-empty');
    const countEl = document.getElementById('directory-count');
    if(!container || !emptyEl) return;
    if(countEl) countEl.textContent = products.length === 1 ? '1 produkt' : `${products.length} produkter`;
    if(!products.length){
      container.innerHTML = '';
      emptyEl.classList.remove('hidden');
      return;
    }
    emptyEl.classList.add('hidden');
    container.innerHTML = products.map(product => {
      const store = STORES.find(s => s.id === product.storeId);
      const priceLine = `DKK ${product.price.toLocaleString('da-DK')}`;
      const deliveryLine = product.readyNow ? '2–4 hverdage' : '4–12 hverdage';
      const rating = store ? formatRating(store.rating) : '';
      return `
        <article class="bg-white rounded-3xl ring-1 ring-black/5 shadow-soft overflow-hidden card-hover">
          <div class="relative h-48">
            <img src="${product.img || IMG_FALLBACK}" alt="${product.title}" class="absolute inset-0 h-full w-full object-cover" loading="lazy">
            <div class="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] ring-1 ring-black/10">${store ? store.country : ''} • ⭐ ${rating}</div>
          </div>
          <div class="p-4 md:p-5 space-y-2">
            <div class="flex items-center justify-between text-xs text-ink/60">
              <span>${store ? store.name : ''}</span>
              <span>${product.brand || ''}</span>
            </div>
            <h3 class="text-lg font-semibold leading-tight">${product.title}</h3>
            <div class="text-sm text-ink/70">${priceLine} • Levering: ${deliveryLine}</div>
            <div class="flex flex-wrap gap-2 pt-2">
              <button class="rounded-full bg-ink text-white px-4 py-2 text-xs font-medium" data-add-to-cart="${product.id}">Tilføj til kurv</button>
              <button class="rounded-full bg-white ring-1 ring-black/10 px-4 py-2 text-xs" data-add-to-wishlist="${product.id}">Til ønskeliste</button>
              <button class="rounded-full bg-white ring-1 ring-black/10 px-4 py-2 text-xs" data-open="sheet-estimator" data-product="${product.id}">Beregn totalpris</button>
            </div>
          </div>
        </article>`;
    }).join('');
  }

  function renderDirectoryStoresList(stores){
    const container = document.getElementById('directory-store-grid');
    if(!container) return;
    if(!stores.length){
      container.innerHTML = '<div class="rounded-3xl bg-white ring-1 ring-black/5 shadow-soft p-6 text-sm text-ink/60">Ingen butikker matcher filtrene endnu.</div>';
      return;
    }
    container.innerHTML = stores.map(store => {
      const link = COUNTRY_LINKS[store.countrySlug]?.path || '#';
      const flag = COUNTRY_LINKS[store.countrySlug]?.flag || '';
      return `
        <article class="bg-white rounded-3xl ring-1 ring-black/5 shadow-soft overflow-hidden card-hover">
          <div class="relative h-40">
            <img src="${store.img || IMG_FALLBACK}" alt="${store.name}" class="absolute inset-0 h-full w-full object-cover" loading="lazy">
            <div class="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] ring-1 ring-black/10">${flag} ${store.country}</div>
          </div>
          <div class="p-4 md:p-5 space-y-2">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">${store.name}</h3>
              <span class="text-xs text-ink/60">⭐ ${formatRating(store.rating)}</span>
            </div>
            <p class="text-sm text-ink/70">${store.badge || ''}</p>
            <p class="text-xs text-ink/60">${store.tags.join(' • ')}</p>
            <div class="flex flex-wrap gap-2 pt-2">
              <a href="${link}" class="rounded-full bg-ink text-white px-4 py-2 text-xs font-medium">Se varer</a>
              <button class="rounded-full bg-white ring-1 ring-black/10 px-4 py-2 text-xs" data-open="sheet-wishlist" data-store="${store.id}">Forespørg</button>
            </div>
          </div>
        </article>`;
    }).join('');
  }

  function setDirectoryChipActive(slug){
    document.querySelectorAll('#directory-country-chips .chip').forEach(chip => {
      chip.classList.toggle('active', !!slug && chip.dataset.country === slug);
    });
  }

  function getCheckedValues(form, name){
    return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map(input => input.value);
  }

  function updateDirectoryActiveFilters({ searchTerm, searchCountry, categories, countries, sizes, brands, priceMin, priceMax }){
    const container = document.getElementById('directory-active-filters');
    if(!container) return;
    const chips = [];
    if(searchTerm){
      chips.push(`<span class="chip">Søg: ${searchTerm}</span>`);
    }
    if(searchCountry){
      const name = COUNTRY_LINKS[searchCountry]?.name || searchCountry;
      chips.push(`<span class="chip">Land: ${name}</span>`);
    }
    if(categories.length){
      chips.push(`<span class="chip">Kategori: ${categories.join(', ')}</span>`);
    }
    if(countries.length){
      const names = countries.map(slug => COUNTRY_LINKS[slug]?.name || slug);
      chips.push(`<span class="chip">Lande: ${names.join(', ')}</span>`);
    }
    if(sizes.length){
      chips.push(`<span class="chip">Størrelser: ${sizes.join(', ')}</span>`);
    }
    if(brands.length){
      chips.push(`<span class="chip">Brands: ${brands.join(', ')}</span>`);
    }
    if(priceMin){
      chips.push(`<span class="chip">Min: DKK ${Number(priceMin).toLocaleString('da-DK')}</span>`);
    }
    if(priceMax){
      chips.push(`<span class="chip">Maks: DKK ${Number(priceMax).toLocaleString('da-DK')}</span>`);
    }
    container.innerHTML = chips.join('');
  }

  function applyDirectoryFilters(){
    const form = document.getElementById('directory-filters');
    const sortSelect = document.getElementById('directory-sort');
    if(!form) return;
    const categories = getCheckedValues(form, 'category');
    const countries = getCheckedValues(form, 'country');
    const sizes = getCheckedValues(form, 'size');
    const brands = getCheckedValues(form, 'brand');
    const priceMinRaw = form.querySelector('input[name="price-min"]')?.value || '';
    const priceMaxRaw = form.querySelector('input[name="price-max"]')?.value || '';
    const priceMin = priceMinRaw ? Number(priceMinRaw) : 0;
    const priceMax = priceMaxRaw ? Number(priceMaxRaw) : Infinity;
    const searchTermNormalized = normalizeTerm(state.directory.searchTerm || '');
    const searchCountry = state.directory.searchCountry || '';
    let results = PRODUCTS.filter(product => {
      const store = STORES.find(s => s.id === product.storeId);
      const haystack = [
        product.title,
        product.brand,
        store?.name,
        store?.country,
        ...(store?.tags || [])
      ].join(' ').toLowerCase();
      if(searchTermNormalized && !haystack.includes(searchTermNormalized)){
        return false;
      }
      if(searchCountry && product.countrySlug !== searchCountry){
        return false;
      }
      if(countries.length && !countries.includes(product.countrySlug)){
        return false;
      }
      if(categories.length && !categories.includes(product.cat)){
        return false;
      }
      if(brands.length && (!product.brand || !brands.includes(product.brand))){
        return false;
      }
      if(sizes.length){
        const productSizes = product.sizes && product.sizes.length ? product.sizes : ['onesize'];
        const matchesSize = sizes.some(size => {
          if(size === 'onesize') return productSizes.includes('onesize');
          return productSizes.includes(size);
        });
        if(!matchesSize) return false;
      }
      if(priceMin && product.price < priceMin) return false;
      if(priceMaxRaw && product.price > priceMax) return false;
      return true;
    });

    const sortValue = sortSelect?.value || 'featured';
    switch(sortValue){
      case 'price-asc':
        results = results.slice().sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        results = results.slice().sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        results = results.slice().sort((a, b) => new Date(b.launched) - new Date(a.launched));
        break;
      default:
        results = results.slice().sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }

    renderDirectoryProductsList(results);

    const relevantCountries = new Set();
    if(countries.length){
      countries.forEach(c => relevantCountries.add(c));
    }
    if(searchCountry){
      relevantCountries.add(searchCountry);
    }
    if(!relevantCountries.size){
      results.forEach(product => relevantCountries.add(product.countrySlug));
    }
    const storeList = relevantCountries.size ? STORES.filter(store => relevantCountries.has(store.countrySlug)) : STORES;
    renderDirectoryStoresList(storeList);

    updateDirectoryActiveFilters({
      searchTerm: state.directory.searchTerm,
      searchCountry,
      categories,
      countries,
      sizes,
      brands,
      priceMin: priceMinRaw,
      priceMax: priceMaxRaw
    });
    setDirectoryChipActive(searchCountry);
  }

  function handleDirectorySearch(event){
    event.preventDefault();
    const input = document.getElementById('directory-search-input');
    const select = document.getElementById('directory-search-country');
    const term = input ? input.value.trim() : '';
    const country = select ? select.value : '';
    state.directory.searchTerm = term;
    state.directory.searchCountry = country;
    const form = document.getElementById('directory-filters');
    if(form){
      form.querySelectorAll('input[name="country"]').forEach(cb => {
        cb.checked = country ? cb.value === country : false;
      });
    }
    setDirectoryChipActive(country);
    applyDirectoryFilters();
  }

  function handleDirectoryChipClick(event){
    const button = event.target.closest('[data-country]');
    if(!button) return;
    const slug = button.dataset.country;
    const name = COUNTRY_LINKS[slug]?.name || slug;
    const input = document.getElementById('directory-search-input');
    const select = document.getElementById('directory-search-country');
    if(input) input.value = name;
    if(select) select.value = slug;
    state.directory.searchTerm = '';
    state.directory.searchCountry = slug;
    const form = document.getElementById('directory-filters');
    if(form){
      form.querySelectorAll('input[name="country"]').forEach(cb => {
        cb.checked = cb.value === slug;
      });
    }
    setDirectoryChipActive(slug);
    applyDirectoryFilters();
  }
  function writeJson(key, value){
    storage.setItem(key, JSON.stringify(value));
  }

  function getCart(){
    return readJson('selekti_cart', []);
  }

  function setCart(items){
    writeJson('selekti_cart', items);
    renderCart();
  }

  function addToCart(productId){
    const product = PRODUCTS.find(p => p.id === productId);
    if(!product) return;
    const store = STORES.find(s => s.id === product.storeId);
    const cart = getCart();
    if(cart.some(item => item.id === product.id)){
      openSheet('sheet-cart');
      return;
    }
    cart.push({
      id: product.id,
      title: product.title,
      store: store ? store.name : '',
      img: product.img,
      readyNow: product.readyNow,
      price: product.price,
      brand: product.brand || ''
    });
    setCart(cart);
    openSheet('sheet-cart');
  }

  function removeFromCart(productId){
    const cart = getCart().filter(item => item.id !== productId);
    setCart(cart);
  }

  function getWishlist(){
    return readJson('selekti_wishlist', []);
  }

  function setWishlist(items){
    writeJson('selekti_wishlist', items);
    renderWishlist();
  }

  function addToWishlist(productId){
    const product = PRODUCTS.find(p => p.id === productId);
    if(!product) return;
    const store = STORES.find(s => s.id === product.storeId);
    const wishlist = getWishlist();
    if(wishlist.some(item => item.id === product.id)){
      openSheet('sheet-favorites');
      return;
    }
    wishlist.push({
      id: product.id,
      title: product.title,
      store: store ? store.name : '',
      img: product.img,
      price: product.price,
      brand: product.brand || '',
      readyNow: product.readyNow
    });
    setWishlist(wishlist);
    openSheet('sheet-favorites');
  }

  function removeFromWishlist(productId){
    const wishlist = getWishlist().filter(item => item.id !== productId);
    setWishlist(wishlist);
  }

  function clearWishlist(){
    setWishlist([]);
  }

  function setProfile(){
    storage.setItem('selekti_profile', '1');
  }

  function normalizeTerm(term){
    return term.toLowerCase().trim();
  }

  function resolveCountry(term){
    if(!term) return '';
    const normalized = normalizeTerm(term).replace(/[^a-zæøå0-9\s]/g, '').replace(/\s+/g, ' ');
    for(const [slug, aliases] of Object.entries(COUNTRY_ALIASES)){
      if(aliases.some(alias => normalized === alias)){
        return slug;
      }
    }
    for(const slug of Object.keys(COUNTRY_LINKS)){
      if(normalized === slug) return slug;
    }
    return '';
  }

  function filterStoresByCountry(slug){
    if(!slug) return STORES;
    return STORES.filter(store => store.countrySlug === slug);
  }

  function filterProductsByCountry(slug){
    if(!slug) return PRODUCTS.slice(0, 8);
    return PRODUCTS.filter(product => product.countrySlug === slug);
  }

  function formatRating(rating){
    return (Math.round(rating * 10) / 10).toFixed(1);
  }

  function renderFeatured(){
    const targets = [
      { id: 'featured-grid', layout: 'grid' },
      { id: 'directory-featured', layout: 'row' }
    ];
    targets.forEach(({ id, layout }) => {
      const container = document.getElementById(id);
      if(!container) return;
      container.innerHTML = FEATURED.map(item => {
        const store = STORES.find(s => s.id === item.storeId);
        const image = store?.img || IMG_FALLBACK;
        const flag = store ? (COUNTRY_LINKS[store.countrySlug]?.flag || '') : '';
        const path = store ? COUNTRY_LINKS[store.countrySlug]?.path : '#';
        if(layout === 'row'){
          return `
            <article class="row-card min-w-[260px] max-w-[300px] bg-white rounded-2xl ring-1 ring-black/10 shadow-soft overflow-hidden card-hover">
              <div class="relative h-40">
                <img src="${image}" alt="${store?.name || ''}" class="absolute inset-0 h-full w-full object-cover" loading="lazy">
                <div class="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent"></div>
                <div class="absolute bottom-3 left-3 text-xs font-medium text-white">${store?.name || ''} ${flag}</div>
              </div>
              <div class="p-4 space-y-2">
                <p class="text-[11px] uppercase tracking-wide text-ink/60">Fremhævet kampagne</p>
                <h3 class="text-lg font-semibold leading-tight">${item.headline}</h3>
                <p class="text-sm text-ink/70">${item.blurb}</p>
                <a href="${path}" class="inline-flex items-center gap-2 text-sm font-medium text-ocean">${item.cta} →</a>
              </div>
            </article>`;
        }
        return `
          <article class="rounded-2xl ring-1 ring-black/10 shadow-soft overflow-hidden bg-gradient-to-br ${item.color}">
            <div class="grid md:grid-cols-[1.1fr_.9fr] gap-0">
              <div class="p-6 md:p-8 text-white">
                <p class="text-xs uppercase tracking-wide text-white/70">Fremhævet partner ${flag ? '• '+flag : ''}</p>
                <h3 class="text-2xl font-semibold mt-2">${item.headline}</h3>
                <p class="mt-3 text-sm text-white/80">${item.blurb}</p>
                <a href="${path}" class="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full bg-white/10 text-sm font-medium ring-1 ring-white/40 hover:bg-white/20">${item.cta} →</a>
              </div>
              <div class="relative min-h-[220px] md:min-h-full">
                <img src="${image}" alt="${store?.name || ''}" class="absolute inset-0 w-full h-full object-cover" loading="lazy">
              </div>
            </div>
          </article>`;
      }).join('');
    });
  }

  function renderStores(stores){
    const container = document.getElementById('row-stores');
    if(!container) return;
    if(!stores.length){
      container.innerHTML = '<div class="text-sm text-ink/60 p-3">Ingen butikker matcher endnu. Prøv et andet land.</div>';
      return;
    }
    container.innerHTML = stores.map(store => `
      <article class="row-card min-w-[240px] max-w-[280px] bg-white rounded-xl ring-1 ring-black/5 shadow-soft overflow-hidden card-hover">
        <div class="relative">
          <img src="${store.img || IMG_FALLBACK}" alt="${store.name}" class="h-36 w-full object-cover" loading="lazy">
          <div class="absolute top-2 left-2 flex flex-wrap gap-2">
            <span class="inline-flex items-center px-2 py-1 rounded-full bg-white/90 ring-1 ring-black/10 text-[11px]">${store.country}</span>
            <span class="inline-flex items-center px-2 py-1 rounded-full bg-white/90 ring-1 ring-black/10 text-[11px]">${store.badge}</span>
          </div>
        </div>
        <div class="p-3">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold text-sm">${store.name}</h4>
            <div class="text-xs">⭐ ${formatRating(store.rating)}</div>
          </div>
          <p class="text-xs text-ink/60 mt-1">${store.tags.join(' • ')}</p>
          <div class="mt-3 flex gap-2">
            <button class="rounded-full bg-ink text-white px-3 py-1.5 text-xs" data-open="sheet-wishlist" data-store="${store.id}">Butiksønske</button>
            <a href="${COUNTRY_LINKS[store.countrySlug]?.path || '#'}" class="rounded-full bg-white ring-1 ring-black/10 px-3 py-1.5 text-xs">Se landeside</a>
          </div>
        </div>
      </article>`).join('');
  }

  function renderProducts(products){
    const container = document.getElementById('row-rare');
    if(!container) return;
    if(!products.length){
      container.innerHTML = '<div class="text-sm text-ink/60 p-3">Ingen produkter matcher landet endnu.</div>';
      return;
    }
    container.innerHTML = products.map(product => {
      const store = STORES.find(s => s.id === product.storeId);
      const brandLine = product.brand ? `${product.brand} • ` : '';
      const priceLine = `DKK ${product.price.toLocaleString('da-DK')}`;
      const deliveryLine = product.readyNow ? '2–4 hverdage' : '4–12 hverdage';
      return `
        <article class="row-card min-w-[220px] max-w-[240px] bg-white rounded-xl ring-1 ring-black/5 shadow-soft overflow-hidden card-hover">
          <img src="${product.img || IMG_FALLBACK}" class="h-36 w-full object-cover" alt="${product.title}" loading="lazy">
          <div class="p-3">
            <p class="text-[10px] uppercase tracking-wide text-ink/60">${store ? store.name : ''}</p>
            <h4 class="font-semibold text-sm line-clamp-2">${product.title}</h4>
            <div class="mt-1 text-[12px] text-ink/60">${brandLine}${priceLine}</div>
            <div class="text-[12px] text-ink/60">Levering: ${deliveryLine}</div>
            <div class="mt-2 flex flex-wrap gap-2">
              <button class="rounded-full bg-ink text-white px-3 py-1.5 text-xs" data-add-to-cart="${product.id}">Tilføj til kurv</button>
              <button class="rounded-full bg-white ring-1 ring-black/10 px-3 py-1.5 text-xs" data-add-to-wishlist="${product.id}">Ønske</button>
              <button class="rounded-full bg-white ring-1 ring-black/10 px-3 py-1.5 text-xs" data-open="sheet-estimator" data-product="${product.id}">Se estimat</button>
            </div>
          </div>
        </article>`;
    }).join('');
  }

  function renderVideoGuides(slug){
    const container = document.getElementById('video-guides');
    if(!container) return;
    const guides = slug ? VIDEO_GUIDES.filter(g => g.countrySlug === slug) : VIDEO_GUIDES;
    if(!guides.length){
      container.innerHTML = '';
      return;
    }
    container.innerHTML = guides.map(guide => `
      <article class="rounded-2xl overflow-hidden ring-1 ring-black/10 shadow-soft bg-white">
        <div class="aspect-video bg-black">
          <iframe src="${guide.video}" title="${guide.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy" class="w-full h-full"></iframe>
        </div>
        <div class="p-4 md:p-5">
          <p class="text-[11px] uppercase tracking-wide text-ink/60">Guide fra ${guide.partner}</p>
          <h3 class="text-lg font-semibold mt-1">${guide.title}</h3>
          <p class="text-sm text-ink/70 mt-2">${guide.description}</p>
        </div>
      </article>`).join('');
  }

  function updateCountryLink(slug){
    const container = document.getElementById('country-link');
    if(!container) return;
    if(!slug){
      container.innerHTML = '<a href="butikker.html" class="inline-flex items-center gap-2 text-xs md:text-sm font-medium text-ocean">🌍 Se alle butikker og kampagner →</a>';
      return;
    }
    const country = COUNTRY_LINKS[slug];
    if(!country){
      container.innerHTML = '';
      return;
    }
    container.innerHTML = `<a href="${country.path}" class="inline-flex items-center gap-2 text-xs md:text-sm font-medium text-ocean">${country.flag || ''} Se hele udvalget fra ${country.name} →</a>`;
    const anchor = container.querySelector('a');
    if(anchor){
      anchor.focus();
    }
  }

  function setActiveChip(slug){
    document.querySelectorAll('#country-chips .chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.country === slug);
    });
  }

  function focusShoppingSections(){
    const section = document.getElementById('butikker');
    if(section){
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleSearch(event){
    event.preventDefault();
    const input = document.getElementById('search-input');
    const value = input ? input.value : '';
    const slug = resolveCountry(value);
    state.currentCountry = slug;
    renderStores(filterStoresByCountry(slug));
    renderProducts(filterProductsByCountry(slug));
    renderVideoGuides(slug);
    updateCountryLink(slug);
    setActiveChip(slug);
    focusShoppingSections();
  }

  function handleChipClick(event){
    const button = event.target.closest('[data-country]');
    if(!button) return;
    const slug = button.dataset.country;
    if(event.detail && event.detail > 1){
      const path = COUNTRY_LINKS[slug]?.path;
      if(path){
        window.location.href = path;
      }
      return;
    }
    const input = document.getElementById('search-input');
    if(input) input.value = COUNTRY_LINKS[slug]?.name || slug;
    state.currentCountry = slug;
    renderStores(filterStoresByCountry(slug));
    renderProducts(filterProductsByCountry(slug));
    renderVideoGuides(slug);
    updateCountryLink(slug);
    setActiveChip(slug);
    focusShoppingSections();
  }

  function scrollRow(rowId, direction){
    const el = document.getElementById(rowId);
    if(!el) return;
    const amount = 320 * (direction === 'backward' ? -1 : 1);
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }

  function autoScrollRow(rowId, interval){
    const el = document.getElementById(rowId);
    if(!el) return;
    let stop = false;
    let dir = 1;
    function step(){
      if(stop) return;
      el.scrollBy({ left: dir * 320, behavior: 'smooth' });
      if(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) dir = -1;
      if(el.scrollLeft <= 4) dir = 1;
      window.setTimeout(step, interval);
    }
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if(!media.matches) window.setTimeout(step, interval);
    el.addEventListener('mouseenter', () => { stop = true; });
    el.addEventListener('mouseleave', () => {
      stop = false;
      window.setTimeout(step, interval);
    });
  }

  function computeEstimate({ price, currency = 'DKK', cat = 'electronics', country = 'EU' }){
    const FX = { DKK: 1, USD: 7.05, EUR: 7.45, GBP: 8.63, JPY: 0.051 };
    const DUTY = { electronics: 0.03, accessories: 0.07, apparel: 0.16, beauty: 0.09, hifi: 0.06, design: 0.11 };
    const priceDkk = (Number(price) || 0) * (FX[currency] || 1);
    const isEU = country === 'EU';
    const dutyBase = (!isEU && priceDkk > 1150) ? priceDkk : 0;
    const duty = dutyBase * (DUTY[cat] ?? 0.06);
    const platformFee = Math.max(priceDkk * 0.16, 55);
    const importHandling = isEU ? 0 : 55;
    const vatBase = priceDkk + duty + platformFee + importHandling;
    const vat = isEU ? 0 : vatBase * 0.25;
    const total = priceDkk + duty + vat + platformFee + importHandling;
    const note = isEU
      ? 'Totalprisen dækker produktet og Selekti service – moms er afregnet hos butikken.'
      : 'Totalprisen inkluderer produktet, told, moms og Selekti service.';
    const highlight = 'Tilføj levering i checkout – fri fragt med Selekti+ fra 249 kr./md.';
    return { total: Math.round(total), note, highlight };
  }

  function renderCart(){
    const list = document.getElementById('cart-list');
    const emptyEl = document.getElementById('cart-empty');
    const actions = document.getElementById('cart-actions');
    const countEl = document.getElementById('cart-count');
    const items = getCart();
    if(countEl) countEl.textContent = String(items.length);
    if(!list || !emptyEl || !actions){
      return;
    }
    list.innerHTML = '';
    if(!items.length){
      emptyEl.classList.remove('hidden');
      actions.classList.add('hidden');
      return;
    }
    emptyEl.classList.add('hidden');
    actions.classList.remove('hidden');
    list.innerHTML = items.map(item => {
      const priceLine = typeof item.price === 'number' ? `DKK ${Number(item.price).toLocaleString('da-DK')}` : '';
      const brandLine = item.brand ? item.brand : '';
      const metaLine = brandLine && priceLine ? `${brandLine} • ${priceLine}` : (brandLine || priceLine);
      const deliveryLine = item.readyNow ? '2–4 hverdage' : '4–12 hverdage';
      return `
      <article class="bg-white rounded-xl ring-1 ring-black/5 shadow-soft overflow-hidden card-hover">
        <img src="${item.img || IMG_FALLBACK}" class="h-32 w-full object-cover" alt="${item.title}" loading="lazy">
        <div class="p-3">
          <p class="text-[10px] uppercase tracking-wide text-ink/60">${item.store || ''}</p>
          <h4 class="font-semibold text-sm">${item.title}</h4>
          ${metaLine ? `<div class="mt-1 text-[12px] text-ink/60">${metaLine}</div>` : ''}
          <div class="mt-1 text-[12px] text-ink/60">Levering: ${deliveryLine}</div>
          <div class="mt-3 flex gap-2">
            <button class="px-3 py-1.5 rounded-full bg-white ring-1 ring-black/10 text-xs" data-remove="${item.id}">Fjern</button>
          </div>
        </div>
      </article>`;
    }).join('');
  }

  function renderWishlist(){
    const list = document.getElementById('wishlist-list');
    const emptyEl = document.getElementById('wishlist-empty');
    const actions = document.getElementById('wishlist-actions');
    const countEl = document.getElementById('wishlist-count');
    const items = getWishlist();
    if(countEl) countEl.textContent = String(items.length);
    if(!list || !emptyEl || !actions){
      return;
    }
    list.innerHTML = '';
    if(!items.length){
      emptyEl.classList.remove('hidden');
      actions.classList.add('hidden');
      return;
    }
    emptyEl.classList.add('hidden');
    actions.classList.remove('hidden');
    list.innerHTML = items.map(item => {
      const priceLine = typeof item.price === 'number' ? `DKK ${Number(item.price).toLocaleString('da-DK')}` : '';
      const brandLine = item.brand ? item.brand : '';
      const metaLine = brandLine && priceLine ? `${brandLine} • ${priceLine}` : (brandLine || priceLine);
      const deliveryLine = item.readyNow ? '2–4 hverdage' : '4–12 hverdage';
      return `
      <article class="bg-white rounded-xl ring-1 ring-black/5 shadow-soft overflow-hidden card-hover">
        <img src="${item.img || IMG_FALLBACK}" class="h-32 w-full object-cover" alt="${item.title}" loading="lazy">
        <div class="p-3">
          <p class="text-[10px] uppercase tracking-wide text-ink/60">${item.store || ''}</p>
          <h4 class="font-semibold text-sm">${item.title}</h4>
          ${metaLine ? `<div class="mt-1 text-[12px] text-ink/60">${metaLine}</div>` : ''}
          <div class="mt-1 text-[12px] text-ink/60">Levering: ${deliveryLine}</div>
          <div class="mt-3 flex flex-wrap gap-2">
            <button class="px-3 py-1.5 rounded-full bg-ink text-white text-xs" data-add-to-cart="${item.id}">Tilføj til kurv</button>
            <button class="px-3 py-1.5 rounded-full bg-white ring-1 ring-black/10 text-xs" data-remove-wish="${item.id}">Fjern</button>
          </div>
        </div>
      </article>`;
    }).join('');
  }

  function generateChatbotResponse(message){
    const term = normalizeTerm(message);
    if(!term){
      return 'Fortæl mig hvad du leder efter – jeg kan guide dig til butikker, levering eller Selekti+.';
    }
    if(term.includes('levering') || term.includes('fragt')){
      return 'Vi viser produktets totalpris med det samme. Du vælger leveringsmetode i checkout – Selekti+ giver fri fragt, ellers kan du se zonetakterne på Om os siden.';
    }
    if(term.includes('selekti+') || term.includes('abonnement')){
      return 'Selekti+ giver fri fragt, Mini Behovsbokse og inviter-ven bonus. Se planerne og aktiver første gratis Mini boks via sektionen Selekti+ på forsiden.';
    }
    if(term.includes('behovsboks')){
      return 'Behovsboksen kurateres ud fra dine søgninger og ønskelister. Med Selekti+ får du første Mini boks gratis, og du kan altid sende en gaveboks til venner.';
    }
    if(term.includes('partner') || term.includes('butik') || term.includes('samarbejd')){
      return 'Klik på “Bliv partner” i menuen for at se vores onboarding, danske butiksløsninger og ansøgningsformular. Vi håndterer told, moms og kundeservice for dig.';
    }
    if(term.includes('login') || term.includes('profil')){
      return 'Du kan logge ind eller oprette profil via knappen øverst til højre. Herfra kan du gemme ønskelister, se kurv og invitere venner til Selekti+.';
    }
    if(term.includes('butik') || term.includes('land') || term.includes('shoppe')){
      return 'Prøv at søge efter et land på forsiden eller brug Butikker-siden, hvor du kan filtrere efter land, kategori, pris og størrelse. Klik på et kort for at se produkter og kampagner.';
    }
    if(term.includes('pris') || term.includes('told') || term.includes('moms')){
      return 'Vores estimator viser produktets totalpris inkl. told, moms og Selekti service. Åbn “Få totalpris” for at teste – levering vælges til sidst.';
    }
    return 'Du kan søge efter et land, filtrere butikker på Butikker-siden eller åbne estimatoren for totalpris. Spørg endelig videre hvis du vil have hjælp til noget specifikt!';
  }

  function initChatbot(){
    if(document.getElementById('selekti-chatbot')) return;
    const styleId = 'selekti-chatbot-style';
    if(!document.getElementById(styleId)){
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        #selekti-chatbot{position:fixed;bottom:24px;right:24px;z-index:90;display:flex;flex-direction:column;align-items:flex-end;gap:12px;font-family:inherit;}
        #selekti-chatbot .chatbot-toggle{background:linear-gradient(135deg,#0ea5e9 0%,#10b981 50%,#7c3aed 100%);color:#fff;border:none;border-radius:9999px;padding:0.75rem 1.1rem;box-shadow:0 12px 30px rgba(15,23,42,0.18);cursor:pointer;font-weight:600;display:flex;align-items:center;gap:0.5rem;}
        #selekti-chatbot .chatbot-panel{width:320px;max-height:420px;background:#fff;border-radius:1.25rem;box-shadow:0 18px 60px rgba(15,23,42,0.22);border:1px solid rgba(15,23,42,0.1);display:none;flex-direction:column;overflow:hidden;}
        #selekti-chatbot .chatbot-panel.open{display:flex;}
        #selekti-chatbot .chatbot-header{display:flex;align-items:center;justify-content:space-between;padding:0.85rem 1rem;background:linear-gradient(135deg,#0ea5e9 0%,#10b981 50%,#7c3aed 100%);color:#fff;font-weight:600;}
        #selekti-chatbot .chatbot-header button{background:rgba(255,255,255,0.2);border:none;border-radius:9999px;color:#fff;padding:0.35rem 0.6rem;cursor:pointer;}
        #selekti-chatbot .chatbot-log{flex:1;padding:1rem;overflow-y:auto;display:flex;flex-direction:column;gap:0.75rem;background:#f6f8fb;}
        #selekti-chatbot .chatbot-message{max-width:85%;padding:0.65rem 0.9rem;border-radius:1rem;font-size:0.85rem;line-height:1.35;}
        #selekti-chatbot .chatbot-bot{background:#fff;color:#0f172a;align-self:flex-start;box-shadow:0 8px 20px rgba(15,23,42,0.12);}
        #selekti-chatbot .chatbot-user{background:#0f172a;color:#fff;align-self:flex-end;}
        #selekti-chatbot .chatbot-form{display:flex;padding:0.8rem 1rem;gap:0.5rem;border-top:1px solid rgba(15,23,42,0.08);}
        #selekti-chatbot .chatbot-form input{flex:1;border-radius:0.85rem;border:1px solid rgba(15,23,42,0.16);padding:0.6rem 0.9rem;font-size:0.85rem;}
        #selekti-chatbot .chatbot-form button{border-radius:0.85rem;border:none;background:#0f172a;color:#fff;padding:0.6rem 1rem;font-size:0.85rem;font-weight:600;cursor:pointer;}
      `;
      document.head.appendChild(style);
    }
    const wrapper = document.createElement('div');
    wrapper.id = 'selekti-chatbot';
    wrapper.innerHTML = `
      <div class="chatbot-panel" role="dialog" aria-modal="false" aria-live="polite">
        <div class="chatbot-header">
          <span>Selekti guide</span>
          <button type="button" data-chatbot-close aria-label="Luk chatbot">✕</button>
        </div>
        <div class="chatbot-log" data-chatbot-log></div>
        <form class="chatbot-form" data-chatbot-form>
          <input type="text" placeholder="Spørg om levering, butikker…" data-chatbot-input aria-label="Chat input" />
          <button type="submit">Send</button>
        </form>
      </div>
      <button class="chatbot-toggle" type="button" data-chatbot-toggle aria-expanded="false" aria-controls="selekti-chatbot">🤖 Hjælp</button>`;
    document.body.appendChild(wrapper);
    const panel = wrapper.querySelector('.chatbot-panel');
    const toggle = wrapper.querySelector('[data-chatbot-toggle]');
    const close = wrapper.querySelector('[data-chatbot-close]');
    const log = wrapper.querySelector('[data-chatbot-log]');
    const form = wrapper.querySelector('[data-chatbot-form]');
    const input = wrapper.querySelector('[data-chatbot-input]');

    function appendMessage(role, text){
      if(!log) return;
      const div = document.createElement('div');
      div.className = `chatbot-message chatbot-${role}`;
      div.innerHTML = text;
      log.appendChild(div);
      log.scrollTop = log.scrollHeight;
    }

    function togglePanel(force){
      const shouldOpen = typeof force === 'boolean' ? force : !panel.classList.contains('open');
      if(shouldOpen){
        panel.classList.add('open');
        panel.setAttribute('aria-hidden', 'false');
        toggle?.setAttribute('aria-expanded', 'true');
        window.setTimeout(() => input?.focus(), 120);
      } else {
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
        toggle?.setAttribute('aria-expanded', 'false');
      }
    }

    toggle?.addEventListener('click', () => togglePanel());
    close?.addEventListener('click', () => togglePanel(false));

    if(form){
      form.addEventListener('submit', event => {
        event.preventDefault();
        const value = input?.value.trim();
        if(!value) return;
        appendMessage('user', value);
        if(input) input.value = '';
        window.setTimeout(() => {
          appendMessage('bot', generateChatbotResponse(value));
        }, 280);
      });
    }

    appendMessage('bot', 'Hej! Spørg mig om Selekti, levering eller hvilke butikker vi samarbejder med.');
  }

  let dimEl;

  function openSheet(id){
    const sheet = document.getElementById(id);
    if(!sheet) return;
    sheet.classList.remove('hidden');
    window.setTimeout(() => sheet.classList.add('open'), 10);
    if(dimEl) dimEl.classList.remove('hidden');
  }

  function closeSheets(){
    document.querySelectorAll('.sheet').forEach(sheet => {
      sheet.classList.remove('open');
      window.setTimeout(() => sheet.classList.add('hidden'), 250);
    });
    if(dimEl) dimEl.classList.add('hidden');
  }

  function initSheets(){
    dimEl = document.getElementById('sheet-dim');
    if(dimEl){
      dimEl.addEventListener('click', closeSheets);
    }
    document.addEventListener('click', event => {
      const closeBtn = event.target.closest('[data-close]');
      if(closeBtn){
        closeSheets();
        return;
      }
      const openBtn = event.target.closest('[data-open]');
      if(openBtn){
        const id = openBtn.getAttribute('data-open');
        if(id) openSheet(id);
        return;
      }
      const addBtn = event.target.closest('[data-add-to-cart]');
      if(addBtn){
        addToCart(addBtn.getAttribute('data-add-to-cart'));
        return;
      }
      const addWishBtn = event.target.closest('[data-add-to-wishlist]');
      if(addWishBtn){
        addToWishlist(addWishBtn.getAttribute('data-add-to-wishlist'));
        return;
      }
      const removeBtn = event.target.closest('[data-remove]');
      if(removeBtn){
        removeFromCart(removeBtn.getAttribute('data-remove'));
        return;
      }
      const removeWishBtn = event.target.closest('[data-remove-wish]');
      if(removeWishBtn){
        removeFromWishlist(removeWishBtn.getAttribute('data-remove-wish'));
        return;
      }
      const rowBtn = event.target.closest('[data-row]');
      if(rowBtn){
        const rowId = rowBtn.getAttribute('data-row');
        if(rowBtn.classList.contains('row-prev')){
          scrollRow(rowId, 'backward');
        } else if(rowBtn.classList.contains('row-next')){
          scrollRow(rowId, 'forward');
        }
        return;
      }
    });
  }

  function initAuth(){
    const loginForm = document.getElementById('form-login');
    const registerForm = document.getElementById('form-register');
    if(loginForm){
      loginForm.addEventListener('submit', event => {
        event.preventDefault();
        setProfile();
        closeSheets();
      });
    }
    if(registerForm){
      registerForm.addEventListener('submit', event => {
        event.preventDefault();
        setProfile();
        closeSheets();
      });
    }
    const openAuth = document.getElementById('open-auth');
    if(openAuth){
      openAuth.addEventListener('click', () => openSheet('sheet-auth'));
    }
    const openCart = document.getElementById('open-cart');
    if(openCart){
      openCart.addEventListener('click', () => openSheet('sheet-cart'));
    }
    const goCheckout = document.getElementById('go-checkout');
    if(goCheckout){
      goCheckout.addEventListener('click', () => openSheet('sheet-auth'));
    }
  }

  function initEstimator(){
    const heroEst = document.getElementById('hero-est');
    if(heroEst){
      const sample = computeEstimate({ price: 150, currency: 'USD', cat: 'electronics', country: 'US' });
      heroEst.textContent = 'DKK ' + sample.total.toLocaleString('da-DK');
    }
    const form = document.getElementById('est-form');
    if(!form) return;
    form.addEventListener('submit', event => {
      event.preventDefault();
      const price = Number(document.getElementById('est-price')?.value || 0);
      const currency = document.getElementById('est-currency')?.value || 'DKK';
      const cat = document.getElementById('est-cat')?.value || 'electronics';
      const country = document.getElementById('est-country')?.value || 'EU';
      const result = computeEstimate({ price, currency, cat, country });
      const totalEl = document.getElementById('est-total');
      const noteEl = document.getElementById('est-note');
      const highlightEl = document.getElementById('est-highlight-main');
      if(totalEl) totalEl.textContent = 'DKK ' + result.total.toLocaleString('da-DK');
      if(noteEl) noteEl.textContent = result.note;
      if(highlightEl) highlightEl.textContent = '• ' + result.highlight;
    });
  }

  function initLanding(){
    renderFeatured();
    renderStores(filterStoresByCountry(''));
    renderProducts(filterProductsByCountry(''));
    renderVideoGuides('');
    updateCountryLink('');
    setActiveChip('');
    autoScrollRow('row-stores', 3200);
    autoScrollRow('row-rare', 3400);
    const searchForm = document.getElementById('search-form');
    if(searchForm){
      searchForm.addEventListener('submit', handleSearch);
    }
    const chips = document.getElementById('country-chips');
    if(chips){
      chips.addEventListener('click', handleChipClick);
    }
  }

  function initDirectoryPage(){
    renderFeatured();
    renderVideoGuides('');
    renderDirectoryStoresList(STORES);
    const heroEst = document.getElementById('directory-hero-est');
    if(heroEst){
      const sample = computeEstimate({ price: 110, currency: 'USD', cat: 'design', country: 'CN' });
      heroEst.textContent = 'DKK ' + sample.total.toLocaleString('da-DK');
    }
    autoScrollRow('directory-featured', 3600);
    const searchForm = document.getElementById('directory-search');
    if(searchForm){
      searchForm.addEventListener('submit', handleDirectorySearch);
    }
    const searchSelect = document.getElementById('directory-search-country');
    if(searchForm && searchSelect){
      const triggerSearch = () => {
        if(typeof searchForm.requestSubmit === 'function'){
          searchForm.requestSubmit();
        } else {
          searchForm.dispatchEvent(new Event('submit', { cancelable: true }));
        }
      };
      searchSelect.addEventListener('change', triggerSearch);
    }
    const chips = document.getElementById('directory-country-chips');
    if(chips){
      chips.addEventListener('click', handleDirectoryChipClick);
    }
    const filterForm = document.getElementById('directory-filters');
    if(filterForm){
      filterForm.addEventListener('change', applyDirectoryFilters);
      filterForm.addEventListener('input', event => {
        if(event.target.matches('input[type="number"]')){
          applyDirectoryFilters();
        }
      });
    }
    const sortSelect = document.getElementById('directory-sort');
    if(sortSelect){
      sortSelect.addEventListener('change', applyDirectoryFilters);
    }
    const resetBtn = document.getElementById('directory-reset');
    if(resetBtn){
      resetBtn.addEventListener('click', () => {
        state.directory.searchTerm = '';
        state.directory.searchCountry = '';
        const input = document.getElementById('directory-search-input');
        const select = document.getElementById('directory-search-country');
        if(input) input.value = '';
        if(select) select.value = '';
        filterForm?.reset();
        setDirectoryChipActive('');
        applyDirectoryFilters();
      });
    }
    applyDirectoryFilters();
  }

  function initCountryPage(slug){
    const normalized = slug || document.body.dataset.country || '';
    state.currentCountry = normalized;
    const heading = document.getElementById('country-heading');
    const description = document.getElementById('country-description');
    const country = COUNTRY_LINKS[normalized];
    if(country && heading){
      heading.textContent = `${country.flag || ''} ${country.name}`;
    }
    if(description && country){
      const sampleStore = STORES.find(store => store.countrySlug === normalized);
      description.textContent = sampleStore
        ? `Shop direkte fra ${sampleStore.country} – vi viser totalprisen og håndterer papirarbejdet for dig.`
        : `Shop direkte fra ${country.name} med Selekti.`;
    }
    renderStores(filterStoresByCountry(normalized));
    renderProducts(filterProductsByCountry(normalized));
    renderVideoGuides(normalized);
    autoScrollRow('row-stores', 3200);
    autoScrollRow('row-rare', 3400);
  }

  function initInfoPage(){
    renderVideoGuides('');
  }

  function initCommon(){
    document.querySelectorAll('#year').forEach(node => {
      node.textContent = new Date().getFullYear();
    });
    initSheets();
    initAuth();
    renderWishlist();
    renderCart();
    initEstimator();
    const clearWishlistBtn = document.getElementById('wishlist-clear');
    if(clearWishlistBtn){
      clearWishlistBtn.addEventListener('click', () => clearWishlist());
    }
    initChatbot();
  }

  function init(){
    initCommon();
    const page = document.body.dataset.page || 'landing';
    switch(page){
      case 'landing':
        initLanding();
        break;
      case 'country':
        initCountryPage(document.body.dataset.country);
        break;
      case 'directory':
        initDirectoryPage();
        break;
      case 'info':
        initInfoPage();
        break;
      case 'partners':
        renderVideoGuides('');
        break;
      default:
        initLanding();
    }
  }

  document.addEventListener('DOMContentLoaded', init);

})(window, document);
