import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, ClipboardList, Banknote, Users, Menu } from 'lucide-react';

const tabs = [
  { icon: BarChart3, label: 'Home', path: '/admin' },
  { icon: ClipboardList, label: 'Orders', path: '/admin/orders' },
  { icon: Banknote, label: 'Cash', path: '/admin/cash' },
  { icon: Users, label: 'Staff', path: '/admin/staff' },
  { icon: Menu, label: 'More', path: '/admin/more' },
] as const;

export default function AdminBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    // /admin/settings, /admin/menu-display, /admin/online-store → More 탭 활성화
    if (path === '/admin/more') {
      return ['/admin/more', '/admin/settings', '/admin/menu-display', '/admin/online-store'].some(
        (p) => location.pathname === p
      );
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="flex-shrink-0 bg-card border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${
                active
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              <tab.icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[10px] ${active ? 'font-semibold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
