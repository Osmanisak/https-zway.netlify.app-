import AdminPanel from '@/components/AdminPanel';

export const metadata = {
  title: 'Admin | MinWebshop',
  description: 'Opret, redigér og slet produkter i webshoppen.'
};

export default function AdminPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Admin</h1>
      <p className="text-slate-600">Administrér produkter i JSON-filen via dette panel.</p>
      <AdminPanel />
    </section>
  );
}
