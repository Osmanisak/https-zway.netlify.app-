const FX = {
  USD: 7.0,
  EUR: 7.45,
  GBP: 8.6,
  JPY: 0.05,
  KRW: 0.0053,
  CNY: 1.05,
  INR: 0.085,
  DKK: 1
};

const DEFAULTS = {
  itemDKK: 1200,
  weightKg: 1.0,
  currency: 'USD'
};

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'METHOD_NOT_ALLOWED' }) };
  }
  try {
    const payload = JSON.parse(event.body || '{}');
    if (!payload.url) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'MISSING_URL' }) };
    }
    const detected = detectFromUrl(payload.url);
    const estimate = computeEstimate(detected);
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, detected, estimate, notes: ['Estimat. Endelig pris bekræftes på mail.'] })
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'SERVER_ERROR' }) };
  }
};

function detectFromUrl(url) {
  const u = new URL(url);
  const host = u.hostname.toLowerCase();
  const detected = {
    title: host,
    url,
    images: [],
    priceOriginal: { amount: DEFAULTS.itemDKK, currency: DEFAULTS.currency },
    priceDKK: DEFAULTS.itemDKK,
    zone: 'US',
    weightKg: DEFAULTS.weightKg
  };
  if (host.includes('apple')) {
    detected.title = 'Apple Store produkt';
    detected.priceOriginal = { amount: 499, currency: 'GBP' };
    detected.zone = 'UK';
    detected.weightKg = 0.9;
  } else if (host.includes('bhphotovideo') || host.includes('b-h')) {
    detected.title = 'B&H Photo produkt';
    detected.priceOriginal = { amount: 799, currency: 'USD' };
    detected.zone = 'US';
    detected.weightKg = 1.8;
  } else if (host.includes('uniqlo')) {
    detected.title = 'UNIQLO Japan produkt';
    detected.priceOriginal = { amount: 8990, currency: 'JPY' };
    detected.zone = 'JP';
    detected.weightKg = 0.5;
  } else if (host.includes('oliveyoung')) {
    detected.title = 'Olive Young K-Beauty';
    detected.priceOriginal = { amount: 32000, currency: 'KRW' };
    detected.zone = 'KR';
    detected.weightKg = 0.3;
  } else if (host.includes('tmall') || host.includes('aliexpress')) {
    detected.title = 'Marketplace produkt';
    detected.priceOriginal = { amount: 899, currency: 'CNY' };
    detected.zone = 'CN';
    detected.weightKg = 2.0;
  } else if (host.includes('croma')) {
    detected.title = 'Croma elektronik';
    detected.priceOriginal = { amount: 12999, currency: 'INR' };
    detected.zone = 'IN';
    detected.weightKg = 3.2;
  }
  detected.priceDKK = Math.round(convertToDKK(detected.priceOriginal.amount, detected.priceOriginal.currency));
  return detected;
}

function convertToDKK(amount, currency) {
  const rate = FX[currency] || 1;
  return amount * rate;
}

function computeEstimate(detected) {
  const itemDKK = detected.priceDKK || DEFAULTS.itemDKK;
  const freight = freightForZone(detected.zone, detected.weightKg);
  const service = Math.max(Math.round(itemDKK * 0.12), 49);
  const duty = Math.round(0.03 * (itemDKK + freight));
  const vatRate = zoneVat(detected.zone);
  const vat = Math.round(vatRate * (itemDKK + freight + duty + service));
  const totalDKK = Math.round(itemDKK + freight + service + duty + vat);
  return {
    itemDKK: Math.round(itemDKK),
    freightDKK: freight,
    serviceDKK: service,
    dutyDKK: duty,
    vatDKK: vat,
    totalDKK
  };
}

function freightForZone(zone, weightKg) {
  const weights = [0.5, 1, 2, 5, 10, 15];
  const tables = {
    EU: [79, 99, 129, 199, 299, 399],
    UK: [99, 129, 179, 259, 359, 499],
    US: [129, 169, 219, 329, 479, 699],
    JP: [129, 169, 229, 339, 499, 749],
    KR: [129, 169, 229, 339, 499, 749],
    CN: [129, 169, 229, 339, 499, 749],
    IN: [139, 179, 239, 359, 519, 799]
  };
  const table = tables[zone] || tables.US;
  const idx = weights.findIndex(limit => weightKg <= limit);
  return table[idx >= 0 ? idx : table.length - 1];
}

function zoneVat(zone) {
  switch (zone) {
    case 'EU':
      return 0.25;
    case 'UK':
      return 0.2;
    case 'JP':
    case 'KR':
      return 0.1;
    case 'CN':
      return 0.13;
    case 'IN':
      return 0.18;
    default:
      return 0.25;
  }
}
