import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartProvider } from '@/lib/cart-context';

export const metadata = {
  title: 'MinWebshop | Enkel webshop i Next.js',
  description: 'Mobilvenlig webshop med produkter, kurv og admin bygget i Next.js + Tailwind.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="da">
      <body>
        <CartProvider>
          <Header />
          <main className="container-default py-10">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
