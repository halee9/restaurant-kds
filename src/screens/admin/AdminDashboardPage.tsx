import { useAdminStore } from '../../stores/adminStore';
import DashboardScreen from '../DashboardScreen';

export default function AdminDashboardPage() {
  const restaurantCode = useAdminStore((s) => s.restaurantCode);
  const theme = useAdminStore((s) => s.theme);

  return <DashboardScreen restaurantCode={restaurantCode} theme={theme} />;
}
