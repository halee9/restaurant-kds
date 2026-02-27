import { useState } from 'react';

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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-sm border border-gray-800 shadow-xl">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🍽️</div>
          <h1 className="text-xl font-bold text-white">Kitchen Display</h1>
          <p className="text-gray-400 text-sm mt-1">Enter your restaurant code to start</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. OWNER01"
            maxLength={8}
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white text-center text-2xl font-bold tracking-widest placeholder:text-gray-600 placeholder:text-base placeholder:font-normal focus:outline-none focus:border-blue-500 transition-colors"
          />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={!code.trim() || loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold transition-colors"
          >
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        </form>
      </div>
    </div>
  );
}
