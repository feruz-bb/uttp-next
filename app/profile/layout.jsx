import KabinetShell from '../../components/KabinetShell';

export default function ProfileLayout({ children }) {
  return <KabinetShell defaultProfilIndex={0}>{children}</KabinetShell>;
}
