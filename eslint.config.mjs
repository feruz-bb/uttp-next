// ESLint flat config — ETTP (uttp-next).
// Asos: eslint-config-next/core-web-vitals (Next + React + react-hooks + jsx-a11y + import)
// va ESLint yadro «recommended» to'plami (ishlatilmagan o'zgaruvchilar, no-undef va h.k.).
// Ishga tushirish: npm run lint  |  avtomatik tuzatish: npm run lint:fix
import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import nextVitals from 'eslint-config-next/core-web-vitals';

export default defineConfig([
  // Tekshirilmaydigan yo'llar (node_modules va .git sukut bo'yicha chetlab o'tiladi)
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'supabase/**', // migratsiyalar, seed SQL, CLI vaqtinchalik fayllari
    'scripts/__pycache__/**', // Python generatorlarining chiqishi
    'lib/*-fallback.js', // gen_talaba.py / gen_doktorant.py hosil qiladi — qo'lda tahrirlanmaydi
    'public/**',
    'backups/**', // reset-cloud.js dumplari
  ]),

  // ESLint yadro qoidalari (no-unused-vars, no-undef, no-empty ...)
  js.configs.recommended,

  // Next.js + React + Core Web Vitals
  ...nextVitals,

  {
    name: 'ettp/qoidalar',
    rules: {
      // Ishlatilmagan o'zgaruvchi — xato; «_» bilan boshlangan nomlar ataylab qoldirilgan hisoblanadi
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      // Effekt qoidalari — ogohlantirish (xato emas): tuzatish effektlarni qayta yozishni talab qiladi,
      // bu bosqichma-bosqich qilinadi; ommaviy tahrir xulq-atvorni o'zgartirishi mumkin.
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'warn', // useEffect ichida to'g'ridan-to'g'ri setState (kesh/demo yuklash)
      'react-hooks/refs': 'warn', // render vaqtida ref.current yozish (GlassModal «so'nggi callback» naqshi)
    },
  },

  // Node (CommonJS) skriptlari: require/module/__dirname ruxsat etiladi
  {
    name: 'ettp/node-skriptlar',
    files: ['scripts/**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },
]);
