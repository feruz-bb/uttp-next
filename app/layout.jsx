import './globals.css';
import './tipme-login.css';

export const metadata = {
  title: 'ETTP — Elektron tibbiy ta‘lim platformasi',
  description: 'O‘zbekiston Respublikasi Sog‘liqni saqlash vazirligi Tibbiyot xodimlari monitoringi va uzluksiz kasbiy ta‘lim milliy platformasi',
};

// Masshtab: kabinet qobig'i (KabinetShell) hujjatga 80% zoom qo'yadi. Buni hydration'dan OLDIN
// qo'ymasak sahifa avval 100%da chiziladi, keyin kichrayadi (reflow/«sakrash»). Qiymatlar KabinetShell
// ZOOM bilan bir xil: zoom '80%' va --zoom '0.8'. Faqat KabinetShell mount bo'ladigan segmentlarda
// (/dashboard, /profile, /admin — app/*/layout.jsx) qo'llanadi: login, ildiz, 404 va xato sahifalari
// qobiqsiz, shuning uchun to'liq o'lchamda qoladi (ularda zoomni tozalaydigan effekt yo'q).
// KabinetShell'ning effekti idempotent — shu qiymatlarni qayta yozmaydi.
const ZOOM_SKRIPT =
  "(function(){try{if(/^\\/(dashboard|profile|admin)(\\/|$)/.test(location.pathname)){var s=document.documentElement.style;s.zoom='80%';s.setProperty('--zoom','0.8');}}catch(e){}})();";

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: brauzer kengaytmalari (masalan Night Eye) html'ga
    // atribut qo'shib hydration-mismatch ogohlantirishini keltirib chiqaradi —
    // bu faqat shu elementning atribut farqlarini jim qiladi (yuqoridagi zoom skripti
    // qo'ygan style atributi ham shu tufayli ogohlantirish bermaydi)
    <html lang="uz" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ZOOM_SKRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router ildiz layout: shrift barcha sahifalarga yuklanadi (qoida Pages Router _document uchun) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* tipme-login.css ikonkalar uchun (fa fa-user, fa-lock ...) */}
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
