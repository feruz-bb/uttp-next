import Link from 'next/link';

// 404 — kabinet qobig'isiz, --bg fonida markazlashgan .card. Mavjud .btn/.card sinflari va tokenlar.
export default function NotFound() {
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
      <div className="card" style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--primary-dark)',
          }}
        >
          404
        </div>
        <h1 style={{ margin: '8px 0 6px', fontSize: 22, lineHeight: 1.2, fontWeight: 700, letterSpacing: '-0.3px' }}>
          Sahifa topilmadi
        </h1>
        <p style={{ margin: '0 0 20px', color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.5 }}>
          So‘ralgan manzil mavjud emas yoki ko‘chirilgan. Manzilni tekshiring yoki bosh sahifaga qayting.
        </p>
        <Link href="/" className="btn">
          Bosh sahifaga
        </Link>
      </div>
    </main>
  );
}
