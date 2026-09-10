'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHead, Card, StatCard, Badge, Segmented, DataTable, Drawer, SectionHead } from '../../components/ui.jsx';
import Icon from '../../components/icons.jsx';
import StoryStrip from '../../components/story/StoryStrip';
import StoryViewer from '../../components/story/StoryViewer';
import ElonForma from '../../components/story/ElonForma';
import Link from 'next/link';
import { IlmFanYonalishlar } from '../../components/story/IlmFanBolimi';
import {
  getElonlar, getElonStat, getElonKorishlar, getMeningKorishlarim, korildiBelgila, getSozlamalar, saqlaElon, ochirElon,
} from '../../lib/data-service';
import { joriyProfilniOl } from '../../lib/auth';
import {
  RANG_TOKEN, TURI_NOMI, TURI_IKON, BOSQICH_TONE, qiymatMatn, vaqtOldin, sanaVaqt, faolmi, qoshaOladimi,
} from '../../components/story/story-utils';

// Ilm-fan va innovatsiyalar (Canvas 3-yo'nalish): grant loyihalari va e'lonlar story ko'rinishida.
// Hamma rollar ko'radi; admin/vazirlik joylaydi, tahrirlaydi va kim ko'rganini ko'radi.

const ROL_NOMI = { vazirlik: 'Vazirlik', admin: 'Admin', xodim: 'Xodim', talaba: 'Talaba' };
const TURI_FILTR = [
  { key: 'hammasi', label: 'Barchasi' },
  { key: 'grant', label: 'Grant' },
  { key: 'innovatsiya', label: 'Innovatsiya' },
  { key: 'elon', label: 'E‘lon' },
];

function ElonlarIchki() {
  const router = useRouter();
  const params = useSearchParams();
  const [user, setUser] = useState(null);
  const [elonlar, setElonlar] = useState([]);
  const [statlar, setStatlar] = useState({});
  const [korilgan, setKorilgan] = useState(() => new Set());
  const [sozlamalar, setSozlamalar] = useState(null);
  const [filtr, setFiltr] = useState('hammasi');
  const [ochiq, setOchiq] = useState(null);           // viewer index (faol ro'yxat ichida)
  const [forma, setForma] = useState({ open: false, elon: null });
  const [statElon, setStatElon] = useState(null);     // drawer: qaysi e'lon
  const [statQatorlar, setStatQatorlar] = useState([]);
  const [xabar, setXabar] = useState('');

  const rol = user?.rol;
  const statistika = rol === 'vazirlik' || rol === 'admin';
  const qoshaOladi = !!sozlamalar && qoshaOladimi(rol, sozlamalar);

  const yukla = useCallback(async (userId) => {
    const [e, s, k] = await Promise.all([getElonlar(), getSozlamalar(), getMeningKorishlarim(userId)]);
    setElonlar(e);
    setSozlamalar(s);
    setKorilgan(k);
  }, []);

  useEffect(() => {
    let bekor = false;
    (async () => {
      const p = await joriyProfilniOl();
      if (bekor) return;
      setUser(p);
      await yukla(p?.id);
    })();
    return () => {
      bekor = true;
    };
  }, [yukla]);

  useEffect(() => {
    if (!statistika) return;
    getElonStat().then(setStatlar);
  }, [statistika, elonlar]);

  // Kim ko'rgan paneli (admin/vazirlik)
  const ochStat = useCallback(async (e) => {
    setStatElon(e);
    setStatQatorlar(await getElonKorishlar(e.id));
  }, []);

  // ?yangi=1 → forma; ?stat=<id> → ko'rishlar paneli
  useEffect(() => {
    if (!sozlamalar) return;
    if (params.get('yangi') === '1' && qoshaOladi) {
      setForma({ open: true, elon: null });
      router.replace('/elonlar');
    }
    const statId = params.get('stat');
    if (statId && statistika) {
      const e = elonlar.find((x) => String(x.id) === statId);
      if (e) {
        ochStat(e);
        router.replace('/elonlar');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- faqat params/sozlamalar o'zgarganda
  }, [params, sozlamalar, elonlar]);

  const faollar = useMemo(() => elonlar.filter(faolmi), [elonlar]);
  const korinadigan = useMemo(
    () => (filtr === 'hammasi' ? elonlar : elonlar.filter((e) => e.turi === filtr)),
    [elonlar, filtr]
  );
  const viewerRoyxat = useMemo(() => korinadigan.filter(faolmi), [korinadigan]);

  const korildi = useCallback(
    (e) => {
      korildiBelgila(e.id, user?.id);
      setKorilgan((s) => new Set(s).add(e.id));
    },
    [user]
  );

  const holatniAlmashtir = async (e) => {
    const natija = await saqlaElon({ id: e.id, holat: e.holat === 'faol' ? 'arxiv' : 'faol' });
    if (!natija.ok) {
      setXabar(`Saqlanmadi: ${natija.error}`);
      return;
    }
    setElonlar((r) => r.map((x) => (x.id === e.id ? natija.data : x)));
  };

  const ochir = async (e) => {
    if (!window.confirm(`«${e.sarlavha}» e‘lonini o‘chirasizmi? Ko‘rish statistikasi ham o‘chadi.`)) return;
    const natija = await ochirElon(e.id);
    if (!natija.ok) {
      setXabar(`O‘chirilmadi: ${natija.error}`);
      return;
    }
    setElonlar((r) => r.filter((x) => x.id !== e.id));
  };

  const saqlandi = (yangi) => {
    setElonlar((r) => (r.some((x) => x.id === yangi.id) ? r.map((x) => (x.id === yangi.id ? yangi : x)) : [yangi, ...r]));
    setXabar('E‘lon saqlandi.');
    setTimeout(() => setXabar(''), 3000);
  };

  // Statistika KPI'lari (admin/vazirlik)
  const jamiKorish = Object.values(statlar).reduce((a, s) => a + (s.korishlar || 0), 0);
  const engKop = useMemo(() => {
    let top = null;
    elonlar.forEach((e) => {
      const k = statlar[e.id]?.korishlar || 0;
      if (!top || k > top.k) top = { e, k };
    });
    return top;
  }, [elonlar, statlar]);

  const actions = qoshaOladi ? (
    <button type="button" className="btn" onClick={() => setForma({ open: true, elon: null })}>
      <Icon.plus width={15} height={15} /> Yangi e‘lon
    </button>
  ) : null;

  return (
    <>
      <PageHead
        breadcrumb={[{ label: 'Bosh sahifa', href: '/' }, { label: 'Ilm-fan va innovatsiyalar' }]}
        title="Ilm-fan va innovatsiyalar"
        count={faollar.length}
        subtitle="Grant loyihalari, innovatsiyalar va e‘lonlar — story ko‘rinishida"
        meta="Manba: TDTU va Milliy biofarmatsevtika instituti grant loyihalari · 2021–2029"
        actions={actions}
      />

      {statistika && (
        <div className="grid stat-grid" style={{ marginBottom: 24 }}>
          <StatCard label="Faol e‘lonlar" value={faollar.length} icon="megaphone" tone="primary" caption={`arxivda ${elonlar.length - faollar.length}`} />
          <StatCard label="Jami ko‘rishlar" value={jamiKorish.toLocaleString('ru-RU')} icon="users" tone="teal" caption="har foydalanuvchi bir marta" />
          <StatCard label="Eng ko‘p ko‘rilgan" value={engKop ? engKop.k : 0} icon="award" tone="violet" caption={engKop?.e?.sarlavha ? engKop.e.sarlavha.slice(0, 48) : '—'} />
          <StatCard label="Kim joylay oladi" value={(sozlamalar?.story_kim_qosha_oladi || []).map((r) => ROL_NOMI[r] || r).join(' · ') || '—'} icon="key" tone="warning" caption="sozlamalar bo‘yicha" />
        </div>
      )}

      {/* Canvas 3-yo'nalish plitkalari: grant (jonli), IRA, Scopus (Rejada), ilmiy daraja */}
      <IlmFanYonalishlar profile={user} grantSoni={faollar.filter((e) => e.turi === 'grant').length} ixcham />
      <div style={{ height: 24 }} />

      <Card title="Story lentasi" subtitle="bosing — to‘liq ekranda ochiladi" extra={`${faollar.length} faol`}>
        <StoryStrip
          elonlar={viewerRoyxat}
          korilgan={korilgan}
          onOchish={setOchiq}
          qoshaOladi={qoshaOladi}
          onQoshish={() => setForma({ open: true, elon: null })}
        />
        {!viewerRoyxat.length && <p style={{ color: 'var(--muted)', fontSize: 13, margin: '8px 0 0' }}>Faol e‘lon yo‘q.</p>}
      </Card>

      <div style={{ height: 24 }} />

      <SectionHead
        title="Barcha e‘lonlar"
        extra={<Segmented options={TURI_FILTR} value={filtr} onChange={setFiltr} />}
      />
      {xabar && <div className="auth-error" role="status" style={{ marginBottom: 12 }}>{xabar}</div>}

      <div className="elon-grid">
        {korinadigan.map((e) => {
          const IconCmp = Icon[TURI_IKON[e.turi]] || Icon.megaphone;
          const faol = faolmi(e);
          const viewerIdx = viewerRoyxat.findIndex((x) => x.id === e.id);
          const stat = statlar[e.id];
          return (
            <article key={e.id} className={`elon-card ${faol ? '' : 'elon-card--arxiv'}`}>
              <div className="elon-card__cover" style={{ background: RANG_TOKEN[e.rang] || RANG_TOKEN.primary }}>
                <IconCmp width={20} height={20} />
                <span className="elon-card__chip">{TURI_NOMI[e.turi] || 'E‘lon'}</span>
                {!faol && <span className="elon-card__chip">{e.holat === 'arxiv' ? 'Arxiv' : 'Muddati o‘tgan'}</span>}
              </div>
              <div className="elon-card__body">
                <h3 className="elon-card__title"><Link href={`/elonlar/${e.id}`} className="elon-card__havola">{e.sarlavha}</Link></h3>
                {e.matn && <p className="elon-card__matn">{e.matn}</p>}
                <div className="elon-card__meta">
                  {e.muassasa && <span>{e.muassasa}</span>}
                  {qiymatMatn(e.qiymat) && <span>{qiymatMatn(e.qiymat)}</span>}
                  {e.muddat && <span>{e.muddat}</span>}
                  {e.bosqich && <Badge tone={BOSQICH_TONE[e.bosqich] || 'neutral'}>{e.bosqich}</Badge>}
                  {korilgan.has(e.id) && <Badge tone="neutral" variant="dot">ko‘rilgan</Badge>}
                </div>
              </div>
              <div className="elon-card__foot">
                <span className="elon-card__vaqt">{vaqtOldin(e.boshlanish)}</span>
                <span className="elon-card__actions">
                  {statistika && (
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => ochStat(e)} title="Kim ko‘rgan">
                      <Icon.users width={14} height={14} /> {stat?.korishlar ?? 0}
                    </button>
                  )}
                  {qoshaOladi && (
                    <>
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => setForma({ open: true, elon: e })}>Tahrirlash</button>
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => holatniAlmashtir(e)}>
                        {e.holat === 'faol' ? 'Arxivlash' : 'Faollashtirish'}
                      </button>
                      <button type="button" className="btn btn--ghost btn--sm elon-card__ochir" onClick={() => ochir(e)}>O‘chirish</button>
                    </>
                  )}
                  <Link href={`/elonlar/${e.id}`} className="btn btn--ghost btn--sm">Batafsil</Link>
                  {viewerIdx >= 0 && (
                    <button type="button" className="btn btn--sm" onClick={() => setOchiq(viewerIdx)}>Story</button>
                  )}
                </span>
              </div>
            </article>
          );
        })}
        {!korinadigan.length && <p style={{ color: 'var(--muted)' }}>Bu turda e‘lon yo‘q.</p>}
      </div>

      {ochiq != null && (
        <StoryViewer
          elonlar={viewerRoyxat}
          boshlanish={ochiq}
          davomiyligi={Number(sozlamalar?.story_davomiyligi) || 6}
          onYopish={() => setOchiq(null)}
          onKorildi={korildi}
          statistika={statistika}
          statlar={statlar}
          onStat={(e) => {
            setOchiq(null);
            ochStat(e);
          }}
        />
      )}

      <ElonForma
        open={forma.open}
        elon={forma.elon}
        muallifId={user?.id}
        sozlamalar={sozlamalar}
        onClose={() => setForma({ open: false, elon: null })}
        onSaqlandi={saqlandi}
      />

      <Drawer
        open={!!statElon}
        onClose={() => setStatElon(null)}
        title={statElon ? `Kim ko‘rgan — ${statElon.sarlavha.slice(0, 60)}` : ''}
        subtitle={statElon ? `${statQatorlar.length} nafar · oxirgi: ${statQatorlar[0] ? sanaVaqt(statQatorlar[0].korilgan) : '—'}` : ''}
      >
        <DataTable
          numbered
          columns={[
            { key: 'fish', label: 'F.I.SH.' },
            { key: 'rol', label: 'Rol', render: (r) => <Badge tone={r.rol === 'talaba' ? 'teal' : r.rol === 'xodim' ? 'info' : 'violet'}>{ROL_NOMI[r.rol] || r.rol}</Badge> },
            { key: 'hozirgi_bosqich', label: 'Bosqich', render: (r) => r.hozirgi_bosqich || '—' },
            { key: 'korilgan', label: 'Ko‘rgan vaqti', render: (r) => sanaVaqt(r.korilgan) },
          ]}
          rows={statQatorlar}
          empty="Hali hech kim ko‘rmagan"
          footnote="Har foydalanuvchi bir marta hisoblanadi (birinchi ochgan vaqti)."
        />
      </Drawer>
    </>
  );
}

export default function ElonlarPage() {
  return (
    <Suspense fallback={null}>
      <ElonlarIchki />
    </Suspense>
  );
}
