# AutoGadget Shop (Next.js + Tailwind)

Lille webshop-hjemmeside uden betaling med 8 bil-gadgets.

## Funktioner
- Forside med hero og **Populære produkter** (viser 4)
- `/produkter` med produkt-grid og søgning
- `/produkt/[slug]` med galleri, pris, highlights, **Tilføj til kurv** og **Køb nu** (link til `/kurv`)
- `/kurv` med ændre antal, fjern og subtotal
- `/kontakt` med simpel formular, der viser “Tak for din besked!” (ingen backend)
- Kurv gemmes i `localStorage`
- Mobilvenligt design
- SEO title/description pr. side
- Ingen database (produkter i JSON)

## Filstruktur
```txt
app/
  globals.css
  layout.js
  page.js
  kontakt/page.js
  kurv/page.js
  produkt/[slug]/page.js
  produkter/page.js
components/
  AddToCartButton.js
  CartPageClient.js
  Footer.js
  Header.js
  KontaktPageClient.js
  ProductCard.js
  ProductFilters.js
lib/
  cart-context.js
  products.js
public/
  products/
src/
  data/products.json
```

## Start på Windows
Åbn PowerShell i projektmappen og kør:

```bash
npm install
npm run dev
```

Åbn derefter:

```txt
http://localhost:3000
```

## Hvor ændrer jeg produkter?
- Redigér: `src/data/products.json`
- Hvert produkt har fx felter: `slug`, `name`, `price`, `shortDescription`, `description`, `highlights`, `popular`, `images`

## Hvor ændrer jeg billeder?
- Læg billeder i: `public/products/`
- Henvis i JSON med stier som fx: `/products/dashcam-pro.svg`

## Bemærk
Der er **ingen betaling** endnu. “Køb nu” sender brugeren til kurv-siden.
