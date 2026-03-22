import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';
import AdminLogin from './AdminLogin';

export default function AdminAuthGuard() {
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated);
  const theme = useAdminStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <Outlet />;
}
