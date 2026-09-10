# ETTP — Elektron tibbiy ta'lim platformasi (uttp-next)

Sog'liqni saqlash vazirligi uchun tibbiy ta'lim zanjiri (chuqurlashtirilgan sinf →
texnikum → bakalavriat → magistratura/ordinatura → doktorantura → shifokor) bo'yicha
yagona portal: vazirlik dashboardi (statistika, hududlar, reyestr), super-admin paneli
(xodimlar, klassifikatorlar) va har bir ta'lim oluvchi / tibbiyot xodimi uchun shaxsiy kabinet.

Stek: **Next.js 16 (App Router, Turbopack) · React 19 · Recharts 3 · Supabase** (Postgres + Auth).
Interfeys tili — o'zbek (lotin). Bulutga chiqarish yo'riqnomasi — [DEPLOY.md](DEPLOY.md).

## Talablar

- Node.js 22+ va npm
- [Supabase CLI](https://supabase.com/docs/guides/cli) + Docker (lokal stack uchun)
- Python 3.10+ va `pip install -r scripts/requirements.txt` (faqat seed generatorlari uchun)

## O'rnatish

```bash
npm ci
cp .env.example .env.local     # NEXT_PUBLIC_SUPABASE_URL / ANON_KEY ni to'ldiring
supabase start                 # lokal stack: http://127.0.0.1:54321 (kalit «supabase status» da)
npm run dev                    # http://localhost:3000
```

`.env.local` da placeholder (`YOUR_...`) qolsa ilova Supabase'siz **demo-rejimda**
(localStorage auth, `lib/demo-*.js` ma'lumotlari) ishlaydi — faqat development uchun.

## npm skriptlari

| Skript | Vazifasi |
|---|---|
| `npm run dev` | Dev server (Turbopack, hot reload) |
| `npm run build` / `npm start` | Production build / start |
| `npm run lint` | ESLint (`eslint.config.mjs`: Next core-web-vitals + ESLint recommended) |
| `npm run lint:fix` | ESLint avtomatik tuzatish |
| `npm run test:e2e` | Playwright e2e testlari (lokal Supabase + dev server kerak) |
| `npm run db:reset` | Lokal Supabase bazasini migratsiyalar + seed bilan qayta qurish |
| `npm run db:reset:cloud` | Bog'langan bulut loyihasini dump olib reset qilish (`CONFIRM_RESET=1` shart) |

## Lokal Supabase

```bash
supabase start        # konteynerlarni ko'tarish (birinchi marta image'lar yuklanadi)
npm run db:reset      # migratsiyalar (supabase/migrations) + seed (seed.sql, seed_talaba.sql, seed_doktorant.sql)
supabase stop         # to'xtatish (ma'lumotlar saqlanadi)
```

Seed ~2 daqiqa davom etadi (27 739 talaba + 383 doktorant hisobi bcrypt bilan).
`supabase/config.toml` dagi `[auth.*]` o'zgarsa `supabase stop && supabase start` qiling.
SQL'ni to'g'ridan-to'g'ri bajarish: `docker exec supabase_db_uttp-next psql -U postgres -d postgres -Atc "<sql>"`.

## Generator skriptlari

Excel manbalar (`../docs/*.xlsx`) dan seed SQL va JS zaxira (fallback) fayllarini hosil qiladi:

```bash
export ETTP_PAROL_TUZ='<maxfiy-tuz>'   # namunadan tashqari hisoblarning parol tuzi (bulut uchun majburiy)
python3 scripts/gen_talaba.py          # → supabase/seed_talaba.sql, lib/talaba-fallback.js
python3 scripts/gen_doktorant.py       # → supabase/seed_doktorant.sql, lib/doktorant-fallback.js
```

`lib/*-fallback.js` — hosil qilingan fayllar, qo'lda tahrirlanmaydi (lint ham ularni chetlab o'tadi).
Tez JSX sintaksis tekshiruvi (`next build`siz): `node scripts/jsx-check.js <fayl...>`.

## Testlar va CI

- `npm run lint` — har bir o'zgarishdan oldin; ogohlantirishlar ruxsat etiladi, xato bo'lmasligi shart.
- `npm run test:e2e` — Playwright; lokal Supabase (seed bilan) va `npm run dev` ishlab turgan bo'lishi kerak.
- GitHub Actions (`.github/workflows/ci.yml`): har push/PR da Node 22 → `npm ci` → `npm run lint` →
  `npm run build` (placeholder Supabase kalitlari bilan, jonli baza kerak emas). E2e testlar CI'da hali yo'q.

## Demo hisoblar

`/login` sahifasidagi tezkor tugmalar: **Vazirlik** (vazirlik@ssv.uz / vazirlik2026) → `/dashboard`,
**Super admin** (admin@ssv.uz / admin2026) → `/admin`; xodim/talaba namunalari → `/profile`.
To'liq ro'yxat va parol qoidalari — [DEPLOY.md](DEPLOY.md#demo-hisoblar-seed-bilan-bir-xil).

## Maxfiylik

`supabase/seed_talaba.sql`, `seed_doktorant.sql` va `../docs/*.xlsx` real shaxsiy ma'lumotlarni
o'z ichiga oladi — repozitoriyni ochiq qilmang, dump va seed fayllarini tashqariga bermang.
