import { describe, it, expect } from 'vitest';

// Test the exported constants and functions directly by importing the module
// Since URGENCY_TIME and badgeClass are not exported, we test their values indirectly
// by checking the source patterns

describe('OrderList emoji visibility on done', () => {
  it('icons should NOT be hidden when item is done (no !isDone condition)', async () => {
    const fs = await import('fs');
    const source = fs.readFileSync('src/components/OrderList.tsx', 'utf-8');

    // Find the icons rendering line
    const match = source.match(/icons\.length > 0 &&[^(]*/);
    expect(match).not.toBeNull();
    // Should NOT contain !isDone
    expect(match![0]).not.toContain('!isDone');
  });
});

describe('OrderList auto-advance guard', () => {
  it('auto-READY effect must have an early return guard for finished orders', async () => {
    const fs = await import('fs');
    const source = fs.readFileSync('src/components/OrderList.tsx', 'utf-8');

    // Find the auto-READY useEffect block
    const effectMatch = source.match(/모든 아이템 수량 다 채워지면[\s\S]*?return \(\) => clearTimeout\(timer\);/);
    expect(effectMatch).not.toBeNull();
    const block = effectMatch![0];

    // Must have an early return that checks isFinished BEFORE setting the timer
    expect(block).toMatch(/if\s*\(\s*isFinished\s*\)\s*return/);
  });

  it('handleItemClick must block clicks for finished orders', async () => {
    const fs = await import('fs');
    const source = fs.readFileSync('src/components/OrderList.tsx', 'utf-8');

    const match = source.match(/function handleItemClick[\s\S]*?\n  \}/);
    expect(match).not.toBeNull();
    const block = match![0];

    // Must have early return for isFinished
    expect(block).toMatch(/if\s*\(\s*isFinished\s*\)\s*return/);
  });
});

describe('OrderList theme-aware colors', () => {
  describe('URGENCY_TIME should have dark: variants', () => {
    // We read the source to verify the pattern
    it('all urgency time colors include dark: variant', async () => {
      const fs = await import('fs');
      const source = fs.readFileSync('src/components/OrderList.tsx', 'utf-8');

      // Extract URGENCY_TIME block
      const urgencyMatch = source.match(/const URGENCY_TIME[\s\S]*?\};/);
      expect(urgencyMatch).not.toBeNull();
      const block = urgencyMatch![0];

      // Each entry should have both light and dark variants
      expect(block).toContain('text-green-700');
      expect(block).toContain('dark:text-green-400');
      expect(block).toContain('text-yellow-700');
      expect(block).toContain('dark:text-yellow-400');
      expect(block).toContain('text-orange-700');
      expect(block).toContain('dark:text-orange-400');
      expect(block).toContain('text-red-700');
      expect(block).toContain('dark:text-red-400');
    });
  });

  describe('badgeClass should have dark: variants', () => {
    it('all badge status colors include dark: variant', async () => {
      const fs = await import('fs');
      const source = fs.readFileSync('src/components/OrderList.tsx', 'utf-8');

      // Extract badgeClass function
      const badgeMatch = source.match(/function badgeClass[\s\S]*?\}/);
      expect(badgeMatch).not.toBeNull();
      const block = badgeMatch![0];

      expect(block).toContain('text-amber-700');
      expect(block).toContain('dark:text-amber-400');
      expect(block).toContain('text-yellow-700');
      expect(block).toContain('dark:text-yellow-400');
      expect(block).toContain('text-green-700');
      expect(block).toContain('dark:text-green-400');
      expect(block).toContain('text-red-700');
      expect(block).toContain('dark:text-red-400');
    });
  });
});
