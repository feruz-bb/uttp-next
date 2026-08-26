'use client';

import React, { useState, useEffect, useCallback } from 'react';
import TalimTimeline from '../../../components/TalimTimeline';
import { PageHead, Card, Badge, GlassModal } from '../../../components/ui.jsx';
import Icon from '../../../components/icons.jsx';
import { joriyProfilniOl } from '../../../lib/auth';
import { INITIAL_PROFILES, getTalimTarixi, addTalimYozuv, deleteTalimYozuv } from '../../../lib/data-service';

const BOSQICH_NOMLARI = {
  chuqurlashtirilgan_sinf: 'Chuqurlashtirilgan sinf',
  texnikum: 'Texnikum',
  bakalavr: 'Bakalavriat',
  magistr: 'Magistratura',
  rezidentura: 'Rezidentura / Ordinatura',
  doktarantura: 'Doktarantura (PhD / DSc)',
};

const HOLAT_TONE = { tamomlagan: 'success', oqimoqda: 'info', chetlatilgan: 'danger' };
const HOLAT_MATN = { tamomlagan: 'Tamomlagan', oqimoqda: 'O‘qimoqda', chetlatilgan: 'Chetlatilgan' };

const BOSH_FORMA = {
  bosqich: 'bakalavr',
  muassasa_nomi: '',
  yonalish_nomi: '',
  boshlangan_yil: new Date().getFullYear(),
  tugatilgan_yil: '',
  diplom_raqami: '',
  diplom_sanasi: '',
  holati: 'tamomlagan',
};

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
    setYozuvlar(await getTalimTarixi(p.id));
    setYuklanmoqda(false);
  }, []);

  useEffect(() => {
    yukla();
  }, [yukla]);

  const handleQoshish = async (yop) => {
    setXato('');
    if (!forma.muassasa_nomi.trim()) {
      setXato('Muassasa nomi majburiy.');
      return;
    }
    try {
      await addTalimYozuv({
        profile_id: profil.id,
        bosqich: forma.bosqich,
        muassasa_nomi: forma.muassasa_nomi,
        yonalish_nomi: forma.yonalish_nomi || null,
        boshlangan_yil: Number(forma.boshlangan_yil),
        tugatilgan_yil: forma.tugatilgan_yil ? Number(forma.tugatilgan_yil) : null,
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
        title="Ta'lim tarixi"
        subtitle="Bosqichma-bosqich ta'lim yo'li — diplomlar va o'qish davrlari (HEMIS bilan sinxronlanadi)"
      />

      <TalimTimeline hozirgiBosqich={profil?.hozirgi_bosqich || 'doktor'} />

      <Card
        title="Ta'lim yozuvlari"
        extra={
          <button className="btn" style={{ padding: '6px 14px', fontSize: 13 }} onClick={() => setModalOchiq(true)}>
            + Yozuv qo'shish
          </button>
        }
      >
        {yuklanmoqda ? (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>Yuklanmoqda...</div>
        ) : yozuvlar.length === 0 ? (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>
            Hozircha ta‘lim yozuvlari yo‘q. «Yozuv qo‘shish» tugmasi orqali kiriting.
          </div>
        ) : (
          <div className="timeline">
            {yozuvlar.map((y) => (
              <div key={y.id} className="timeline__row">
                <div className="timeline__dot" />
                <div className="timeline__body" style={{ flex: 1 }}>
                  <div className="timeline__top" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <b>{BOSQICH_NOMLARI[y.bosqich] || y.bosqich}</b>
                    <Badge tone={HOLAT_TONE[y.holati] || 'info'}>{HOLAT_MATN[y.holati] || y.holati}</Badge>
                    <span className="timeline__muted" style={{ marginLeft: 'auto' }}>
                      {y.boshlangan_yil} — {y.tugatilgan_yil || 'davom etmoqda'}
                    </span>
                    <button
                      className="pf-yozuv__ochir"
                      title="Yozuvni o‘chirish"
                      onClick={() => handleOchirish(y.id)}
                    >
                      ✕
                    </button>
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
            ))}
          </div>
        )}
      </Card>

      {/* Yozuv qo'shish modali */}
      <GlassModal
        open={modalOchiq}
        onClose={() => setModalOchiq(false)}
        title="Yangi ta'lim yozuvi"
        subtitle="Diplom ma'lumotlari reyestrga saqlanadi"
        keng
      >
        {(yop) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {xato && <div className="err-txt">{xato}</div>}
            <div className="tmodal__grid">
              <div>
                <label className="login__label">Bosqich</label>
                <select className="select" value={forma.bosqich} onChange={(e) => setForma({ ...forma, bosqich: e.target.value })}>
                  {Object.entries(BOSQICH_NOMLARI).map(([id, nom]) => (
                    <option key={id} value={id}>{nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="login__label">Holati</label>
                <select className="select" value={forma.holati} onChange={(e) => setForma({ ...forma, holati: e.target.value })}>
                  <option value="tamomlagan">Tamomlagan</option>
                  <option value="oqimoqda">O‘qimoqda</option>
                  <option value="chetlatilgan">Chetlatilgan</option>
                </select>
              </div>
            </div>
            <div>
              <label className="login__label">Muassasa nomi *</label>
              <input className="inp" type="text" value={forma.muassasa_nomi} onChange={(e) => setForma({ ...forma, muassasa_nomi: e.target.value })} placeholder="masalan: Toshkent tibbiyot akademiyasi" />
            </div>
            <div>
              <label className="login__label">Yo‘nalish / mutaxassislik</label>
              <input className="inp" type="text" value={forma.yonalish_nomi} onChange={(e) => setForma({ ...forma, yonalish_nomi: e.target.value })} placeholder="masalan: Kardiologiya" />
            </div>
            <div className="tmodal__grid">
              <div>
                <label className="login__label">Boshlangan yil *</label>
                <input className="inp" type="number" min="1950" max="2100" value={forma.boshlangan_yil} onChange={(e) => setForma({ ...forma, boshlangan_yil: e.target.value })} />
              </div>
              <div>
                <label className="login__label">Tugatilgan yil</label>
                <input className="inp" type="number" min="1950" max="2100" value={forma.tugatilgan_yil} onChange={(e) => setForma({ ...forma, tugatilgan_yil: e.target.value })} placeholder="bo‘sh = davom etmoqda" />
              </div>
            </div>
            <div className="tmodal__grid">
              <div>
                <label className="login__label">Diplom raqami</label>
                <input className="inp" type="text" value={forma.diplom_raqami} onChange={(e) => setForma({ ...forma, diplom_raqami: e.target.value })} placeholder="B 1234567" />
              </div>
              <div>
                <label className="login__label">Diplom sanasi</label>
                <input className="inp" type="date" value={forma.diplom_sanasi} onChange={(e) => setForma({ ...forma, diplom_sanasi: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button className="btn btn--ghost" onClick={yop}>Bekor qilish</button>
              <button className="btn" onClick={() => handleQoshish(yop)}>Saqlash</button>
            </div>
          </div>
        )}
      </GlassModal>
    </>
  );
}
