import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Settings, Palette, Store, ChevronRight } from 'lucide-react';

const items = [
  {
    icon: BarChart3,
    label: 'Analytics',
    description: 'Daily, weekly, monthly sales analytics',
    path: '/admin/analytics',
  },
  {
    icon: Settings,
    label: 'Settings',
    description: 'Restaurant info, tax, tips, payment, PIN',
    path: '/admin/settings',
  },
  {
    icon: Palette,
    label: 'Menu Display',
    description: 'Item abbreviations, colors, visibility',
    path: '/admin/menu-display',
  },
  {
    icon: Store,
    label: 'Online Store',
    description: 'Theme, hours, landing page, social links',
    path: '/admin/online-store',
  },
] as const;

export default function AdminMoreScreen() {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-6">
      <h2 className="text-lg font-bold mb-4">More</h2>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <Card
            key={item.path}
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => navigate(item.path)}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <item.icon size={20} className="text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
