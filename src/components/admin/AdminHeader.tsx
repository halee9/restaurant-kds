import { Sun, Moon, LogOut } from 'lucide-react';
import { useAdminStore } from '../../stores/adminStore';
import { Button } from '@/components/ui/button';

export default function AdminHeader() {
  const restaurantName = useAdminStore((s) => s.restaurantName);
  const theme = useAdminStore((s) => s.theme);
  const setTheme = useAdminStore((s) => s.setTheme);
  const logout = useAdminStore((s) => s.logout);

  return (
    <header className="h-12 flex items-center justify-between px-4 bg-card border-b border-border flex-shrink-0">
      <h1 className="text-sm font-semibold text-foreground truncate">
        {restaurantName}
      </h1>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={logout}
        >
          <LogOut size={16} />
        </Button>
      </div>
    </header>
  );
}
