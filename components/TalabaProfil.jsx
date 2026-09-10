'use client';

import { useEffect, useState } from 'react';
import IlmFanBolimi from './story/IlmFanBolimi';
import TalimTimeline from './TalimTimeline';
import { PageHead, Card, StatCard, Badge, SummaryList } from './ui.jsx';
import Icon from './icons.jsx';
import { getTalabaByUser, getDoktorantByUser, getTalimTarixi } from '../lib/data-service';
import { TALABA_MANBA_SANASI, DOKTORANT_MANBA_SANASI } from '../lib/demo-namunalar';

// Oliy ta'lim talabasi (TDTU ro'yxati, rol='talaba') uchun profil ko'rinishi.
// Shifokor kabinetidagi TFX/UKTT bloklari o'rniga — fakultet, mutaxassislik, kurs, guruh.

const TALIM_TURI_NOMI = {
  Bakalavr: 'Bakalavriat',
  Magistr: 'Magistratura',
  Ordinatura: 'Klinik ordinatura',
  'Tayanch doktorantura, PhD': 'Tayanch doktorantura (PhD)',
  'Maqsadli tayanch doktorantura, PhD': 'Maqsadli tayanch doktorantura (PhD)',
  'Doktorantura, DSc': 'Doktorantura (DSc)',
  'Stajyor-tadqiqotchi': 'Stajyor-tadqiqotchi',
};

// «Keyingi bosqich» tile'i trayektoriya kartasi (TalimTimeline) lug'atida — bitta zanjir, bitta so'z
const KEYINGI_BOSQICH = {
  Bakalavr: 'Magistratura / Klinik ordinatura',
  Magistr: 'Klinik ordinatura / Doktor (Shifokorlik)',
  Ordinatura: 'Doktor (Shifokorlik)',
};

// ISO sana (2026-09-04) → banner matni uchun 04.09.2026
const sanaUz = (iso) => String(iso || '').split('-').reverse().join('.');

export default function TalabaProfil({ profile }) {
  const [talaba, setTalaba] = useState(null);
  const [doktorant, setDoktorant] = useState(null);
  const [tamomlangan, setTamomlangan] = useState([]);

  useEffect(() => {
    let bekor = false;
    if (profile.hozirgi_bosqich === 'doktorantura') {
      getDoktorantByUser(profile.id).then((d) => {
        if (!bekor) setDoktorant(d);
      });
    } else {
      getTalabaByUser(profile.id).then((t) => {
        if (!bekor) setTalaba(t);
      });
    }
    // Trayektoriya faqat haqiqiy «tamomlagan» yozuvi bor bosqichlarni yashil qiladi
    getTalimTarixi(profile.id).then((rows) => {
      if (!bekor) setTamomlangan(rows.filter((y) => y.holati === 'tamomlagan').map((y) => y.bosqich));
    });
    return () => {
      bekor = true;
    };
  }, [profile.id, profile.hozirgi_bosqich]);

  // Supabase'dan talaba qatori kelmasa (demo-rejim) profil maydonlaridan tiklanadi
  const doktorantmi = profile.hozirgi_bosqich === 'doktorantura';
  const kurs = talaba?.kurs ?? doktorant?.kurs ?? profile.hozirgi_kurs;
  const talimTuri = doktorantmi
    ? doktorant?.bosqich || (profile.lavozimi || '').split(' · ')[0] || 'Doktorantura'
    : talaba?.talim_turi || (profile.lavozimi || '').split(' · ')[0] || 'Bakalavr';
  const fakultet = doktorantmi
    ? doktorant?.ixtisoslik || (profile.lavozimi || '').split(' · ')[1] || '—'
    : talaba?.fakultet || (profile.lavozimi || '').split(' · ')[1] || '—';
  const muassasa = talaba?.muassasa || profile.hozirgi_muassasa || 'Toshkent davlat tibbiyot universiteti';
  const ism = profile.fish?.split(' ')[1] || profile.fish;
  const jinsi = talaba?.jinsi || profile.jinsi;
  // Tile'ga faqat qisqa guruh kodi («1d20-18a») sig'adi; magistr/ordinatura uzun satrlari o'rniga qabul yili
  const guruhQisqa = talaba?.guruh && talaba.guruh.length <= 16 ? talaba.guruh : null;
  // Manba ro'yxati va sanasi — doktorant uchun TDTU doktorantlar ro'yxati (04.09.2026),
  // talaba uchun TDTU kontingent ro'yxati (03.09.2026); Supabase qatori bo'lsa undagi sana ustun
  const manbaNomi = doktorantmi ? 'TDTU doktorantlar ro‘yxati' : 'TDTU kontingent ro‘yxati';
  const manbaSanasi =
    talaba?.manba_sanasi || doktorant?.manba_sanasi || (doktorantmi ? DOKTORANT_MANBA_SANASI : TALABA_MANBA_SANASI);
  // Sarlavha uchun egalik qo'shimchasi bilan: «... talabasi» / «... doktoranti»
  const rolSozi = doktorantmi ? 'doktoranti' : 'talabasi';

  // Profil ma'lumotlari ro'yxati — doktorant/talaba maydonlari va faqat mavjud bo'lsa chiqadigan qatorlar
  const profilQatorlari = [
    { label: 'F.I.SH.', value: profile.fish },
    { label: 'Tug‘ilgan sana', value: talaba?.tugilgan_sana || profile.tug_ilgan_sana, mono: true },
    { label: 'Jinsi', value: jinsi === 'ayol' ? 'Ayol' : jinsi === 'erkak' ? 'Erkak' : '—' },
    { label: 'Muassasa', value: muassasa },
    { label: doktorantmi ? 'Ixtisoslik' : 'Fakultet', value: fakultet },
    ...(doktorantmi
      ? [
          { label: 'Ixtisoslik shifri', value: doktorant?.ixtisoslik_shifri, mono: true },
          { label: 'Ilmiy rahbar', value: doktorant?.rahbar },
          { label: 'Hudud', value: doktorant?.tuman || doktorant?.hudud },
        ]
      : [{ label: 'Mutaxassislik', value: talaba?.mutaxassislik }]),
    ...(talaba?.mutaxassislik_kodi
      ? [{ label: 'Mutaxassislik shifri', value: talaba.mutaxassislik_kodi, mono: true }]
      : []),
    { label: 'Kurs', value: kurs ? `${kurs}-kurs` : '—' },
    // Guruh alohida qatorda (kurs bilan qo'shib yozilmaydi); qisqa kod mono, uzun nom oddiy matn
    ...(talaba?.guruh ? [{ label: 'Guruh', value: talaba.guruh, mono: talaba.guruh.length <= 24 }] : []),
    // Magistr faylidan boyitilgan maydonlar — faqat mavjud bo'lsa ko'rsatiladi
    ...(talaba?.kampus ? [{ label: 'Kampus', value: talaba.kampus }] : []),
    ...(talaba?.til ? [{ label: 'Ta‘lim tili', value: talaba.til === 'ru' ? 'Rus tili' : 'O‘zbek tili' }] : []),
    ...(talaba?.qabul_yili ? [{ label: 'Qabul yili', value: String(talaba.qabul_yili), mono: true }] : []),
  ];

  return (
    <>
      <PageHead
        breadcrumb={[{ label: 'Kabinet', href: '/profile' }, { label: doktorantmi ? 'Doktorant profili' : 'Talaba profili' }]}
        title={`Salom, ${ism}!`}
        badge={<Badge tone="neutral">{doktorantmi ? 'Doktorant' : 'Talaba'}</Badge>}
        subtitle={`${kurs ? `${kurs}-kurs` : ''} ${TALIM_TURI_NOMI[talimTuri] || talimTuri} ${rolSozi} · ${muassasa}`}
      />

      <div className="elon-banner" style={{ marginBottom: 18 }}>
        <span className="elon-banner__ikon">
          <Icon.certificate width={16} height={16} aria-hidden="true" />
        </span>
        <p>
          <b>Ta’lim zanjiridasiz.</b>{' '}
          Bu kabinet {sanaUz(manbaSanasi)} holatidagi {manbaNomi} asosida ochilgan. O‘qishni
          tamomlaganingizdan so‘ng profilingiz avtomatik tarzda keyingi bosqichga o‘tkaziladi.
        </p>
      </div>

      <div className="grid stat-grid" style={{ marginBottom: 24 }}>
        <StatCard label="Joriy kurs" value={kurs ? `${kurs}-kurs` : '—'} icon="book" tone="primary" />
        <StatCard label="Ta’lim turi" value={TALIM_TURI_NOMI[talimTuri] || talimTuri} icon="certificate" tone="teal" />
        <StatCard
          label={doktorantmi || !guruhQisqa ? 'Qabul yili' : 'Guruh'}
          value={
            doktorantmi
              ? doktorant?.qabul_yili ? String(doktorant.qabul_yili) : '—'
              : guruhQisqa || (talaba?.qabul_yili ? String(talaba.qabul_yili) : '—')
          }
          icon="users"
          tone="warning"
        />
        <StatCard
          label="Keyingi bosqich"
          value={
            doktorantmi
              ? doktorant?.daraja === 'DSc' ? 'Fan doktori (DSc)' : 'PhD himoyasi'
              : KEYINGI_BOSQICH[talimTuri] || '—'
          }
          icon="flag"
          tone="violet"
        />
      </div>

      <TalimTimeline hozirgiBosqich={profile.hozirgi_bosqich || 'bakalavr'} tamomlangan={tamomlangan} />

      <div className="grid cols-2" style={{ gap: 24, marginBottom: 24, alignItems: 'start' }}>
        <Card title="Profil ma’lumotlari">
          <SummaryList items={profilQatorlari} />
        </Card>

        <Card title="Kirish ma’lumotlari" extra={<Badge tone="success">Faol</Badge>}>
          <SummaryList
            items={[
              { label: 'Login', value: talaba?.login || doktorant?.login || profile.email, mono: true },
              { label: 'Ro‘yxat sanasi', value: manbaSanasi, mono: true },
              { label: 'Manba', value: manbaNomi },
            ]}
          />
          {doktorantmi && doktorant?.mavzu && (
            <p style={{ fontSize: 13, marginTop: 14, marginBottom: 0 }}>
              <span style={{ color: 'var(--muted)' }}>Ilmiy ish mavzusi: </span>{doktorant.mavzu}
            </p>
          )}
          <p style={{ color: 'var(--muted)', fontSize: 12.5, marginTop: 14, marginBottom: 0 }}>
            Login va parol universitet ro‘yxati asosida avtomatik berilgan. Parolni o‘zgartirish
            uchun tizim administratoriga murojaat qiling.
          </p>
        </Card>
      </div>

      {/* Canvas 3-yo'nalish — har kabinetda alohida bo'lim */}
      <IlmFanBolimi profile={profile} />
    </>
  );
}
