'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, SectionHead } from '../ui.jsx';
import Icon from '../icons.jsx';
import { getElonlar } from '../../lib/data-service';
import { RANG_TOKEN, TURI_NOMI, TURI_IKON, qiymatMatn, faolmi } from './story-utils';

// Canvas 3-yo'nalish («Ilm-fan va innovatsiyalar») — har bir kabinetdagi alohida bo'lim:
// yo'nalish plitkalari (grant loyihalari, IRA loyihalari, Scopus, ilmiy daraja) + so'nggi loyihalar.
// Grant/IRA/Scopus manbalari: grantlar jonli (elonlar), IRA va Scopus — Rejada (tashqi tizim).

function darajaMatni(profile) {
  if (!profile) return null;
  if (profile.hozirgi_bosqich === 'doktorantura') {
    const l = (profile.lavozimi || '').split(' · ')[0];
    return l || 'Doktorantura';
  }
  if (profile.hozirgi_bosqich === 'doktor') return 'Amaliyotchi shifokor';
  return null;
}

export function IlmFanYonalishlar({ profile, grantSoni, ixcham = false }) {
  const daraja = darajaMatni(profile);
  const plitkalar = [
    { key: 'grant', nom: 'Grant loyihalari', qiymat: grantSoni != null ? `${grantSoni} ta` : '—', izoh: 'TDTU va Biofarmatsevtika instituti', tone: 'teal', holat: 'Jonli', icon: 'flask', href: '/elonlar' },
    { key: 'ira', nom: 'IRA loyihalari', qiymat: '—', izoh: 'Innovatsion rivojlanish agentligi', tone: 'accent', holat: 'Rejada', icon: 'award', href: '/elonlar' },
    { key: 'scopus', nom: 'Scopus nashrlar', qiymat: '—', izoh: 'ilmiy maqolalar bazasi', tone: 'accent', holat: 'Rejada', icon: 'globe', href: '/elonlar' },
    { key: 'daraja', nom: 'Ilmiy daraja va unvon', qiymat: daraja || '—', izoh: daraja ? 'profil ma‘lumoti' : 'hozircha biriktirilmagan', tone: daraja ? 'violet' : 'neutral', holat: daraja ? 'Profil' : '—', icon: 'certificate', href: '/profile' },
  ];
  return (
    <div className={`ilmfan-yonalishlar ${ixcham ? 'ilmfan-yonalishlar--ixcham' : ''}`}>
      {plitkalar.map((p) => {
        const I = Icon[p.icon] || Icon.folder;
        return (
          <Link key={p.key} href={p.href} className="ilmfan-plitka">
            <span className="ilmfan-plitka__ikon"><I width={18} height={18} /></span>
            <span className="ilmfan-plitka__matn">
              <span className="ilmfan-plitka__nom">{p.nom}</span>
              <span className="ilmfan-plitka__qiymat">{p.qiymat}</span>
              <span className="ilmfan-plitka__izoh">{p.izoh}</span>
            </span>
            <Badge tone={p.tone} variant="dot">{p.holat}</Badge>
          </Link>
        );
      })}
    </div>
  );
}

export default function IlmFanBolimi({ profile }) {
  const [elonlar, setElonlar] = useState([]);
  useEffect(() => {
    let bekor = false;
    getElonlar().then((e) => {
      if (!bekor) setElonlar(e.filter(faolmi));
    });
    return () => {
      bekor = true;
    };
  }, []);
  const grantlar = elonlar.filter((e) => e.turi === 'grant');
  const songgi = elonlar.slice(0, 3);

  return (
    <section className="ilmfan-bolim">
      <SectionHead
        title="Ilm-fan va innovatsiyalar"
        extra={<Link href="/elonlar" className="story-lenta__link">Bo‘limga o‘tish →</Link>}
      />
      <IlmFanYonalishlar profile={profile} grantSoni={grantlar.length} />
      {songgi.length > 0 && (
        <div className="ilmfan-songgi">
          {songgi.map((e) => {
            const I = Icon[TURI_IKON[e.turi]] || Icon.megaphone;
            return (
              <Link key={e.id} href={`/elonlar/${e.id}`} className="ilmfan-mini">
                <span className="ilmfan-mini__rang" style={{ background: RANG_TOKEN[e.rang] || RANG_TOKEN.primary }}>
                  <I width={16} height={16} />
                </span>
                <span className="ilmfan-mini__matn">
                  <span className="ilmfan-mini__turi">{TURI_NOMI[e.turi] || 'E‘lon'}{e.muassasa ? ` · ${e.muassasa}` : ''}</span>
                  <span className="ilmfan-mini__sarlavha">{e.sarlavha}</span>
                  {qiymatMatn(e.qiymat) && <span className="ilmfan-mini__izoh">{qiymatMatn(e.qiymat)}{e.muddat ? ` · ${e.muddat}` : ''}</span>}
                </span>
                <span className="ilmfan-mini__strelka">→</span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
