const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const SHIPPING_CONFIG = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../data/shipping-config.json'), 'utf8')
);

const EXCHANGE_RATES = {
  DKK: 1,
  USD: 6.85,
  EUR: 7.45,
  GBP: 8.65,
  JPY: 0.051,
  CNY: 0.98,
  KRW: 0.0053,
  INR: 0.083,
  HKD: 0.88,
  SGD: 5.1,
  AUD: 4.5,
  CAD: 5.0
};

const ZONE_FALLBACK_CURRENCY = {
  EU: 'EUR',
  UK: 'GBP',
  US: 'USD',
  JP: 'JPY',
  KR: 'KRW',
  CN: 'CNY',
  IN: 'INR'
};

const WEIGHT_RULES = [
  { pattern: /(sneaker|shoe|trainer|boot)/i, weight: 1.2 },
  { pattern: /(laptop|macbook|notebook)/i, weight: 2.4 },
  { pattern: /(headphone|headset|airpods|earbud)/i, weight: 0.6 },
  { pattern: /(camera|lens|gimbal)/i, weight: 1.5 },
  { pattern: /(hoodie|jacket|coat)/i, weight: 0.9 },
  { pattern: /(t[- ]?shirt|tee|shirt)/i, weight: 0.3 },
  { pattern: /(bag|backpack|tote)/i, weight: 1 },
  { pattern: /(beauty|serum|skincare|cream|lotion)/i, weight: 0.4 }
];

const ZONE_HINTS = [
  { match: /\.co\.jp$|\.jp$/i, zone: 'JP' },
  { match: /\.co\.uk$|\.uk$/i, zone: 'UK' },
  { match: /\.com\.hk$|\.hk$/i, zone: 'CN' },
  { match: /\.kr$/i, zone: 'KR' },
  { match: /\.cn$/i, zone: 'CN' },
  { match: /\.in$/i, zone: 'IN' },
  { match: /\.de$|\.fr$|\.it$|\.es$|\.se$|\.dk$/i, zone: 'EU' },
  { match: /\.us$|\.com$/i, zone: 'US' }
];

const FETCH_TIMEOUT = 6500;

exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (err) {
    return jsonResponse({ ok: false, error: 'INVALID_BODY' });
  }

  const urlInput = typeof payload.url === 'string' ? payload.url.trim() : '';
  if (!urlInput) {
    return jsonResponse({ ok: false, error: 'MISSING_URL' });
  }

  let parsed;
  try {
    parsed = new URL(urlInput);
  } catch (err) {
    return jsonResponse({ ok: false, error: 'INVALID_URL' });
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return jsonResponse({ ok: false, error: 'INVALID_URL' });
  }

  let zone = typeof payload.zone === 'string' ? payload.zone.trim().toUpperCase() : '';
  if (!zone || !isValidZone(zone)) {
    zone = detectZone(parsed.hostname) || 'US';
  }

  let html = '';
  try {
    html = await fetchHtml(parsed.href);
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message || 'NETWORK' });
  }

  const title = extractTitle(html) || parsed.hostname;
  const siteName = extractMeta(html, ['og:site_name', 'application-name']) || parsed.hostname;
  const image = extractImage(html);
  const priceInfo = extractPrice(html);

  if (!priceInfo) {
    return jsonResponse({ ok: false, error: 'UNREADABLE_PAGE' });
  }

  const currency = (priceInfo.currency || ZONE_FALLBACK_CURRENCY[zone] || 'USD').toUpperCase();
  const amount = priceInfo.amount;
  const priceDKK = convertToDKK(amount, currency);
  const weightKg = guessWeight(title);

  const estimate = computeEstimate(priceDKK, weightKg, zone);
  const response = {
    ok: true,
    detected: {
      title,
      priceOriginal: { amount: roundTo(amount, 2), currency },
      priceDKK: Math.round(priceDKK),
      images: image ? [image] : [],
      store: siteName,
      zone,
      weightKg
    },
    estimate,
    notes: ['Automatisk estimat. Endelig pris bekræftes via mail.']
  };

  return jsonResponse(response);
};

function jsonResponse(body) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body)
  };
}

function isValidZone(zone) {
  return SHIPPING_CONFIG.zones.some(entry => entry.code === zone);
}

function detectZone(hostname) {
  if (!hostname) return '';
  for (const hint of ZONE_HINTS) {
    if (hint.match.test(hostname)) return hint.zone;
  }
  return '';
}

async function fetchHtml(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SelektiBot/0.1 (+https://selekti.dk)'
      }
    });
    if (!res.ok) {
      throw new Error('UNREADABLE_PAGE');
    }
    return await res.text();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('TIMEOUT');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

function extractMeta(html, names) {
  for (const name of names) {
    const regex = new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)`, 'i');
    const match = html.match(regex);
    if (match) return decode(match[1]);
  }
  return '';
}

function extractTitle(html) {
  return extractMeta(html, ['og:title', 'twitter:title']) ||
    (html.match(/<title>([^<]+)<\/title>/i) ? decode(html.match(/<title>([^<]+)<\/title>/i)[1]) : '');
}

function extractImage(html) {
  return extractMeta(html, ['og:image', 'twitter:image']);
}

function extractPrice(html) {
  const metaAmount = extractMeta(html, ['product:price:amount', 'og:price:amount', 'twitter:data1']);
  if (metaAmount) {
    const currency = extractMeta(html, ['product:price:currency', 'og:price:currency', 'twitter:label1']);
    const amount = normaliseNumber(metaAmount);
    if (amount) return { amount, currency: currency || '' };
  }

  const jsonPrice = extractJsonPrice(html);
  if (jsonPrice) return jsonPrice;

  const symbolMatch = html.match(/(\$|£|€|¥|₩|₹)\s?(\d[\d.,]*)/);
  if (symbolMatch) {
    const symbol = symbolMatch[1];
    const amount = normaliseNumber(symbolMatch[2]);
    const currency = symbolToCurrency(symbol);
    if (amount) return { amount, currency };
  }

  return null;
}

function extractJsonPrice(html) {
  try {
    const matches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
    if (!matches) return null;
    for (const script of matches) {
      const jsonText = script.replace(/<script type="application\/ld\+json">/i, '').replace(/<\/script>/i, '');
      const data = JSON.parse(jsonText.trim());
      const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers || data;
      if (offer && offer.price) {
        const amount = normaliseNumber(String(offer.price));
        if (amount) {
          return { amount, currency: offer.priceCurrency || '' };
        }
      }
    }
  } catch (err) {
    return null;
  }
  return null;
}

function symbolToCurrency(symbol) {
  switch (symbol) {
    case '$': return 'USD';
    case '£': return 'GBP';
    case '€': return 'EUR';
    case '¥': return 'JPY';
    case '₩': return 'KRW';
    case '₹': return 'INR';
    default: return 'USD';
  }
}

function normaliseNumber(value) {
  if (!value) return 0;
  const clean = String(value).replace(/[^0-9.,]/g, '');
  if (!clean) return 0;
  if (clean.includes(',') && clean.includes('.')) {
    if (clean.lastIndexOf('.') > clean.lastIndexOf(',')) {
      return parseFloat(clean.replace(/,/g, ''));
    }
    return parseFloat(clean.replace(/\./g, '').replace(',', '.'));
  }
  if (clean.includes(',')) {
    const parts = clean.split(',');
    if (parts[1] && parts[1].length === 3) {
      return parseFloat(clean.replace(/,/g, ''));
    }
    return parseFloat(clean.replace(',', '.'));
  }
  return parseFloat(clean);
}

function convertToDKK(amount, currency) {
  const rate = EXCHANGE_RATES[currency] || 1;
  return amount * rate;
}

function guessWeight(title) {
  if (!title) return 1;
  for (const rule of WEIGHT_RULES) {
    if (rule.pattern.test(title)) return rule.weight;
  }
  return 1;
}

function computeEstimate(itemDKK, weightKg, zoneCode) {
  const zone = SHIPPING_CONFIG.zones.find(entry => entry.code === zoneCode) || SHIPPING_CONFIG.zones[0];
  const weights = SHIPPING_CONFIG.weights || [];
  const freightTable = SHIPPING_CONFIG.freight[zoneCode] || SHIPPING_CONFIG.freight[zone.code] || [];
  const index = weights.findIndex(limit => weightKg <= limit);
  const freight = freightTable[index >= 0 ? index : freightTable.length - 1] || 0;
  const serviceRaw = itemDKK * (SHIPPING_CONFIG.service.rate || 0.12);
  const service = Math.max(Math.round(serviceRaw), SHIPPING_CONFIG.service.minDKK || 49);
  const duty = Math.round((itemDKK + freight) * (zone.dutyDefault ?? 0.03));
  const vat = Math.round((itemDKK + freight + duty + service) * (zone.vat ?? 0.25));
  const total = Math.round(itemDKK + freight + duty + vat + service);
  return {
    zoneCode: zone.code,
    itemDKK: Math.round(itemDKK),
    freightDKK: freight,
    serviceDKK: service,
    dutyDKK: duty,
    vatDKK: vat,
    totalDKK: total
  };
}

function decode(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function roundTo(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
