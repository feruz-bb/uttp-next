#!/usr/bin/env python3
"""Tibbiy jihozlar yig'masi (docs/equipment_summary.xlsx) -> Supabase seed + JS fallback.

Ishga tushirish (uttp-next ichidan):  python3 scripts/gen_jihozlar.py   (openpyxl kerak)

Manba tuzilmasi (bitta varaq, 4 139 qator):
  № | Hududlar va tibbiyot muassasalari nomi | Jihozlar | Soz | Nosoz | Yaroqsiz | Umumiy hisob
  Ierarxik: tuman/shahar guruh qatori (keyingi qator № = 1 dan boshlanadi), ostida muassasalar.
  Guruh qatori = ostidagi muassasalar yig'indisi (264/264 tekshirilgan). Umumiy hisob (272 578) —
  faqat birinchi qatorda, barcha guruhlar yig'indisiga teng.

Manba nozikliklari:
  * Tuman nomlari lotin (Denov tumani) va rus-kirill (Давлетабадский район) aralash — bir tuman ikki
    guruh bo'lib kelgan. Kirill guruhlar lotin kanonik tumanga BIRLASHTIRILADI (manba_guruh ustunida
    asl nom saqlanadi).
  * Viloyat ustuni YO'Q — tuman → viloyat mapping'i shu skriptda (TUMAN_VILOYAT). Har guruh mapping'da
    bo'lishi SHART, aks holda skript to'xtaydi.
  * 42-guruh nomsiz (325 jihoz, 105 yozuv, ichida «Del», «jjj», «toDelete» kabi sinov yozuvlari) —
    hudud «Ko‘rsatilmagan» bo'lib saqlanadi: jami 272 578 ga kiradi, hudud kesimiga kirmaydi.
  * Muassasa turi manbada yo'q — nomdagi kalit so'zlar bo'yicha tasniflanadi (turi ustuni), tartib muhim.

Chiqish:
  uttp-next/supabase/seed_jihozlar.sql  - jihoz_muassasa jadvali (3 875 qator)
  uttp-next/lib/jihoz-fallback.js       - agregatlar + ixcham muassasa ro'yxati (Supabase bo'lmaganda)
"""
import json
import re
from collections import OrderedDict, defaultdict
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'docs/equipment_summary.xlsx'
OUT_SQL = ROOT / 'uttp-next/supabase/seed_jihozlar.sql'
OUT_JS = ROOT / 'uttp-next/lib/jihoz-fallback.js'

MANBA = 'docs/equipment_summary.xlsx'
KORSATILMAGAN = 'Ko‘rsatilmagan'

# Hudud nomlari — app/dashboard/page.jsx HUDUD_ID bilan BIR XIL (xarita id ↔ nom)
QR, AND, BUX, JIZ, QASH, NAV, NAM, SAM, SUR, SIR, FAR, XOR, TSH, TVIL = (
    'Qoraqalpog‘iston', 'Andijon', 'Buxoro', 'Jizzax', 'Qashqadaryo', 'Navoiy', 'Namangan',
    'Samarqand', 'Surxondaryo', 'Sirdaryo', 'Farg‘ona', 'Xorazm', 'Toshkent sh.', 'Toshkent vil.',
)

# Kanonik tuman/shahar nomi → viloyat. Apostrof: ‘ (U+2018).
TUMAN_VILOYAT = {
    # Qoraqalpog'iston
    'Amudaryo tumani': QR, 'Beruniy tumani': QR, 'Bozatov tumani': QR, 'Chimboy tumani': QR,
    'Ellikqal‘a tumani': QR, 'Kegayli tumani': QR, 'Mo‘ynoq tumani': QR, 'Nukus shahri': QR,
    'Nukus tumani': QR, 'Qonliko‘l tumani': QR, 'Qorao‘zak tumani': QR, 'Qo‘ng‘irot tumani': QR,
    'Shumanay tumani': QR, 'Taxiatosh tumani': QR, 'Taxtako‘prik tumani': QR, 'To‘rtko‘l tumani': QR,
    'Xo‘jayli tumani': QR,
    # Andijon
    'Andijon shahri': AND, 'Andijon tumani': AND, 'Asaka tumani': AND, 'Baliqchi tumani': AND,
    'Bo‘ston tumani': AND, 'Buloqboshi tumani': AND, 'Izboskan tumani': AND, 'Jalaquduq tumani': AND,
    'Marxamat tumani': AND, 'Oltinko‘l tumani': AND, 'Paxtaobod tumani': AND, 'Qorasuv shahri': AND,
    'Qo‘rg‘ontepa tumani': AND, 'Shaxrixon tumani': AND, 'Ulug‘nor tumani': AND, 'Xonobod shahri': AND,
    'Xo‘jaobod tumani': AND,
    # Buxoro
    'Buxoro shahri': BUX, 'Buxoro tumani': BUX, 'G‘ijduvon tumani': BUX, 'Jondor tumani': BUX,
    'Kogon shahri': BUX, 'Kogon tumani': BUX, 'Olot tumani': BUX, 'Peshku tumani': BUX,
    'Qorako‘l tumani': BUX, 'Qorovulbozor tumani': BUX, 'Romitan tumani': BUX, 'Shofirkon tumani': BUX,
    'Vobkent tumani': BUX,
    # Jizzax
    'Arnasoy tumani': JIZ, 'Baxmal tumani': JIZ, 'Do‘stlik tumani': JIZ, 'Forish tumani': JIZ,
    'G‘allaorol tumani': JIZ, 'Jizzax shahri': JIZ, 'Mirzacho‘l tumani': JIZ, 'Paxtakor tumani': JIZ,
    'Sharof Rashidov tumani': JIZ, 'Yangiobod tumani': JIZ, 'Zafarobod tumani': JIZ, 'Zarbdor tumani': JIZ,
    'Zomin tumani': JIZ,
    # Qashqadaryo
    'Chiroqchi tumani': QASH, 'Dexqonobod tumani': QASH, 'G‘uzor tumani': QASH, 'Kasbi tumani': QASH,
    'Kitob tumani': QASH, 'Koson tumani': QASH, 'Ko‘kdala tumani': QASH, 'Mirishkor tumani': QASH,
    'Muborak tumani': QASH, 'Nishon tumani': QASH, 'Qamashi tumani': QASH, 'Qarshi shahri': QASH,
    'Qarshi tumani': QASH, 'Shaxrisabz shahri': QASH, 'Shaxrisabz tumani': QASH, 'Yakkabog‘ tumani': QASH,
    # Navoiy
    'G‘ozg‘on shahri': NAV, 'Karmana tumani': NAV, 'Konimex tumani': NAV, 'Navbahor tumani': NAV,
    'Navoiy shahri': NAV, 'Nurota tumani': NAV, 'Qiziltepa tumani': NAV, 'Tomdi tumani': NAV,
    'Uchquduq tumani': NAV, 'Xatirchi tumani': NAV, 'Zarafshon shahri': NAV,
    # Namangan
    'Chortoq tumani': NAM, 'Chust tumani': NAM, 'Davlatobod tumani': NAM, 'Kosonsoy tumani': NAM,
    'Mingbuloq tumani': NAM, 'Namangan shahri': NAM, 'Namangan tumani': NAM, 'Norin tumani': NAM,
    'Pop tumani': NAM, 'To‘raqo‘rg‘on tumani': NAM, 'Uchqo‘rg‘on tumani': NAM, 'Uychi tumani': NAM,
    'Yangi Namangan tumani': NAM, 'Yangiqo‘rg‘on tumani': NAM,
    # Samarqand
    'Bulung‘ur tumani': SAM, 'Ishtixon tumani': SAM, 'Jomboy tumani': SAM, 'Kattaqo‘rg‘on shahri': SAM,
    'Kattaqo‘rg‘on tumani': SAM, 'Narpay tumani': SAM, 'Nurobod tumani': SAM, 'Oqdaryo tumani': SAM,
    'Pastdarg‘om tumani': SAM, 'Paxtachi tumani': SAM, 'Payariq tumani': SAM, 'Qo‘shrabod tumani': SAM,
    'Samarqand shahri': SAM, 'Samarqand tumani': SAM, 'Toyloq tumani': SAM, 'Urgut tumani': SAM,
    # Surxondaryo
    'Angor tumani': SUR, 'Bandixon tumani': SUR, 'Boysun tumani': SUR, 'Denov tumani': SUR,
    'Jarqo‘rg‘on tumani': SUR, 'Muzrobod tumani': SUR, 'Oltinsoy tumani': SUR, 'Qiziriq tumani': SUR,
    'Qumqo‘rg‘on tumani': SUR, 'Sariosiyo tumani': SUR, 'Sherobod tumani': SUR, 'Sho‘rchi tumani': SUR,
    'Termiz shahri': SUR, 'Termiz tumani': SUR, 'Uzun tumani': SUR,
    # Sirdaryo
    'Boyovut tumani': SIR, 'Guliston shahri': SIR, 'Guliston tumani': SIR, 'Mirzaobod tumani': SIR,
    'Oqoltin tumani': SIR, 'Sardoba tumani': SIR, 'Sayxunobod tumani': SIR, 'Shirin shahri': SIR,
    'Sirdaryo tumani': SIR, 'Xovos tumani': SIR, 'Yangiyer shahri': SIR,
    # Farg'ona
    'Bag‘dod tumani': FAR, 'Beshariq tumani': FAR, 'Buvayda tumani': FAR, 'Dang‘ara tumani': FAR,
    'Farg‘ona shahri': FAR, 'Farg‘ona tumani': FAR, 'Furqat tumani': FAR, 'Marg‘ilon shahri': FAR,
    'Oltiariq tumani': FAR, 'O‘zbekiston tumani': FAR, 'Qo‘qon shahri': FAR, 'Qo‘shtepa tumani': FAR,
    'Quva tumani': FAR, 'Quvasoy shahri': FAR, 'Rishton tumani': FAR, 'So‘x tumani': FAR,
    'Toshloq tumani': FAR, 'Uchko‘prik tumani': FAR, 'Yozyovon tumani': FAR,
    # Xorazm
    'Bog‘ot tumani': XOR, 'Gurlan tumani': XOR, 'Qo‘shko‘pir tumani': XOR, 'Shovot tumani': XOR,
    'Tuproqqal‘a tumani': XOR, 'Urganch shahri': XOR, 'Urganch tumani': XOR, 'Xazorasp tumani': XOR,
    'Xiva shahri': XOR, 'Xiva tumani': XOR, 'Xonqa tumani': XOR, 'Yangiariq tumani': XOR,
    'Yangibozor tumani': XOR,
    # Toshkent shahri
    'Bektemir tumani': TSH, 'Chilonzor tumani': TSH, 'Mirobod tumani': TSH, 'Mirzo Ulug‘bek tumani': TSH,
    'Olmazor tumani': TSH, 'Sergeli tumani': TSH, 'Shayxontoxur tumani': TSH, 'Uchtepa tumani': TSH,
    'Yakkasaroy tumani': TSH, 'Yangihayot tumani': TSH, 'Yashnobod tumani': TSH, 'Yunusobod tumani': TSH,
    # Toshkent viloyati
    'Angren shahri': TVIL, 'Bekobod shahri': TVIL, 'Bekobod tumani': TVIL, 'Bo‘ka tumani': TVIL,
    'Bo‘stonliq tumani': TVIL, 'Chinoz tumani': TVIL, 'Chirchiq shahri': TVIL, 'Nurafshon shahri': TVIL,
    'Ohangaron shahri': TVIL, 'Ohangaron tumani': TVIL, 'Olmaliq shahri': TVIL, 'Oqqo‘rg‘on tumani': TVIL,
    'O‘rta Chirchiq tumani': TVIL, 'Parkent tumani': TVIL, 'Pskent tumani': TVIL, 'Qibray tumani': TVIL,
    'Quyi Chirchiq tumani': TVIL, 'Toshkent tumani': TVIL, 'Yangiyo‘l shahri': TVIL, 'Yangiyo‘l tumani': TVIL,
    'Yuqori Chirchiq tumani': TVIL, 'Zangiota tumani': TVIL,
}

# Manbadagi guruh nomi (apostroflar ‘ ga keltirilgan) → kanonik tuman. Lotin nomlar o'z-o'zidan mos
# kelsa yozilmaydi; faqat imlo farqi va rus-kirill dublikatlar.
GURUH_ALIAS = {
    'Bog‘dod tumani': 'Bag‘dod tumani',
    'Ellikqal‘a tumani': 'Ellikqal‘a tumani',
    'G‘ozg‘on shahar': 'G‘ozg‘on shahri',
    'Ko‘kdala tumani': 'Ko‘kdala tumani',
    'Nurafshon shaxri': 'Nurafshon shahri',
    'Oxangaron shaxri': 'Ohangaron shahri',
    'Taxhiatosh tumani': 'Taxiatosh tumani',
    'Yangi namangan tumani': 'Yangi Namangan tumani',
    'Yangiyul shaxri': 'Yangiyo‘l shahri',
    # rus-kirill dublikatlar
    'Давлетабадский район': 'Davlatobod tumani',
    'Алмазарский район': 'Olmazor tumani',
    'Тахтакупырский район': 'Taxtako‘prik tumani',
    'Юнусабадский район': 'Yunusobod tumani',
    'Мирзо-Улугбекский район': 'Mirzo Ulug‘bek tumani',
    'Шахриханский район': 'Shaxrixon tumani',
    'Янгикурганский район': 'Yangiqo‘rg‘on tumani',
    'Амударьинский район': 'Amudaryo tumani',
    'Ахангаран': 'Ohangaron shahri',
    'Пахтаабадский район': 'Paxtaobod tumani',
    'Наманган': 'Namangan shahri',
    'Андижанский район': 'Andijon tumani',
    'Караузякский район': 'Qorao‘zak tumani',
    'Ханабад': 'Xonobod shahri',
    'Чиланзарский район': 'Chilonzor tumani',
    'Ангрен': 'Angren shahri',
    'Балыкчинский район': 'Baliqchi tumani',
    'Андижан': 'Andijon shahri',
    'Алтынкульский район': 'Oltinko‘l tumani',
    'Букинский район': 'Bo‘ka tumani',
    'Кегейлийский район': 'Kegayli tumani',
    'Чимбайский район': 'Chimboy tumani',
    'Шайхантахурский район': 'Shayxontoxur tumani',
    'Тахиаташский район': 'Taxiatosh tumani',
    'Учтепинский район': 'Uchtepa tumani',
    'Янгиюль': 'Yangiyo‘l shahri',
    'Зангиатинский район': 'Zangiota tumani',
    'Улугноpский район': 'Ulug‘nor tumani',   # manbada lotin «p» aralashgan
    'Шуманайский район': 'Shumanay tumani',
    'Тамдынский район': 'Tomdi tumani',
    'Нарынский район': 'Norin tumani',
    'Кунградский район': 'Qo‘ng‘irot tumani',
    'Яккасарайский район': 'Yakkasaroy tumani',
    'Пскентский район': 'Pskent tumani',
    'Яшнободский район': 'Yashnobod tumani',
    'Алмалык': 'Olmaliq shahri',
    'Избасканский район': 'Izboskan tumani',
    'Нукус': 'Nukus shahri',
    'Асакинский район': 'Asaka tumani',
    'город Карасув': 'Qorasuv shahri',
    'Булакбашинский район': 'Buloqboshi tumani',
    'Мирабадский район': 'Mirobod tumani',
    'Наманганский район': 'Namangan tumani',
    'Ходжаабадский район': 'Xo‘jaobod tumani',
    'Чартакский район': 'Chortoq tumani',
    'Янги наманганский район': 'Yangi Namangan tumani',
    'Куйичирчикский район': 'Quyi Chirchiq tumani',
    'Кургантепинский район': 'Qo‘rg‘ontepa tumani',
    'Бекабад': 'Bekobod shahri',
    'Берунийский район': 'Beruniy tumani',
    'Уртачирчикский район': 'O‘rta Chirchiq tumani',
    'Туракурганский район': 'To‘raqo‘rg‘on tumani',
    'Чустский район': 'Chust tumani',
    'Кибрайский район': 'Qibray tumani',
}

# Muassasa turlari — tasnif tartibi MUHIM (birinchi mos kelgan qoida oladi).
# Ko'rsatkich: nom kichik harfda, apostroflar olib tashlangan, bo'sh joylar bitta.
TURLAR = [
    ('Tez tibbiy yordam', ('shoshilinch', 'tez tibbiy', 'tez yordam', 'tez-tibbiy')),
    ('SEO va jamoat salomatligi', ('sanitariya', 'epidemiolog', 'sanepid', 'osoyishtalik')),
    ('Respublika ixtisos. markazlari', ('respublika ixtisoslashtirilgan', 'ilmiy-amaliy', 'ilmiy amaliy', 'ilimiy-amaliy', 'ilmiy- amaliy', 'respublika ixtisoslashtirlgan')),
    # shifokorlik/shifokorlar/shikorlik/shiforlik + punkti/punkit/punki — imlo xatolari ko'p
    ('Oilaviy shifokorlik punkti', (r'(shi|sgi)[a-z]*\s*pu[kn]', r'\boshp\b', 'shifokor punk')),
    ('Markaziy poliklinika', ('markaziy polikl', 'markaziy polil', 'markaziy polikn', 'tarmoqli markaziy', r'\bktmp\b', r'\bktp\b', r'\bmp\b')),
    ('Oilaviy poliklinika', ('polikl', 'palikl', 'polil', 'polikn', 'polikin', 'polikil', r'\bop\b')),
    ('Tibbiyot birlashmasi (klaster)', ('tibbiyot birlashmasi', 'tibbiyat birlashmasi', 'tibbiyot birlashma', 'tibbiyot klasteri', r'\bttb\b')),
    ('Perinatal va tug‘ruq', ('perinatal', 'tugruq', 'tug`ruq', 'tug‘ruq', 'akusherlik', 'tugʻruq')),
    ('Dispanser', ('dispanser',)),
    ('Stomatologiya', ('stomatolog', 'stomotolog')),
    ('Sanatoriya va reabilitatsiya', ('sanatori', 'sixatgo', 'sihatgo', 'reabilita', 'shifobaxsh')),
    ('Xususiy muassasalar', ('xususiy', 'mchj', 'masuliyati cheklangan', 'mas‘uliyati cheklangan')),
    ('Shifoxona va klinikalar', ('shifoxona', 'shifohona', 'kasalxona', 'klinika', 'gospital', 'shifoxana', 'xospis', 'hospis', 'institut', 'akademiya', 'universitet')),
    ('Boshqaruv va xizmatlar', ('sogliqni saq', 'vazirligi', 'boshqarmasi', 'jamgarmasi', 'ekspertiza', 'qon quyish', 'patolog', 'patanatom', 'patalog', 'potalog')),
    ('Tibbiyot markazlari', ('markaz',)),
]
BOSHQA = 'Boshqa muassasalar'


def apostrof(s: str) -> str:
    return re.sub(r"[’'ʻ`ʼ]", '‘', s)


def toza(s) -> str:
    s = re.sub(r'\s+', ' ', str(s or '')).strip()
    return apostrof(s)


def tasnif(nomi: str) -> str:
    n = re.sub(r"[‘’'ʻ`ʼ]", '', nomi.lower())
    n = re.sub(r'\s+', ' ', n)
    for turi, kalitlar in TURLAR:
        for k in kalitlar:
            if any(ch in k for ch in '\\[]'):
                if re.search(k, n):
                    return turi
            elif k in n:
                return turi
    return BOSHQA


def sql_matn(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def main():
    wb = openpyxl.load_workbook(SRC, data_only=True)
    ws = wb.worksheets[0]
    rows = list(ws.iter_rows(min_row=2, values_only=True))
    umumiy_hisob = rows[0][6]

    # Guruh qatorlari: keyingi qator № = 1 (yangi ro'yxat boshlanadi)
    guruh_idx = []
    for i, r in enumerate(rows):
        nxt = rows[i + 1] if i + 1 < len(rows) else None
        if nxt and nxt[0] == 1 and r[0] is not None:
            guruh_idx.append(i)

    muassasalar = []
    xatolar = []
    for gi, i in enumerate(guruh_idx):
        end = guruh_idx[gi + 1] if gi + 1 < len(guruh_idx) else len(rows)
        g = rows[i]
        manba_guruh = toza(g[1])
        if not manba_guruh:
            hudud, tuman = KORSATILMAGAN, KORSATILMAGAN
        else:
            tuman = GURUH_ALIAS.get(manba_guruh, manba_guruh)
            hudud = TUMAN_VILOYAT.get(tuman)
            if not hudud:
                xatolar.append(manba_guruh)
                continue
        kids = rows[i + 1:end]
        s = [sum((k[c] or 0) for k in kids) for c in (2, 3, 4, 5)]
        assert s == [g[2] or 0, g[3] or 0, g[4] or 0, g[5] or 0], f'Guruh yig‘indisi mos emas: {manba_guruh} {s} vs {g[2:6]}'
        for k in kids:
            nomi = toza(k[1])
            jami, soz, nosoz, yaroqsiz = (int(k[c] or 0) for c in (2, 3, 4, 5))
            assert soz + nosoz + yaroqsiz == jami, f'{nomi}: holatlar yig‘indisi jami bilan mos emas'
            muassasalar.append({
                'hudud': hudud, 'tuman': tuman, 'manba_guruh': manba_guruh or None, 'nomi': nomi,
                'turi': tasnif(nomi), 'jami': jami, 'soz': soz, 'nosoz': nosoz, 'yaroqsiz': yaroqsiz,
            })
    if xatolar:
        raise SystemExit('Mapping topilmadi (TUMAN_VILOYAT / GURUH_ALIAS ga qo‘shing): ' + ', '.join(sorted(set(xatolar))))

    jami = sum(m['jami'] for m in muassasalar)
    assert jami == umumiy_hisob, f'Jami {jami} ≠ manba «Umumiy hisob» {umumiy_hisob}'

    # Agregatlar (view'lar bilan bir xil shakl)
    def agg(kalit_fn, kalitlar):
        d = OrderedDict()
        for m in muassasalar:
            k = kalit_fn(m)
            if k not in d:
                d[k] = dict(zip(kalitlar, k if isinstance(k, tuple) else (k,)))
                d[k].update(muassasa=0, jami=0, soz=0, nosoz=0, yaroqsiz=0)
            a = d[k]
            a['muassasa'] += 1
            for c in ('jami', 'soz', 'nosoz', 'yaroqsiz'):
                a[c] += m[c]
        return list(d.values())

    hudud_stat = agg(lambda m: m['hudud'], ('hudud',))
    tuman_soni = defaultdict(set)
    for m in muassasalar:
        tuman_soni[m['hudud']].add(m['tuman'])
    for h in hudud_stat:
        h['tuman_soni'] = len(tuman_soni[h['hudud']])
    hudud_stat.sort(key=lambda h: -h['jami'])
    tuman_stat = agg(lambda m: (m['hudud'], m['tuman']), ('hudud', 'tuman'))
    tuman_stat.sort(key=lambda t: (t['hudud'], -t['jami']))
    turi_stat = agg(lambda m: m['turi'], ('turi',))
    turi_stat.sort(key=lambda t: -t['jami'])

    # ---- Hisobot (stdout) ----
    print(f'Muassasalar: {len(muassasalar)}, jami jihozlar: {jami} (manba Umumiy hisob {umumiy_hisob})')
    print(f'Hududlar: {len(hudud_stat)}, tumanlar: {len(tuman_stat)} (manba guruhlari: {len(guruh_idx)})')
    for h in hudud_stat:
        print(f"  {h['hudud']:<18} muassasa {h['muassasa']:>5}  tuman {h['tuman_soni']:>3}  jihoz {h['jami']:>7}  soz {h['soz']:>7}  nosoz {h['nosoz']:>6}  yaroqsiz {h['yaroqsiz']:>6}")
    print('Turlar:')
    for t in turi_stat:
        print(f"  {t['turi']:<42} muassasa {t['muassasa']:>5}  jihoz {t['jami']:>7}")
    boshqa = [m['nomi'] for m in muassasalar if m['turi'] == BOSHQA]
    print(f'«{BOSHQA}» namunalari ({len(boshqa)}):')
    for n in boshqa[:60]:
        print('   -', n)

    # ---- SQL seed ----
    ustunlar = '(hudud, tuman, manba_guruh, nomi, turi, jami, soz, nosoz, yaroqsiz)'
    satrlar = []
    for m in muassasalar:
        satrlar.append('  (%s, %s, %s, %s, %s, %d, %d, %d, %d)' % (
            sql_matn(m['hudud']), sql_matn(m['tuman']),
            sql_matn(m['manba_guruh']) if m['manba_guruh'] else 'NULL',
            sql_matn(m['nomi']), sql_matn(m['turi']), m['jami'], m['soz'], m['nosoz'], m['yaroqsiz']))
    sql = [
        '-- =========================================================',
        '-- ETTP — Tibbiy jihozlar yig‘masi (muassasa kesimida)',
        f'-- Manba: {MANBA} — {len(muassasalar)} muassasa, {len(tuman_stat)} tuman/shahar, {len(hudud_stat) - 1} hudud + «{KORSATILMAGAN}»',
        f'-- Jami {jami} jihoz: soz {sum(m["soz"] for m in muassasalar)}, nosoz {sum(m["nosoz"] for m in muassasalar)}, yaroqsiz {sum(m["yaroqsiz"] for m in muassasalar)}',
        '-- GENERATSIYA QILINGAN FAYL — scripts/gen_jihozlar.py; qo‘lda tahrirlanmaydi.',
        '-- Rus-kirill nomli tuman guruhlari lotin kanonik tumanga birlashtirilgan (manba_guruh — asl nom).',
        '-- Idempotent: avval jadval tozalanadi.',
        '-- =========================================================',
        '',
        'TRUNCATE TABLE public.jihoz_muassasa RESTART IDENTITY;',
        '',
        f'INSERT INTO public.jihoz_muassasa {ustunlar} VALUES',
        ',\n'.join(satrlar) + ';',
        '',
    ]
    OUT_SQL.write_text('\n'.join(sql), encoding='utf-8')

    # ---- JS fallback ----
    def js(v):
        return json.dumps(v, ensure_ascii=False)

    hududlar = [h['hudud'] for h in hudud_stat]
    tumanlar = [t['tuman'] for t in tuman_stat]
    turlar = [t['turi'] for t in turi_stat]
    h_idx = {h: i for i, h in enumerate(hududlar)}
    t_idx = {}
    for i, t in enumerate(tuman_stat):
        t_idx[(t['hudud'], t['tuman'])] = i
    k_idx = {k: i for i, k in enumerate(turlar)}
    ixcham = [
        [h_idx[m['hudud']], t_idx[(m['hudud'], m['tuman'])], k_idx[m['turi']], m['nomi'], m['jami'], m['soz'], m['nosoz'], m['yaroqsiz']]
        for m in muassasalar
    ]
    jsl = [
        '// Tibbiy jihozlar yig‘masi — zaxira (Supabase ulanmaganda).',
        f'// Manba: {MANBA}. {len(muassasalar)} muassasa, {jami} jihoz. GENERATSIYA QILINGAN FAYL — scripts/gen_jihozlar.py.',
        '// Shakllar supabase/migrations/011_jihozlar.sql dagi jadval va view‘larga mos.',
        '',
        f'export const JIHOZ_MANBA = {js(MANBA)};',
        f'export const JIHOZ_KORSATILMAGAN = {js(KORSATILMAGAN)};',
        '',
        '// jihoz_hudud_stat',
        'export const INITIAL_JIHOZ_HUDUD_STAT = [',
        *[f'  {js(h)},' for h in hudud_stat],
        '];',
        '',
        '// jihoz_tuman_stat',
        'export const INITIAL_JIHOZ_TUMAN_STAT = [',
        *[f'  {js(t)},' for t in tuman_stat],
        '];',
        '',
        '// jihoz_turi_stat',
        'export const INITIAL_JIHOZ_TURI_STAT = [',
        *[f'  {js(t)},' for t in turi_stat],
        '];',
        '',
        '// jihoz_muassasa — ixcham: [hududIdx, tumanIdx, turiIdx, nomi, jami, soz, nosoz, yaroqsiz]',
        f'const HUDUDLAR = {js(hududlar)};',
        f'const TUMANLAR = {js(tumanlar)};',
        f'const TURLAR = {js(turlar)};',
        'const QATORLAR = [',
        *[f'  {js(r)},' for r in ixcham],
        '];',
        'export const INITIAL_JIHOZ_MUASSASA = QATORLAR.map((r, i) => ({',
        '  id: i + 1,',
        '  hudud: HUDUDLAR[r[0]],',
        '  tuman: TUMANLAR[r[1]],',
        '  turi: TURLAR[r[2]],',
        '  nomi: r[3],',
        '  jami: r[4],',
        '  soz: r[5],',
        '  nosoz: r[6],',
        '  yaroqsiz: r[7],',
        '}));',
        '',
    ]
    OUT_JS.write_text('\n'.join(jsl), encoding='utf-8')
    print(f'Yozildi: {OUT_SQL.relative_to(ROOT)} ({OUT_SQL.stat().st_size // 1024} KB), {OUT_JS.relative_to(ROOT)} ({OUT_JS.stat().st_size // 1024} KB)')


if __name__ == '__main__':
    main()
