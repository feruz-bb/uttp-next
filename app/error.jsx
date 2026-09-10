'use client';

import { useEffect } from 'react';
import Link from 'next/link';

// Segment xatosi (React error boundary) — kabinet qobig'isiz, --bg fonida markazlashgan .card.
// Next 16.3: retry() bo'limni qayta yuklab chizadi; reset() eski API (zaxira sifatida qabul qilinadi).
export default function Xato({ error, retry, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const qaytaUrin = retry || reset;

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--bg)',
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: 440, textAlign: 'center' }} role="alert">
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--danger)',
          }}
        >
          Xatolik
        </div>
        <h1 style={{ margin: '8px 0 6px', fontSize: 22, lineHeight: 1.2, fontWeight: 700, letterSpacing: '-0.3px' }}>
          Sahifani ochib bo‘lmadi
        </h1>
        <p style={{ margin: '0 0 20px', color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.5 }}>
          Kutilmagan xatolik yuz berdi. Qayta urinib ko‘ring; takrorlansa yordam markaziga (1003) murojaat qiling.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="btn" onClick={() => qaytaUrin?.()}>
            Qayta urinish
          </button>
          <Link href="/" className="btn btn--ghost">
            Bosh sahifaga
          </Link>
        </div>
        {error?.digest && (
          <div style={{ marginTop: 14, fontSize: 11, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
            Xato kodi: {error.digest}
          </div>
        )}
      </div>
    </main>
  );
}
