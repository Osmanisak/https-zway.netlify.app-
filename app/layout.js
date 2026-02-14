import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartProvider } from '@/lib/cart-context';

export const metadata = {
  title: 'AutoGadget Shop | Smarte produkter til biler',
  description:
    'Lille webshop med smarte bil-gadgets: dashcams, OBD2 scannere, CarPlay adaptere og mere.'
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
