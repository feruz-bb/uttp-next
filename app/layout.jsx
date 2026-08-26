import './globals.css';
import './tipme-login.css';

export const metadata = {
  title: 'ETTP — Elektron tibbiy ta‘lim platformasi',
  description: 'O‘zbekiston Respublikasi Sog‘liqni saqlash vazirligi Tibbiyot xodimlari monitoringi va uzluksiz kasbiy ta‘lim milliy platformasi',
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: brauzer kengaytmalari (masalan Night Eye) html'ga
    // atribut qo'shib hydration-mismatch ogohlantirishini keltirib chiqaradi —
    // bu faqat shu elementning atribut farqlarini jim qiladi
    <html lang="uz" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
