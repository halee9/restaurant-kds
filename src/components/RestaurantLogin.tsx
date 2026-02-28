import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  onJoin: (code: string, name: string) => void;
}

export default function RestaurantLogin({ onJoin }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${serverUrl}/api/config/${trimmed}`);
      if (!res.ok) {
        setError('Restaurant code not found. Please check and try again.');
        return;
      }
      const config = await res.json();
      localStorage.setItem('kds_restaurant_code', trimmed);
      localStorage.setItem('kds_restaurant_name', config.name);
      onJoin(trimmed, config.name);
    } catch {
      setError('Cannot connect to server. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🍽️</div>
          <CardTitle>Kitchen Display</CardTitle>
          <CardDescription>Enter your restaurant code to start</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="code">Restaurant Code</Label>
              <Input
                id="code"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. MIDORI"
                maxLength={8}
                autoFocus
                className="text-center text-2xl font-bold tracking-widest h-14"
              />
            </div>

            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}

            <Button type="submit" disabled={!code.trim() || loading} className="w-full">
              {loading ? 'Connecting...' : 'Connect'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
