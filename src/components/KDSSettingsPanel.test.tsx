import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock stores
const mockSetTheme = vi.fn();
let mockTheme = 'dark';

vi.mock('../stores/sessionStore', () => ({
  useSessionStore: (selector?: (s: any) => any) => {
    const state = {
      restaurantCode: 'midori',
      pin: '1234',
      theme: mockTheme,
      setTheme: mockSetTheme,
    };
    return selector ? selector(state) : state;
  },
}));

vi.mock('../stores/kdsStore', () => ({
  useKDSStore: (selector?: (s: any) => any) => {
    const state = {
      scheduledActivationMinutes: 10,
      setScheduledActivationMinutes: vi.fn(),
      autoStartOrders: false,
      setAutoStartOrders: vi.fn(),
      autoPrint: false,
      setAutoPrint: vi.fn(),
      soundEnabled: false,
      setSoundEnabled: vi.fn(),
      soundVolume: 80,
      setSoundVolume: vi.fn(),
      urgencyYellowMin: 5,
      setUrgencyYellowMin: vi.fn(),
      urgencyOrangeMin: 10,
      setUrgencyOrangeMin: vi.fn(),
      urgencyRedMin: 15,
      setUrgencyRedMin: vi.fn(),
    };
    return selector ? selector(state) : state;
  },
}));

vi.mock('../utils/sounds', () => ({
  playTestSound: vi.fn(),
}));

import KDSSettingsPanel from './KDSSettingsPanel';

describe('KDSSettingsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme = 'dark';
  });

  it('renders a theme toggle with "Theme" label', () => {
    render(<KDSSettingsPanel open={true} onClose={vi.fn()} />);
    expect(screen.getByText('Theme')).toBeInTheDocument();
  });

  it('shows "Light" when theme is dark (clicking will switch to light)', () => {
    mockTheme = 'dark';
    render(<KDSSettingsPanel open={true} onClose={vi.fn()} />);
    expect(screen.getByText(/dark mode/i)).toBeInTheDocument();
  });

  it('shows "Dark" when theme is light', () => {
    mockTheme = 'light';
    render(<KDSSettingsPanel open={true} onClose={vi.fn()} />);
    expect(screen.getByText(/light mode/i)).toBeInTheDocument();
  });

  it('calls setTheme when theme toggle is clicked', () => {
    mockTheme = 'dark';
    render(<KDSSettingsPanel open={true} onClose={vi.fn()} />);

    const themeToggle = screen.getByRole('switch', { name: /theme/i });
    fireEvent.click(themeToggle);

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('calls setTheme("dark") when switching from light', () => {
    mockTheme = 'light';
    render(<KDSSettingsPanel open={true} onClose={vi.fn()} />);

    const themeToggle = screen.getByRole('switch', { name: /theme/i });
    fireEvent.click(themeToggle);

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('Toggle unchecked state uses bg-muted (not bg-white/20)', () => {
    render(<KDSSettingsPanel open={true} onClose={vi.fn()} />);

    // Find all toggle switches
    const toggles = screen.getAllByRole('switch');
    // Each unchecked toggle should use bg-muted, not bg-white/20
    toggles.forEach((toggle) => {
      if (toggle.getAttribute('aria-checked') === 'false') {
        expect(toggle.className).toContain('bg-muted');
        expect(toggle.className).not.toContain('bg-white/20');
      }
    });
  });
});
