import KabinetShell from '../../components/KabinetShell';

export default function AdminLayout({ children }) {
  return <KabinetShell defaultProfilIndex={3}>{children}</KabinetShell>;
}
