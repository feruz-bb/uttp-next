'use client';

import Icon from '../icons.jsx';
import { RANG_TOKEN, TURI_IKON } from './story-utils';

// Instagram uslubidagi story lentasi: doira muqovalar, ko'rilmagan — turkuaz halqa,
// ko'rilgan — kulrang halqa. Bosilganda StoryViewer ochiladi (onOchish(index)).
// qoshaOladi — admin/vazirlik uchun birinchi «+ Yangi e'lon» doirasi.
export default function StoryStrip({ elonlar = [], korilgan, onOchish, qoshaOladi, onQoshish, sarlavha }) {
  if (!elonlar.length && !qoshaOladi) return null;
  return (
    <div className="story-strip" role="list" aria-label={sarlavha || 'Ilm-fan va innovatsiyalar e‘lonlari'}>
      {qoshaOladi && (
        <button type="button" className="story-item story-item--qosh" onClick={onQoshish} role="listitem" title="Yangi e‘lon joylash">
          <span className="story-ring story-ring--qosh">
            <span className="story-avatar story-avatar--qosh">
              <Icon.plus width={22} height={22} />
            </span>
          </span>
          <span className="story-title">Yangi e‘lon</span>
        </button>
      )}
      {elonlar.map((e, i) => {
        const IconCmp = Icon[TURI_IKON[e.turi]] || Icon.megaphone;
        const korildi = korilgan?.has(e.id);
        return (
          <button
            type="button"
            key={e.id}
            className={`story-item ${korildi ? 'story-item--korilgan' : ''}`}
            onClick={() => onOchish(i)}
            role="listitem"
            title={e.sarlavha}
            aria-label={`${e.sarlavha}${korildi ? ' (ko‘rilgan)' : ''}`}
          >
            <span className="story-ring">
              <span className="story-avatar" style={{ background: RANG_TOKEN[e.rang] || RANG_TOKEN.primary }}>
                <IconCmp width={22} height={22} />
              </span>
            </span>
            <span className="story-title">{e.sarlavha}</span>
          </button>
        );
      })}
    </div>
  );
}
