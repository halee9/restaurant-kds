import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBar from './StatusBar';

describe('StatusBar', () => {
  const defaultProps = {
    connected: true,
    restaurantName: 'Test Restaurant',
    activeTab: 'active' as const,
    onTabChange: vi.fn(),
    counts: { active: 3, scheduled: 1, readyDone: 2, cancelled: 0 },
    viewMode: 'list' as const,
    onViewModeChange: vi.fn(),
    onSettings: vi.fn(),
  };

  it('uses dark: variant for connected status text color', () => {
    render(<StatusBar {...defaultProps} connected={true} />);
    const liveText = screen.getByText('Test Restaurant');
    expect(liveText.className).toContain('text-green-700');
    expect(liveText.className).toContain('dark:text-green-400');
  });

  it('uses dark: variant for offline status text color', () => {
    render(<StatusBar {...defaultProps} connected={false} />);
    const offlineText = screen.getByText('Offline');
    expect(offlineText.className).toContain('text-red-700');
    expect(offlineText.className).toContain('dark:text-red-400');
  });

  it('scheduled badge uses dark: variant for text color', () => {
    render(<StatusBar {...defaultProps} counts={{ ...defaultProps.counts, scheduled: 5 }} />);
    const badge = screen.getByText('5');
    expect(badge.className).toContain('text-purple-700');
    expect(badge.className).toContain('dark:text-purple-400');
  });

  it('ready-done badge uses dark: variant for text color', () => {
    render(<StatusBar {...defaultProps} activeTab="ready-done" counts={{ ...defaultProps.counts, readyDone: 4 }} />);
    const badge = screen.getByText('4');
    expect(badge.className).toContain('text-emerald-700');
    expect(badge.className).toContain('dark:text-emerald-400');
  });
});
