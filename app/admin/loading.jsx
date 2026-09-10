// Segment yuklanayotganda (Suspense fallback) ko'rsatiladigan skelet: PageHead balandligidagi
// sarlavha bloki + 4 ta stat-karta o'rni. .skeleton sinflari — app/globals.css oxiridagi bo'lim.
// KabinetShell (layout) saqlanib qoladi, shuning uchun bu faqat .glass-page ichidagi kontent o'rni.
export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="skeleton__sr">Sahifa yuklanmoqda…</span>
      <div className="page-head" aria-hidden="true">
        <div className="page-head__main">
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--text" />
        </div>
      </div>
      <div className="grid stat-grid" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div className="stat" key={i}>
            <div className="skeleton skeleton--label" />
            <div className="skeleton skeleton--value" />
          </div>
        ))}
      </div>
    </div>
  );
}
