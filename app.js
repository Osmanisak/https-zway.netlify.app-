diff --git a/app.js b/app.js
new file mode 100644
index 0000000000000000000000000000000000000000..ea5ca335357606a436d0c8a3d3851d373b1347a8
--- /dev/null
+++ b/app.js
@@ -0,0 +1,573 @@
+(function(window, document){
+  'use strict';
+
+  const IMG_FALLBACK = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><rect width='100%25' height='100%25' fill='%23f6f8fb'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2364748b' font-family='Inter' font-size='32'>Selekti</text></svg>";
+
+  const COUNTRY_LINKS = {
+    eu: { slug: 'eu', name: 'Europa', path: 'index.html#butikker', flag: '🇪🇺' },
+    usa: { slug: 'usa', name: 'USA', path: 'usa.html', flag: '🇺🇸' },
+    uk: { slug: 'uk', name: 'Storbritannien', path: 'uk.html', flag: '🇬🇧' },
+    japan: { slug: 'japan', name: 'Japan', path: 'japan.html', flag: '🇯🇵' },
+    sydkorea: { slug: 'sydkorea', name: 'Sydkorea', path: 'sydkorea.html', flag: '🇰🇷' },
+    kina: { slug: 'kina', name: 'Kina', path: 'kina.html', flag: '🇨🇳' },
+    indien: { slug: 'indien', name: 'Indien', path: 'indien.html', flag: '🇮🇳' }
+  };
+
+  const COUNTRY_ALIASES = {
+    eu: ['eu', 'europa'],
+    usa: ['usa', 'us', 'america', 'amerika', 'forenede stater'],
+    uk: ['uk', 'storbritannien', 'england', 'britain'],
+    japan: ['japan', 'jp'],
+    sydkorea: ['sydkorea', 'korea', 'south korea', 'southkorea'],
+    kina: ['kina', 'china', 'cn'],
+    indien: ['indien', 'india']
+  };
+
+  const STORES = [
+    { id: 'us-nyc-camera', name: 'NYC Camera Store', city: 'New York', country: 'USA', countrySlug: 'usa', badge: 'Pro gear med totalpris', tags: ['Elektronik', 'Hi-Fi'], img: 'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&w=1200&q=80', rating: 4.8, sponsored: true },
+    { id: 'us-coast-sneaker', name: 'Pacific Sneaker Club', city: 'Los Angeles', country: 'USA', countrySlug: 'usa', badge: 'Limited releases', tags: ['Tøj & Sneakers'], img: 'https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=1200&q=80', rating: 4.6, sponsored: true },
+    { id: 'jp-tokyo-streetwear', name: 'Tokyo Streetwear', city: 'Tokyo', country: 'Japan', countrySlug: 'japan', badge: 'Drop alarm', tags: ['Tøj & Sneakers'], img: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', rating: 4.7, sponsored: true },
+    { id: 'jp-osaka-audio', name: 'Osaka Audio Lab', city: 'Osaka', country: 'Japan', countrySlug: 'japan', badge: 'Hi-Fi specialister', tags: ['Hi-Fi', 'Elektronik'], img: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80', rating: 4.9 },
+    { id: 'uk-audio-boutique', name: 'London Vinyl House', city: 'London', country: 'Storbritannien', countrySlug: 'uk', badge: 'Kurateret lyd', tags: ['Hi-Fi', 'Vinyl'], img: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80', rating: 4.9, sponsored: true },
+    { id: 'uk-style-atelier', name: 'Manchester Style Atelier', city: 'Manchester', country: 'Storbritannien', countrySlug: 'uk', badge: 'Modetendenser', tags: ['Accessories', 'Tøj'], img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80', rating: 4.5 },
+    { id: 'kr-seoul-beauty', name: 'Seoul Beauty Lab', city: 'Seoul', country: 'Sydkorea', countrySlug: 'sydkorea', badge: 'K-Beauty kurateret', tags: ['Skønhed', 'K-Beauty'], img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80', rating: 4.8, sponsored: true },
+    { id: 'kr-busan-tech', name: 'Busan Tech Market', city: 'Busan', country: 'Sydkorea', countrySlug: 'sydkorea', badge: 'Smart hjem', tags: ['Elektronik'], img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', rating: 4.6 },
+    { id: 'cn-shanghai-design', name: 'Shanghai Design Market', city: 'Shanghai', country: 'Kina', countrySlug: 'kina', badge: 'Indie brands', tags: ['Design', 'Interiør'], img: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=1200&q=80', rating: 4.7, sponsored: true },
+    { id: 'cn-shenzhen-gadget', name: 'Shenzhen Gadget Hub', city: 'Shenzhen', country: 'Kina', countrySlug: 'kina', badge: 'Teknologi', tags: ['Elektronik', 'Gadgets'], img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', rating: 4.5 },
+    { id: 'in-delhi-craft', name: 'Delhi Craft Collective', city: 'Delhi', country: 'Indien', countrySlug: 'indien', badge: 'Håndværk', tags: ['Hjem', 'Design'], img: 'https://images.unsplash.com/photo-1529929654850-443046a0544e?auto=format&fit=crop&w=1200&q=80', rating: 4.6, sponsored: true },
+    { id: 'in-bangalore-gaming', name: 'Bangalore Gaming Forge', city: 'Bengaluru', country: 'Indien', countrySlug: 'indien', badge: 'Gaming gear', tags: ['Elektronik'], img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80', rating: 4.5 }
+  ];
+
+  const PRODUCTS = [
+    { id: 'p-us-gimbal', title: 'Pro kamera-gimbal (travel size)', price: 1549, cat: 'electronics', img: 'https://images.unsplash.com/photo-1526178618720-6a67cf02c4b7?auto=format&fit=crop&w=1200&q=80', storeId: 'us-nyc-camera', countrySlug: 'usa', readyNow: false },
+    { id: 'p-us-sneaker', title: 'West Coast runner – eksklusiv farve', price: 1199, cat: 'apparel', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80', storeId: 'us-coast-sneaker', countrySlug: 'usa', readyNow: false },
+    { id: 'p-jp-headphones', title: 'Audio Lab reference-hovedtelefoner', price: 1899, cat: 'hifi', img: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=80', storeId: 'jp-osaka-audio', countrySlug: 'japan', readyNow: false },
+    { id: 'p-jp-streetwear', title: 'Tokyo street-jakke med limited patch', price: 1399, cat: 'apparel', img: 'https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=1200&q=80', storeId: 'jp-tokyo-streetwear', countrySlug: 'japan', readyNow: false },
+    { id: 'p-uk-dac', title: 'Kompakt DAC/AMP (Hi-Res USB-C)', price: 899, cat: 'hifi', img: 'https://images.unsplash.com/photo-1545127398-14699f92334d?auto=format&fit=crop&w=1200&q=80', storeId: 'uk-audio-boutique', countrySlug: 'uk', readyNow: false },
+    { id: 'p-uk-accessory', title: 'Britisk lædertaske – håndlavet', price: 1599, cat: 'accessories', img: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=1200&q=80', storeId: 'uk-style-atelier', countrySlug: 'uk', readyNow: true },
+    { id: 'p-kr-serum', title: 'Glass skin serum (klinisk testet)', price: 329, cat: 'beauty', img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80', storeId: 'kr-seoul-beauty', countrySlug: 'sydkorea', readyNow: false },
+    { id: 'p-kr-smart', title: 'Smart home hub med AI-stemmer', price: 1049, cat: 'electronics', img: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1200&q=80', storeId: 'kr-busan-tech', countrySlug: 'sydkorea', readyNow: true },
+    { id: 'p-cn-ceramics', title: 'Shanghai keramik-sæt i begrænset oplag', price: 749, cat: 'design', img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80', storeId: 'cn-shanghai-design', countrySlug: 'kina', readyNow: true },
+    { id: 'p-cn-gadget', title: 'Foldbar skrivebordslampe med Qi-lader', price: 589, cat: 'electronics', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', storeId: 'cn-shenzhen-gadget', countrySlug: 'kina', readyNow: true },
+    { id: 'p-in-textiles', title: 'Delhi håndvævet tæppe (2x3 m)', price: 2099, cat: 'design', img: 'https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=1200&q=80', storeId: 'in-delhi-craft', countrySlug: 'indien', readyNow: false },
+    { id: 'p-in-peripheral', title: 'Pro gaming mus med hall-sensor', price: 799, cat: 'electronics', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80', storeId: 'in-bangalore-gaming', countrySlug: 'indien', readyNow: true }
+  ];
+
+  const FEATURED = [
+    { storeId: 'jp-tokyo-streetwear', headline: 'Tokyo Streetwear', blurb: 'Eksklusive collabs lanceres først hos Selekti – sikr dig næste drop med totalpris fra Tokyo.', cta: 'Se nye drops', color: 'from-ocean to-grape' },
+    { storeId: 'cn-shanghai-design', headline: 'Shanghai Design Market', blurb: 'Indie designere fra Shanghai håndplukker interiør med danske mål – klar til din stue.', cta: 'Opdag kollektionen', color: 'from-amber to-mint' },
+    { storeId: 'us-nyc-camera', headline: 'NYC Camera Store', blurb: 'Professionelt udstyr, forsikret og klar til levering – vi håndterer told og papirarbejdet.', cta: 'Find udstyr', color: 'from-ink to-ocean' }
+  ];
+
+  const VIDEO_GUIDES = [
+    { id: 'guide-japan-sneakers', title: 'Guide: Sådan shopper du sneakers i Japan', partner: 'Tokyo Streetwear', countrySlug: 'japan', video: 'https://www.youtube.com/embed/9bZkp7q19f0', description: 'Lær hvordan Selekti sikrer autentiske releases og hurtig levering fra Japan.' },
+    { id: 'guide-usa-gear', title: 'Guide: Kamera gear fra USA', partner: 'NYC Camera Store', countrySlug: 'usa', video: 'https://www.youtube.com/embed/ysz5S6PUM-U', description: 'Se hvordan vores team tester gear og pakker sikkert til Danmark.' },
+    { id: 'guide-korea-beauty', title: 'Guide: K-Beauty rutiner', partner: 'Seoul Beauty Lab', countrySlug: 'sydkorea', video: 'https://www.youtube.com/embed/ktvTqknDobU', description: 'Ekspertråd fra Seoul Beauty Lab om at bygge din perfekte hudplejerutine.' }
+  ];
+
+  const state = {
+    currentCountry: '',
+    storageFallback: {}
+  };
+
+  const storage = (() => {
+    try {
+      const key = 'selekti_test';
+      window.localStorage.setItem(key, '1');
+      window.localStorage.removeItem(key);
+      return window.localStorage;
+    } catch (err) {
+      return {
+        getItem: key => Object.prototype.hasOwnProperty.call(state.storageFallback, key) ? state.storageFallback[key] : null,
+        setItem: (key, value) => { state.storageFallback[key] = String(value); },
+        removeItem: key => { delete state.storageFallback[key]; }
+      };
+    }
+  })();
+
+  function readJson(key, fallback){
+    try {
+      const raw = storage.getItem(key);
+      return raw ? JSON.parse(raw) : fallback;
+    } catch (err) {
+      return fallback;
+    }
+  }
+
+  function writeJson(key, value){
+    storage.setItem(key, JSON.stringify(value));
+  }
+
+  function getCart(){
+    return readJson('selekti_cart', []);
+  }
+
+  function setCart(items){
+    writeJson('selekti_cart', items);
+    renderCart();
+  }
+
+  function addToCart(productId){
+    const product = PRODUCTS.find(p => p.id === productId);
+    if(!product) return;
+    const store = STORES.find(s => s.id === product.storeId);
+    const cart = getCart();
+    if(cart.some(item => item.id === product.id)){
+      openSheet('sheet-cart');
+      return;
+    }
+    cart.push({
+      id: product.id,
+      title: product.title,
+      store: store ? store.name : '',
+      img: product.img,
+      readyNow: product.readyNow
+    });
+    setCart(cart);
+    openSheet('sheet-cart');
+  }
+
+  function removeFromCart(productId){
+    const cart = getCart().filter(item => item.id !== productId);
+    setCart(cart);
+  }
+
+  function setProfile(){
+    storage.setItem('selekti_profile', '1');
+  }
+
+  function normalizeTerm(term){
+    return term.toLowerCase().trim();
+  }
+
+  function resolveCountry(term){
+    if(!term) return '';
+    const normalized = normalizeTerm(term).replace(/[^a-zæøå0-9\s]/g, '').replace(/\s+/g, ' ');
+    for(const [slug, aliases] of Object.entries(COUNTRY_ALIASES)){
+      if(aliases.some(alias => normalized === alias)){
+        return slug;
+      }
+    }
+    for(const slug of Object.keys(COUNTRY_LINKS)){
+      if(normalized === slug) return slug;
+    }
+    return '';
+  }
+
+  function filterStoresByCountry(slug){
+    if(!slug) return STORES;
+    return STORES.filter(store => store.countrySlug === slug);
+  }
+
+  function filterProductsByCountry(slug){
+    if(!slug) return PRODUCTS.slice(0, 8);
+    return PRODUCTS.filter(product => product.countrySlug === slug);
+  }
+
+  function formatRating(rating){
+    return (Math.round(rating * 10) / 10).toFixed(1);
+  }
+
+  function renderFeatured(){
+    const container = document.getElementById('featured-grid');
+    if(!container) return;
+    container.innerHTML = FEATURED.map(item => {
+      const store = STORES.find(s => s.id === item.storeId);
+      const image = store?.img || IMG_FALLBACK;
+      const flag = store ? (COUNTRY_LINKS[store.countrySlug]?.flag || '') : '';
+      const path = store ? COUNTRY_LINKS[store.countrySlug]?.path : '#';
+      return `
+        <article class="rounded-2xl ring-1 ring-black/10 shadow-soft overflow-hidden bg-gradient-to-br ${item.color}">
+          <div class="grid md:grid-cols-[1.1fr_.9fr] gap-0">
+            <div class="p-6 md:p-8 text-white">
+              <p class="text-xs uppercase tracking-wide text-white/70">Fremhævet partner ${flag ? '• '+flag : ''}</p>
+              <h3 class="text-2xl font-semibold mt-2">${item.headline}</h3>
+              <p class="mt-3 text-sm text-white/80">${item.blurb}</p>
+              <a href="${path}" class="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full bg-white/10 text-sm font-medium ring-1 ring-white/40 hover:bg-white/20">${item.cta} →</a>
+            </div>
+            <div class="relative min-h-[220px] md:min-h-full">
+              <img src="${image}" alt="${store?.name || ''}" class="absolute inset-0 w-full h-full object-cover" loading="lazy">
+            </div>
+          </div>
+        </article>`;
+    }).join('');
+  }
+
+  function renderStores(stores){
+    const container = document.getElementById('row-stores');
+    if(!container) return;
+    if(!stores.length){
+      container.innerHTML = '<div class="text-sm text-ink/60 p-3">Ingen butikker matcher endnu. Prøv et andet land.</div>';
+      return;
+    }
+    container.innerHTML = stores.map(store => `
+      <article class="row-card min-w-[240px] max-w-[280px] bg-white rounded-xl ring-1 ring-black/5 shadow-soft overflow-hidden card-hover">
+        <div class="relative">
+          <img src="${store.img || IMG_FALLBACK}" alt="${store.name}" class="h-36 w-full object-cover" loading="lazy">
+          <div class="absolute top-2 left-2 flex flex-wrap gap-2">
+            <span class="inline-flex items-center px-2 py-1 rounded-full bg-white/90 ring-1 ring-black/10 text-[11px]">${store.country}</span>
+            <span class="inline-flex items-center px-2 py-1 rounded-full bg-white/90 ring-1 ring-black/10 text-[11px]">${store.badge}</span>
+          </div>
+        </div>
+        <div class="p-3">
+          <div class="flex items-center justify-between">
+            <h4 class="font-semibold text-sm">${store.name}</h4>
+            <div class="text-xs">⭐ ${formatRating(store.rating)}</div>
+          </div>
+          <p class="text-xs text-ink/60 mt-1">${store.tags.join(' • ')}</p>
+          <div class="mt-3 flex gap-2">
+            <button class="rounded-full bg-ink text-white px-3 py-1.5 text-xs" data-open="sheet-wishlist" data-store="${store.id}">Butiksønske</button>
+            <a href="${COUNTRY_LINKS[store.countrySlug]?.path || '#'}" class="rounded-full bg-white ring-1 ring-black/10 px-3 py-1.5 text-xs">Se landeside</a>
+          </div>
+        </div>
+      </article>`).join('');
+  }
+
+  function renderProducts(products){
+    const container = document.getElementById('row-rare');
+    if(!container) return;
+    if(!products.length){
+      container.innerHTML = '<div class="text-sm text-ink/60 p-3">Ingen produkter matcher landet endnu.</div>';
+      return;
+    }
+    container.innerHTML = products.map(product => {
+      const store = STORES.find(s => s.id === product.storeId);
+      return `
+        <article class="row-card min-w-[220px] max-w-[240px] bg-white rounded-xl ring-1 ring-black/5 shadow-soft overflow-hidden card-hover">
+          <img src="${product.img || IMG_FALLBACK}" class="h-36 w-full object-cover" alt="${product.title}" loading="lazy">
+          <div class="p-3">
+            <p class="text-[10px] uppercase tracking-wide text-ink/60">${store ? store.name : ''}</p>
+            <h4 class="font-semibold text-sm line-clamp-2">${product.title}</h4>
+            <div class="mt-1 text-[12px] text-ink/60">Totalpris: ${product.price.toLocaleString('da-DK')} kr.</div>
+            <div class="mt-2 flex gap-2">
+              <button class="rounded-full bg-ink text-white px-3 py-1.5 text-xs" data-add-to-cart="${product.id}">Tilføj til kurv</button>
+              <button class="rounded-full bg-white ring-1 ring-black/10 px-3 py-1.5 text-xs" data-open="sheet-estimator" data-product="${product.id}">Se estimat</button>
+            </div>
+          </div>
+        </article>`;
+    }).join('');
+  }
+
+  function renderVideoGuides(slug){
+    const container = document.getElementById('video-guides');
+    if(!container) return;
+    const guides = slug ? VIDEO_GUIDES.filter(g => g.countrySlug === slug) : VIDEO_GUIDES;
+    if(!guides.length){
+      container.innerHTML = '';
+      return;
+    }
+    container.innerHTML = guides.map(guide => `
+      <article class="rounded-2xl overflow-hidden ring-1 ring-black/10 shadow-soft bg-white">
+        <div class="aspect-video bg-black">
+          <iframe src="${guide.video}" title="${guide.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy" class="w-full h-full"></iframe>
+        </div>
+        <div class="p-4 md:p-5">
+          <p class="text-[11px] uppercase tracking-wide text-ink/60">Guide fra ${guide.partner}</p>
+          <h3 class="text-lg font-semibold mt-1">${guide.title}</h3>
+          <p class="text-sm text-ink/70 mt-2">${guide.description}</p>
+        </div>
+      </article>`).join('');
+  }
+
+  function updateCountryLink(slug){
+    const container = document.getElementById('country-link');
+    if(!container) return;
+    if(!slug){
+      container.innerHTML = '';
+      return;
+    }
+    const country = COUNTRY_LINKS[slug];
+    if(!country){
+      container.innerHTML = '';
+      return;
+    }
+    container.innerHTML = `<a href="${country.path}" class="inline-flex items-center gap-2 text-xs md:text-sm font-medium text-ocean">${country.flag || ''} Se hele udvalget fra ${country.name} →</a>`;
+  }
+
+  function setActiveChip(slug){
+    document.querySelectorAll('#country-chips .chip').forEach(chip => {
+      chip.classList.toggle('active', chip.dataset.country === slug);
+    });
+  }
+
+  function handleSearch(event){
+    event.preventDefault();
+    const input = document.getElementById('search-input');
+    const value = input ? input.value : '';
+    const slug = resolveCountry(value);
+    state.currentCountry = slug;
+    renderStores(filterStoresByCountry(slug));
+    renderProducts(filterProductsByCountry(slug));
+    renderVideoGuides(slug);
+    updateCountryLink(slug);
+    setActiveChip(slug);
+  }
+
+  function handleChipClick(event){
+    const button = event.target.closest('[data-country]');
+    if(!button) return;
+    const slug = button.dataset.country;
+    const input = document.getElementById('search-input');
+    if(input) input.value = COUNTRY_LINKS[slug]?.name || slug;
+    state.currentCountry = slug;
+    renderStores(filterStoresByCountry(slug));
+    renderProducts(filterProductsByCountry(slug));
+    renderVideoGuides(slug);
+    updateCountryLink(slug);
+    setActiveChip(slug);
+  }
+
+  function autoScrollRow(rowId, interval){
+    const el = document.getElementById(rowId);
+    if(!el) return;
+    let stop = false;
+    let dir = 1;
+    function step(){
+      if(stop) return;
+      el.scrollBy({ left: dir * 320, behavior: 'smooth' });
+      if(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) dir = -1;
+      if(el.scrollLeft <= 4) dir = 1;
+      window.setTimeout(step, interval);
+    }
+    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
+    if(!media.matches) window.setTimeout(step, interval);
+    el.addEventListener('mouseenter', () => { stop = true; });
+    el.addEventListener('mouseleave', () => {
+      stop = false;
+      window.setTimeout(step, interval);
+    });
+  }
+
+  function computeEstimate({ price, currency = 'DKK', cat = 'electronics', country = 'EU' }){
+    const FX = { DKK: 1, USD: 7.05, EUR: 7.45, GBP: 8.63, JPY: 0.051 };
+    const DUTY = { electronics: 0.03, accessories: 0.07, apparel: 0.16, beauty: 0.09, hifi: 0.06, design: 0.11 };
+    const priceDkk = (Number(price) || 0) * (FX[currency] || 1);
+    const isEU = country === 'EU';
+    const dutyBase = (!isEU && priceDkk > 1150) ? priceDkk : 0;
+    const duty = dutyBase * (DUTY[cat] ?? 0.06);
+    const platformFee = Math.max(priceDkk * 0.16, 55);
+    const importHandling = isEU ? 0 : 55;
+    const vatBase = priceDkk + duty + platformFee + importHandling;
+    const vat = isEU ? 0 : vatBase * 0.25;
+    const total = priceDkk + duty + vat + platformFee + importHandling;
+    const note = isEU
+      ? 'Totalprisen dækker produktet og Selekti service – moms er afregnet hos butikken.'
+      : 'Totalprisen inkluderer produktet, told, moms og Selekti service.';
+    const highlight = 'Tilføj levering i checkout – fri fragt med Selekti+ fra 249 kr./md.';
+    return { total: Math.round(total), note, highlight };
+  }
+
+  function renderCart(){
+    const list = document.getElementById('cart-list');
+    const emptyEl = document.getElementById('cart-empty');
+    const actions = document.getElementById('cart-actions');
+    const countEl = document.getElementById('cart-count');
+    const items = getCart();
+    if(countEl) countEl.textContent = String(items.length);
+    if(!list || !emptyEl || !actions){
+      return;
+    }
+    list.innerHTML = '';
+    if(!items.length){
+      emptyEl.classList.remove('hidden');
+      actions.classList.add('hidden');
+      return;
+    }
+    emptyEl.classList.add('hidden');
+    actions.classList.remove('hidden');
+    list.innerHTML = items.map(item => `
+      <article class="bg-white rounded-xl ring-1 ring-black/5 shadow-soft overflow-hidden card-hover">
+        <img src="${item.img || IMG_FALLBACK}" class="h-32 w-full object-cover" alt="${item.title}" loading="lazy">
+        <div class="p-3">
+          <p class="text-[10px] uppercase tracking-wide text-ink/60">${item.store || ''}</p>
+          <h4 class="font-semibold text-sm">${item.title}</h4>
+          <div class="mt-1 text-[12px] text-ink/60">Anslået levering: ${item.readyNow ? '2–4 hverdage' : '4–12 hverdage'}</div>
+          <div class="mt-3 flex gap-2">
+            <button class="px-3 py-1.5 rounded-full bg-white ring-1 ring-black/10 text-xs" data-remove="${item.id}">Fjern</button>
+          </div>
+        </div>
+      </article>`).join('');
+  }
+
+  let dimEl;
+
+  function openSheet(id){
+    const sheet = document.getElementById(id);
+    if(!sheet) return;
+    sheet.classList.remove('hidden');
+    window.setTimeout(() => sheet.classList.add('open'), 10);
+    if(dimEl) dimEl.classList.remove('hidden');
+  }
+
+  function closeSheets(){
+    document.querySelectorAll('.sheet').forEach(sheet => {
+      sheet.classList.remove('open');
+      window.setTimeout(() => sheet.classList.add('hidden'), 250);
+    });
+    if(dimEl) dimEl.classList.add('hidden');
+  }
+
+  function initSheets(){
+    dimEl = document.getElementById('sheet-dim');
+    if(dimEl){
+      dimEl.addEventListener('click', closeSheets);
+    }
+    document.addEventListener('click', event => {
+      const closeBtn = event.target.closest('[data-close]');
+      if(closeBtn){
+        closeSheets();
+        return;
+      }
+      const openBtn = event.target.closest('[data-open]');
+      if(openBtn){
+        const id = openBtn.getAttribute('data-open');
+        if(id) openSheet(id);
+        return;
+      }
+      const addBtn = event.target.closest('[data-add-to-cart]');
+      if(addBtn){
+        addToCart(addBtn.getAttribute('data-add-to-cart'));
+        return;
+      }
+      const removeBtn = event.target.closest('[data-remove]');
+      if(removeBtn){
+        removeFromCart(removeBtn.getAttribute('data-remove'));
+        return;
+      }
+    });
+  }
+
+  function initAuth(){
+    const loginForm = document.getElementById('form-login');
+    const registerForm = document.getElementById('form-register');
+    if(loginForm){
+      loginForm.addEventListener('submit', event => {
+        event.preventDefault();
+        setProfile();
+        closeSheets();
+      });
+    }
+    if(registerForm){
+      registerForm.addEventListener('submit', event => {
+        event.preventDefault();
+        setProfile();
+        closeSheets();
+      });
+    }
+    const openAuth = document.getElementById('open-auth');
+    if(openAuth){
+      openAuth.addEventListener('click', () => openSheet('sheet-auth'));
+    }
+    const openCart = document.getElementById('open-cart');
+    if(openCart){
+      openCart.addEventListener('click', () => openSheet('sheet-cart'));
+    }
+    const goCheckout = document.getElementById('go-checkout');
+    if(goCheckout){
+      goCheckout.addEventListener('click', () => openSheet('sheet-auth'));
+    }
+  }
+
+  function initEstimator(){
+    const heroEst = document.getElementById('hero-est');
+    if(heroEst){
+      const sample = computeEstimate({ price: 150, currency: 'USD', cat: 'electronics', country: 'US' });
+      heroEst.textContent = 'DKK ' + sample.total.toLocaleString('da-DK');
+    }
+    const form = document.getElementById('est-form');
+    if(!form) return;
+    form.addEventListener('submit', event => {
+      event.preventDefault();
+      const price = Number(document.getElementById('est-price')?.value || 0);
+      const currency = document.getElementById('est-currency')?.value || 'DKK';
+      const cat = document.getElementById('est-cat')?.value || 'electronics';
+      const country = document.getElementById('est-country')?.value || 'EU';
+      const result = computeEstimate({ price, currency, cat, country });
+      const totalEl = document.getElementById('est-total');
+      const noteEl = document.getElementById('est-note');
+      const highlightEl = document.getElementById('est-highlight-main');
+      if(totalEl) totalEl.textContent = 'DKK ' + result.total.toLocaleString('da-DK');
+      if(noteEl) noteEl.textContent = result.note;
+      if(highlightEl) highlightEl.textContent = '• ' + result.highlight;
+    });
+  }
+
+  function initLanding(){
+    renderFeatured();
+    renderStores(filterStoresByCountry(''));
+    renderProducts(filterProductsByCountry(''));
+    renderVideoGuides('');
+    updateCountryLink('');
+    setActiveChip('');
+    autoScrollRow('row-stores', 3200);
+    autoScrollRow('row-rare', 3400);
+    const searchForm = document.getElementById('search-form');
+    if(searchForm){
+      searchForm.addEventListener('submit', handleSearch);
+    }
+    const chips = document.getElementById('country-chips');
+    if(chips){
+      chips.addEventListener('click', handleChipClick);
+    }
+  }
+
+  function initCountryPage(slug){
+    const normalized = slug || document.body.dataset.country || '';
+    state.currentCountry = normalized;
+    const heading = document.getElementById('country-heading');
+    const description = document.getElementById('country-description');
+    const country = COUNTRY_LINKS[normalized];
+    if(country && heading){
+      heading.textContent = `${country.flag || ''} ${country.name}`;
+    }
+    if(description && country){
+      const sampleStore = STORES.find(store => store.countrySlug === normalized);
+      description.textContent = sampleStore
+        ? `Shop direkte fra ${sampleStore.country} – vi viser totalprisen og håndterer papirarbejdet for dig.`
+        : `Shop direkte fra ${country.name} med Selekti.`;
+    }
+    renderStores(filterStoresByCountry(normalized));
+    renderProducts(filterProductsByCountry(normalized));
+    renderVideoGuides(normalized);
+    autoScrollRow('row-stores', 3200);
+    autoScrollRow('row-rare', 3400);
+  }
+
+  function initInfoPage(){
+    renderVideoGuides('');
+  }
+
+  function initCommon(){
+    document.querySelectorAll('#year').forEach(node => {
+      node.textContent = new Date().getFullYear();
+    });
+    initSheets();
+    initAuth();
+    renderCart();
+    initEstimator();
+  }
+
+  function init(){
+    initCommon();
+    const page = document.body.dataset.page || 'landing';
+    switch(page){
+      case 'landing':
+        initLanding();
+        break;
+      case 'country':
+        initCountryPage(document.body.dataset.country);
+        break;
+      case 'info':
+        initInfoPage();
+        break;
+      case 'partners':
+        renderVideoGuides('');
+        break;
+      default:
+        initLanding();
+    }
+  }
+
+  document.addEventListener('DOMContentLoaded', init);
+
+})(window, document);
