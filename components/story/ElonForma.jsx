'use client';

import { useEffect, useState } from 'react';
import { GlassModal } from '../ui.jsx';
import { saqlaElon } from '../../lib/data-service';
import { RANGLAR, RANG_NOMI, RANG_TOKEN, TURI_NOMI } from './story-utils';

// E'lon yaratish / tahrirlash formasi (admin, vazirlik). Story ko'rinishi oldindan ko'rsatiladi.
const BOSH = {
  sarlavha: '',
  matn: '',
  turi: 'elon',
  rang: 'primary',
  muassasa: '',
  mualliflar: '',
  qiymat: '',
  bosqich: '',
  muddat: '',
  manba: '',
  rasm_url: '',
  holat: 'faol',
  tugash: '',
};

const sanaInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');

export default function ElonForma({ open, onClose, elon, muallifId, sozlamalar, onSaqlandi }) {
  const [f, setF] = useState(BOSH);
  const [xato, setXato] = useState('');
  const [yuklanmoqda, setYuklanmoqda] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (elon) {
      setF({ ...BOSH, ...elon, qiymat: elon.qiymat ?? '', tugash: sanaInput(elon.tugash) });
    } else {
      const kun = Number(sozlamalar?.story_muddat_kun ?? 30);
      const tugash = kun > 0 ? new Date(Date.now() + kun * 86400000).toISOString().slice(0, 10) : '';
      setF({ ...BOSH, tugash });
    }
    setXato('');
  }, [open, elon, sozlamalar]);

  const oz = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const saqla = async (yop) => {
    if (!f.sarlavha.trim()) {
      setXato('Sarlavha bo‘sh bo‘lishi mumkin emas.');
      return;
    }
    setYuklanmoqda(true);
    setXato('');
    const payload = {
      id: elon?.id,
      sarlavha: f.sarlavha.trim(),
      matn: f.matn.trim() || null,
      turi: f.turi,
      rang: f.rang,
      muassasa: f.muassasa.trim() || null,
      mualliflar: f.mualliflar.trim() || null,
      qiymat: f.qiymat === '' ? null : Number(String(f.qiymat).replace(/\s/g, '')),
      bosqich: f.bosqich.trim() || null,
      muddat: f.muddat.trim() || null,
      manba: f.manba.trim() || null,
      rasm_url: f.rasm_url.trim() || null,
      holat: f.holat,
      tugash: f.tugash ? new Date(`${f.tugash}T23:59:59`).toISOString() : null,
      ...(elon ? {} : { muallif_id: muallifId && !String(muallifId).includes('@') ? muallifId : null }),
    };
    const natija = await saqlaElon(payload);
    setYuklanmoqda(false);
    if (!natija.ok) {
      setXato(`Saqlanmadi: ${natija.error}`);
      return;
    }
    onSaqlandi && onSaqlandi(natija.data);
    yop();
  };

  return (
    <GlassModal open={open} onClose={onClose} title={elon ? 'E‘lonni tahrirlash' : 'Yangi e‘lon'} subtitle="Story ko‘rinishida barcha kabinetlarda chiqadi" keng>
      {(yop) => (
        <div className="elon-forma">
          <div className="elon-forma__grid">
            <div className="elon-forma__maydonlar">
              <label className="login__label" htmlFor="ef-sarlavha">Sarlavha *</label>
              <input id="ef-sarlavha" className="inp" value={f.sarlavha} onChange={oz('sarlavha')} maxLength={160} placeholder="Masalan: Yangi grant loyihasi e‘lon qilindi" />

              <label className="login__label" htmlFor="ef-matn">Matn</label>
              <textarea id="ef-matn" className="inp" rows={5} value={f.matn} onChange={oz('matn')} maxLength={600} placeholder="Qisqa tavsif — story ichida ko‘rinadi" />

              <div className="elon-forma__qator">
                <div>
                  <label className="login__label" htmlFor="ef-turi">Turi</label>
                  <select id="ef-turi" className="select" value={f.turi} onChange={oz('turi')}>
                    {Object.entries(TURI_NOMI).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="login__label" htmlFor="ef-holat">Holati</label>
                  <select id="ef-holat" className="select" value={f.holat} onChange={oz('holat')}>
                    <option value="faol">Faol</option>
                    <option value="arxiv">Arxiv</option>
                  </select>
                </div>
                <div>
                  <label className="login__label" htmlFor="ef-tugash">Amal muddati (gacha)</label>
                  <input id="ef-tugash" className="inp" type="date" value={f.tugash} onChange={oz('tugash')} />
                </div>
              </div>

              <label className="login__label">Muqova rangi</label>
              <div className="elon-forma__ranglar" role="radiogroup" aria-label="Muqova rangi">
                {RANGLAR.map((r) => (
                  <button
                    key={r}
                    type="button"
                    role="radio"
                    aria-checked={f.rang === r}
                    title={RANG_NOMI[r]}
                    className={`elon-forma__rang ${f.rang === r ? 'elon-forma__rang--faol' : ''}`}
                    style={{ background: RANG_TOKEN[r] }}
                    onClick={() => setF((x) => ({ ...x, rang: r }))}
                  />
                ))}
              </div>

              <div className="elon-forma__qator">
                <div>
                  <label className="login__label" htmlFor="ef-muassasa">Muassasa</label>
                  <input id="ef-muassasa" className="inp" value={f.muassasa} onChange={oz('muassasa')} />
                </div>
                <div>
                  <label className="login__label" htmlFor="ef-mualliflar">Mualliflar</label>
                  <input id="ef-mualliflar" className="inp" value={f.mualliflar} onChange={oz('mualliflar')} />
                </div>
              </div>
              <div className="elon-forma__qator">
                <div>
                  <label className="login__label" htmlFor="ef-qiymat">Qiymati (so‘m)</label>
                  <input id="ef-qiymat" className="inp" inputMode="numeric" value={f.qiymat} onChange={oz('qiymat')} placeholder="1500000000" />
                </div>
                <div>
                  <label className="login__label" htmlFor="ef-muddat">Muddat</label>
                  <input id="ef-muddat" className="inp" value={f.muddat} onChange={oz('muddat')} placeholder="2026–2029" />
                </div>
                <div>
                  <label className="login__label" htmlFor="ef-bosqich">Bosqich</label>
                  <select id="ef-bosqich" className="select" value={f.bosqich} onChange={oz('bosqich')}>
                    <option value="">—</option>
                    <option value="rejalashtirilgan">rejalashtirilgan</option>
                    <option value="davom etmoqda">davom etmoqda</option>
                    <option value="yakunlangan">yakunlangan</option>
                  </select>
                </div>
              </div>
              <div className="elon-forma__qator">
                <div>
                  <label className="login__label" htmlFor="ef-manba">Manba</label>
                  <input id="ef-manba" className="inp" value={f.manba} onChange={oz('manba')} />
                </div>
                <div>
                  <label className="login__label" htmlFor="ef-rasm">Rasm URL (ixtiyoriy)</label>
                  <input id="ef-rasm" className="inp" value={f.rasm_url} onChange={oz('rasm_url')} placeholder="https://…" />
                </div>
              </div>
            </div>

            {/* Oldindan ko'rish — kichik story kartasi */}
            <div className="elon-forma__preview" aria-hidden="true">
              <div className="story-card story-card--mini" style={{ background: RANG_TOKEN[f.rang] }}>
                <div className="story-bars"><span className="story-bar"><span className="story-bar__fill story-bar__fill--tugagan" /></span></div>
                <div className="story-body">
                  <span className="story-chip">{TURI_NOMI[f.turi]}</span>
                  <h2 className="story-sarlavha">{f.sarlavha || 'Sarlavha'}</h2>
                  {f.matn && <p className="story-matn">{f.matn}</p>}
                </div>
                <div className="story-foot"><span className="story-foot__manba">{f.muassasa || 'ETTP'}</span></div>
              </div>
            </div>
          </div>

          {xato && <div className="auth-error" role="alert" style={{ marginTop: 10 }}>{xato}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button type="button" className="btn btn--ghost" onClick={yop} disabled={yuklanmoqda}>Bekor qilish</button>
            <button type="button" className="btn" onClick={() => saqla(yop)} disabled={yuklanmoqda}>
              {yuklanmoqda ? 'Saqlanmoqda…' : 'Saqlash'}
            </button>
          </div>
        </div>
      )}
    </GlassModal>
  );
}
