import { describe, it, expect } from 'vitest';

describe('OrdersScreen theme-aware colors', () => {
  it('statusBadge uses dark: variants for all statuses', async () => {
    const fs = await import('fs');
    const source = fs.readFileSync('src/screens/OrdersScreen.tsx', 'utf-8');

    // Extract statusBadge map
    const match = source.match(/function statusBadge[\s\S]*?\n\}/);
    expect(match).not.toBeNull();
    const block = match![0];

    expect(block).toContain('text-amber-600 dark:text-amber-500');
    expect(block).toContain('text-blue-600 dark:text-blue-400');
    expect(block).toContain('text-amber-600 dark:text-amber-400');
    expect(block).toContain('text-emerald-600 dark:text-emerald-400');
    expect(block).toContain('text-gray-600 dark:text-gray-400');
    expect(block).toContain('text-red-600 dark:text-red-400');
  });

  it('sourceBadge uses dark: variants', async () => {
    const fs = await import('fs');
    const source = fs.readFileSync('src/screens/OrdersScreen.tsx', 'utf-8');

    // Check sourceBadge function colors map
    const match = source.match(/function sourceBadge[\s\S]*?\n\}/);
    expect(match).not.toBeNull();
    const block = match![0];

    expect(block).toContain('text-purple-600 dark:text-purple-400');
    expect(block).toContain('text-cyan-600 dark:text-cyan-400');
    expect(block).toContain('text-red-600 dark:text-red-400');
    expect(block).toContain('text-green-600 dark:text-green-400');
    expect(block).toContain('text-orange-600 dark:text-orange-400');
  });
});
