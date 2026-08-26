import KabinetShell from '../../components/KabinetShell';

export default function DashboardLayout({ children }) {
  return <KabinetShell defaultProfilIndex={2}>{children}</KabinetShell>;
}
