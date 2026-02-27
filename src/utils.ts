import type { OrderSource } from './types';

export function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function getElapsedMinutes(isoString: string): number {
  return Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
}

export function detectSource(squareSourceName?: string): OrderSource {
  if (!squareSourceName) return 'Unknown';
  const name = squareSourceName.toLowerCase();
  if (name.includes('doordash')) return 'DoorDash';
  if (name.includes('uber')) return 'Uber Eats';
  if (name.includes('grubhub')) return 'Grubhub';
  if (name.includes('square online') || name.includes('online store')) return 'Square Online';
  if (name.includes('kiosk') || name.includes('point of sale') || name.includes('pos')) return 'Kiosk';
  return 'Unknown';
}

export const SOURCE_COLORS: Record<OrderSource, string> = {
  'Kiosk': 'bg-blue-600',
  'DoorDash': 'bg-red-600',
  'Uber Eats': 'bg-green-600',
  'Grubhub': 'bg-orange-500',
  'Square Online': 'bg-purple-600',
  'Unknown': 'bg-gray-600',
};
