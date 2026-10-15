export default function Loading() {
  return (
    <main className="route-loading" aria-busy="true" aria-live="polite">
      <div className="route-loading__content">
        <span className="route-loading__eyebrow">PUSPITA × RIPITA</span>
        <span className="route-loading__title">Menyiapkan halaman…</span>
        <span className="route-loading__line" aria-hidden="true" />
      </div>
    </main>
  );
}
