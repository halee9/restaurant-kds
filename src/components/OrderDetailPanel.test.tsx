import { describe, it, expect } from 'vitest';

describe('OrderDetailPanel theme-aware colors', () => {
  it('statusBadge uses dark: variants for all statuses', async () => {
    const fs = await import('fs');
    const source = fs.readFileSync('src/components/OrderDetailPanel.tsx', 'utf-8');

    // Extract statusBadge function block
    const match = source.match(/function statusBadge[\s\S]*?\n\}/);
    expect(match).not.toBeNull();
    const block = match![0];

    // Each status text color should have a dark: variant
    expect(block).toContain('text-amber-600 dark:text-amber-500');
    expect(block).toContain('text-blue-600 dark:text-blue-400');
    expect(block).toContain('text-amber-600 dark:text-amber-400');
    expect(block).toContain('text-emerald-600 dark:text-emerald-400');
    expect(block).toContain('text-gray-600 dark:text-gray-400');
    expect(block).toContain('text-red-600 dark:text-red-400');
  });
});
