#!/usr/bin/env python3
"""TDTU doktorantlar ro'yxati (docs/doktarantlar_tayanch_doktarant.xlsx) -> Supabase seed + JS fallback.

Ishga tushirish (uttp-next ichidan):  python3 scripts/gen_doktorant.py   (openpyxl kerak)

Manba: 383 kishi — Tayanch doktorantura PhD 325, Doktorantura DSc 49, Maqsadli tayanch PhD 7,
Stajyor-tadqiqotchi 2 (2024–2026 qabul). PNFL ustuni ATAYLAB yuklanmaydi (shaxsiy ma'lumot).

Chiqish:
  uttp-next/supabase/seed_doktorant.sql  - doktorant jadvali + auth hisoblar + profillar
  uttp-next/lib/doktorant-fallback.js    - agregat statistikalar (Supabase bo'lmaganda)

Login:  <familiya>.<ism>@doktorant.tdtu.uz   (takror bo'lsa raqam: 2, 3 ...)
Parol:  namuna hisoblar (DEPLOY.md jadvali, 2 nafar) — <ism>2026 (ochiq, login demosi uchun);
        qolgan har bir hisob — base32(sha256('ettp:<login>:<TUZ>'))[:10], kichik harf,
        TUZ = ETTP_PAROL_TUZ muhit o'zgaruvchisi (standart 'ettp-demo-2026' faqat lokal demo;
        bulutga reseed qilishdan oldin MAXFIY qiymat o'rnating).
        Parollar faqat seed SQL'ga yoziladi (crypt bilan) — JS fallbackka namunadan boshqasi tushmaydi.
"""
import base64
import hashlib
import json
import os
import re
import unicodedata
import uuid
from collections import Counter, defaultdict
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'docs/doktarantlar_tayanch_doktarant.xlsx'
OUT_SQL = ROOT / 'uttp-next/supabase/seed_doktorant.sql'
OUT_JS = ROOT / 'uttp-next/lib/doktorant-fallback.js'
NAMUNA_JS = ROOT / 'uttp-next/lib/demo-namunalar.js'   # qo'lda yoziladigan kichik modul (sana sinxron)

MUASSASA = 'Toshkent davlat tibbiyot universiteti'
MANBA_SANASI = '2026-09-04'

# Parol tuzi: bulutga reseed qilishdan oldin ETTP_PAROL_TUZ ga MAXFIY qiymat bering
# (standart qiymat faqat lokal demo uchun). Tuz hech qayerga yozilmaydi.
TUZ = os.environ.get('ETTP_PAROL_TUZ') or 'ettp-demo-2026'


def yashirin_parol(login: str) -> str:
    """Hisobga xos, taxmin qilib bo'lmaydigan parol: base32(sha256('ettp:<login>:<TUZ>'))[:10], kichik harf (a-z, 2-7)."""
    xesh = hashlib.sha256(f'ettp:{login}:{TUZ}'.encode('utf-8')).digest()
    return base64.b32encode(xesh)[:10].decode('ascii').lower()
DARAJA = {
    'Tayanch doktorantura, PhD': 'PhD',
    'Maqsadli tayanch doktorantura, PhD': 'PhD',
    'Doktorantura, DSc': 'DSc',
    'Stajyor-tadqiqotchi': 'Stajyor',
}

# Hudud (viloyat) — tuman/shahar nomidan. Kalitlar apostrofsiz katta harfda solishtiriladi.
HUDUD = [
    ('Toshkent sh.', 'toshkent-shahar', ['YUNUSOBOD', 'CHILONZOR', 'MIROBOD', 'YAKKASAROY', 'SERGELI', 'SHAYXONTOHUR', 'OLMAZOR', 'UCHTEPA', 'YASHNOBOD', 'MIRZO ULUGBEK', 'BEKTEMIR', 'YANGIHAYOT', 'TOSHKENT SHAHRI', 'TOSHKENT SHAHAR']),
    ('Toshkent vil.', 'toshkent-viloyat', ['TOSHKENT VILOYATI', 'TOSHKENT TUMANI', 'QIBRAY', 'BOSTONLIQ', 'PISKENT', 'ZANGIOTA', 'ZANGI-OTA', 'OLMALIK', 'CHIRCHIQ', 'ANGREN', 'OLMALIQ', 'BEKOBOD', 'NURAFSHON', 'YANGIYOL', 'PARKENT', 'OHANGARON', 'QUYICHIRCHIQ', 'ORTACHIRCHIQ', 'YUQORICHIRCHIQ', 'BOKA', 'CHINOZ', 'OQQORGON']),
    ('Buxoro', 'buxoro', ['BUXORO', 'GIJDUVON', 'SHOFIRKON', 'JONDOR', 'ROMITON', 'ROMITAN', 'OLOT', 'PESHKU', 'KOGON', 'QORAKOL', 'VOBKENT', 'QOROVULBOZOR']),
    ('Samarqand', 'samarqand', ['SAMARQAND', 'URGUT', 'KATTAQORGON', 'JOMBOY', 'ISHTIXON', 'BULUNGUR', 'PASTDARGOM', 'PAYARIQ', 'NUROBOD', 'TOYLOQ', 'QOSHRABOD', 'NARPAY', 'OQDARYO', 'OQTOSH', 'CHELAK']),
    ('Jizzax', 'jizzax', ['JIZZAX', 'GALLAOROL', 'BAXMAL', 'ZOMIN', 'PAXTAKOR', 'DOSTLIK', 'ARNASOY', 'FORISH', 'ZARBDOR', 'ZAFAROBOD', 'MIRZACHOL', 'YANGIOBOD', 'SHAROF RASHIDOV']),
    ('Qashqadaryo', 'qashqadaryo', ['QASHQADARYO', 'QARSHI', 'SHAHRISABZ', 'SHAXRISABZ', 'KITOB', 'GUZOR', 'YAKKABOG', 'KOSON', 'CHIROQCHI', 'DEHQONOBOD', 'KASBI', 'MIRISHKOR', 'MUBORAK', 'NISHON', 'QAMASHI']),
    ('Surxondaryo', 'surxondaryo', ['SURXONDARYO', 'TERMIZ', 'DENOV', 'SHEROBOD', 'BOYSUN', 'JARQORGON', 'QUMQORGON', 'SHORCHI', 'ANGOR', 'MUZRABOT', 'OLTINSOY', 'SARIOSIYO', 'UZUN', 'BANDIXON']),
    ('Xorazm', 'xorazm', ['XORAZM', 'URGANCH', 'SHOVOT', 'XONQA', 'XIVA', 'BOGOT', 'GURLAN', 'HAZORASP', 'QOSHKOPIR', 'YANGIARIQ', 'YANGIBOZOR', 'TUPROQQALA']),
    ('Farg‘ona', 'fargona', ['FARGONA', 'QOQON', 'MARGILON', 'QUVASOY', 'BESHARIQ', 'OLTIARIQ', 'RISHTON', 'UCHKOPRIK', 'BUVAYDA', 'BOGDOD', 'DANGARA', 'FURQAT', 'QUVA', 'TOSHLOQ', 'YOZYOVON', 'SOX', 'OZBEKISTON TUMANI']),
    ('Andijon', 'andijon', ['ANDIJON', 'ASAKA', 'XONOBOD', 'SHAHRIXON', 'MARHAMAT', 'BALIQCHI', 'BOSTON', 'BULOQBOSHI', 'IZBOSKAN', 'JALAQUDUQ', 'QORGONTEPA', 'OLTINKOL', 'PAXTAOBOD', 'ULUGNOR', 'XOJAOBOD']),
    ('Namangan', 'namangan', ['NAMANGAN', 'CHUST', 'POP', 'CHORTOQ', 'KOSONSOY', 'MINGBULOQ', 'NORIN', 'TORAQORGON', 'UYCHI', 'UCHQORGON', 'YANGIQORGON']),
    ('Navoiy', 'navoiy', ['NAVOIY', 'XATIRCHI', 'ZARAFSHON', 'KARMANA', 'KONIMEX', 'QIZILTEPA', 'UCHQUDUQ', 'NUROTA', 'NAVBAHOR', 'TOMDI']),
    ('Sirdaryo', 'sirdaryo', ['SIRDARYO', 'GULISTON', 'MIRZAOBOD', 'BOYOVUT', 'SARDOBA', 'SAYXUNOBOD', 'YANGIYER', 'SHIRIN', 'OQOLTIN', 'XOVOS']),
    ('Qoraqalpog‘iston', 'qoraqalpogiston', ['QORAQALPOG', 'NUKUS', 'NOKIS', 'QALASI', 'BERUNIY', 'AMUDARYO', 'CHIMBOY', 'ELLIKQALA', 'KEGEYLI', 'QANLIKOL', 'KANLIKOL', 'QONGIROT', 'QORAOZAK', 'MOYNOQ', 'SHUMANAY', 'TAXTAKOPIR', 'TORTKOL', 'XOJAYLI', 'TAXIATOSH']),
]
NOMALUM = {"NOMA'LUM", 'NOMALUM', 'НОМАЪЛУМ', '-', '', 'NOMA`LUM'}


def ascii_slug(s: str) -> str:
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(ch for ch in s if not unicodedata.combining(ch))
    return re.sub(r'[^a-z]', '', s.lower())


def title_case(s: str) -> str:
    return ' '.join(w[:1].upper() + w[1:].lower() for w in s.split())


def norm(s) -> str:
    return re.sub(r'\s+', ' ', str(s or '')).strip()


def kalit(s: str) -> str:
    """Apostrof/diakritikasiz katta harf — hudud lug'ati uchun."""
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(ch for ch in s if not unicodedata.combining(ch))
    return re.sub(r"[‘’'`ʻ]", '', s).upper()


def hudud_topish(tuman: str):
    k = kalit(tuman)
    if k in NOMALUM:
        return None, None
    # Toshkent shahri: aniq "TOSHKENT" (tuman/viloyat so'zisiz) yoki shahar tumanlari
    if k == 'TOSHKENT' or k == 'TOSHKENT SH':
        return 'Toshkent sh.', 'toshkent-shahar'
    for nom, rid, kalitlar in HUDUD:
        if any(x in k for x in kalitlar):
            return nom, rid
    if any(x in k for x in ('ROSSIYA', 'TURKMEN', 'QOZOG', 'QIRG', 'TOJIK', 'FEDERATSIYA')):
        return 'Xorij', None
    return None, None


def q(v) -> str:
    if v is None:
        return 'NULL'
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"


ws = openpyxl.load_workbook(SRC, data_only=True, read_only=True).worksheets[0]
rows = [r for r in list(ws.iter_rows(values_only=True))[3:] if r and r[1]]

doktorantlar = []
login_counter = Counter()
topilmadi = Counter()
for r in rows:
    tartib, fish, ixt, shifr, bosqich, yil, yosh, jins, _pnfl, kurs, tuman, mavzu, rahbar, holat = r[:14]
    fish = norm(fish)
    words = [w for w in (ascii_slug(w) for w in fish.split()) if len(w) >= 2]
    familiya = words[0] if words else f'd{int(tartib)}'
    ism = words[1] if len(words) > 1 else ''
    base = f'{familiya}.{ism}' if ism else familiya
    login_counter[base] += 1
    n = login_counter[base]
    login = f'{base}{"" if n == 1 else n}@doktorant.tdtu.uz'
    jins_n = {'AYOL': 'ayol', 'ERKAK': 'erkak'}.get(norm(jins).upper())
    bosqich = norm(bosqich)
    assert bosqich in DARAJA, bosqich
    tuman_n = norm(tuman)
    hudud, hudud_id = hudud_topish(tuman_n)
    if hudud is None and kalit(tuman_n) not in NOMALUM:
        topilmadi[tuman_n] += 1
    doktorantlar.append({
        'tartib': int(tartib),
        'user_id': str(uuid.uuid5(uuid.NAMESPACE_URL, f'ettp:doktorant:{login}')),
        'fish': title_case(fish),
        'ixtisoslik': norm(ixt),
        'ixtisoslik_shifri': norm(shifr),
        'bosqich': bosqich,
        'daraja': DARAJA[bosqich],
        'qabul_yili': int(yil),
        'yosh': int(yosh) if isinstance(yosh, (int, float)) else None,
        'jinsi': jins_n,
        'kurs': int(kurs),
        'tuman': None if kalit(tuman_n) in NOMALUM else title_case(tuman_n),
        'hudud': hudud,
        'hudud_id': hudud_id,
        'mavzu': norm(mavzu) or None,
        'rahbar': title_case(norm(rahbar)) if rahbar else None,
        'holat': norm(holat) or None,
        'login': login,
        'parol': yashirin_parol(login),
        'ism_slug': ism or familiya,   # namuna hisoblarning ochiq paroli uchun
    })

assert len({d['login'] for d in doktorantlar}) == len(doktorantlar)
assert all(len(d['parol']) >= 6 for d in doktorantlar)

# Login demosi uchun namuna hisoblar (PhD, DSc). Faqat shular ochiq <ism>2026 parolini oladi
# (DEPLOY.md jadvali va login sahifasi shunga tayanadi).
namuna = [
    next(d for d in doktorantlar if d['daraja'] == 'PhD' and d['hudud']),
    next(d for d in doktorantlar if d['daraja'] == 'DSc'),
]
for n in namuna:
    n['parol'] = f"{n['ism_slug']}2026"

# Shifr → nom (klassifikator sinxroni)
KOD_NOMI = {}
for d in doktorantlar:
    KOD_NOMI.setdefault(d['ixtisoslik_shifri'], Counter())[d['ixtisoslik']] += 1
KOD_NOMI = {k: c.most_common(1)[0][0] for k, c in KOD_NOMI.items()}

# ---------------- SQL ----------------
COLS = ('tartib', 'user_id', 'fish', 'ixtisoslik', 'ixtisoslik_shifri', 'bosqich', 'daraja', 'qabul_yili', 'yosh',
        'jinsi', 'kurs', 'tuman', 'hudud', 'hudud_id', 'mavzu', 'rahbar', 'holat', 'login', 'parol')
vals = ['(' + ', '.join(q(d[k]) for k in COLS) + ')' for d in doktorantlar]
lines = [
    '-- =========================================================',
    '-- ETTP — TDTU doktorantlar (PhD/DSc/stajyor) + auth hisoblar',
    f'-- Manba: docs/{SRC.name} ({MANBA_SANASI} holatiga)',
    f'-- {len(doktorantlar)} kishi: ' + ', '.join(f'{k} {v}' for k, v in Counter(d['bosqich'] for d in doktorantlar).most_common()),
    '-- Login: <familiya>.<ism>@doktorant.tdtu.uz. Parol: namuna hisoblar (DEPLOY.md) — <ism>2026;',
    '-- qolganlari — ETTP_PAROL_TUZ dan hosil qilingan 10 belgili yashirin parol (scripts/gen_doktorant.py). PNFL yuklanmagan.',
    '-- GENERATSIYA QILINGAN FAYL — scripts/gen_doktorant.py; qo‘lda tahrirlanmaydi.',
    '-- Bitta CTE-buyruq (auth.users → identities → doktorant → profiles), idempotent.',
    '-- =========================================================',
    '',
    f'WITH s({", ".join(COLS)}) AS (',
    '  VALUES',
    ',\n'.join('  ' + v for v in vals),
    '),',
    'yangi AS (',
    '  SELECT s.* FROM s WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = s.user_id::uuid)',
    '),',
    'u AS (',
    '  INSERT INTO auth.users (',
    '      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,',
    '      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,',
    '      confirmation_token, recovery_token, email_change,',
    '      email_change_token_new, email_change_token_current, is_super_admin',
    '  )',
    "  SELECT '00000000-0000-0000-0000-000000000000', y.user_id::uuid, 'authenticated', 'authenticated',",
    "         y.login, extensions.crypt(y.parol, extensions.gen_salt('bf')), NOW(),",
    """         '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '', '', false""",
    '  FROM yangi y',
    '  RETURNING id',
    '),',
    'i AS (',
    '  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)',
    '  SELECT y.user_id::uuid, y.user_id, y.user_id::uuid,',
    "         jsonb_build_object('sub', y.user_id, 'email', y.login, 'email_verified', true, 'phone_verified', false),",
    "         'email', NOW(), NOW(), NOW()",
    '  FROM yangi y',
    '  RETURNING id',
    '),',
    'd AS (',
    '  INSERT INTO public.doktorant (tartib, user_id, fish, ixtisoslik, ixtisoslik_shifri, bosqich, daraja, qabul_yili, yosh,',
    '                                jinsi, kurs, tuman, hudud, hudud_id, mavzu, rahbar, holat, login, manba_sanasi)',
    '  SELECT y.tartib, y.user_id::uuid, y.fish, y.ixtisoslik, y.ixtisoslik_shifri, y.bosqich, y.daraja, y.qabul_yili, y.yosh,',
    '         y.jinsi, y.kurs, y.tuman, y.hudud, y.hudud_id, y.mavzu, y.rahbar, y.holat, y.login, ' + q(MANBA_SANASI) + '::date',
    '  FROM yangi y',
    '  RETURNING id',
    ')',
    "-- Profil: rol='talaba', bosqich 'doktorantura'; ixtisoslik shifri klassifikatorda bo'lsa bog'lanadi",
    'INSERT INTO public.profiles (id, fish, jinsi, email, manzil_viloyat_id, manzil_tuman, hozirgi_bosqich, hozirgi_muassasa, hozirgi_kurs, yonalish_kodi, lavozimi, rol)',
    'SELECT y.user_id::uuid, y.fish, y.jinsi, y.login,',
    '       (SELECT r.id FROM public.regions r WHERE r.id = y.hudud_id), y.tuman,',
    f"       'doktorantura', {q(MUASSASA)}, y.kurs,",
    '       (SELECT sp.kodi FROM public.specializations sp WHERE sp.kodi = y.ixtisoslik_shifri),',
    "       y.bosqich || ' · ' || y.ixtisoslik, 'talaba'",
    'FROM yangi y;',
    '',
]
OUT_SQL.write_text('\n'.join(lines), encoding='utf-8')

# ---------------- JS fallback ----------------
def yosh_guruh(y):
    if y is None:
        return None
    return '30 gacha' if y < 30 else '30–34' if y < 35 else '35–39' if y < 40 else '40–44' if y < 45 else '45+'


stat = defaultdict(int)
rahbar = defaultdict(int)
for d in doktorantlar:
    stat[(d['bosqich'], d['daraja'], d['ixtisoslik_shifri'], d['ixtisoslik'], d['qabul_yili'], d['kurs'], d['jinsi'], d['hudud'], d['yosh'])] += 1
    if d['rahbar']:
        rahbar[(d['rahbar'], d['daraja'])] += 1
stat_rows = [
    {'bosqich': k[0], 'daraja': k[1], 'ixtisoslik_shifri': k[2], 'ixtisoslik': k[3], 'qabul_yili': k[4], 'kurs': k[5], 'jinsi': k[6], 'hudud': k[7], 'yosh': k[8], 'soni': v}
    for k, v in sorted(stat.items(), key=lambda kv: tuple(str(x) for x in kv[0]))
]
rahbar_rows = [
    {'rahbar': k[0], 'daraja': k[1], 'soni': v}
    for k, v in sorted(rahbar.items(), key=lambda kv: (-kv[1], kv[0][0]))
]
yosh_ortacha = round(sum(d['yosh'] for d in doktorantlar if d['yosh']) / max(1, sum(1 for d in doktorantlar if d['yosh'])), 1)

def js_rows(rs):
    return ',\n'.join('  ' + json.dumps(r, ensure_ascii=False) for r in rs)


js = f"""// TDTU doktorantlar — agregat fallback (Supabase ulanmaganda).
// Manba: docs/{SRC.name}. {len(doktorantlar)} kishi. GENERATSIYA QILINGAN FAYL — scripts/gen_doktorant.py.
// Ustunlar supabase/migrations/008_doktorant.sql dagi view'larga mos.

export const DOKTORANT_MANBA_SANASI = '{MANBA_SANASI}';
export const DOKTORANT_ORTACHA_YOSH = {yosh_ortacha};

// doktorant_stat: bosqich × daraja × ixtisoslik × qabul yili × kurs × jinsi × hudud × yosh
export const INITIAL_DOKTORANT_STAT = [
{js_rows(stat_rows)},
];

// doktorant_rahbar_stat: ilmiy rahbar × daraja
export const INITIAL_DOKTORANT_RAHBAR_STAT = [
{js_rows(rahbar_rows)},
];

// Login demosi uchun namuna hisoblar (seed_doktorant.sql bilan sinxron). Faqat shu 2 hisobning
// ochiq <ism>2026 paroli shu yerda; qolgan parollar hech qachon JS'ga yozilmaydi.
export const DEMO_DOKTORANTLAR = [
{js_rows([{'email': n['login'], 'parol': n['parol'], 'ism': n['fish'], 'bosqich': f"{n['bosqich']} · {n['ixtisoslik']}", 'bosqichId': 'doktorantura', 'kurs': n['kurs']} for n in namuna])},
];
"""
# JS'ga faqat namuna parollari tushganini tekshirish (yashirin parollar sizmasin)
assert js.count('"parol"') == len(namuna), 'JS fallbackda ortiqcha parol'
assert all(n['parol'].endswith('2026') for n in namuna)
OUT_JS.write_text(js, encoding='utf-8')

# lib/demo-namunalar.js (TalabaProfil) shu sanani o'z konstantasida takrorlaydi — u katta fallback
# modulni import qilmasligi uchun. Sana o'zgarsa u faylni ham qo'lda yangilash shart.
assert f"DOKTORANT_MANBA_SANASI = '{MANBA_SANASI}'" in NAMUNA_JS.read_text(encoding='utf-8'), (
    f'lib/demo-namunalar.js dagi DOKTORANT_MANBA_SANASI {MANBA_SANASI} emas — qo‘lda yangilang'
)

if __name__ == '__main__':
    print('parol tuzi:', 'ETTP_PAROL_TUZ (maxfiy)' if os.environ.get('ETTP_PAROL_TUZ') else 'standart (faqat lokal demo!)')
    print('doktorantlar:', len(doktorantlar), '| shifrlar:', len(KOD_NOMI))
    print('sql bytes:', OUT_SQL.stat().st_size, '| js bytes:', OUT_JS.stat().st_size)
    print('stat rows:', len(stat_rows), '| rahbar rows:', len(rahbar_rows), '| o‘rtacha yosh:', yosh_ortacha)
    print('hudud:', Counter(d['hudud'] for d in doktorantlar).most_common())
    print('hudud topilmadi:', topilmadi.most_common(15))
    print('jinsi:', Counter(d['jinsi'] for d in doktorantlar))
    print('namuna:', [(n['login'], n['parol']) for n in namuna])
