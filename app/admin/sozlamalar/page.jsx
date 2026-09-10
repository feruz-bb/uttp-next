'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHead, Card, SectionHead, Badge } from '../../../components/ui.jsx';
import Icon from '../../../components/icons.jsx';
import { getSozlamalar, saqlaSozlama, SOZLAMA_STANDART } from '../../../lib/data-service';

// Super admin — tizim sozlamalari va barcha xususiyatlar bir oynada.
const ROLLAR = [
  { key: 'admin', nom: 'Super admin' },
  { key: 'vazirlik', nom: 'Vazirlik' },
  { key: 'xodim', nom: 'Tibbiyot xodimi' },
];

const XUSUSIYATLAR = [
  { href: '/elonlar', icon: 'megaphone', t: 'Ilm-fan va innovatsiyalar (story-e‘lonlar)', d: 'E‘lon joylash, tahrirlash, arxivlash, kim ko‘rganini ko‘rish' },
  { href: '/admin/xodimlar', icon: 'users', t: 'Xodimlar boshqaruvi (CRUD)', d: 'Yangi xodim qo‘shish, tahrirlash va o‘chirish' },
  { href: '/admin/klassifikatorlar', icon: 'registry', t: 'Yo‘nalishlar va hududlar', d: 'Klassifikatorlar va ma‘lumotlar bazasi' },
  { href: '/dashboard', icon: 'chart', t: 'Tahlil paneli', d: 'Vazirlik ko‘rinishidagi statistika — 5 tab' },
  { href: '/admin', icon: 'laptop', t: 'Ma‘lumotlar bazasi hajmi', d: 'Jadvallar va hisoblar inventari' },
];

export default function SozlamalarPage() {
  const [s, setS] = useState(null);
  const [xabar, setXabar] = useState('');
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);

  useEffect(() => {
    getSozlamalar().then(setS);
  }, []);

  const oz = (k, v) => setS((x) => ({ ...x, [k]: v }));
  const rolAlmashtir = (rol) =>
    setS((x) => {
      const r = new Set(Array.isArray(x.story_kim_qosha_oladi) ? x.story_kim_qosha_oladi : SOZLAMA_STANDART.story_kim_qosha_oladi);
      if (r.has(rol)) r.delete(rol);
      else r.add(rol);
      if (!r.has('admin')) r.add('admin'); // admin doim qo'sha oladi
      return { ...x, story_kim_qosha_oladi: [...r] };
    });

  const saqla = async () => {
    setSaqlanmoqda(true);
    setXabar('');
    const natijalar = await Promise.all([
      saqlaSozlama('storylar_yoqilgan', !!s.storylar_yoqilgan, 'Story-e‘lonlar lentasi barcha kabinetlarda ko‘rsatiladimi'),
      saqlaSozlama('story_davomiyligi', Math.min(30, Math.max(2, Number(s.story_davomiyligi) || 6)), 'Bitta story avtomatik o‘tish vaqti, soniya'),
      saqlaSozlama('story_muddat_kun', Math.max(0, Number(s.story_muddat_kun) || 0), 'Yangi e‘lon standart amal muddati, kun (0 = muddatsiz)'),
      saqlaSozlama('story_kim_qosha_oladi', s.story_kim_qosha_oladi, 'E‘lon joylash huquqiga ega rollar'),
    ]);
    setSaqlanmoqda(false);
    const xato = natijalar.find((n) => !n.ok);
    setXabar(xato ? `Saqlanmadi: ${xato.error}` : 'Sozlamalar saqlandi.');
    if (!xato) setTimeout(() => setXabar(''), 3000);
  };

  return (
    <>
      <PageHead
        breadcrumb={[{ label: 'Bosh sahifa', href: '/' }, { label: 'Boshqaruv paneli', href: '/admin' }, { label: 'Sozlamalar' }]}
        title="Tizim sozlamalari"
        badge={<Badge tone="violet">Super admin</Badge>}
        subtitle="Story-e‘lonlar, ruxsatlar va platforma xususiyatlarini boshqarish"
        actions={
          <button type="button" className="btn" onClick={saqla} disabled={!s || saqlanmoqda}>
            {saqlanmoqda ? 'Saqlanmoqda…' : 'Saqlash'}
          </button>
        }
      />

      {xabar && <div className="auth-error" role="status" style={{ marginBottom: 12 }}>{xabar}</div>}

      <div className="grid cols-2" style={{ gap: 24, alignItems: 'start', marginBottom: 24 }}>
        <Card title="Story-e‘lonlar" subtitle="Instagram uslubidagi lenta — barcha kabinetlarda">
          {!s ? (
            <p style={{ color: 'var(--muted)' }}>Yuklanmoqda…</p>
          ) : (
            <div className="sozlama-royxat">
              <label className="sozlama-qator">
                <span>
                  <b>Lenta yoqilgan</b>
                  <small>O‘chirilsa story lentasi hech kimga ko‘rinmaydi; e‘lonlar saqlanib qoladi.</small>
                </span>
                <input type="checkbox" checked={!!s.storylar_yoqilgan} onChange={(e) => oz('storylar_yoqilgan', e.target.checked)} />
              </label>
              <label className="sozlama-qator">
                <span>
                  <b>Bitta story davomiyligi</b>
                  <small>Avtomatik keyingisiga o‘tish vaqti, soniya (2–30).</small>
                </span>
                <input className="inp inp--qisqa" type="number" min={2} max={30} value={s.story_davomiyligi} onChange={(e) => oz('story_davomiyligi', e.target.value)} />
              </label>
              <label className="sozlama-qator">
                <span>
                  <b>Standart amal muddati</b>
                  <small>Yangi e‘lon necha kun faol turadi (0 — muddatsiz).</small>
                </span>
                <input className="inp inp--qisqa" type="number" min={0} max={365} value={s.story_muddat_kun} onChange={(e) => oz('story_muddat_kun', e.target.value)} />
              </label>
              <div className="sozlama-qator">
                <span>
                  <b>Kim e‘lon joylay oladi</b>
                  <small>Super admin doim ruxsatga ega.</small>
                </span>
                <span className="sozlama-rollar">
                  {ROLLAR.map((r) => (
                    <label key={r.key} className="sozlama-rol">
                      <input
                        type="checkbox"
                        checked={(s.story_kim_qosha_oladi || []).includes(r.key)}
                        disabled={r.key === 'admin'}
                        onChange={() => rolAlmashtir(r.key)}
                      />
                      {r.nom}
                    </label>
                  ))}
                </span>
              </div>
            </div>
          )}
        </Card>

        <Card title="Ruxsatlar matritsasi" subtitle="rol → nima ko‘radi va boshqaradi">
          <table className="tbl tbl--kichik">
            <thead>
              <tr><th scope="col">Xususiyat</th><th scope="col">Admin</th><th scope="col">Vazirlik</th><th scope="col">Xodim / Talaba</th></tr>
            </thead>
            <tbody>
              <tr><td>Story-e‘lonlarni ko‘rish</td><td>✓</td><td>✓</td><td>✓</td></tr>
              <tr><td>E‘lon joylash / tahrirlash</td><td>✓</td><td>{(s?.story_kim_qosha_oladi || []).includes('vazirlik') ? '✓' : '—'}</td><td>{(s?.story_kim_qosha_oladi || []).includes('xodim') ? '✓' : '—'}</td></tr>
              <tr><td>Kim ko‘rganini ko‘rish</td><td>✓</td><td>✓</td><td>—</td></tr>
              <tr><td>Tahlil paneli</td><td>✓</td><td>✓</td><td>—</td></tr>
              <tr><td>Xodimlar CRUD</td><td>✓</td><td>ko‘rish</td><td>—</td></tr>
              <tr><td>Sozlamalar</td><td>✓</td><td>—</td><td>—</td></tr>
            </tbody>
          </table>
        </Card>
      </div>

      <SectionHead title="Barcha xususiyatlar" extra="bir oynadan boshqaruv" />
      <div className="grid cols-2" style={{ gap: 18 }}>
        {XUSUSIYATLAR.map((h) => {
          const IconCmp = Icon[h.icon] || Icon.folder;
          return (
            <Link key={h.href} href={h.href} className="card row-click" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <span className="stat__ico" style={{ color: 'var(--primary-dark)' }}><IconCmp width={22} height={22} /></span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontWeight: 600, fontSize: 15 }}>{h.t}</span>
                <span style={{ display: 'block', fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{h.d}</span>
              </span>
              <span style={{ color: 'var(--muted)' }}>→</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
