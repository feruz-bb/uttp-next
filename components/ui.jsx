'use client';

// Qayta ishlatiladigan UI komponentlari — uttp-platform/src/components/ui.jsx dan
// Next.js'ga moslab ko'chirilgan (react-router o'rniga lokal holat/next-navigation).
// 2026-09 UI polish: PageHead (breadcrumb/count/badge/meta/actions), StatCard (label-ustida-raqam),
// KpiStrip, Badge juftliklari + dot varianti, DataTable (numeric/rowHeader/pageSize/totals/footnote/toolbar),
// Card (subtitle/headerBand/footer), SummaryList, DefinitionGrid, FilterRow/FilterField, SectionHead,
// TabGroup variant="underline". Barcha eski proplar o'zgarishsiz ishlaydi.
import { Fragment, useState, useMemo, useEffect, useContext, useRef, useId, createContext } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Icon from './icons.jsx';
import { theme } from '../lib/theme.js';

// Card sarlavhasidagi "tools" konteyneri — DataTable qidiruvi shu yerga portal qilinadi
const CardHeadCtx = createContext(null);

// Bo'sh qiymat (null / undefined / '') — jadval va ro'yxatlarda xira «—» bilan chiqadi
const bosh = (v) => v === null || v === undefined || v === '';

// Minglik ajratgich (1 228) — locale'ga bog'liq emas, SSR bilan bir xil
const sonFmt = (n) => String(n ?? 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// Hudud klassifikatori (profiles.manzil_viloyat_id → inson o'qiydigan nom). Admin formasi select'i,
// kabinet SummaryList «Hudud» qatori va reyestr jadvali shu ro'yxatdan oladi — xom slug UI'ga chiqmaydi.
// (lib/ ochilganda lib/hududlar.js ga ko'chiriladi.)
export const HUDUDLAR = [
  { id: 'andijon', nom: 'Andijon viloyati' },
  { id: 'buxoro', nom: 'Buxoro viloyati' },
  { id: 'fargona', nom: 'Farg‘ona viloyati' },
  { id: 'jizzax', nom: 'Jizzax viloyati' },
  { id: 'namangan', nom: 'Namangan viloyati' },
  { id: 'navoiy', nom: 'Navoiy viloyati' },
  { id: 'qashqadaryo', nom: 'Qashqadaryo viloyati' },
  { id: 'qoraqalpogiston', nom: 'Qoraqalpog‘iston Resp.' },
  { id: 'samarqand', nom: 'Samarqand viloyati' },
  { id: 'sirdaryo', nom: 'Sirdaryo viloyati' },
  { id: 'surxondaryo', nom: 'Surxondaryo viloyati' },
  { id: 'toshkent-shahar', nom: 'Toshkent shahri' },
  { id: 'toshkent-viloyat', nom: 'Toshkent viloyati' },
  { id: 'xorazm', nom: 'Xorazm viloyati' },
];

// «Namangan viloyati, Namangan shahri» — viloyat nomi + (bo'lsa) tuman; hech narsa bo'lmasa '' (SummaryList «—» chiqaradi)
export function hududNomi(viloyatId, tuman) {
  const viloyat = HUDUDLAR.find((h) => h.id === viloyatId)?.nom || '';
  return [viloyat, tuman].filter(Boolean).join(', ');
}

// Birlashtirilgan modul ichidagi tab'lar (lokal holat bilan).
// tabs: [{ key, label, element }]; variant: 'underline' — PageHead ostidagi bo'lim almashtirgich.
// value/onChange berilsa boshqariladigan rejim (sahifa faol tabni bilishi kerak bo'lganda —
// masalan, PageHead tugmasi faqat bitta tabda chiqadi); berilmasa avvalgidek ichki holat ishlaydi.
export function TabGroup({ tabs, variant, value, onChange }) {
  const [ichkiActive, setIchkiActive] = useState(tabs[0].key);
  const boshqariladi = value !== undefined;
  const active = boshqariladi ? value : ichkiActive;
  const current = tabs.find((t) => t.key === active) || tabs[0];
  const tanla = (key) => {
    if (!boshqariladi) setIchkiActive(key);
    if (onChange) onChange(key);
  };
  return (
    <>
      <div className={`tabs${variant === 'underline' ? ' tabs--underline' : ''}`} role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={t.key === active}
            className={`tab ${t.key === active ? 'active' : ''}`}
            onClick={() => tanla(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {current.element}
    </>
  );
}

// Segmentli filtr — kartaning yuqori o'ng burchagida.
export function Segmented({ options, value, onChange }) {
  const opts = options.map((o) => (typeof o === 'string' ? { key: o, label: o } : o));
  return (
    <div className="seg" role="tablist">
      {opts.map((o) => (
        <button
          key={o.key}
          role="tab"
          aria-selected={o.key === value}
          className={`seg__btn ${o.key === value ? 'active' : ''}`}
          onClick={() => onChange(o.key)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// Statistika kartasi — yorliq ustida raqam. tone faqat yorliqdagi inline ikonkani bo'yaydi
// (primary · accent · teal · warning · success · violet · info); delta — konturli pill, caption — xira izoh.
export function StatCard({ label, value, delta, up, icon, tone = 'primary', caption }) {
  const IconCmp = icon ? Icon[icon] || Icon.chart : null;
  const matn = typeof value === 'string' || typeof value === 'number' ? String(value) : undefined;
  // Matnli qiymat (harf bor: «Magistratura / Ordinatura», «7-sinfdan») — kichikroq o'lchamda ikki satrga o'raladi;
  // raqam/foiz/«—»/«…» kabi qiymatlar 28px tabular uslubda qoladi
  const matnli = typeof value === 'string' && /[^\d\s.,%/·–—+…-]/.test(value);
  return (
    <div className={`stat stat--${tone}`}>
      <div className="stat__label">
        {IconCmp && <IconCmp className="stat__ico" width={16} height={16} aria-hidden="true" />}
        <span className="stat__label-text">{label}</span>
      </div>
      <div className={`stat__value${matnli ? ' stat__value--text' : ''}`} title={matn}>{value}</div>
      {(delta || caption) && (
        <div className="stat__foot">
          {delta && (
            <span className={`stat__delta ${up ? 'up' : 'down'}`}>
              {up ? '▲' : '▼'} {delta}
            </span>
          )}
          {caption && <span className="stat__caption">{caption}</span>}
        </div>
      )}
    </div>
  );
}

// KPI chizig'i — bitta chegarali kartada 3–5 ta ikkilamchi ko'rsatkich, 1px tik chiziqlar bilan.
// items: [{ label, value, caption? }]
export function KpiStrip({ items = [], className = '' }) {
  return (
    <div className={`kpi-strip ${className}`.trim()}>
      {items.map((it, i) => (
        <div className="kpi-strip__item" key={it.key ?? i}>
          <div className="kpi-strip__label">{it.label}</div>
          <div className="kpi-strip__value">{it.value}</div>
          {it.caption && <div className="kpi-strip__caption">{it.caption}</div>}
        </div>
      ))}
    </div>
  );
}

// Karta. subtitle — sarlavha ostidagi xira satr; headerBand — kulrang sarlavha tasmasi;
// footer — pastki slot (masalan «Batafsil →» havolasi).
export function Card({ title, subtitle, extra, headerBand, footer, children, className = '' }) {
  // ref-callback + state: portal nishoni mount bo'lgach DataTable qayta render oladi
  const [tools, setTools] = useState(null);
  const cls = ['card', headerBand ? 'card--band' : '', className].filter(Boolean).join(' ');
  return (
    <div className={cls}>
      {(title || subtitle || extra) && (
        <div className="card__head">
          {(title || subtitle) && (
            <div className="card__head-main">
              {title && <h3>{title}</h3>}
              {subtitle && <p className="card__sub">{subtitle}</p>}
            </div>
          )}
          <div className="card__head-right">
            {extra && <span>{extra}</span>}
            <div className="card__head-tools" ref={setTools} />
          </div>
        </div>
      )}
      <CardHeadCtx.Provider value={tools}>{children}</CardHeadCtx.Provider>
      {footer && <div className="card__foot">{footer}</div>}
    </div>
  );
}

// Nishoncha. tone: info · teal · success · warning · danger · accent · violet · neutral;
// variant="dot" — fon o'rniga 6px nuqta + oddiy matn (sokin jadvallar uchun).
export function Badge({ children, tone = 'info', variant }) {
  return (
    <span className={`badge badge--${tone}${variant === 'dot' ? ' badge--dot' : ''}`}>{children}</span>
  );
}

// «Ma'lumot yangilangan» meta satri uchun kichik yangilash ikonkasi (icons.jsx'da yo'q)
function RefreshIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

// Sahifa sarlavhasi: breadcrumb → sarlavha (+ xira soni, + badge) → izoh → meta satr; o'ngda amallar.
// breadcrumb: [{ label, href? }] — «›» ajratgich bilan; actions: tugmalar (bitta primary + konturli).
export function PageHead({ title, subtitle, breadcrumb, count, badge, meta, actions }) {
  const yol = Array.isArray(breadcrumb) ? breadcrumb : null;
  return (
    <div className="page-head">
      <div className="page-head__main">
        {yol && yol.length > 0 && (
          <nav className="page-head__crumb" aria-label="Sahifa yo‘li">
            {yol.map((b, i) => {
              const oxirgi = i === yol.length - 1;
              return (
                <Fragment key={i}>
                  {i > 0 && <span className="page-head__crumb-sep" aria-hidden="true">›</span>}
                  {b.href && !oxirgi ? (
                    <Link href={b.href}>{b.label}</Link>
                  ) : (
                    <span aria-current={oxirgi ? 'page' : undefined}>{b.label}</span>
                  )}
                </Fragment>
              );
            })}
          </nav>
        )}
        <div className="page-head__title-row">
          <h1>{title}</h1>
          {!bosh(count) && <span className="page-head__count">{count}</span>}
          {badge}
        </div>
        {subtitle && <p>{subtitle}</p>}
        {meta && (
          <div className="page-head__meta">
            <RefreshIcon />
            <span>{meta}</span>
          </div>
        )}
      </div>
      {actions && <div className="page-head__actions">{actions}</div>}
    </div>
  );
}

const SAHIFA_HAJMLARI = [10, 25, 50, 100];

// Universal jadval.
// columns: [{ key, label, mono?, numeric?, rowHeader?, badge? (tone-map yoki fn), render? }]
// pageSize — sahifalash (faqat qatorlar pageSize dan ko'p bo'lsa pager chiqadi);
// totals — { [key]: qiymat } → «Jami» tfoot qatori; footnote — manba izohi; toolbar — qidiruv o'ngidagi slot.
export function DataTable({
  columns,
  rows,
  empty = 'Ma’lumot yo‘q',
  onRowClick,
  searchable,
  actions,
  numbered,
  // renderExpanded(row) berilsa qator bosilganda ostida yig'ilib ochiladigan panel chiqadi
  renderExpanded,
  rowKey,
  // expandedKey berilsa panel tashqaridan boshqariladi (masalan grafikdan bosilganda)
  expandedKey,
  onExpandedChange,
  pageSize,
  totals,
  footnote,
  toolbar,
}) {
  const [query, setQuery] = useState('');
  const [ichkiKalit, setIchkiKalit] = useState(null);
  const boshqariladi = expandedKey !== undefined;
  const ochiqKalit = boshqariladi ? expandedKey : ichkiKalit;
  const [sort, setSort] = useState({ key: null, dir: 1 });
  const [sahifa, setSahifa] = useState(1);
  const [hajm, setHajm] = useState(pageSize || SAHIFA_HAJMLARI[1]);
  const headTools = useContext(CardHeadCtx);

  // Qatorlar (tashqi filtr/hudud tanlovi) yoki tartib o'zgarsa — 1-sahifaga qaytish
  useEffect(() => {
    setSahifa(1);
  }, [rows, sort]);

  const filtered = useMemo(() => {
    let out = rows;
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter((r) =>
        columns.some((c) => String(r[c.key] ?? '').toLowerCase().includes(q))
      );
    }
    if (sort.key) {
      out = [...out].sort((a, b) => {
        const av = a[sort.key], bv = b[sort.key];
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sort.dir;
        return String(av ?? '').localeCompare(String(bv ?? '')) * sort.dir;
      });
    }
    return out;
  }, [rows, query, sort, columns]);

  // Sahifalash — faqat pageSize berilgan va jami qatorlar undan ko'p bo'lsa
  const sahifalanadi = Boolean(pageSize) && rows.length > pageSize;
  const jamiSahifa = sahifalanadi ? Math.max(1, Math.ceil(filtered.length / hajm)) : 1;
  const joriySahifa = Math.min(sahifa, jamiSahifa);
  const boshIndeks = sahifalanadi ? (joriySahifa - 1) * hajm : 0;
  const korinadigan = sahifalanadi ? filtered.slice(boshIndeks, boshIndeks + hajm) : filtered;
  const hajmlar = !pageSize || SAHIFA_HAJMLARI.includes(pageSize)
    ? SAHIFA_HAJMLARI
    : [...SAHIFA_HAJMLARI, pageSize].sort((a, b) => a - b);

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: 1 }));
  const qidir = (v) => {
    setQuery(v);
    setSahifa(1);
  };
  const hajmOzgar = (n) => {
    setHajm(n);
    setSahifa(1);
  };

  const ustunSoni = columns.length + (numbered ? 1 : 0) + (renderExpanded ? 1 : 0);
  const toolbarBor = Boolean(searchable || toolbar || actions);

  // Katak sinfi: mono / num (o'ngga tekis, tabular-nums)
  const katakCls = (c) => [c.mono ? 'mono' : '', c.numeric ? 'num' : ''].filter(Boolean).join(' ') || undefined;

  return (
    <>
      {toolbarBor && (() => {
        const tb = (
          <div className="tbl-toolbar tbl-toolbar--table">
            {searchable && (
              <div className="search tbl-toolbar__search">
                <Icon.search width={17} height={17} />
                <input
                  name="qidiruv"
                  value={query}
                  onChange={(e) => qidir(e.target.value)}
                  placeholder="Jadvalda qidirish..."
                  aria-label="Jadvalda qidirish"
                />
              </div>
            )}
            {toolbar}
            {actions}
          </div>
        );
        return headTools ? createPortal(tb, headTools) : tb;
      })()}
      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              {numbered && <th scope="col" style={{ width: 46 }}>№</th>}
              {renderExpanded && <th scope="col" style={{ width: 34 }} aria-label="Batafsil" />}
              {columns.map((c) => {
                const faol = searchable && sort.key === c.key;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    className={c.numeric ? 'num' : undefined}
                    aria-sort={faol ? (sort.dir === 1 ? 'ascending' : 'descending') : undefined}
                  >
                    {searchable ? (
                      <button type="button" className="tbl__sort-btn" onClick={() => toggleSort(c.key)}>
                        {c.label}
                        {faol && <span className="tbl__sort" aria-hidden="true">{sort.dir === 1 ? '▲' : '▼'}</span>}
                      </button>
                    ) : (
                      c.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={ustunSoni} className="tbl__empty-row">
                  {empty}
                </td>
              </tr>
            )}
            {korinadigan.map((row, i) => {
              const kalit = rowKey ? rowKey(row) : row.id ?? boshIndeks + i;
              const ochiq = Boolean(renderExpanded) && ochiqKalit === kalit;
              const bosish =
                renderExpanded || onRowClick
                  ? () => {
                      if (renderExpanded) {
                        const yangi = ochiqKalit === kalit ? null : kalit;
                        if (!boshqariladi) setIchkiKalit(yangi);
                        if (onExpandedChange) onExpandedChange(yangi);
                      }
                      if (onRowClick) onRowClick(row);
                    }
                  : undefined;
              return (
                <Fragment key={kalit}>
                  <tr
                    className={bosish ? 'row-click' : undefined}
                    onClick={bosish}
                    aria-expanded={renderExpanded ? ochiq : undefined}
                  >
                    {numbered && <td className="tbl__no">{boshIndeks + i + 1}</td>}
                    {renderExpanded && (
                      <td className="row-caret" aria-hidden="true">
                        <span className={ochiq ? 'caret caret--open' : 'caret'}>›</span>
                      </td>
                    )}
                    {columns.map((c) => {
                      const val = row[c.key];
                      let content = val;
                      if (c.render) content = c.render(row);
                      else if (c.badge) {
                        const tone = typeof c.badge === 'function' ? c.badge(row) : c.badge[val] || 'info';
                        content = <Badge tone={tone}>{val}</Badge>;
                      }
                      if (bosh(content) || content === '—') content = <span className="tbl__empty">—</span>;
                      const cls = katakCls(c);
                      if (c.rowHeader) {
                        return (
                          <th key={c.key} scope="row" className={cls ? `tbl__rowhead ${cls}` : 'tbl__rowhead'}>
                            {content}
                          </th>
                        );
                      }
                      return (
                        <td key={c.key} className={cls}>
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                  {ochiq && (
                    <tr className="row-expanded">
                      <td colSpan={ustunSoni}>{renderExpanded(row)}</td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
          {totals && (
            <tfoot>
              <tr className="tbl__totals">
                {columns.map((c, ci) => {
                  const qiymat = totals[c.key];
                  if (ci === 0) {
                    // Birinchi ustun «Jami» yorlig'i — № va caret ustunlarini ham qamrab oladi
                    const span = 1 + (numbered ? 1 : 0) + (renderExpanded ? 1 : 0);
                    return (
                      <th key={c.key} scope="row" colSpan={span} className={c.numeric ? 'num' : undefined}>
                        Jami
                        {!bosh(qiymat) && <span className="tbl__totals-note">{qiymat}</span>}
                      </th>
                    );
                  }
                  return (
                    <td key={c.key} className={c.numeric ? 'num' : undefined}>
                      {bosh(qiymat) ? '' : qiymat}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {(sahifalanadi || footnote) && (
        <div className="tbl-foot">
          {sahifalanadi && (
            <div className="tbl-pager">
              <span className="tbl-pager__info">
                Ko‘rsatilmoqda{' '}
                {filtered.length
                  ? `${sonFmt(boshIndeks + 1)}–${sonFmt(boshIndeks + korinadigan.length)}`
                  : '0'}{' '}
                / {sonFmt(filtered.length)} ta
              </span>
              <div className="tbl-pager__ctl">
                <label className="tbl-pager__size">
                  Sahifada
                  <select
                    className="select select--sm"
                    name="sahifada"
                    value={hajm}
                    onChange={(e) => hajmOzgar(Number(e.target.value))}
                  >
                    {hajmlar.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="tbl-pager__btn"
                  disabled={joriySahifa <= 1}
                  onClick={() => setSahifa(joriySahifa - 1)}
                >
                  ‹ Oldingi
                </button>
                <span className="tbl-pager__page">
                  {joriySahifa} / {jamiSahifa}
                </span>
                <button
                  type="button"
                  className="tbl-pager__btn"
                  disabled={joriySahifa >= jamiSahifa}
                  onClick={() => setSahifa(joriySahifa + 1)}
                >
                  Keyingi ›
                </button>
              </div>
            </div>
          )}
          {footnote && <div className="tbl-footnote">{footnote}</div>}
        </div>
      )}
    </>
  );
}

// Yorliq–qiymat ro'yxati (30 % / 70 %, yupqa ajratgichlar). items: [{ label, value, mono? }]
export function SummaryList({ items = [], className = '' }) {
  return (
    <dl className={`summary-list ${className}`.trim()}>
      {items.map((it, i) => (
        <div className="summary-list__row" key={it.key ?? i}>
          <dt>{it.label}</dt>
          <dd className={it.mono ? 'mono' : undefined}>
            {bosh(it.value) ? <span className="tbl__empty">—</span> : it.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// Ta'rif to'ri — 3 ustun: 12px katta harfli xira yorliq ustida 15px qiymat. items: [{ label, value }]
export function DefinitionGrid({ items = [], columns = 3, className = '' }) {
  return (
    <dl className={`def-grid ${className}`.trim()} style={{ '--def-cols': columns }}>
      {items.map((it, i) => (
        <div className="def-grid__item" key={it.key ?? i}>
          <dt>{it.label}</dt>
          <dd>{bosh(it.value) ? <span className="tbl__empty">—</span> : it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// Filtr qatori — sarlavha ostida yorliqli selectlar; o'ngda «Jami: 205» va «Tozalash» havolasi.
export function FilterRow({ children, total, totalLabel = 'Jami', onClear, className = '' }) {
  const ongBor = !bosh(total) || onClear;
  return (
    <div className={`filter-row ${className}`.trim()}>
      <div className="filter-row__fields">{children}</div>
      {ongBor && (
        <div className="filter-row__right">
          {!bosh(total) && (
            <span className="filter-row__total">
              {totalLabel}: <b>{typeof total === 'number' ? sonFmt(total) : total}</b>
            </span>
          )}
          {onClear && (
            <button type="button" className="filter-row__clear" onClick={onClear}>
              Tozalash
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Yorliqli select o'rami — FilterRow ichida: kichik izoh ustida 42px select.
export function FilterField({ label, children, className = '' }) {
  return (
    <label className={`filter-field ${className}`.trim()}>
      {label && <span className="filter-field__label">{label}</span>}
      {children}
    </label>
  );
}

// Bo'lim sarlavhasi — karta guruhi ustida: 19px/600 sarlavha, o'ngda xira slot (vaqt yoki «Barchasi →»).
export function SectionHead({ title, extra, className = '' }) {
  return (
    <div className={`section-head ${className}`.trim()}>
      <h2 className="section-head__title">{title}</h2>
      {extra && <div className="section-head__extra">{extra}</div>}
    </div>
  );
}

// TZ modul maqsadini ko'rsatuvchi ma'lumot paneli.
export function InfoBanner({ maqsad, ishlar, manba }) {
  return (
    <div className="info-banner">
      {maqsad && (
        <div className="info-banner__item">
          <span className="info-banner__label">Maqsad</span>
          <p>{maqsad}</p>
        </div>
      )}
      {ishlar && (
        <div className="info-banner__item">
          <span className="info-banner__label">Bajariladigan ishlar</span>
          <p>{ishlar}</p>
        </div>
      )}
      {manba && (
        <div className="info-banner__item">
          <span className="info-banner__label">Ma’lumot manbalari</span>
          <p>{manba}</p>
        </div>
      )}
    </div>
  );
}

// Progress-bar (kredit ijrosi uchun)
export function Progress({ value, max = 100, tone }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const color =
    tone || (pct >= 100 ? 'var(--success)' : pct >= 60 ? 'var(--primary)' : 'var(--warning)');
  return (
    <div className="progress" title={`${pct}%`}>
      <div className="progress__bar" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// Markaziy modal — kabinetdagi barcha formalar uchun yagona qobiq.
// Escape yopadi, ochilganda fokus birinchi maydonga o'tadi, role="dialog" + aria-labelledby.
export function GlassModal({ open, onClose, title, subtitle, keng, children }) {
  const [yopilmoqda, setYopilmoqda] = useState(false);
  const panelRef = useRef(null);
  const yopRef = useRef(null);
  const sarlavhaId = useId();

  const yop = () => {
    if (yopilmoqda) return;
    setYopilmoqda(true);
    setTimeout(() => {
      setYopilmoqda(false);
      onClose();
    }, 170);
  };
  yopRef.current = yop;

  // Escape — yopish; ochilganda fokus birinchi input/select/textarea'ga (bo'lmasa panelning o'ziga)
  useEffect(() => {
    if (!open) return undefined;
    const klavish = (e) => {
      if (e.key === 'Escape') yopRef.current?.();
    };
    document.addEventListener('keydown', klavish);
    const birinchi = panelRef.current?.querySelector('input, select, textarea');
    if (birinchi) birinchi.focus();
    else panelRef.current?.focus();
    return () => document.removeEventListener('keydown', klavish);
  }, [open]);

  if (!open) return null;
  return (
    <div className={`tmodal-overlay ${yopilmoqda ? 'tmodal-overlay--yopil' : ''}`} onClick={yop}>
      <div
        ref={panelRef}
        className={`tmodal ${keng ? 'tmodal--keng' : ''} ${yopilmoqda ? 'tmodal--yopil' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={sarlavhaId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tmodal__head">
          <div>
            <h3 id={sarlavhaId}>{title}</h3>
            {subtitle && <p className="tmodal__sub">{subtitle}</p>}
          </div>
          <button type="button" className="drawer__close" onClick={yop} aria-label="Yopish">✕</button>
        </div>
        {typeof children === 'function' ? children(yop) : children}
      </div>
    </div>
  );
}

// Yon panel (drawer) — o'ng tomondan ochiladi.
export function Drawer({ open, onClose, title, subtitle, children }) {
  if (!open) return null;
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer__head">
          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="drawer__close" onClick={onClose} aria-label="Yopish">
            ✕
          </button>
        </div>
        <div className="drawer__body">{children}</div>
      </div>
    </div>
  );
}

// Nuqtali ro'yxat
export function Bullets({ items }) {
  return (
    <ul className="tz-list">
      {items.map((it, i) => <li key={i}>{it}</li>)}
    </ul>
  );
}

// Ikki ustunli ma'lumotnoma jadvali
export function RefTable({ head, rows }) {
  return (
    <div className="table-wrap">
      <table className="tbl">
        <thead><tr>{head.map((h, i) => <th key={h} style={{ width: i === 0 ? '32%' : undefined }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}><td style={{ fontWeight: 600 }}>{r[0]}</td><td>{r[1]}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

export function Stub({ title, subtitle, icon = 'folder' }) {
  const IconCmp = Icon[icon] || Icon.folder;
  return (
    <div className="stub">
      <div>
        <div className="stub__icon">
          <IconCmp width={30} height={30} />
        </div>
        <h2 style={{ margin: '0 0 6px', color: theme.text }}>{title}</h2>
        <p style={{ margin: 0, maxWidth: 420 }}>{subtitle}</p>
      </div>
    </div>
  );
}
