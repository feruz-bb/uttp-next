'use client';

// Qayta ishlatiladigan UI komponentlari — uttp-platform/src/components/ui.jsx dan
// Next.js'ga moslab ko'chirilgan (react-router o'rniga lokal holat/next-navigation).
import { useState, useMemo, useContext, createContext } from 'react';
import { createPortal } from 'react-dom';
import Icon from './icons.jsx';
import { theme } from '../lib/theme.js';

// Card sarlavhasidagi "tools" konteyneri — DataTable qidiruvi shu yerga portal qilinadi
const CardHeadCtx = createContext(null);

// Birlashtirilgan modul ichidagi tab'lar (lokal holat bilan).
// tabs: [{ key, label, element }]
export function TabGroup({ tabs }) {
  const [active, setActive] = useState(tabs[0].key);
  const current = tabs.find((t) => t.key === active) || tabs[0];
  return (
    <>
      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`tab ${t.key === active ? 'active' : ''}`}
            onClick={() => setActive(t.key)}
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

const toneColor = {
  primary: { bg: theme.primarySoft, fg: theme.primary },
  accent: { bg: theme.accentSoft, fg: theme.accent },
  teal: { bg: '#ccfbf1', fg: theme.teal },
  warning: { bg: theme.warningSoft, fg: theme.warning },
  success: { bg: theme.successSoft, fg: theme.success },
  violet: { bg: '#ede9fe', fg: theme.violet },
};

export function StatCard({ label, value, delta, up, icon, tone = 'primary' }) {
  const c = toneColor[tone] || toneColor.primary;
  const IconCmp = Icon[icon] || Icon.chart;
  return (
    <div className={`stat stat--${tone}`}>
      <div className="stat__top">
        <div className="stat__icon" style={{ background: c.bg, color: c.fg }}>
          <IconCmp />
        </div>
        <div className="stat__value">{value}</div>
        {delta && (
          <span className={`stat__delta ${up ? 'up' : 'down'}`}>
            {up ? '▲' : '▼'} {delta}
          </span>
        )}
      </div>
      <div className="stat__label">{label}</div>
    </div>
  );
}

export function Card({ title, extra, children, className = '' }) {
  // ref-callback + state: portal nishoni mount bo'lgach DataTable qayta render oladi
  const [tools, setTools] = useState(null);
  return (
    <div className={`card ${className}`}>
      {(title || extra) && (
        <div className="card__head">
          {title && <h3>{title}</h3>}
          <div className="card__head-right">
            {extra && <span>{extra}</span>}
            <div className="card__head-tools" ref={setTools} />
          </div>
        </div>
      )}
      <CardHeadCtx.Provider value={tools}>{children}</CardHeadCtx.Provider>
    </div>
  );
}

export function Badge({ children, tone = 'info' }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

export function PageHead({ title, subtitle }) {
  return (
    <div className="page-head">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

// Universal jadval. columns: [{ key, label, mono?, badge? (tone-map yoki fn), render? }]
export function DataTable({ columns, rows, empty = 'Ma’lumot yo‘q', onRowClick, searchable, actions, numbered }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: null, dir: 1 });
  const headTools = useContext(CardHeadCtx);

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

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: 1 }));

  return (
    <>
      {searchable && (() => {
        const toolbar = (
          <div className="tbl-toolbar">
            {actions}
            <div className="search" style={{ maxWidth: 320 }}>
              <Icon.search width={17} height={17} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Jadvalda qidirish..." />
            </div>
          </div>
        );
        return headTools ? createPortal(toolbar, headTools) : toolbar;
      })()}
      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              {numbered && <th style={{ width: 46 }}>№</th>}
              {columns.map((c) => (
                <th
                  key={c.key}
                  onClick={searchable ? () => toggleSort(c.key) : undefined}
                  style={searchable ? { cursor: 'pointer', userSelect: 'none' } : undefined}
                >
                  {c.label}
                  {searchable && sort.key === c.key && (sort.dir === 1 ? ' ▲' : ' ▼')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={columns.length + (numbered ? 1 : 0)} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  {empty}
                </td>
              </tr>
            )}
            {filtered.map((row, i) => (
              <tr
                key={row.id || i}
                className={onRowClick ? 'row-click' : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {numbered && <td style={{ color: 'var(--muted)', fontWeight: 600 }}>{i + 1}</td>}
                {columns.map((c) => {
                  const val = row[c.key];
                  let content = val;
                  if (c.render) content = c.render(row);
                  else if (c.badge) {
                    const tone = typeof c.badge === 'function' ? c.badge(row) : c.badge[val] || 'info';
                    content = <Badge tone={tone}>{val}</Badge>;
                  }
                  return (
                    <td key={c.key} className={c.mono ? 'mono' : undefined}>
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
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

// Markaziy glass-modal — kabinetdagi barcha formalar uchun yagona qobiq.
export function GlassModal({ open, onClose, title, subtitle, keng, children }) {
  const [yopilmoqda, setYopilmoqda] = useState(false);
  if (!open) return null;
  const yop = () => {
    if (yopilmoqda) return;
    setYopilmoqda(true);
    setTimeout(() => {
      setYopilmoqda(false);
      onClose();
    }, 170);
  };
  return (
    <div className={`tmodal-overlay ${yopilmoqda ? 'tmodal-overlay--yopil' : ''}`} onClick={yop}>
      <div
        className={`tmodal ${keng ? 'tmodal--keng' : ''} ${yopilmoqda ? 'tmodal--yopil' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tmodal__head">
          <div>
            <h3>{title}</h3>
            {subtitle && <p className="tmodal__sub">{subtitle}</p>}
          </div>
          <button className="drawer__close" onClick={yop} aria-label="Yopish">✕</button>
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
