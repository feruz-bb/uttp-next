import KabinetShell from '../../components/KabinetShell';

// Ilm-fan va innovatsiyalar — barcha rollar uchun (rolga mos sidebar KabinetShell ichida)
export default function ElonlarLayout({ children }) {
  return <KabinetShell defaultProfilIndex={0}>{children}</KabinetShell>;
}
