# ETTP (uttp-next) — bulutga chiqarish yo'riqnomasi

Maqsad: **bulut Supabase** (ma'lumotlar + auth) va **Vercel** (hosting).
Sizdan faqat 2 ta narsa kerak: Supabase kalitlari va Vercel token — qolganini
agent (yoki quyidagi buyruqlar) bajaradi.

---

## 1-qadam — Supabase bulut loyihasi (siz, ~5 daqiqa)

1. https://supabase.com/dashboard → **New project**.
   - Organization: o'zingizniki (bepul tier yetadi)
   - Name: `ettp`
   - Database password: kuchli parol yozing va **saqlab qo'ying**
   - Region: `Central EU (Frankfurt)` (O'zbekistonga eng yaqin barqaror region)
2. Loyiha ochilgach: **Project Settings → API** bo'limidan nusxalang:
   - `Project URL` (https://<ref>.supabase.co)
   - `anon public` kalit
3. **Project Settings → General** dan `Reference ID` (<ref>) ni ham oling.

Agentga bering: `URL`, `anon key`, `ref`, va DB paroli.

## 2-qadam — sxema va demo ma'lumotlarni yuborish (agent)

```bash
cd uttp-next
pip install -r scripts/requirements.txt              # openpyxl (seed generatorlari uchun)
export ETTP_PAROL_TUZ='<uzun-maxfiy-satr>'           # talaba/doktorant parollari tuzi — MAJBURIY, hech qayerga yozmang
python3 scripts/gen_talaba.py && python3 scripts/gen_doktorant.py   # seed_*.sql shu tuz bilan qayta hosil bo'ladi
supabase link --project-ref <ref>                    # DB parolini so'raydi
supabase config push                                 # auth sozlamalari (quyida) — db push/reset ularni yubormaydi
supabase db push                                     # migratsiyalar (001–009)
CONFIRM_RESET=1 npm run db:reset:cloud               # scripts/reset-cloud.js: avval dump, keyin migratsiya + seed
```

> **Auth sozlamalari** (`supabase/config.toml`): `[auth] enable_signup = false` —
> ro'yxatdan o'tish yopiq (`/auth/v1/signup` → 422 `signup_disabled`), hisoblar
> faqat seed/admin orqali ochiladi. `[auth.email] enable_signup = true` **shunday
> qolsin** — bu bayroq butun email provayderini (`GOTRUE_EXTERNAL_EMAIL_ENABLED`)
> boshqaradi, `false` qilinsa hech kim parol bilan kira olmaydi (422
> `email_provider_disabled`). `[auth.sms] enable_signup = false`. Bulutda tekshiring:
> Authentication → Sign In / Providers: «Allow new users to sign up» **OFF**, Email
> provayderi **ON** — `supabase config push` shuni yuboradi.
>
> Lokal stack: `config.toml` `[auth.*]` o'zgarsa `supabase stop && supabase start`
> qiling — `supabase db reset` konteynerlarni qayta yaratmaydi, eski sozlama
> ishlayveradi (ma'lumotlar `stop`da saqlanadi).

> Seed uch fayldan iborat (`config.toml` → `sql_paths`): `seed.sql` (demo
> xodimlar, klassifikatorlar), `seed_talaba.sql` (TDTU kontingenti, 27 739 hisob)
> `seed_doktorant.sql` (383 doktorant) va `seed_elonlar.sql` (17 story-e'lon:
> grant loyihalari, `scripts/gen_elonlar.py`) — bcrypt sabab ~2 daqiqa davom etadi.

> `npm run db:reset:cloud` → `scripts/reset-cloud.js` — bulutdagi bazani TOZALAB
> qayta quradi (`supabase db reset --linked` ustidagi himoyalangan qobiq):
> `CONFIRM_RESET=1` bo'lmasa rad etadi; avval `backups/<vaqt>.sql` (sxema) va
> `backups/<vaqt>.data.sql` (ma'lumotlar) dumpini oladi, so'ng reset qiladi.
> Demo uchun bu ayni muddao («reseed» tugmasi vazifasini bajaradi); real
> ma'lumot paydo bo'lgach ishlatmang — reset qaytarib bo'lmaydi.

> `ETTP_PAROL_TUZ` o'rnatilmasa generator standart tuz bilan ishlaydi — bu faqat
> lokal demo uchun; bulutga standart tuz bilan seed yubormang.

## 3-qadam — Vercel token (siz, ~2 daqiqa)

1. https://vercel.com/account/settings/tokens → **Create Token**
   - Name: `ettp-deploy`, Scope: o'z akkauntingiz, Expiration: 30 kun
2. Tokenni agentga bering (chat tashqarisida saqlamang — muddati o'tgach o'chadi).

## 4-qadam — deploy (agent)

```bash
cd uttp-next
VERCEL_TOKEN=<token> npx vercel link --yes --project ettp --token <token>
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production --token <token>
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --token <token>
npx vercel deploy --prod --token <token>
```

## Demo hisoblar (seed bilan bir xil)

| Rol / bosqich | Email | Parol |
|---|---|---|
| Vazirlik | vazirlik@ssv.uz | vazirlik2026 |
| Super admin | admin@ssv.uz | admin2026 |
| Chuqurlashtirilgan sinf | madina.y@ssv.uz | madina2026 |
| Texnikum | aziz.q@ssv.uz | aziz2026 |
| Bakalavriat | nilufar.e@ssv.uz | nilufar2026 |
| Magistratura | shahlo.k@ssv.uz | shahlo2026 |
| Rezidentura | sardor.t@ssv.uz | sardor2026 |
| Doktor | jamshid.r@ssv.uz | jamshid2026 |
| Doktarantura | gulnora.m@ssv.uz | gulnora2026 |

### TDTU talabalari (real ro'yxat, 03.09.2026 — 27 739 hisob)

Manba: `docs/bakalavriat/TDTU_03_09_2026_..._Talabalar_ro'yxati.xlsx` →
`supabase/seed_talaba.sql` (generator: `scripts/gen_talaba.py`, JS fallback
`lib/talaba-fallback.js`; Excel yangilansa `python3 scripts/gen_talaba.py`). Qoidalar:

- Login: `<familiya>.<ism>@talaba.tdtu.uz` (takror bo'lsa raqam: `karimova.aziza2@...`)
- Parol: faqat quyidagi jadvaldagi **6 namuna hisob** ochiq `<ism>2026` parolini oladi
  (login sahifasidagi tezkor kirish shularga tayanadi). **Qolgan barcha hisoblar**
  uchun generator har biriga alohida tasodifiy 10 belgili parol hosil qiladi:
  `base32(sha256('ettp:<login>:<tuz>'))[:10]` (kichik harf), tuz — `ETTP_PAROL_TUZ`
  muhit o'zgaruvchisi. Tuz repoda ham, bazada ham saqlanmaydi; parollar faqat seed
  SQL ichida (`crypt` bilan bcrypt'lanadi) mavjud.
- Rol: `talaba` — faqat o'z profilini ko'radi, vazirlik reyestriga kirmaydi

| Namuna | Email | Parol |
|---|---|---|
| Bakalavr 1-kurs | shukrullayev.azizbek@talaba.tdtu.uz | azizbek2026 |
| Bakalavr 6-kurs | materova.ayna@talaba.tdtu.uz | ayna2026 |
| Magistratura 2-kurs | sadullayeva.shamsiyabonu@talaba.tdtu.uz | shamsiyabonu2026 |
| Klinik ordinatura | xamrayev.orifxon@talaba.tdtu.uz | orifxon2026 |
| Tayanch doktorantura (PhD) | usmonaliyeva.zilola@doktorant.tdtu.uz | zilola2026 |
| Doktorantura (DSc) | abduvaxitova.asal@doktorant.tdtu.uz | asal2026 |

### TDTU doktorantlari (383 kishi, 04.09.2026)

Manba: `docs/doktarantlar_tayanch_doktarant.xlsx` → `supabase/seed_doktorant.sql`
(generator `scripts/gen_doktorant.py`, fallback `lib/doktorant-fallback.js`, 008-migratsiya).
Login `<familiya>.<ism>@doktorant.tdtu.uz`, parol qoidasi talabalar bilan bir xil
(namuna — `<ism>2026`, qolganlari `ETTP_PAROL_TUZ` dan), rol `talaba`,
bosqich `doktorantura`. PNFL ustuni ataylab yuklanmagan. Klassifikatorning
doktorantura shifrlari fayldagi 35 real OAK shifri bilan birlashtirilgan.

Magistrlar (1 231 nafar) `docs/magistr_TDTU_2_3_kurs.xlsx` bilan boyitilgan:
mutaxassislik shifri, kampus, ta'lim tili, qabul yili, 2026/27 kursi (007-migratsiya).
Klassifikatorning magistratura shifrlari shu fayldagi 42 real shifr bilan
almashtirilgan (avvalgi 26 tasi taxminiy edi) — demo profillarning shifrlari
mos ravishda yangilangan (Kardiologiya 70910205, Pediatriya 70910301, Xirurgiya 70910212).

Istalgan talabaning logini `public.talaba.login` / `public.doktorant.login`
ustunida (Supabase Studio yoki SQL). Namunadan tashqari hisobning parolini bilish
uchun seed qilingan tuz kerak:

```bash
ETTP_PAROL_TUZ='<o‘sha tuz>' python3 -c "import base64,hashlib,os;l='<login>';print(base64.b32encode(hashlib.sha256(f'ettp:{l}:{os.environ[\"ETTP_PAROL_TUZ\"]}'.encode()).digest())[:10].decode().lower())"
```

Tuz yo'qolgan bo'lsa parolni tiklab bo'lmaydi — Supabase Studio → Authentication →
Users orqali yangi parol beriladi yoki yangi tuz bilan qayta seed qilinadi.

## Maxfiylik (PII) — repo yopiq qolsin

- `supabase/seed_talaba.sql` va `seed_doktorant.sql` TDTU ro'yxatlaridagi **real
  F.I.SH., tug'ilgan sana, guruh, dissertatsiya mavzusi va ilmiy rahbar**larni o'z
  ichiga oladi (`docs/*.xlsx` manbalari ham repoda). Repozitoriyni ochiq qilmang,
  seed fayllarni va DB dumplarini tashqariga bermang, ommaviy joyga yuklamang.
- PNFL ustuni ataylab yuklanmagan; `.env*` va `backups/` dumplari gitga tushmasin
  (`.gitignore`).
- Parol tuzi (`ETTP_PAROL_TUZ`) faqat seed qilgan odamda bo'ladi — chat, git yoki
  Vercel env'ga yozmang (ilovaga u kerak emas).

Demo ochiq URLda bo'ladi (kelishilgan) — buzilsa `CONFIRM_RESET=1 npm run db:reset:cloud`
bilan bir buyruqda qayta tiklanadi (tuz o'zgarmasa parollar ham o'sha-o'sha qoladi).
Lokal stack uchun: `npm run db:reset`.
