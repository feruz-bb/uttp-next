'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { INITIAL_PROFILES } from '../../lib/data-service';
import { tizimgaKirish, supabaseSozlanganmi, rolBoshSahifasi } from '../../lib/auth';
import { RASMIY_RAQAMLAR } from '../../lib/rasmiy-raqamlar';

// Kirish ekrani — my.tipme.uz/user/login joylashuvi (chap brend paneli + o'ng karta),
// uslub tipme-login.css (gov navy + glass qatlami). Autentifikatsiya Supabase (lokal stack) orqali;
// Supabase ulanmagan bo'lsa localStorage demo-rejimga tushadi.
// 2026-09-08 sayqal: soxta raqamlar → rasmiy raqamlar, avatar halqasi va ikonkali yorliqlar olib tashlandi,
// demo kirish bitta ro'yxat-blokka yig'ildi, pastda yordam/© qatori.

import { DEMO_ROLLAR, DEMO_XODIMLAR, DEMO_TALABALAR, DEMO_PAROLLAR } from '../../lib/demo-hisoblar';

const fmt = (n) => (n ?? 0).toLocaleString('ru-RU');

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({ login: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  // Kabinet qobig'i hujjatga 80% zoom qo'yadi — login to'liq o'lchamda ko'rinishi uchun tiklaymiz
  useEffect(() => {
    document.documentElement.style.zoom = '';
    document.documentElement.style.removeProperty('--zoom');
  }, []);

  const kirishniYakunla = (profil) => router.push(rolBoshSahifasi(profil.rol));

  // Email+parol bilan kirish (Supabase yoki demo-fallback)
  const kir = async (email, parol) => {
    setLoading(true);
    setAuthError('');
    try {
      if (supabaseSozlanganmi()) {
        const profil = await tizimgaKirish(email, parol);
        if (profil) {
          kirishniYakunla(profil);
          return true;
        }
        setAuthError('Login yoki parol noto‘g‘ri. Qaytadan urinib ko‘ring.');
        return false;
      }
      const demoUser =
        INITIAL_PROFILES.find((p) => p.email === email) ||
        (() => {
          // Bosqich demo-xodimlari INITIAL ro'yxatida yo'q — yengil profil quramiz
          const x = DEMO_XODIMLAR.find((d) => d.email === email);
          if (x) return { id: x.email, fish: x.ism, email: x.email, rol: 'xodim', hozirgi_bosqich: x.bosqichId, lavozimi: x.bosqich };
          const t = DEMO_TALABALAR.find((d) => d.email === email);
          return t
            ? { id: t.email, fish: t.ism, email: t.email, rol: 'talaba', hozirgi_bosqich: t.bosqichId, hozirgi_kurs: t.kurs, hozirgi_muassasa: 'Toshkent davlat tibbiyot universiteti', lavozimi: t.bosqich }
            : null;
        })();
      if (demoUser) {
        localStorage.setItem('uttp_current_user', JSON.stringify(demoUser));
        kirishniYakunla(demoUser);
        return true;
      }
      setAuthError('Bunday foydalanuvchi topilmadi (demo-rejim).');
      return false;
    } catch {
      setAuthError('Tizimga ulanishda xatolik. Keyinroq urinib ko‘ring.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = {
      login: login.trim() ? '' : 'Login bo‘sh bo‘lishi mumkin emas.',
      password: password ? '' : 'Parol bo‘sh bo‘lishi mumkin emas.',
    };
    setErrors(errs);
    setAuthError('');
    if (errs.login || errs.password) return;
    kir(login.trim().toLowerCase(), password);
  };

  // Rol-qatori orqali tez kirish (SSO taqlidi — seed paroli bilan)
  const demoKir = (email) => kir(email, DEMO_PAROLLAR[email] || '');

  return (
    <div className="tipme-auth">
      <div className="auth-shell">
        {/* ═══ CHAP — Brend paneli (yassi navy, ETTP) ═══ */}
        <div className="auth-left" role="complementary">
          <div className="deco deco-1" />
          <div className="deco deco-2" />

          <div className="left-inner">
            <a href="#" className="brand-row" aria-label="Bosh sahifa" onClick={(e) => e.preventDefault()}>
              {/* eslint-disable-next-line @next/next/no-img-element -- statik 50×50 logotip, next/image optimizatsiyasi shart emas */}
              <img src="/tipme/logo-minzdrav.png" alt="Logo" width="50" height="50" />
              <div className="brand-name">ELEKTRON TIBBIY<br />TA’LIM PLATFORMASI</div>
            </a>

            <h1 className="hero-title">Tibbiyot xodimlarini <br />rivojlantirish platformasi</h1>
            <p className="hero-desc">
              Malaka oshirish, qayta tayyorlash va elektron ta’lim xizmatlarining yagona raqamli tizimi.
            </p>

            {/* Rasmiy bosh raqamlar — dashboard bilan bir xil manbalar (lib/rasmiy-raqamlar.js) */}
            <dl className="stats-row" aria-label="Platforma qamrovi">
              <div className="st">
                <dt className="st-lbl">O‘qiyotganlar</dt>
                <dd className="st-num">{fmt(RASMIY_RAQAMLAR.oqiyotganlar)}</dd>
              </div>
              <div className="st">
                <dt className="st-lbl">Tibbiyot muassasalari</dt>
                <dd className="st-num">{fmt(RASMIY_RAQAMLAR.tibbiyot_muassasalari)}</dd>
              </div>
              <div className="st">
                <dt className="st-lbl">Tibbiy jihozlar</dt>
                <dd className="st-num">{fmt(RASMIY_RAQAMLAR.tibbiy_jihozlar)}</dd>
              </div>
            </dl>
            <p className="stats-src">Texnikum anketasi, TDTU ro‘yxati va jihozlar yig‘masi, {RASMIY_RAQAMLAR.sana}.</p>
          </div>
        </div>

        {/* ═══ O'NG — Login va demo hisoblar ═══ */}
        <div className="auth-right">
          <div className="right-inner">
            <div className="login-card" role="main">
              <div className="card-head">
                <h2 className="card-title">Tizimga kirish</h2>
                <p className="card-sub">Boshqaruv va tibbiyot xodimlari uchun</p>
              </div>

              <form className="form" onSubmit={submit} noValidate>
                <div className="fg">
                  <label className="fl" htmlFor="tm-login">Foydalanuvchi nomi</label>
                  <div className={`form__field-wrap${errors.login ? ' has-error' : ''}`}>
                    <input
                      id="tm-login"
                      type="text"
                      className="fi"
                      placeholder="login@ssv.uz"
                      value={login}
                      onChange={(e) => { setLogin(e.target.value); setAuthError(''); }}
                      autoFocus
                      autoComplete="username"
                      aria-required="true"
                      aria-invalid={Boolean(errors.login)}
                      aria-describedby={errors.login ? 'tm-login-xato' : undefined}
                    />
                    <div className="help-block" id="tm-login-xato">{errors.login}</div>
                  </div>
                </div>

                <div className="fg">
                  <label className="fl" htmlFor="tm-pw">Parol</label>
                  <div className="pw-wrap">
                    <div className={`form__field-wrap${errors.password ? ' has-error' : ''}`}>
                      <input
                        id="tm-pw"
                        type={showPw ? 'text' : 'password'}
                        className="fi fi--pw"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setAuthError(''); }}
                        autoComplete="current-password"
                        aria-required="true"
                        aria-invalid={Boolean(errors.password)}
                        aria-describedby={errors.password ? 'tm-pw-xato' : undefined}
                      />
                      <div className="help-block" id="tm-pw-xato">{errors.password}</div>
                    </div>
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowPw((s) => !s)}
                      aria-label={showPw ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
                      aria-pressed={showPw}
                    >
                      <i className={showPw ? 'fa fa-eye-slash' : 'fa fa-eye'} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {authError && (
                  <div className="auth-error" role="alert">
                    <i className="fa fa-circle-exclamation" aria-hidden="true" /> {authError}
                  </div>
                )}

                <div className="f-actions">
                  <button type="submit" className="btn-login" disabled={loading}>
                    {loading ? 'Tekshirilmoqda…' : 'Kirish'}
                  </button>
                </div>
              </form>

              {/* Demo hisoblar — taqdimot uchun parolsiz tezkor kirish, bitta blok */}
              <section className="demo" aria-labelledby="demo-sarlavha">
                <div className="demo-head">
                  <h3 className="demo-title" id="demo-sarlavha">Demo hisoblar</h3>
                  <p className="demo-sub">Taqdimot uchun parolsiz kirish</p>
                </div>
                <div className="demo-list">
                  {DEMO_ROLLAR.map((r) => (
                    <button key={r.email} type="button" className="demo-row" onClick={() => demoKir(r.email)} disabled={loading}>
                      <i className={`fa ${r.ikon} demo-ic`} aria-hidden="true" />
                      <span className="demo-txt">
                        <span className="demo-nom">{r.nom}</span>
                        <span className="demo-tavsif">{r.tavsif}</span>
                      </span>
                      <span className="demo-arr" aria-hidden="true">›</span>
                    </button>
                  ))}

                  {/* Ta'lim zanjiri demosi: har bosqichdan bittadan xodim/talaba — tanlanganda darhol kiradi */}
                  <div className="demo-row demo-row--select">
                    <i className="fa fa-user-doctor demo-ic" aria-hidden="true" />
                    <span className="demo-txt">
                      <label className="demo-nom" htmlFor="tm-xodim">Xodim yoki talaba</label>
                      <span className="demo-tavsif">Bosqich bo‘yicha kirish</span>
                    </span>
                    <select
                      id="tm-xodim"
                      className="demo-select"
                      defaultValue=""
                      disabled={loading}
                      onChange={(e) => e.target.value && demoKir(e.target.value)}
                    >
                      <option value="" disabled>Bosqichni tanlang</option>
                      <optgroup label="Tibbiyot xodimlari (demo)">
                        {DEMO_XODIMLAR.map((x) => (
                          <option key={x.email} value={x.email}>
                            {x.bosqich} — {x.ism}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="TDTU talabalari (real ro‘yxat, 03.09.2026)">
                        {DEMO_TALABALAR.map((t) => (
                          <option key={t.email} value={t.email}>
                            {t.bosqich.split(' · ')[0]} — {t.ism}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>
              </section>
            </div>

            <p className="auth-foot">
              <span>Yordam markazi: 1003</span>
              <span>© 2026 Elektron tibbiy ta’lim platformasi</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
