# MinWebshop (Next.js + Tailwind)

Fuldt funktionel, simpel webshop uden betaling.

## Funktioner
- Forside med hero + udvalgte produkter
- Produkter-side med grid, søgning og filtrering
- Produkt-side med billeder, beskrivelse og **Tilføj til kurv**
- Kurv med tilføj/fjern/ændre antal (gemmes i `localStorage`)
- Admin-side med opret/rediger/slet produkter
- Produkter gemmes i JSON-fil (`data/products.json`) via API-routes
- Mobilvenligt design
- SEO metadata (`title` + `description`)

## Projektstruktur

```txt
app/
  admin/page.js
  api/products/route.js
  api/products/[id]/route.js
  cart/page.js
  products/page.js
  products/[id]/page.js
  globals.css
  layout.js
  page.js
components/
  AddToCartButton.js
  AdminPanel.js
  Footer.js
  Header.js
  ProductCard.js
  ProductFilters.js
data/
  products.json
lib/
  cart-context.js
  products.js
public/
  images/
```

## Start på Windows
1. Åbn PowerShell eller CMD i projektmappen.
2. Kør:

```bash
npm install
npm run dev
```

3. Åbn browser på:

```txt
http://localhost:3000
```

## Hvor ændrer jeg produkter og billeder?

### Hurtigst (for ikke-udvikler)
- Gå til `http://localhost:3000/admin`
- Opret/redigér/slet produkter i formularen
- Billeder indsættes som URL’er (én eller flere, adskilt med komma)

### Direkte i fil
- Redigér `data/products.json`
- Hvert produkt har felter som:
  - `name`
  - `price`
  - `category`
  - `description`
  - `images` (liste af billed-URL’er)
  - `featured` (`true/false` for forsiden)

## Vigtigt
Denne løsning har ingen betaling og ingen database, så den er god til at komme hurtigt i gang lokalt.
