'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PageHead, Card, Badge, KpiStrip, SummaryList, DataTable, SectionHead } from '../../../components/ui.jsx';
import Icon from '../../../components/icons.jsx';
import StoryViewer from '../../../components/story/StoryViewer';
import {
  getElon, getElonlar, getElonStat, getElonKorishlar, korildiBelgila, getSozlamalar,
} from '../../../lib/data-service';
import { joriyProfilniOl } from '../../../lib/auth';
import {
  RANG_TOKEN, TURI_NOMI, TURI_IKON, TURI_TONE, BOSQICH_TONE, qiymatMatn, vaqtOldin, sanaVaqt, faolmi,
} from '../../../components/story/story-utils';

// Ilm-fan va innovatsiyalar — bitta grant loyihasi / e'lon haqida batafsil sahifa.
// Story ichidan «Batafsil» yoki sarlavha bosilganda shu yerga keladi.

const ROL_NOMI = { vazirlik: 'Vazirlik', admin: 'Admin', xodim: 'Xodim', talaba: 'Talaba' };
const SOHA_NOMI = { tibbiyot: 'Tibbiyot', 'tibbiyot-ijtimoiy': 'Tibbiyot va ijtimoiy soha', farmatsevtika: 'Farmatsevtika' };

export default function ElonBatafsilPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [elon, setElon] = useState(undefined); // undefined — yuklanmoqda, null — topilmadi
  const [boshqalar, setBoshqalar] = useState([]);
  const [stat, setStat] = useState(null);
  const [korishlar, setKorishlar] = useState([]);
  const [sozlamalar, setSozlamalar] = useState(null);
  const [storyOchiq, setStoryOchiq] = useState(false);

  const rol = user?.rol;
  const statistika = rol === 'vazirlik' || rol === 'admin';

  useEffect(() => {
    let bekor = false;
    (async () => {
      const [p, e, hammasi, s] = await Promise.all([joriyProfilniOl(), getElon(id), getElonlar(), getSozlamalar()]);
      if (bekor) return;
      setUser(p);
      setElon(e);
      setSozlamalar(s);
      setBoshqalar(hammasi.filter((x) => String(x.id) !== String(id) && faolmi(x)));
      if (e && p?.id) korildiBelgila(e.id, p.id); // batafsil sahifani ochish ham «ko'rish» hisoblanadi
    })();
    return () => {
      bekor = true;
    };
  }, [id]);

  useEffect(() => {
    if (!statistika || !elon) return;
    let bekor = false;
    (async () => {
      const [st, k] = await Promise.all([getElonStat(), getElonKorishlar(elon.id)]);
      if (bekor) return;
      setStat(st[elon.id] || { korishlar: 0 });
      setKorishlar(k);
    })();
    return () => {
      bekor = true;
    };
  }, [statistika, elon]);

  const korildi = useCallback((e) => korildiBelgila(e.id, user?.id), [user]);

  const oxshash = useMemo(() => {
    if (!elon) return [];
    const birXil = boshqalar.filter((x) => x.turi === elon.turi);
    return (birXil.length ? birXil : boshqalar).slice(0, 3);
  }, [boshqalar, elon]);

  if (elon === undefined) {
    return <PageHead breadcrumb={[{ label: 'Bosh sahifa', href: '/' }, { label: 'Ilm-fan va innovatsiyalar', href: '/elonlar' }]} title="Yuklanmoqda…" />;
  }
  if (!elon) {
    return (
      <>
        <PageHead breadcrumb={[{ label: 'Bosh sahifa', href: '/' }, { label: 'Ilm-fan va innovatsiyalar', href: '/elonlar' }]} title="E‘lon topilmadi" subtitle="Bu e‘lon o‘chirilgan, arxivlangan yoki muddati o‘tgan bo‘lishi mumkin." />
        <Link href="/elonlar" className="btn">← Bo‘limga qaytish</Link>
      </>
    );
  }

  const IconCmp = Icon[TURI_IKON[elon.turi]] || Icon.megaphone;
  const rang = RANG_TOKEN[elon.rang] || RANG_TOKEN.primary;
  const kpi = [
    { key: 'qiymat', label: 'Loyiha qiymati', value: qiymatMatn(elon.qiymat) || '—' },
    { key: 'muddat', label: 'Muddat', value: elon.muddat || '—' },
    { key: 'bosqich', label: 'Bosqich', value: elon.bosqich || '—' },
    { key: 'soha', label: 'Soha', value: SOHA_NOMI[elon.soha] || elon.soha || '—' },
  ];

  return (
    <>
      <PageHead
        breadcrumb={[
          { label: 'Bosh sahifa', href: '/' },
          { label: 'Ilm-fan va innovatsiyalar', href: '/elonlar' },
          { label: TURI_NOMI[elon.turi] || 'E‘lon' },
        ]}
        title={elon.sarlavha}
        badge={<Badge tone={TURI_TONE[elon.turi] || 'info'}>{TURI_NOMI[elon.turi] || 'E‘lon'}</Badge>}
        subtitle={[elon.muassasa, elon.muddat].filter(Boolean).join(' · ')}
        meta={`E‘lon qilingan: ${sanaVaqt(elon.boshlanish)} (${vaqtOldin(elon.boshlanish)})${elon.manba ? ` · Manba: ${elon.manba}` : ''}`}
        actions={
          <>
            <button type="button" className="btn btn--ghost" onClick={() => setStoryOchiq(true)}>
              <Icon.expand width={15} height={15} /> Story sifatida
            </button>
            <Link href="/elonlar" className="btn btn--ghost">← Bo‘lim</Link>
          </>
        }
      />

      {/* Muqova — story rangi bilan */}
      <div className="elon-hero" style={{ background: rang }}>
        <span className="story-head__avatar"><IconCmp width={20} height={20} /></span>
        <div className="elon-hero__matn">
          <span className="story-chip">{TURI_NOMI[elon.turi] || 'E‘lon'}{elon.bosqich ? ` · ${elon.bosqich}` : ''}</span>
          <h2 className="elon-hero__sarlavha">{elon.sarlavha}</h2>
          {elon.mualliflar && <div className="elon-hero__mualliflar">Mualliflar: {elon.mualliflar}</div>}
        </div>
      </div>

      <KpiStrip items={kpi} className="elon-kpi" />

      <div className="grid cols-2" style={{ gap: 24, alignItems: 'start', marginTop: 24 }}>
        <div style={{ display: 'grid', gap: 24 }}>
          <Card title="Loyiha haqida" subtitle="story matni">
            <p className="elon-matn">{elon.matn || '—'}</p>
          </Card>
          {elon.muammo && (
            <Card title="Qaysi muammoga yechim bo‘ladi" subtitle="tibbiyot yoki jamiyatdagi muammo">
              <p className="elon-matn">{elon.muammo}</p>
            </Card>
          )}
          {elon.mexanizm && (
            <Card title="Amalga oshirish mexanizmi" subtitle="loyiha qanday bajariladi">
              <p className="elon-matn">{elon.mexanizm}</p>
            </Card>
          )}
        </div>

        <div style={{ display: 'grid', gap: 24 }}>
          <Card title="Loyiha pasporti">
            <SummaryList
              items={[
                { label: 'Turi', value: TURI_NOMI[elon.turi] || 'E‘lon' },
                { label: 'Muassasa', value: elon.muassasa },
                { label: 'Mualliflar', value: elon.mualliflar },
                { label: 'Qiymati', value: qiymatMatn(elon.qiymat) },
                { label: 'Muddat', value: elon.muddat },
                { label: 'Bosqich', value: elon.bosqich ? <Badge tone={BOSQICH_TONE[elon.bosqich] || 'neutral'}>{elon.bosqich}</Badge> : null },
                { label: 'Soha', value: SOHA_NOMI[elon.soha] || elon.soha },
                { label: 'Manba', value: elon.manba },
                { label: 'Holati', value: elon.holat === 'faol' ? 'Faol' : 'Arxiv' },
                { label: 'Amal muddati', value: elon.tugash ? sanaVaqt(elon.tugash) : 'Muddatsiz' },
              ]}
            />
          </Card>

          {statistika && (
            <Card title="Ko‘rishlar statistikasi" subtitle="kim va qachon ko‘rgan" extra={<Badge tone="teal">{stat?.korishlar ?? 0} ko‘rdi</Badge>}>
              <DataTable
                numbered
                pageSize={10}
                columns={[
                  { key: 'fish', label: 'F.I.SH.' },
                  { key: 'rol', label: 'Rol', render: (r) => <Badge tone={r.rol === 'talaba' ? 'teal' : r.rol === 'xodim' ? 'info' : 'violet'}>{ROL_NOMI[r.rol] || r.rol}</Badge> },
                  { key: 'korilgan', label: 'Vaqt', render: (r) => sanaVaqt(r.korilgan) },
                ]}
                rows={korishlar}
                empty="Hali hech kim ko‘rmagan"
                footnote="Har foydalanuvchi bir marta hisoblanadi."
              />
            </Card>
          )}
        </div>
      </div>

      {oxshash.length > 0 && (
        <>
          <div style={{ height: 24 }} />
          <SectionHead title="Boshqa loyihalar va e‘lonlar" extra={<Link href="/elonlar" className="story-lenta__link">Barchasi →</Link>} />
          <div className="elon-grid">
            {oxshash.map((x) => {
              const I = Icon[TURI_IKON[x.turi]] || Icon.megaphone;
              return (
                <Link key={x.id} href={`/elonlar/${x.id}`} className="elon-card elon-card--havola">
                  <div className="elon-card__cover" style={{ background: RANG_TOKEN[x.rang] || RANG_TOKEN.primary }}>
                    <I width={20} height={20} />
                    <span className="elon-card__chip">{TURI_NOMI[x.turi] || 'E‘lon'}</span>
                  </div>
                  <div className="elon-card__body">
                    <h3 className="elon-card__title">{x.sarlavha}</h3>
                    <div className="elon-card__meta">
                      {x.muassasa && <span>{x.muassasa}</span>}
                      {qiymatMatn(x.qiymat) && <span>{qiymatMatn(x.qiymat)}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {storyOchiq && (
        <StoryViewer
          elonlar={[elon]}
          boshlanish={0}
          davomiyligi={Number(sozlamalar?.story_davomiyligi) || 6}
          onYopish={() => setStoryOchiq(false)}
          onKorildi={korildi}
          onBatafsil={() => setStoryOchiq(false)}
          statistika={statistika}
          statlar={stat ? { [elon.id]: stat } : {}}
          onStat={() => setStoryOchiq(false)}
        />
      )}
    </>
  );
}
