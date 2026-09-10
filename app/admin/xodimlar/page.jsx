'use client';

import { useState, useEffect, useMemo } from 'react';
import { PageHead, Card, Badge, DataTable, GlassModal, HUDUDLAR } from '../../../components/ui.jsx';
import { getProfiles, yangilaProfil, ochirProfil } from '../../../lib/data-service';
import { supabaseSozlanganmi } from '../../../lib/auth';

// Hudud ro'yxati — components/ui.jsx HUDUDLAR (kabinet «Hudud» qatori bilan bitta manba)

const STAGES = [
  { id: 'chuqurlashtirilgan_sinf', label: 'Chuqurlashtirilgan sinf' },
  { id: 'texnikum', label: 'Texnikum' },
  { id: 'bakalavr', label: 'Bakalavriat' },
  { id: 'magistr', label: 'Magistratura' },
  { id: 'rezidentura', label: 'Klinik ordinatura (rezidentura)' },
  { id: 'doktor', label: 'Doktor (Shifokorlik)' },
  { id: 'doktorantura', label: 'Doktorantura (PhD/DSc)' },
];

// Rol nishonchasi: inson o'qiydigan nom + tint (admin — neytral, qizil «xato» tint emas)
const ROL_NOMI = { xodim: 'Tibbiyot xodimi', vazirlik: 'Vazirlik', admin: 'Super admin', talaba: 'Talaba' };
const ROL_TONE = { xodim: 'info', vazirlik: 'violet', admin: 'neutral', talaba: 'teal' };

// Satr ichidagi xabar — login sahifasidagi .auth-error ko'rinishi (tipme-login.css faqat /login'da
// yuklanadi, shuning uchun uslub shu yerda): xato — qizil tint, muvaffaqiyat — yashil tint.
const XABAR_USLUB = {
  xato: { color: 'var(--danger-ink)', background: 'var(--danger-tint)', border: '1px solid #fecdd3' },
  ok: { color: 'var(--success-ink)', background: 'var(--success-tint)', border: '1px solid #bbf7d0' },
};
function XabarQatori({ tur = 'xato', children, style }) {
  return (
    <div
      role={tur === 'xato' ? 'alert' : 'status'}
      style={{
        display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 500,
        borderRadius: 10, padding: '8px 11px', ...XABAR_USLUB[tur], ...style,
      }}
    >
      {children}
    </div>
  );
}

const BOSH_FORMA = {
  fish: '',
  jshshir: '',
  telefon: '',
  email: '',
  manzil_viloyat_id: 'toshkent-shahar',
  manzil_tuman: '',
  hozirgi_bosqich: 'bakalavr',
  hozirgi_muassasa: '',
  ish_joyi: '',
  lavozimi: '',
  rol: 'xodim',
};

export default function AdminXodimlarPage() {
  const [profiles, setProfiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(BOSH_FORMA);
  // Sahifa darajasidagi xabar ({ tur: 'ok' | 'xato', matn }) va modal ichidagi xato satri
  const [xabar, setXabar] = useState(null);
  const [modalXato, setModalXato] = useState('');
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);

  useEffect(() => {
    getProfiles().then(setProfiles);
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(BOSH_FORMA);
    setModalXato('');
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditingId(p.id);
    setFormData({ ...BOSH_FORMA, ...Object.fromEntries(Object.keys(BOSH_FORMA).map((k) => [k, p[k] ?? BOSH_FORMA[k]])) });
    setModalXato('');
    setShowModal(true);
  };

  // O'chirish: lokal holat FAQAT Supabase yozuvi xatosiz qaytganda yangilanadi; xatoda ro'yxat o'zgarmaydi.
  // Faqat profiles qatori o'chadi — auth.users hisobi anon kalit bilan o'chmaydi (service role kerak);
  // profilsiz qolgan sessiyani proxy.js endi chiqarib yuboradi, shuning uchun bunday hisob kira olmaydi.
  const handleDelete = async (id) => {
    if (!confirm('Rostdan ham ushbu xodimni o‘chirmoqchimisiz?')) return;
    setXabar(null);
    if (supabaseSozlanganmi()) {
      const { ok, error } = await ochirProfil(id);
      if (!ok) {
        setXabar({ tur: 'xato', matn: `Saqlanmadi: ${error}` });
        return;
      }
    }
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    setXabar({ tur: 'ok', matn: 'Xodim reyestrdan o‘chirildi.' });
  };

  // Saqlash: tahrirda Supabase yozuvi xatosiz qaytgandagina lokal holat yangilanadi va modal yopiladi;
  // xatoda modal ochiq qoladi va «Saqlanmadi: …» satri ko'rinadi.
  const handleSubmit = async (yop) => {
    setModalXato('');
    if (!formData.fish.trim()) {
      setModalXato('F.I.O majburiy.');
      return;
    }
    if (editingId) {
      if (supabaseSozlanganmi()) {
        setSaqlanmoqda(true);
        const { ok, error } = await yangilaProfil(editingId, formData);
        setSaqlanmoqda(false);
        if (!ok) {
          setModalXato(`Saqlanmadi: ${error}`);
          return;
        }
      }
      setProfiles((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...formData } : p)));
      setXabar({ tur: 'ok', matn: 'Xodim ma’lumotlari saqlandi.' });
    } else {
      // Yangi profil auth.users yozuviga bog'lanadi — demo rejimda faqat lokal qo'shiladi
      // (haqiqiy yaratish OneID/ro'yxatdan o'tish oqimi orqali bo'ladi)
      setProfiles((prev) => [{ ...formData, id: crypto.randomUUID?.() || String(Date.now()) }, ...prev]);
      setXabar({ tur: 'ok', matn: 'Yangi xodim ro‘yxatga qo‘shildi (demo — faqat shu sahifada, reyestrga yozilmadi).' });
    }
    yop();
  };

  // Barqaror havola — modal/forma holati o'zgarganda DataTable sahifasi 1-ga tushib ketmasin
  const rows = useMemo(
    () =>
      profiles.map((p) => ({
        ...p,
        bosqich_nomi: STAGES.find((s) => s.id === p.hozirgi_bosqich)?.label || p.hozirgi_bosqich,
        hudud: HUDUDLAR.find((h) => h.id === p.manzil_viloyat_id)?.nom || '—',
      })),
    [profiles]
  );

  const columns = [
    {
      key: 'fish',
      label: 'F.I.O',
      // Qator sarlavhasi (th scope="row", 600 vazn); aloqa satri oddiy vaznda
      rowHeader: true,
      render: (r) => (
        <>
          <div>{r.fish}</div>
          <div style={{ fontSize: 11.5, fontWeight: 400, color: 'var(--muted)' }}>{r.email}{r.telefon ? ` · ${r.telefon}` : ''}</div>
        </>
      ),
    },
    { key: 'jshshir', label: 'JSHSHIR', mono: true },
    { key: 'bosqich_nomi', label: 'Bosqich', render: (r) => <Badge tone="info">{r.bosqich_nomi}</Badge> },
    { key: 'hudud', label: 'Hudud' },
    { key: 'rol', label: 'Rol', render: (r) => <Badge tone={ROL_TONE[r.rol] || 'info'}>{ROL_NOMI[r.rol] || r.rol}</Badge> },
    {
      key: 'amallar',
      label: '',
      render: (r) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <button
            className="btn btn--ghost"
            style={{ padding: '4px 10px', fontSize: 12.5 }}
            onClick={(e) => { e.stopPropagation(); openEditModal(r); }}
          >
            Tahrirlash
          </button>
          <button
            className="btn btn--ghost"
            style={{ padding: '4px 10px', fontSize: 12.5, color: 'var(--danger)' }}
            onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
          >
            O‘chirish
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHead
        breadcrumb={[{ label: 'Bosh sahifa', href: '/' }, { label: 'Xodimlar' }]}
        title="Xodimlar boshqaruvi"
        count={rows.length || undefined}
        subtitle="Xodimlar ro‘yxati, yangi profil qo‘shish, tahrirlash va o‘chirish"
        actions={
          <button type="button" className="btn" onClick={openCreateModal}>
            + Xodim qo‘shish
          </button>
        }
      />

      {xabar && (
        <XabarQatori tur={xabar.tur} style={{ marginBottom: 16 }}>
          {xabar.matn}
        </XabarQatori>
      )}

      <Card title="Xodimlar reyestri">
        <DataTable
          searchable
          numbered
          columns={columns}
          rows={rows}
          pageSize={25}
          footnote="Manba: ETTP reyestri (demo)"
          empty="Xodimlar topilmadi"
        />
      </Card>

      {/* Yaratish / tahrirlash modali */}
      <GlassModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Xodim ma'lumotlarini tahrirlash" : "Yangi tibbiyot xodimi qo'shish"}
        subtitle="Ma'lumotlar yagona reyestrga saqlanadi"
        keng
      >
        {(yop) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="login__label" htmlFor="x-fish">F.I.O (to‘liq) *</label>
              <input id="x-fish" className="inp" type="text" value={formData.fish} onChange={(e) => setFormData({ ...formData, fish: e.target.value })} />
            </div>
            <div className="tmodal__grid">
              <div>
                <label className="login__label" htmlFor="x-jshshir">JSHSHIR (14 raqam)</label>
                <input id="x-jshshir" className="inp mono" type="text" maxLength={14} value={formData.jshshir} onChange={(e) => setFormData({ ...formData, jshshir: e.target.value })} />
              </div>
              <div>
                <label className="login__label" htmlFor="x-telefon">Telefon raqami</label>
                <input id="x-telefon" className="inp" type="text" value={formData.telefon} onChange={(e) => setFormData({ ...formData, telefon: e.target.value })} placeholder="+998 90 123 45 67" />
              </div>
            </div>
            <div className="tmodal__grid">
              <div>
                <label className="login__label" htmlFor="x-viloyat">Viloyat</label>
                <select id="x-viloyat" className="select" value={formData.manzil_viloyat_id} onChange={(e) => setFormData({ ...formData, manzil_viloyat_id: e.target.value })}>
                  {HUDUDLAR.map((r) => (
                    <option key={r.id} value={r.id}>{r.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="login__label" htmlFor="x-tuman">Tuman / shahar</label>
                <input id="x-tuman" className="inp" type="text" value={formData.manzil_tuman} onChange={(e) => setFormData({ ...formData, manzil_tuman: e.target.value })} placeholder="masalan: Asaka" />
              </div>
            </div>
            <div className="tmodal__grid">
              <div>
                <label className="login__label" htmlFor="x-bosqich">Joriy bosqich</label>
                <select id="x-bosqich" className="select" value={formData.hozirgi_bosqich} onChange={(e) => setFormData({ ...formData, hozirgi_bosqich: e.target.value })}>
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="login__label" htmlFor="x-rol">Tizimdagi roli</label>
                <select id="x-rol" className="select" value={formData.rol} onChange={(e) => setFormData({ ...formData, rol: e.target.value })}>
                  <option value="xodim">Tibbiyot xodimi</option>
                  <option value="vazirlik">Vazirlik (inspektor)</option>
                  <option value="admin">Super admin</option>
                </select>
              </div>
            </div>
            <div>
              <label className="login__label" htmlFor="x-ish">Ish joyi (shifoxona / OTM)</label>
              <input id="x-ish" className="inp" type="text" value={formData.ish_joyi} onChange={(e) => setFormData({ ...formData, ish_joyi: e.target.value })} placeholder="masalan: Asaka tumani markaziy shifoxonasi" />
            </div>
            <div>
              <label className="login__label" htmlFor="x-lavozim">Lavozimi</label>
              <input id="x-lavozim" className="inp" type="text" value={formData.lavozimi} onChange={(e) => setFormData({ ...formData, lavozimi: e.target.value })} placeholder="masalan: Kardiolog-shifokor" />
            </div>
            {modalXato && <XabarQatori tur="xato">{modalXato}</XabarQatori>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button type="button" className="btn btn--ghost" onClick={yop}>Bekor qilish</button>
              <button type="button" className="btn" disabled={saqlanmoqda} onClick={() => handleSubmit(yop)}>
                {saqlanmoqda ? 'Saqlanmoqda…' : 'Saqlash'}
              </button>
            </div>
          </div>
        )}
      </GlassModal>
    </>
  );
}
