'use client';

import { useState } from 'react';

export default function KontaktPageClient() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold">Kontakt</h1>
      <p className="text-slate-600">Har du spørgsmål om produkterne? Skriv til os her.</p>

      {submitted ? (
        <p className="rounded-lg border bg-white p-4 font-semibold text-green-700">Tak for din besked!</p>
      ) : (
        <form
          className="space-y-3 rounded-xl border bg-white p-5"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
        >
          <input required className="w-full rounded border px-3 py-2" placeholder="Navn" />
          <input required type="email" className="w-full rounded border px-3 py-2" placeholder="Email" />
          <textarea required className="w-full rounded border px-3 py-2" rows={5} placeholder="Besked" />
          <button type="submit" className="rounded-lg bg-brand px-5 py-2 font-semibold text-white">
            Send
          </button>
        </form>
      )}
    </section>
  );
}
