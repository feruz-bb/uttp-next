'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { INITIAL_PROFILES } from '../../lib/data-service';
import { tizimgaKirish, supabaseSozlanganmi, rolBoshSahifasi } from '../../lib/auth';

// my.tipme.uz/user/login asosidagi kirish ekrani — uttp-platform TipmeLogin.jsx
// dizayni (tipme-login.css), autentifikatsiya esa Supabase (lokal stack) orqali.
// Supabase ulanmagan bo'lsa localStorage demo-rejimga tushadi.

// Seed'dagi demo hisoblar (parol konvensiyasi: <ism>2026)
const DEMO_PAROLLAR = {
  'vazirlik@ssv.uz': 'vazirlik2026',
  'admin@ssv.uz': 'admin2026',
  'jamshid.r@ssv.uz': 'jamshid2026',
  'shahlo.k@ssv.uz': 'shahlo2026',
};

const DEMO_ROLLAR = [
  { email: 'vazirlik@ssv.uz', nom: 'Vazirlik / Tahlil paneli', tavsif: 'Umumiy monitoring va statistika', ikon: 'fa-landmark' },
  { email: 'admin@ssv.uz', nom: 'Super admin / Boshqaruv', tavsif: 'CRUD va klassifikatorlar', ikon: 'fa-user-shield' },
  { email: 'jamshid.r@ssv.uz', nom: 'Tibbiyot xodimi / Kabinet', tavsif: 'Shifokor profili, UKTT va TFX', ikon: 'fa-user-doctor' },
];

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
      const demoUser = INITIAL_PROFILES.find((p) => p.email === email);
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

  // Rol-kartasi orqali tez kirish (SSO taqlidi — seed paroli bilan)
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
              <img src="/tipme/logo-minzdrav.png" alt="Logo" width="50" height="50" />
              <div className="brand-name">ELEKTRON TIBBIY<br />TA’LIM PLATFORMASI</div>
            </a>

            <h1 className="hero-title">Tibbiyot xodimlarini<br />rivojlantirish platformasi</h1>
            <p className="hero-desc">
              Malaka oshirish, qayta tayyorlash va elektron ta’lim xizmatlarining yagona raqamli tizimi.
            </p>

            <div className="stats-row">
              <div>
                <div className="st-num">57</div>
                <div className="st-lbl">Muassasalar</div>
              </div>
              <div className="stats-div" />
              <div>
                <div className="st-num">149K+</div>
                <div className="st-lbl">Tinglovchilar</div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ O'NG — Login va demo rollar ═══ */}
        <div className="auth-right">
          <div className="right-inner">
            <div className="login-card" role="main">
              <div className="card-head">
                <div className="avatar-ring"><i className="fa fa-user-md" /></div>
                <h2 className="card-title">Tizimga kirish</h2>
                <p className="card-sub">Boshqaruv va tibbiyot xodimlari uchun</p>
              </div>

              <form className="form" onSubmit={submit} noValidate>
                <div className="fg">
                  <label className="fl" htmlFor="tm-login"><i className="fa fa-user" /> Foydalanuvchi nomi</label>
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
                    />
                    <div className="help-block">{errors.login}</div>
                  </div>
                </div>

                <div className="fg">
                  <label className="fl" htmlFor="tm-pw"><i className="fa fa-lock" /> Parol</label>
                  <div className="pw-wrap">
                    <div className={`form__field-wrap${errors.password ? ' has-error' : ''}`}>
                      <input
                        id="tm-pw"
                        type={showPw ? 'text' : 'password'}
                        className="fi"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setAuthError(''); }}
                        autoComplete="current-password"
                        aria-required="true"
                      />
                      <div className="help-block">{errors.password}</div>
                    </div>
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowPw((s) => !s)}
                      aria-label="Parolni ko'rsatish / yashirish"
                    >
                      <i className={showPw ? 'fa fa-eye-slash' : 'fa fa-eye'} />
                    </button>
                  </div>
                </div>

                {authError && (
                  <div className="auth-error" role="alert">
                    <i className="fa fa-circle-exclamation" /> {authError}
                  </div>
                )}

                <div className="f-actions">
                  <button type="submit" className="btn-login" disabled={loading}>
                    <i className="fa fa-sign-in-alt" /> {loading ? 'Tekshirilmoqda...' : 'Kirish'}
                  </button>
                </div>

                <div className="divider"><span>yoki demo rollar</span></div>

                {DEMO_ROLLAR.map((r) => (
                  <button key={r.email} type="button" className="btn-oneid" onClick={() => demoKir(r.email)} disabled={loading}>
                    <i className={`fa ${r.ikon}`} style={{ width: 18 }} />
                    <span style={{ flex: 1, textAlign: 'left' }}>
                      {r.nom}
                      <span style={{ display: 'block', fontSize: 11, opacity: 0.7, fontWeight: 400 }}>{r.tavsif}</span>
                    </span>
                  </button>
                ))}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
