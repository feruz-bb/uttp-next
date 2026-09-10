'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import TalimTimeline from '../../../components/TalimTimeline';
import { PageHead, Card, Badge, GlassModal } from '../../../components/ui.jsx';
import Icon from '../../../components/icons.jsx';
import { joriyProfilniOl } from '../../../lib/auth';
import {
  INITIAL_PROFILES,
  getTalimTarixi,
  addTalimYozuv,
  deleteTalimYozuv,
  getTalabaByUser,
  getDoktorantByUser,
} from '../../../lib/data-service';

const BOSQICH_NOMLARI = {
  chuqurlashtirilgan_sinf: 'Chuqurlashtirilgan sinf',
  texnikum: 'Texnikum',
  bakalavr: 'Bakalavriat',
  magistr: 'Magistratura',
  rezidentura: 'Klinik ordinatura (rezidentura)',
  doktorantura: 'Doktorantura (PhD / DSc)',
};

const HOLAT_TONE = { tamomlagan: 'success', oqimoqda: 'info', chetlatilgan: 'danger' };
const HOLAT_MATN = { tamomlagan: 'Tamomlagan', oqimoqda: 'O‘qimoqda', chetlatilgan: 'Chetlatilgan' };
// Tugun rangi: tamomlangan — yashil tint, o'qimoqda — turkuaz, qolgani — neytral
const DOT_CLS = { tamomlagan: 'timeline__dot--tamom', oqimoqda: 'timeline__dot--joriy' };

// Sarlavhadagi rol nishonchasi: TDTU talabasi / chuqurlashtirilgan sinf o'quvchisi / shifokor
const rolNomi = (p) =>
  p?.rol === 'talaba' ? 'Talaba' : p?.hozirgi_bosqich === 'chuqurlashtirilgan_sinf' ? 'O‘quvchi' : 'Shifokor';

// Talaba uchun universitet ro'yxatidan sintez qilingan joriy yozuvning kaliti (o'chirilmaydi)
const TDTU_ID = 'tdtu-joriy';

// Bo'sh forma: yil va holat ochilganda profildan to'ldiriladi (modalniOch)
const BOSH_FORMA = {
  bosqich: 'bakalavr',
  muassasa_nomi: '',
  yonalish_nomi: '',
  boshlangan_yil: '',
  tugatilgan_yil: '',
  diplom_raqami: '',
  diplom_sanasi: '',
  holati: 'oqimoqda',
};

// '2026-09-03' → '03.09.2026'
const sanaFmt = (s) => {
  if (!s) return '';
  const [y, m, d] = String(s).split('-');
  return d && m ? `${d}.${m}.${y}` : String(s);
};

// TDTU ro'yxatidagi joriy o'qish — talaba o'zi kiritmaydi, tizim biladi (faqat o'qish uchun)
function tdtuYozuv(profil, talaba, doktorant) {
  const muassasa = talaba?.muassasa || profil.hozirgi_muassasa;
  if (!muassasa) return null;
  const yonalish = talaba?.mutaxassislik || doktorant?.ixtisoslik || (profil.lavozimi || '').split(' · ')[1] || '';
  const kurs = talaba?.kurs ?? doktorant?.kurs ?? profil.hozirgi_kurs;
  const sana = sanaFmt(talaba?.manba_sanasi || doktorant?.manba_sanasi || '2026-09-03');
  return {
    id: TDTU_ID,
    bosqich: profil.hozirgi_bosqich || 'bakalavr',
    muassasa_nomi: muassasa,
    yonalish_nomi: [yonalish, kurs ? `${kurs}-kurs` : ''].filter(Boolean).join(' · '),
    boshlangan_yil: talaba?.qabul_yili ?? doktorant?.qabul_yili ?? null,
    tugatilgan_yil: null,
    diplom_raqami: null,
    diplom_sanasi: null,
    holati: 'oqimoqda',
    manba: `TDTU ${doktorant ? 'doktorantlar' : 'kontingent'} ro‘yxati, ${sana}`,
  };
}

export default function TalimTarixiPage() {
  const [profil, setProfil] = useState(null);
  const [yozuvlar, setYozuvlar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [modalOchiq, setModalOchiq] = useState(false);
  const [forma, setForma] = useState(BOSH_FORMA);
  const [xato, setXato] = useState('');

  const yukla = useCallback(async () => {
    const p = (await joriyProfilniOl()) || INITIAL_PROFILES[0];
    setProfil(p);
    let qatorlar = await getTalimTarixi(p.id);
    // Talabaning yozuvi bo'lmasa — universitet ro'yxatidagi joriy o'qishni ko'rsatamiz
    if (p.rol === 'talaba' && qatorlar.length === 0) {
      const doktorantmi = p.hozirgi_bosqich === 'doktorantura';
      const [t, d] = await Promise.all([
        doktorantmi ? null : getTalabaByUser(p.id),
        doktorantmi ? getDoktorantByUser(p.id) : null,
      ]);
      const joriy = tdtuYozuv(p, t, d);
      if (joriy) qatorlar = [joriy];
    }
    setYozuvlar(qatorlar);
    setYuklanmoqda(false);
  }, []);

  useEffect(() => {
    yukla();
  }, [yukla]);

  const oquvchimi = profil?.hozirgi_bosqich === 'chuqurlashtirilgan_sinf';
  const talabami = profil?.rol === 'talaba';
  // Sidebar bandi bilan bir xil nom: o'quvchi/talaba — «Ta‘lim yo‘lim», shifokor — «Ta‘lim tarixi»
  const sahifaNomi = oquvchimi || talabami ? 'Ta‘lim yo‘lim' : 'Ta‘lim tarixi';
  const sahifaIzohi = oquvchimi
    ? 'Maktabdan tibbiyotgacha — o‘qish davrlari va sertifikatlar'
    : 'Bosqichma-bosqich ta‘lim yo‘li — diplomlar va o‘qish davrlari (HEMIS bilan sinxronlanadi)';

  // Trayektoriya kartasi faqat haqiqiy «tamomlagan» yozuvi bor bosqichlarni yashil qiladi
  const tamomlangan = useMemo(
    () => yozuvlar.filter((y) => y.holati === 'tamomlagan').map((y) => y.bosqich),
    [yozuvlar]
  );
  const tdtuManba = yozuvlar.find((y) => y.id === TDTU_ID)?.manba;

  // Modal profildan boshlanadi: joriy bosqich (ro'yxatda bo'lsa) + «O‘qimoqda», aks holda bakalavriat diplomi
  const modalniOch = () => {
    setXato('');
    const joriyBosqich = BOSQICH_NOMLARI[profil?.hozirgi_bosqich] ? profil.hozirgi_bosqich : null;
    setForma({
      ...BOSH_FORMA,
      bosqich: joriyBosqich || 'bakalavr',
      holati: joriyBosqich ? 'oqimoqda' : 'tamomlagan',
      muassasa_nomi: joriyBosqich ? profil?.hozirgi_muassasa || '' : '',
    });
    setModalOchiq(true);
  };

  const handleQoshish = async (yop) => {
    setXato('');
    if (!forma.muassasa_nomi.trim()) {
      setXato('Muassasa nomi majburiy.');
      return;
    }
    const boshi = Number(forma.boshlangan_yil);
    const oxiri = forma.tugatilgan_yil ? Number(forma.tugatilgan_yil) : null;
    if (!forma.boshlangan_yil || Number.isNaN(boshi)) {
      setXato('Boshlangan yil majburiy.');
      return;
    }
    if (forma.holati === 'tamomlagan' && !oxiri) {
      setXato('«Tamomlagan» holati uchun tugatilgan yil majburiy.');
      return;
    }
    if (oxiri && oxiri < boshi) {
      setXato('Tugatilgan yil boshlangan yildan kichik bo‘lmasin.');
      return;
    }
    try {
      await addTalimYozuv({
        profile_id: profil.id,
        bosqich: forma.bosqich,
        muassasa_nomi: forma.muassasa_nomi,
        yonalish_nomi: forma.yonalish_nomi || null,
        boshlangan_yil: boshi,
        tugatilgan_yil: oxiri,
        diplom_raqami: forma.diplom_raqami || null,
        diplom_sanasi: forma.diplom_sanasi || null,
        holati: forma.holati,
      });
      setForma(BOSH_FORMA);
      yop();
      await yukla();
    } catch (err) {
      setXato(`Saqlashda xatolik: ${err.message}`);
    }
  };

  const handleOchirish = async (id) => {
    if (!confirm('Ushbu ta‘lim yozuvi o‘chirilsinmi?')) return;
    try {
      await deleteTalimYozuv(id);
      setYozuvlar((old) => old.filter((y) => y.id !== id));
    } catch (err) {
      alert(`O‘chirishda xatolik: ${err.message}`);
    }
  };

  return (
    <>
      <PageHead
        breadcrumb={[{ label: 'Kabinet', href: '/profile' }, { label: sahifaNomi }]}
        title={sahifaNomi}
        badge={profil ? <Badge tone="neutral">{rolNomi(profil)}</Badge> : undefined}
        subtitle={sahifaIzohi}
        actions={
          // Talabaning zanjiri universitet ro'yxatidan keladi — qo'lda yozuv qo'shilmaydi
          profil && !talabami ? (
            <button type="button" className="btn" onClick={modalniOch}>
              + Yozuv qo‘shish
            </button>
          ) : undefined
        }
      />

      <TalimTimeline hozirgiBosqich={profil?.hozirgi_bosqich || 'doktor'} tamomlangan={tamomlangan} />

      <Card title="Ta‘lim yozuvlari" extra={yuklanmoqda ? undefined : `${yozuvlar.length} ta`}>
        {yuklanmoqda ? (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>Yuklanmoqda...</div>
        ) : yozuvlar.length === 0 ? (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>
            {talabami
              ? 'Ta‘lim yozuvlari universitet ro‘yxatidan yuklanadi.'
              : 'Hozircha ta‘lim yozuvlari yo‘q. «Yozuv qo‘shish» tugmasi orqali kiriting.'}
          </div>
        ) : (
          <>
            <div className="timeline">
              {yozuvlar.map((y, idx) => {
                const tdtu = y.id === TDTU_ID;
                const davr = y.boshlangan_yil
                  ? `${y.boshlangan_yil} — ${y.tugatilgan_yil || 'davom etmoqda'}`
                  : y.tugatilgan_yil
                    ? String(y.tugatilgan_yil)
                    : 'davom etmoqda';
                return (
                  <div key={y.id} className="timeline__row">
                    <div className={`timeline__dot ${DOT_CLS[y.holati] || 'timeline__dot--neytral'}`} aria-hidden="true">
                      {idx + 1}
                    </div>
                    <div className="timeline__body" style={{ flex: 1 }}>
                      <div className="timeline__top" style={{ flexWrap: 'wrap' }}>
                        <b>{BOSQICH_NOMLARI[y.bosqich] || y.bosqich}</b>
                        <Badge tone={HOLAT_TONE[y.holati] || 'info'}>{HOLAT_MATN[y.holati] || y.holati}</Badge>
                        <span className="timeline__ong">
                          <span className="timeline__muted">{davr}</span>
                          {!tdtu && (
                            <button
                              type="button"
                              className="timeline__ochir"
                              aria-label="Yozuvni o‘chirish"
                              title="Yozuvni o‘chirish"
                              onClick={() => handleOchirish(y.id)}
                            >
                              ✕
                            </button>
                          )}
                        </span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{y.muassasa_nomi}</div>
                      {y.yonalish_nomi && (
                        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{y.yonalish_nomi}</div>
                      )}
                      {y.diplom_raqami && (
                        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Icon.certificate width={14} height={14} />
                          Diplom: <span className="mono" style={{ fontWeight: 600 }}>{y.diplom_raqami}</span>
                          {y.diplom_sanasi ? ` · ${y.diplom_sanasi}` : ''}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {tdtuManba && (
              <div className="timeline__foot">
                Manba: {tdtuManba}. Yozuv universitet ro‘yxatidan avtomatik olingan — kabinetdan tahrirlanmaydi.
              </div>
            )}
          </>
        )}
      </Card>

      {/* Yozuv qo'shish modali */}
      <GlassModal
        open={modalOchiq}
        onClose={() => setModalOchiq(false)}
        title="Yangi ta‘lim yozuvi"
        subtitle="Diplom ma’lumotlari reyestrga saqlanadi"
        keng
      >
        {(yop) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {xato && <div className="err-txt">{xato}</div>}
            <div className="tmodal__grid">
              <div>
                <label className="login__label" htmlFor="ty-bosqich">Bosqich</label>
                <select id="ty-bosqich" className="select" value={forma.bosqich} onChange={(e) => setForma({ ...forma, bosqich: e.target.value })}>
                  {Object.entries(BOSQICH_NOMLARI).map(([id, nom]) => (
                    <option key={id} value={id}>{nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="login__label" htmlFor="ty-holati">Holati</label>
                <select id="ty-holati" className="select" value={forma.holati} onChange={(e) => setForma({ ...forma, holati: e.target.value })}>
                  <option value="tamomlagan">Tamomlagan</option>
                  <option value="oqimoqda">O‘qimoqda</option>
                  <option value="chetlatilgan">Chetlatilgan</option>
                </select>
              </div>
            </div>
            <div>
              <label className="login__label" htmlFor="ty-muassasa">Muassasa nomi *</label>
              <input
                id="ty-muassasa"
                className="inp"
                type="text"
                value={forma.muassasa_nomi}
                onChange={(e) => setForma({ ...forma, muassasa_nomi: e.target.value })}
                placeholder={oquvchimi ? 'masalan: Abu Ali ibn Sino nomidagi ixtisoslashtirilgan maktab' : 'masalan: Toshkent tibbiyot akademiyasi'}
              />
            </div>
            <div>
              <label className="login__label" htmlFor="ty-yonalish">Yo‘nalish / mutaxassislik</label>
              <input
                id="ty-yonalish"
                className="inp"
                type="text"
                value={forma.yonalish_nomi}
                onChange={(e) => setForma({ ...forma, yonalish_nomi: e.target.value })}
                placeholder={oquvchimi ? 'masalan: Kimyo-biologiya' : 'masalan: Kardiologiya'}
              />
            </div>
            <div className="tmodal__grid">
              <div>
                <label className="login__label" htmlFor="ty-boshi">Boshlangan yil *</label>
                <input id="ty-boshi" className="inp" type="number" min="1950" max="2100" value={forma.boshlangan_yil} onChange={(e) => setForma({ ...forma, boshlangan_yil: e.target.value })} placeholder="masalan: 2020" />
              </div>
              <div>
                <label className="login__label" htmlFor="ty-oxiri">Tugatilgan yil{forma.holati === 'tamomlagan' ? ' *' : ''}</label>
                <input id="ty-oxiri" className="inp" type="number" min="1950" max="2100" value={forma.tugatilgan_yil} onChange={(e) => setForma({ ...forma, tugatilgan_yil: e.target.value })} placeholder="bo‘sh = davom etmoqda" />
              </div>
            </div>
            <div className="tmodal__grid">
              <div>
                <label className="login__label" htmlFor="ty-diplom">Diplom raqami</label>
                <input id="ty-diplom" className="inp" type="text" value={forma.diplom_raqami} onChange={(e) => setForma({ ...forma, diplom_raqami: e.target.value })} placeholder="B 1234567" />
              </div>
              <div>
                <label className="login__label" htmlFor="ty-diplom-sana">Diplom sanasi</label>
                <input id="ty-diplom-sana" className="inp" type="date" value={forma.diplom_sanasi} onChange={(e) => setForma({ ...forma, diplom_sanasi: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button type="button" className="btn btn--ghost" onClick={yop}>Bekor qilish</button>
              <button type="button" className="btn" onClick={() => handleQoshish(yop)}>Saqlash</button>
            </div>
          </div>
        )}
      </GlassModal>
    </>
  );
}
