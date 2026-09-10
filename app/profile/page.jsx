'use client';

import { useState, useEffect } from 'react';
import IlmFanBolimi from '../../components/story/IlmFanBolimi';
import TalimTimeline from '../../components/TalimTimeline';
import OquvchiProfil from '../../components/OquvchiProfil';
import TalabaProfil from '../../components/TalabaProfil';
import { PageHead, Card, StatCard, Badge, Progress, GlassModal, SummaryList, hududNomi } from '../../components/ui.jsx';
import { INITIAL_PROFILES, getLitsenziyalar, getKreditlar, getTalimTarixi, yangilaProfil } from '../../lib/data-service';
import { joriyProfilniOl, supabaseSozlanganmi } from '../../lib/auth';

const LITSENZIYA_TONE = {
  amal_qilmoqda: 'success',
  muddati_tugayapti: 'warning',
  muddati_otgan: 'danger',
};
const LITSENZIYA_MATN = {
  amal_qilmoqda: 'Amal qilmoqda',
  muddati_tugayapti: 'Muddati tugayapti',
  muddati_otgan: 'Muddati o‘tgan',
};
// Toifa enum'i → inson o'qiydigan nom (xom «oliy» UI'ga chiqmaydi)
const TOIFA_NOMLARI = { oliy: 'Oliy toifa', birinchi: 'Birinchi toifa', ikkinchi: 'Ikkinchi toifa', mutaxassis: 'Mutaxassis' };

// Yengil skelet bloki — profil sessiyadan kelguncha (demo shifokor haqiqiy sessiyada ko'rinmaydi)
function Skelet({ w = '100%', h = 14, style }) {
  return <div aria-hidden="true" style={{ width: w, maxWidth: '100%', height: h, borderRadius: 8, background: 'var(--line)', ...style }} />;
}
function ProfilSkelet() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div style={{ marginBottom: 24 }}>
        <Skelet w={220} h={12} style={{ marginBottom: 12 }} />
        <Skelet w={320} h={26} style={{ marginBottom: 10 }} />
        <Skelet w={260} h={12} />
      </div>
      <div className="grid stat-grid" style={{ marginBottom: 24 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card" style={{ minHeight: 88 }}>
            <Skelet w={130} h={11} style={{ marginBottom: 14 }} />
            <Skelet w={80} h={22} />
          </div>
        ))}
      </div>
      <div style={{ fontSize: 13, color: 'var(--muted)' }}>Profil yuklanmoqda…</div>
    </div>
  );
}

// Satr ichidagi xato (login .auth-error ko'rinishi; tipme-login.css faqat /login'da yuklanadi)
function XatoQatori({ children }) {
  return (
    <div
      role="alert"
      style={{
        fontSize: 12.5, fontWeight: 500, borderRadius: 10, padding: '8px 11px',
        color: 'var(--danger-ink)', background: 'var(--danger-tint)', border: '1px solid #fecdd3',
      }}
    >
      {children}
    </div>
  );
}

export default function WorkerProfilePage() {
  // null — hali yuklanmagan; keshlangan sessiya profili (uttp_current_user) bo'lsa effect'da darhol qo'yiladi
  const [profile, setProfile] = useState(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [licenses, setLicenses] = useState([]);
  const [credits, setCredits] = useState([]);
  // Trayektoriya kartasi uchun: haqiqiy «tamomlagan» yozuvi bor bosqichlar
  const [tamomlangan, setTamomlangan] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saqlashXato, setSaqlashXato] = useState('');
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);

  useEffect(() => {
    let bekor = false;
    // 1) Kesh (lib/auth.js uttp_current_user) — bo'lsa skelet o'rniga darhol ko'rsatamiz;
    //    useState initializer'da o'qilmaydi (SSR bilan hydration farqi bo'lardi)
    try {
      const saqlangan = localStorage.getItem('uttp_current_user');
      if (saqlangan) {
        const kesh = JSON.parse(saqlangan);
        setProfile(kesh);
        setEditForm(kesh);
      }
    } catch {
      // buzuq JSON — asinxron yo'l hal qiladi
    }
    // 2) Haqiqiy sessiya profili. Demo shifokor (INITIAL_PROFILES[0]) faqat Supabase sozlanmagan
    //    demo-rejimda — haqiqiy sessiyada profil topilmasa bo'sh holat ko'rsatiladi.
    (async () => {
      const p = await joriyProfilniOl();
      const profil = p || (!supabaseSozlanganmi() ? INITIAL_PROFILES[0] : null);
      if (bekor) return;
      setProfile(profil);
      setYuklanmoqda(false);
      if (!profil) return;
      setEditForm(profil);
      const [lic, cr, talim] = await Promise.all([getLitsenziyalar(profil.id), getKreditlar(profil.id), getTalimTarixi(profil.id)]);
      if (bekor) return;
      setLicenses(lic);
      setCredits(cr);
      setTamomlangan(talim.filter((y) => y.holati === 'tamomlagan').map((y) => y.bosqich));
    })();
    return () => {
      bekor = true;
    };
  }, []);

  if (!profile) {
    if (yuklanmoqda) return <ProfilSkelet />;
    return (
      <>
        <PageHead breadcrumb={[{ label: 'Kabinet', href: '/profile' }, { label: 'Shaxsiy profil' }]} title="Profil topilmadi" />
        <Card>
          <div style={{ color: 'var(--muted)', fontSize: 13.5, textAlign: 'center', padding: '18px 0' }}>
            Sessiyaga profil biriktirilmagan. Tizimdan chiqib, qaytadan kiring.
          </div>
        </Card>
      </>
    );
  }

  // Maktab o'quvchisi (chuqurlashtirilgan sinf) — alohida, unga mos profil ko'rinishi
  if (profile.hozirgi_bosqich === 'chuqurlashtirilgan_sinf') {
    return <OquvchiProfil profile={profile} />;
  }
  // Oliy ta'lim talabasi (TDTU ro'yxati) — TFX/UKTT bloklari unga taalluqli emas
  if (profile.rol === 'talaba') {
    return <TalabaProfil profile={profile} />;
  }

  const totalCredits = credits.reduce((sum, c) => sum + (c.kredit_ball || 0), 0);
  const joriyYil = new Date().getFullYear();
  const yillikBall = credits
    .filter((c) => new Date(c.topshirilgan_sana).getFullYear() === joriyYil)
    .reduce((s, c) => s + (c.kredit_ball || 0), 0);
  const faolLitsenziya = licenses.find((l) => l.holati !== 'muddati_otgan');

  // Saqlash: holat va localStorage FAQAT Supabase yozuvi xatosiz qaytganda yangilanadi;
  // xatoda modal ochiq qoladi va «Saqlanmadi: …» satri ko'rinadi. Demo-rejimda (Supabase yo'q) — lokal.
  const handleSaveProfile = async (yop) => {
    setSaqlashXato('');
    const yangi = {
      fish: editForm.fish,
      telefon: editForm.telefon,
      ish_joyi: editForm.ish_joyi,
      lavozimi: editForm.lavozimi,
    };
    if (supabaseSozlanganmi()) {
      setSaqlanmoqda(true);
      const { ok, error } = await yangilaProfil(profile.id, yangi);
      setSaqlanmoqda(false);
      if (!ok) {
        setSaqlashXato(`Saqlanmadi: ${error}`);
        return;
      }
    }
    const yangilangan = { ...profile, ...yangi };
    setProfile(yangilangan);
    try {
      localStorage.setItem('uttp_current_user', JSON.stringify(yangilangan));
    } catch {
      // saqlash bloklangan (private rejim) — holat baribir yangilandi
    }
    yop();
  };

  return (
    <>
      <PageHead
        breadcrumb={[{ label: 'Kabinet', href: '/profile' }, { label: 'Shaxsiy profil' }]}
        title={`Salom, ${profile.fish?.split(' ')[1] || profile.fish}!`}
        badge={<Badge tone="neutral">Shifokor</Badge>}
        subtitle={`${profile.lavozimi || 'Tibbiyot xodimi'} · ${profile.ish_joyi || ''}`}
      />

      {/* Litsenziya ogohlantirishi */}
      {faolLitsenziya && faolLitsenziya.holati === 'muddati_tugayapti' && (
        <div className="elon-banner" style={{ marginBottom: 18 }}>
          <span className="elon-banner__ikon">⚠</span>
          <div>
            <b>Malaka sertifikatingiz muddati tugayapti!</b>{' '}
            Amal qilish muddati: {faolLitsenziya.amal_qilish_muddati} gacha — qayta attestatsiya uchun TFX baholash markaziga murojaat qiling.
          </div>
        </div>
      )}

      {/* Asosiy ko'rsatkichlar */}
      <div className="grid stat-grid" style={{ marginBottom: 24 }}>
        <StatCard label={`${joriyYil}-yil krediti (norma 50)`} value={`${yillikBall} / 50`} icon="credit" tone="primary" />
        <StatCard label="5 yillik jami kredit" value={totalCredits} icon="chart" tone="teal" />
        <StatCard label="Sertifikatlar" value={credits.filter((c) => c.sertifikat_raqami).length} icon="certificate" tone="success" />
        <StatCard label="Malaka toifasi" value={faolLitsenziya?.toifa ? TOIFA_NOMLARI[faolLitsenziya.toifa] || faolLitsenziya.toifa : '—'} icon="award" tone="violet" />
      </div>

      {/* Kasbiy trayektoriya */}
      <TalimTimeline hozirgiBosqich={profile.hozirgi_bosqich || 'doktor'} tamomlangan={tamomlangan} />

      <div className="grid cols-2" style={{ gap: 24, marginBottom: 24, alignItems: 'start' }}>
        {/* Profil ma'lumotlari */}
        <Card
          title="Profil ma’lumotlari"
          extra={
            <button className="btn btn--ghost" style={{ padding: '5px 12px', fontSize: 13 }} onClick={() => { setEditForm(profile); setSaqlashXato(''); setIsEditing(true); }}>
              Tahrirlash
            </button>
          }
        >
          <SummaryList
            items={[
              { label: 'F.I.SH.', value: profile.fish },
              { label: 'Lavozimi', value: profile.lavozimi },
              { label: 'Ish joyi', value: profile.ish_joyi },
              { label: 'Hudud', value: hududNomi(profile.manzil_viloyat_id, profile.manzil_tuman) },
              { label: 'Email', value: profile.email },
              { label: 'Telefon', value: profile.telefon },
              { label: 'JSHSHIR', value: profile.jshshir, mono: true },
            ]}
          />
        </Card>

        {/* TFX litsenziyalari */}
        <Card title="TFX malaka toifasi (sertifikat)" extra={`${licenses.length} ta`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {licenses.length === 0 && (
              <div style={{ color: 'var(--muted)', fontSize: 13.5, textAlign: 'center', padding: '18px 0' }}>
                Malaka sertifikati topilmadi
              </div>
            )}
            {licenses.map((lic) => (
              <div key={lic.id} style={{ border: '1px solid var(--line)', borderRadius: 14, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8, flexWrap: 'wrap' }}>
                  <span className="mono" style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{lic.tfx_raqami}</span>
                  <Badge tone={LITSENZIYA_TONE[lic.holati] || 'info'}>{LITSENZIYA_MATN[lic.holati] || lic.holati}</Badge>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>
                  {lic.mutaxassislik}{lic.toifa ? ` · ${TOIFA_NOMLARI[lic.toifa] || lic.toifa}` : ''}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                  {lic.berilgan_sana} — {lic.amal_qilish_muddati} (5 yillik tsikl)
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* UKTT kreditlari */}
      <Card title="UKTT kredit ballari" extra={`Jami: ${totalCredits} ball`}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 6 }}>
            <span style={{ color: 'var(--muted)' }}>Yillik norma bajarilishi (50 ball)</span>
            <b>{yillikBall} / 50</b>
          </div>
          <Progress value={yillikBall} max={50} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {credits.map((c) => (
            <div
              key={c.id}
              style={{
                border: '1px solid var(--line)', borderRadius: 12, padding: '11px 14px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.kurs_nomi}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {c.tashkilot_nomi} · {c.sertifikat_raqami || 'sertifikatsiz'} · {c.topshirilgan_sana}
                </div>
              </div>
              <Badge tone="info">+{c.kredit_ball}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Profilni tahrirlash modali */}
      <GlassModal
        open={isEditing}
        onClose={() => setIsEditing(false)}
        title="Profil ma’lumotlarini yangilash"
        subtitle="O‘zgartirishlar reyestrga saqlanadi"
      >
        {(yop) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="login__label" htmlFor="pf-fish">F.I.SH.</label>
              <input id="pf-fish" className="inp" type="text" value={editForm.fish || ''} onChange={(e) => setEditForm({ ...editForm, fish: e.target.value })} />
            </div>
            <div>
              <label className="login__label" htmlFor="pf-telefon">Telefon</label>
              <input id="pf-telefon" className="inp" type="text" value={editForm.telefon || ''} onChange={(e) => setEditForm({ ...editForm, telefon: e.target.value })} />
            </div>
            <div>
              <label className="login__label" htmlFor="pf-ish">Ish joyi</label>
              <input id="pf-ish" className="inp" type="text" value={editForm.ish_joyi || ''} onChange={(e) => setEditForm({ ...editForm, ish_joyi: e.target.value })} />
            </div>
            <div>
              <label className="login__label" htmlFor="pf-lavozim">Lavozimi</label>
              <input id="pf-lavozim" className="inp" type="text" value={editForm.lavozimi || ''} onChange={(e) => setEditForm({ ...editForm, lavozimi: e.target.value })} />
            </div>
            {saqlashXato && <XatoQatori>{saqlashXato}</XatoQatori>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button type="button" className="btn btn--ghost" onClick={yop}>Bekor qilish</button>
              <button type="button" className="btn" disabled={saqlanmoqda} onClick={() => handleSaveProfile(yop)}>
                {saqlanmoqda ? 'Saqlanmoqda…' : 'Saqlash'}
              </button>
            </div>
          </div>
        )}
      </GlassModal>

      {/* Canvas 3-yo'nalish — har kabinetda alohida bo'lim */}
      <IlmFanBolimi profile={profile} />
    </>
  );
}
