'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Icon from '../icons.jsx';
import { Badge } from '../ui.jsx';
import { RANG_TOKEN, TURI_NOMI, TURI_IKON, BOSQICH_TONE, qiymatMatn, vaqtOldin } from './story-utils';

// Instagram story ko'rinishidagi to'liq ekran ko'ruvchi.
// - Yuqorida har e'lon uchun progress chizig'i (joriysi CSS animatsiya bilan to'ladi, tugaganda keyingisi).
// - Chap/o'ng yarmini bosish — oldingi/keyingi; bosib turish — pauza; ←/→/Esc klaviatura.
// - Sarlavha yoki «Batafsil» tugmasi bosilsa — Ilm-fan bo'limidagi batafsil sahifaga o'tadi (/elonlar/<id>),
//   xuddi Instagram'dagi «swipe up» havolasi kabi. Enter tugmasi ham shu.
// - Har ochilgan e'lon uchun onKorildi(elon) chaqiriladi (ko'rish statistikasi).
// - statistika=true (admin/vazirlik) bo'lsa pastda «N ko'rdi» tugmasi → onStat(elon).
export default function StoryViewer({
  elonlar = [],
  boshlanish = 0,
  davomiyligi = 6,
  onYopish,
  onKorildi,
  onBatafsil,
  statistika = false,
  statlar = {},
  onStat,
}) {
  const router = useRouter();
  const [indeks, setIndeks] = useState(boshlanish);
  const [pauza, setPauza] = useState(false);
  const [mounted, setMounted] = useState(false);
  const korilganRef = useRef(new Set());
  const e = elonlar[indeks];

  useEffect(() => setMounted(true), []);

  // Ko'rish belgisi — har e'lon bir marta
  useEffect(() => {
    if (!e || korilganRef.current.has(e.id)) return;
    korilganRef.current.add(e.id);
    onKorildi && onKorildi(e);
  }, [e, onKorildi]);

  const keyingi = useCallback(() => {
    setIndeks((i) => {
      if (i + 1 >= elonlar.length) {
        onYopish && onYopish();
        return i;
      }
      return i + 1;
    });
  }, [elonlar.length, onYopish]);
  const oldingi = useCallback(() => setIndeks((i) => Math.max(0, i - 1)), []);

  const batafsil = useCallback(() => {
    if (!e) return;
    if (onBatafsil) onBatafsil(e);
    else router.push(`/elonlar/${e.id}`);
    onYopish && onYopish();
  }, [e, onBatafsil, onYopish, router]);

  // Klaviatura
  useEffect(() => {
    const h = (ev) => {
      if (ev.key === 'Escape') onYopish && onYopish();
      else if (ev.key === 'ArrowRight') keyingi();
      else if (ev.key === 'ArrowLeft') oldingi();
      else if (ev.key === 'Enter') batafsil();
      else if (ev.key === ' ') {
        ev.preventDefault();
        setPauza((p) => !p);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [keyingi, oldingi, onYopish, batafsil]);

  // Sahifa skrollini bloklash
  useEffect(() => {
    const avval = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = avval;
    };
  }, []);

  if (!mounted || !e) return null;

  const IconCmp = Icon[TURI_IKON[e.turi]] || Icon.megaphone;
  const rang = RANG_TOKEN[e.rang] || RANG_TOKEN.primary;
  const stat = statlar[e.id];
  const qiymat = qiymatMatn(e.qiymat);

  return createPortal(
    <div className="story-overlay" onClick={onYopish} role="dialog" aria-modal="true" aria-label={e.sarlavha}>
      <div
        className={`story-card ${pauza ? 'story-card--pauza' : ''}`}
        style={{ background: rang, '--story-dur': `${davomiyligi}s` }}
        onClick={(ev) => ev.stopPropagation()}
        onPointerDown={() => setPauza(true)}
        onPointerUp={() => setPauza(false)}
        onPointerCancel={() => setPauza(false)}
        onPointerLeave={() => setPauza(false)}
      >
        {/* Progress chiziqlari */}
        <div className="story-bars" aria-hidden="true">
          {elonlar.map((x, i) => (
            <span key={x.id} className="story-bar">
              <span
                key={`${x.id}-${i === indeks ? 'faol' : 'x'}`}
                className={`story-bar__fill ${i < indeks ? 'story-bar__fill--tugagan' : ''} ${i === indeks ? 'story-bar__fill--faol' : ''}`}
                onAnimationEnd={i === indeks ? keyingi : undefined}
              />
            </span>
          ))}
        </div>

        {/* Sarlavha qatori */}
        <div className="story-head">
          <span className="story-head__avatar">
            <IconCmp width={18} height={18} />
          </span>
          <span className="story-head__meta">
            <span className="story-head__nom">{e.muassasa || 'ETTP'}</span>
            <span className="story-head__vaqt">{TURI_NOMI[e.turi] || 'E‘lon'} · {vaqtOldin(e.boshlanish)}</span>
          </span>
          <span className="story-head__hisob" aria-hidden="true">{indeks + 1} / {elonlar.length}</span>
          <button type="button" className="story-close" onClick={onYopish} aria-label="Yopish">✕</button>
        </div>

        {/* Matn */}
        <div className="story-body">
          {e.rasm_url && <img className="story-rasm" src={e.rasm_url} alt="" />}
          <span className="story-chip">{TURI_NOMI[e.turi] || 'E‘lon'}</span>
          <h2 className="story-sarlavha story-sarlavha--havola" onClick={batafsil} title="Batafsil ko‘rish">
            {e.sarlavha}
          </h2>
          {e.matn && <p className="story-matn">{e.matn}</p>}
          <div className="story-meta">
            {e.mualliflar && <span className="story-meta__qator"><b>Mualliflar:</b> {e.mualliflar}</span>}
            {qiymat && <span className="story-meta__qator"><b>Qiymati:</b> {qiymat}</span>}
            {e.muddat && <span className="story-meta__qator"><b>Muddat:</b> {e.muddat}</span>}
            {e.bosqich && (
              <span className="story-meta__qator">
                <Badge tone={BOSQICH_TONE[e.bosqich] || 'neutral'}>{e.bosqich}</Badge>
              </span>
            )}
          </div>
        </div>

        {/* Pastki qism: Batafsil (swipe-up o'rniga) + statistika */}
        <div className="story-foot">
          <button type="button" className="story-batafsil" onClick={batafsil}>
            <Icon.expand width={15} height={15} /> Batafsil ko‘rish
          </button>
          {statistika && (
            <button type="button" className="story-stat-btn" onClick={() => onStat && onStat(e)}>
              <Icon.users width={15} height={15} /> {stat?.korishlar ?? 0} ko‘rdi
            </button>
          )}
        </div>
        {e.manba && <div className="story-manba">Manba: {e.manba}</div>}

        {/* Navigatsiya zonalari */}
        <button type="button" className="story-nav story-nav--chap" onClick={oldingi} aria-label="Oldingi" />
        <button type="button" className="story-nav story-nav--ong" onClick={keyingi} aria-label="Keyingi" />
      </div>
    </div>,
    document.body
  );
}
