// Markaziy dizayn tokenlari — CSS va grafiklar (Recharts) uchun.
export const theme = {
  navy: '#111827',
  navy2: '#1f2937',
  navyLine: 'rgba(17,24,39,0.07)',
  bg: '#eef1f5',
  sidebar: '#e5e9f1',
  card: '#ffffff',
  text: '#111827',
  muted: '#737780',
  line: '#e4e7ec',
  primary: '#06b6d4',
  primaryDark: '#0e7490', // matn-roldagi primary uchun (oq fonda 5.36:1, WCAG AA)
  primarySoft: '#cffafe',
  accent: '#e4756a',
  accentSoft: '#fbe5e2',
  success: '#16a34a',
  successSoft: '#dcfce7',
  warning: '#e0930a',
  warningSoft: '#fef3c7',
  danger: '#dc2626',
  dangerSoft: '#fee2e2',
  teal: '#1fa396',
  tealSoft: '#ccfbf1',
  violet: '#7c3aed',
  violetSoft: '#ede9fe',
};

// Recharts Tooltip uchun yagona uslub (oq karta, yupqa chegara, 12px radius)
export const chartTip = {
  background: theme.card,
  border: `1px solid ${theme.line}`,
  borderRadius: 12,
  color: theme.text,
  fontSize: 12.5,
  boxShadow: '0 4px 14px rgba(17,24,39,0.08)',
};

// Grafiklar uchun kategorik ranglar — tartib qat'iy, validatordan o'tgan
// (ko'k → teal → binafsha → yashil → amber → pushti; aylantirilmaydi).
// Uyg'un sovuq gamma + bitta iliq aksent — sayt primary (turkuaz) bilan hamohang.
export const chartColors = [
  '#4e7fd1', // ko'k
  '#37ada4', // teal
  '#8b7ad9', // binafsha
  '#58a66e', // yashil
  '#e3a63c', // amber
  '#c4708f', // pushti (rose)
];

// "Boshqalar" kategoriyasi uchun neytral kulrang (kategorik slot emas)
export const chartGray = '#8a94a6';

// Taqqoslash juftligi: joriy davr vs o'tgan davr (o'tgan davr doim xira)
export const comparePair = { current: '#37ada4', previous: '#c3c9d4' };
