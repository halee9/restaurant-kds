import { useState, useEffect } from 'react';
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
  logo_style?: string;
  // ── Online Store / Landing Page ──
  timezone?: string;
  hours?: { open: string; close: string; days: number[] } | null;
  theme?: {
    primaryColor: string;
    accentColor?: string;
    bgColor?: string;
    textColor?: string;
    logoUrl?: string;
    heroImageUrl?: string;
    fontFamily?: string;
  } | null;
  enable_landing?: boolean;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  social_links?: {
    instagram?: string;
    facebook?: string;
    yelp?: string;
    google_maps?: string;
  } | null;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export default function AdminPage() {
  const [config, setConfig] = useState<RestaurantConfig | null>(null);
  const [pin, setPin] = useState('');

  // 테스트용 자동 로그인: /admin?code=midori&pin=1234
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const autoCode = params.get('code');
    const autoPin  = params.get('pin');
    if (!autoCode || !autoPin) return;

    fetch(`${SERVER_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: autoCode, pin: autoPin }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((cfg) => { if (cfg) { setConfig(cfg); setPin(autoPin); } })
      .catch(() => {});
  }, []);

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
