'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StoryStrip from './StoryStrip';
import StoryViewer from './StoryViewer';
import { getElonlar, getElonStat, getMeningKorishlarim, korildiBelgila, getSozlamalar } from '../../lib/data-service';
import { faolmi, qoshaOladimi } from './story-utils';

// Kabinet bosh sahifalaridagi story lentasi (Instagram uslubi): faol e'lonlar, ko'rilgan/ko'rilmagan
// halqa, to'liq ekran ko'ruvchi, ko'rish belgisi. Admin/vazirlik uchun «+ Yangi e'lon» va statistika.
export default function StoryLenta({ user, sarlavha }) {
  const router = useRouter();
  const [elonlar, setElonlar] = useState([]);
  const [korilgan, setKorilgan] = useState(() => new Set());
  const [statlar, setStatlar] = useState({});
  const [sozlamalar, setSozlamalar] = useState(null);
  const [ochiq, setOchiq] = useState(null);

  const rol = user?.rol;
  const statistika = rol === 'vazirlik' || rol === 'admin';

  useEffect(() => {
    let bekor = false;
    (async () => {
      const [e, s, k] = await Promise.all([getElonlar(), getSozlamalar(), getMeningKorishlarim(user?.id)]);
      if (bekor) return;
      setElonlar(e.filter(faolmi));
      setSozlamalar(s);
      setKorilgan(k);
      if (statistika) {
        const st = await getElonStat();
        if (!bekor) setStatlar(st);
      }
    })();
    return () => {
      bekor = true;
    };
  }, [statistika, user?.id]);

  const korildi = useCallback(
    (e) => {
      korildiBelgila(e.id, user?.id);
      setKorilgan((s) => new Set(s).add(e.id));
      if (statistika) {
        setStatlar((st) => {
          const avval = st[e.id]?.korishlar ?? 0;
          // O'z ko'rishimiz statistikada bir marta hisoblanadi
          return korilgan.has(e.id) ? st : { ...st, [e.id]: { ...(st[e.id] || {}), korishlar: avval + 1 } };
        });
      }
    },
    [user, statistika, korilgan]
  );

  if (!sozlamalar || sozlamalar.storylar_yoqilgan === false) return null;
  const qoshaOladi = qoshaOladimi(rol, sozlamalar);
  if (!elonlar.length && !qoshaOladi) return null;

  return (
    <div className="story-lenta">
      <div className="story-lenta__head">
        <span className="story-lenta__title">{sarlavha || 'Ilm-fan va innovatsiyalar'}</span>
        <Link href="/elonlar" className="story-lenta__link">Barchasi →</Link>
      </div>
      <StoryStrip
        elonlar={elonlar}
        korilgan={korilgan}
        onOchish={setOchiq}
        qoshaOladi={qoshaOladi}
        onQoshish={() => router.push('/elonlar?yangi=1')}
      />
      {ochiq != null && (
        <StoryViewer
          elonlar={elonlar}
          boshlanish={ochiq}
          davomiyligi={Number(sozlamalar.story_davomiyligi) || 6}
          onYopish={() => setOchiq(null)}
          onKorildi={korildi}
          statistika={statistika}
          statlar={statlar}
          onStat={(e) => router.push(`/elonlar?stat=${e.id}`)}
        />
      )}
    </div>
  );
}
