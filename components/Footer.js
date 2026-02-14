export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-white">
      <div className="container-default py-8 text-sm text-slate-600">
        © {new Date().getFullYear()} MinWebshop. Lavet med Next.js + Tailwind.
      </div>
    </footer>
  );
}
