import { useState } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export interface RestaurantConfig {
  id: string;
  restaurant_code: string;
  name: string;
  square_location_id: string;
  square_environment: string;
  tax_rate: number;
  tip_percentages: number[];
  settings_pin: string;
  enable_tipping: boolean;
  session_timeout_minutes: number;
}

export default function AdminPage() {
  const [config, setConfig] = useState<RestaurantConfig | null>(null);
  const [pin, setPin] = useState('');

  const handleLogin = (cfg: RestaurantConfig, enteredPin: string) => {
    setConfig(cfg);
    setPin(enteredPin);
  };

  const handleLogout = () => {
    setConfig(null);
    setPin('');
  };

  const handleSaved = (updated: RestaurantConfig) => {
    setConfig(updated);
  };

  if (!config) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <AdminDashboard
      config={config}
      pin={pin}
      onSaved={handleSaved}
      onLogout={handleLogout}
    />
  );
}
