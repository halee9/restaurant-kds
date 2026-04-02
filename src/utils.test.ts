import { describe, it, expect } from 'vitest';
import { getItemDisplay, getModifierDisplay, collectLineItemIcons, adaptColorForLight } from './utils';
import type { MenuDisplayItem, ModifierDisplayItem, OrderLineItem } from './types';

describe('getItemDisplay icon field', () => {
  const menuDisplay: MenuDisplayItem[] = [
    { restaurant_code: 'TEST', item_name: 'Spicy Chicken', icon: '🔥' },
    { restaurant_code: 'TEST', item_name: 'Salmon Bowl', icon: '🐟', abbreviation: 'Salmon' },
    { restaurant_code: 'TEST', item_name: 'No Icon Item' },
  ];

  it('returns icon when configured', () => {
    const result = getItemDisplay('Spicy Chicken', menuDisplay);
    expect(result.icon).toBe('🔥');
  });

  it('returns icon alongside abbreviation', () => {
    const result = getItemDisplay('Salmon Bowl', menuDisplay);
    expect(result.icon).toBe('🐟');
    expect(result.label).toBe('Salmon');
  });

  it('returns undefined icon when not configured', () => {
    const result = getItemDisplay('No Icon Item', menuDisplay);
    expect(result.icon).toBeUndefined();
  });

  it('returns undefined icon for unknown item', () => {
    const result = getItemDisplay('Unknown Item', menuDisplay);
    expect(result.icon).toBeUndefined();
  });
});

describe('getModifierDisplay icon field', () => {
  const modifierDisplay: ModifierDisplayItem[] = [
    { restaurant_code: 'TEST', modifier_name: 'Brown Rice', icon: '🌾' },
    { restaurant_code: 'TEST', modifier_name: 'Extra Spicy', icon: '🌶️', abbreviation: 'X-Spicy' },
    { restaurant_code: 'TEST', modifier_name: 'No Onion' },
  ];

  it('returns icon when configured', () => {
    const result = getModifierDisplay({ name: 'Brown Rice', qty: 1, price: 0 }, modifierDisplay);
    expect(result.icon).toBe('🌾');
  });

  it('returns icon alongside abbreviation', () => {
    const result = getModifierDisplay({ name: 'Extra Spicy', qty: 1, price: 0 }, modifierDisplay);
    expect(result.icon).toBe('🌶️');
    expect(result.label).toBe('X-Spicy');
  });

  it('returns undefined icon when not configured', () => {
    const result = getModifierDisplay({ name: 'No Onion', qty: 1, price: 0 }, modifierDisplay);
    expect(result.icon).toBeUndefined();
  });

  it('returns undefined icon for unknown modifier', () => {
    const result = getModifierDisplay('Unknown Mod', modifierDisplay);
    expect(result.icon).toBeUndefined();
  });
});

describe('collectLineItemIcons', () => {
  const menuItems: MenuDisplayItem[] = [
    { restaurant_code: 'TEST', item_name: 'Spicy Poke', icon: '🌶️' },
    { restaurant_code: 'TEST', item_name: 'Plain Bowl' },
  ];
  const modifiers: ModifierDisplayItem[] = [
    { restaurant_code: 'TEST', modifier_name: 'Brown Rice', icon: '🌾' },
    { restaurant_code: 'TEST', modifier_name: 'Extra Spicy', icon: '🔥' },
    { restaurant_code: 'TEST', modifier_name: 'No Onion' },
    { restaurant_code: 'TEST', modifier_name: 'Hidden Mod', icon: '👻', show_on_kds: false },
  ];

  const makeItem = (name: string, mods?: { name: string; qty: number; price: number }[]): OrderLineItem => ({
    name,
    quantity: '1',
    totalMoney: 0,
    modifiers: mods,
  });

  it('returns item icon only when no modifier icons', () => {
    const item = makeItem('Spicy Poke', [{ name: 'No Onion', qty: 1, price: 0 }]);
    expect(collectLineItemIcons(item, menuItems, modifiers)).toEqual(['🌶️']);
  });

  it('returns modifier icon only when no item icon', () => {
    const item = makeItem('Plain Bowl', [{ name: 'Brown Rice', qty: 1, price: 0 }]);
    expect(collectLineItemIcons(item, menuItems, modifiers)).toEqual(['🌾']);
  });

  it('returns both item + modifier icons in order', () => {
    const item = makeItem('Spicy Poke', [
      { name: 'Brown Rice', qty: 1, price: 0 },
      { name: 'Extra Spicy', qty: 1, price: 0 },
    ]);
    expect(collectLineItemIcons(item, menuItems, modifiers)).toEqual(['🌶️', '🌾', '🔥']);
  });

  it('returns empty array when no icons configured', () => {
    const item = makeItem('Plain Bowl', [{ name: 'No Onion', qty: 1, price: 0 }]);
    expect(collectLineItemIcons(item, menuItems, modifiers)).toEqual([]);
  });

  it('excludes icons from showOnKds=false modifiers', () => {
    const item = makeItem('Plain Bowl', [{ name: 'Hidden Mod', qty: 1, price: 0 }]);
    expect(collectLineItemIcons(item, menuItems, modifiers)).toEqual([]);
  });

  it('returns empty array when no modifiers', () => {
    const item = makeItem('Plain Bowl');
    expect(collectLineItemIcons(item, menuItems, modifiers)).toEqual([]);
  });
});

describe('adaptColorForLight', () => {
  describe('fill mode (item pills)', () => {
    it('returns original colors in dark mode', () => {
      const result = adaptColorForLight('#1E3A5F', '#FFFFFF', 'dark');
      expect(result).toEqual({ bg: '#1E3A5F', text: '#FFFFFF' });
    });

    it('keeps original bg, picks white text for dark bg', () => {
      const result = adaptColorForLight('#1E3A5F', '#FFFFFF', 'light');
      expect(result.bg).toBe('#1E3A5F');
      expect(result.text).toBe('#FFFFFF');
    });

    it('picks dark text for light bg', () => {
      const result = adaptColorForLight('#FDE68A', '#111827', 'light');
      expect(result.text).toBe('#1A1A1A');
    });

    it('auto-picks white text when bg is dark enough', () => {
      const result = adaptColorForLight('#991B1B', '#AAAAAA', 'light');
      expect(result.text).toBe('#FFFFFF');
    });

    it('handles 3-char hex codes', () => {
      const result = adaptColorForLight('#F00', '#FFF', 'light');
      expect(result.text).toBe('#FFFFFF');
    });
  });

  describe('accent mode (modifier border+text on transparent bg)', () => {
    it('returns original color in dark mode', () => {
      const result = adaptColorForLight('#EF4444', '#EF4444', 'dark', 'accent');
      expect(result).toEqual({ bg: '#EF4444', text: '#EF4444' });
    });

    it('keeps dark colors as-is for border (no lightening)', () => {
      // A dark red used as modifier border/text
      const result = adaptColorForLight('#991B1B', '#991B1B', 'light', 'accent');
      // Should stay the same (already dark enough for white bg)
      expect(result.bg).toBe('#991B1B');
      expect(result.text).toBe('#991B1B');
    });

    it('keeps saturated colors distinguishable in light mode', () => {
      // Red, green, blue modifiers should remain distinct
      const red = adaptColorForLight('#EF4444', '#EF4444', 'light', 'accent');
      const green = adaptColorForLight('#22C55E', '#22C55E', 'light', 'accent');
      const blue = adaptColorForLight('#3B82F6', '#3B82F6', 'light', 'accent');

      // All should be different from each other
      expect(red.text).not.toBe(green.text);
      expect(red.text).not.toBe(blue.text);
      expect(green.text).not.toBe(blue.text);
    });

    it('darkens light colors for contrast against white bg', () => {
      // A light yellow that's hard to see on white
      const result = adaptColorForLight('#FDE047', '#FDE047', 'light', 'accent');
      // Should be darker than original
      const origG = parseInt('E0', 16);
      const newG = parseInt(result.text.slice(3, 5), 16);
      expect(newG).toBeLessThan(origG);
    });

    it('preserves already-dark accent colors in light mode', () => {
      // Dark red that's already visible on white
      const result = adaptColorForLight('#991B1B', '#991B1B', 'light', 'accent');
      // Should keep it as-is (already good contrast)
      expect(result.text).toBe('#991B1B');
    });
  });
});
