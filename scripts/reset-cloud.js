#!/usr/bin/env node
// =========================================================
// ETTP — Bulutdagi (linked) Supabase loyihasini xavfsiz reset qilish
//
//   CONFIRM_RESET=1 npm run db:reset:cloud
//
// Qadamlar:
//   1. CONFIRM_RESET=1 bo‘lmasa — rad etiladi (tasodifiy reset'dan himoya).
//   2. Bog‘langan loyiha ref'i chop etiladi (supabase/.temp/project-ref,
//      bo‘lmasa `supabase projects list` dagi ● belgili qator).
//   3. backups/<ISO-vaqt>.sql (sxema) va backups/<ISO-vaqt>.data.sql
//      (ma’lumotlar) — `supabase db dump --linked`.
//   4. `supabase db reset --linked` — migratsiyalar + seed qayta yuklanadi.
//
// Tashqi bog‘liqliklar yo‘q (faqat Node yadro modullari, CommonJS).
// =========================================================
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ILDIZ = path.resolve(__dirname, '..');
const BACKUP_DIR = path.join(ILDIZ, 'backups');
const REF_FAYL = path.join(ILDIZ, 'supabase', '.temp', 'project-ref');

function xabar(matn) {
  process.stdout.write(`[reset-cloud] ${matn}\n`);
}

function xato(matn, kod = 1) {
  process.stderr.write(`[reset-cloud] XATO: ${matn}\n`);
  process.exit(kod);
}

// Supabase CLI buyrug‘ini ishga tushiradi; chiqishi terminalga o‘tkaziladi
function supabase(args, { capture = false } = {}) {
  const natija = spawnSync('supabase', args, {
    cwd: ILDIZ,
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
    encoding: 'utf8',
    env: process.env,
  });
  if (natija.error) {
    xato(`supabase CLI topilmadi yoki ishga tushmadi (${natija.error.message})`);
  }
  return natija;
}

// Bog‘langan loyiha ref'i: avval .temp/project-ref, keyin projects list
function loyihaRef() {
  try {
    if (fs.existsSync(REF_FAYL)) {
      const ref = fs.readFileSync(REF_FAYL, 'utf8').trim();
      if (ref) return ref;
    }
  } catch {
    // o‘qib bo‘lmasa — quyidagi usulga o‘tamiz
  }
  const ro = supabase(['projects', 'list'], { capture: true });
  if (ro.status === 0 && ro.stdout) {
    // CLI bog‘langan loyihani ● bilan belgilaydi: "  ●  | ORG | REF | NAME | ..."
    const qator = ro.stdout.split('\n').find((q) => q.includes('●'));
    if (qator) {
      const ustunlar = qator.split('|').map((u) => u.trim()).filter(Boolean);
      const ref = ustunlar.find((u) => /^[a-z]{20}$/.test(u));
      if (ref) return ref;
    }
  }
  return null;
}

function isoVaqt() {
  // 2026-09-07T10-15-30-123Z — fayl nomi uchun ':' va '.' almashtiriladi
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function asosiy() {
  if (process.env.CONFIRM_RESET !== '1') {
    xabar('Bu buyruq BULUTDAGI (linked) ma’lumotlar bazasini to‘liq o‘chirib, qayta yaratadi.');
    xabar('Davom etish uchun aniq tasdiq kerak:');
    xabar('    CONFIRM_RESET=1 npm run db:reset:cloud');
    xato('CONFIRM_RESET=1 berilmagan — reset bekor qilindi.', 2);
  }

  const ref = loyihaRef();
  if (!ref) {
    xato('Bog‘langan loyiha topilmadi. Avval `supabase link --project-ref <ref>` bajaring.', 3);
  }
  xabar(`Bog‘langan loyiha: ${ref}`);

  // 1. Zaxira nusxa
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const vaqt = isoVaqt();
  const sxemaFayl = path.join('backups', `${vaqt}.sql`);
  const dataFayl = path.join('backups', `${vaqt}.data.sql`);

  xabar(`Sxema zaxirasi: ${sxemaFayl}`);
  const d1 = supabase(['db', 'dump', '-f', sxemaFayl, '--linked']);
  if (d1.status !== 0) xato('Sxema dump muvaffaqiyatsiz — reset bajarilmadi.', 4);

  xabar(`Ma’lumotlar zaxirasi: ${dataFayl}`);
  const d2 = supabase(['db', 'dump', '-f', dataFayl, '--linked', '--data-only', '--use-copy']);
  if (d2.status !== 0) xato('Ma’lumotlar dump muvaffaqiyatsiz — reset bajarilmadi.', 4);

  // 2. Reset (migratsiyalar + seed)
  xabar(`Reset boshlanmoqda: supabase db reset --linked (${ref})`);
  const r = supabase(['db', 'reset', '--linked']);
  if (r.status !== 0) xato('supabase db reset --linked muvaffaqiyatsiz tugadi.', 5);

  xabar('Tayyor. Zaxira nusxalar backups/ papkasida (git’ga kirmaydi).');
}

asosiy();
