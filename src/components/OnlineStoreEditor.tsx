import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { RestaurantConfig } from './AdminPage';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
const ONLINE_STORE_URL = import.meta.env.VITE_ONLINE_STORE_URL || 'https://order.ziggl.app';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TIMEZONE_OPTIONS = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
];

interface Props {
  config: RestaurantConfig;
  pin: string;
  onSaved: (updated: RestaurantConfig) => void;
}

export default function OnlineStoreEditor({ config, pin, onSaved }: Props) {
  // Landing Page
  const [enableLanding, setEnableLanding] = useState(config.enable_landing ?? false);
  const [description, setDescription] = useState(config.description ?? '');
  const [address, setAddress] = useState(config.address ?? '');
  const [phone, setPhone] = useState(config.phone ?? '');

  // Business Hours
  const [timezone, setTimezone] = useState(config.timezone ?? 'America/Los_Angeles');
  const [openTime, setOpenTime] = useState(config.hours?.open ?? '09:00');
  const [closeTime, setCloseTime] = useState(config.hours?.close ?? '21:00');
  const [days, setDays] = useState<number[]>(config.hours?.days ?? [1, 2, 3, 4, 5]);

  // Social Links
  const [yelp, setYelp] = useState(config.social_links?.yelp ?? '');
  const [googleMaps, setGoogleMaps] = useState(config.social_links?.google_maps ?? '');
  const [instagram, setInstagram] = useState(config.social_links?.instagram ?? '');
  const [facebook, setFacebook] = useState(config.social_links?.facebook ?? '');

  // Theme
  const [primaryColor, setPrimaryColor] = useState(config.theme?.primaryColor ?? '#16a34a');
  const [heroImageUrl, setHeroImageUrl] = useState(config.theme?.heroImageUrl ?? '');
  const [logoUrl, setLogoUrl] = useState(config.theme?.logoUrl ?? '');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const toggleDay = (day: number) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setSaving(true);

    // social_links — 빈 문자열 필터링
    const socialLinks: Record<string, string> = {};
    if (yelp.trim()) socialLinks.yelp = yelp.trim();
    if (googleMaps.trim()) socialLinks.google_maps = googleMaps.trim();
    if (instagram.trim()) socialLinks.instagram = instagram.trim();
    if (facebook.trim()) socialLinks.facebook = facebook.trim();

    // theme — 기존 theme 유지하면서 변경된 필드만 업데이트
    const theme = {
      ...(config.theme ?? {}),
      primaryColor: primaryColor.trim() || '#16a34a',
      heroImageUrl: heroImageUrl.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
    };

    try {
      const res = await fetch(`${SERVER_URL}/api/admin/${config.restaurant_code}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin,
          enable_landing: enableLanding,
          description: description.trim() || null,
          address: address.trim() || null,
          phone: phone.trim() || null,
          social_links: Object.keys(socialLinks).length > 0 ? socialLinks : null,
          timezone,
          hours: days.length > 0 ? { open: openTime, close: closeTime, days } : null,
          theme,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        setErrorMsg(d.error || 'Failed to save');
        return;
      }

      const updated = await res.json();
      setSuccessMsg('Settings saved!');
      onSaved(updated);
    } catch {
      setErrorMsg('Cannot connect to server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">

      {/* Landing Page */}
      <Card>
        <CardHeader><CardTitle className="text-sm uppercase tracking-wider">Landing Page</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium">Enable Landing Page</p>
              <p className="text-xs text-muted-foreground">Show a storefront page at your root URL</p>
            </div>
            <button
              type="button"
              onClick={() => setEnableLanding((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${enableLanding ? 'bg-primary' : 'bg-muted'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${enableLanding ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Fresh Japanese teriyaki & more in Beaverton"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="3735 SW Hall Blvd, Beaverton, OR 97005" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+15031234567" />
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card>
        <CardHeader><CardTitle className="text-sm uppercase tracking-wider">Business Hours</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="timezone">Timezone</Label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz} value={tz}>{tz.replace('America/', '').replace('Pacific/', '').replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="open">Open</Label>
              <Input id="open" type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="close">Close</Label>
              <Input id="close" type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Days Open</Label>
            <div className="flex gap-1.5 flex-wrap">
              {DAY_LABELS.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    days.includes(i)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:border-muted-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader><CardTitle className="text-sm uppercase tracking-wider">Social Links</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="yelp">Yelp</Label>
            <Input id="yelp" value={yelp} onChange={(e) => setYelp(e.target.value)} placeholder="https://www.yelp.com/biz/..." />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="gmaps">Google Maps</Label>
            <Input id="gmaps" value={googleMaps} onChange={(e) => setGoogleMaps(e.target.value)} placeholder="https://maps.google.com/?cid=..." />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ig">Instagram</Label>
            <Input id="ig" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/..." />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fb">Facebook</Label>
            <Input id="fb" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/..." />
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader><CardTitle className="text-sm uppercase tracking-wider">Theme</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                id="primaryColor"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-md border border-input cursor-pointer"
              />
              <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} placeholder="#16a34a" className="flex-1" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="heroImage">Hero Image URL</Label>
            <Input id="heroImage" value={heroImageUrl} onChange={(e) => setHeroImageUrl(e.target.value)} placeholder="https://example.com/hero.jpg" />
            <p className="text-xs text-muted-foreground">Background image for the landing page hero section</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input id="logoUrl" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
            <p className="text-xs text-muted-foreground">Custom logo (overrides the default template logo)</p>
          </div>
        </CardContent>
      </Card>

      {/* Preview Link */}
      <div className="text-center">
        <a
          href={`${ONLINE_STORE_URL}/${config.restaurant_code.toLowerCase()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          Preview Landing Page ↗
        </a>
      </div>

      <Separator />

      {errorMsg && <p className="text-destructive text-sm text-center">{errorMsg}</p>}
      {successMsg && <p className="text-green-400 text-sm text-center">{successMsg}</p>}

      <Button type="submit" disabled={saving} size="lg" className="w-full">
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
