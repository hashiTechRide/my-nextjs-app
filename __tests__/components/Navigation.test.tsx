import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Navigation from '../../app/components/Navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

import { usePathname } from 'next/navigation';

describe('Navigation', () => {
  it('should render all navigation links', () => {
    vi.mocked(usePathname).mockReturnValue('/');

    render(<Navigation />);

    expect(screen.getByText('ダイエットアプリ')).toBeInTheDocument();
    expect(screen.getByText('ホーム')).toBeInTheDocument();
    expect(screen.getByText('食事管理')).toBeInTheDocument();
    expect(screen.getByText('運動管理')).toBeInTheDocument();
    expect(screen.getByText('統計')).toBeInTheDocument();
  });

  it('should highlight home link when on home page', () => {
    vi.mocked(usePathname).mockReturnValue('/');

    render(<Navigation />);

    const homeLink = screen.getByText('ホーム').closest('a');
    expect(homeLink).toHaveClass('bg-blue-700');
  });

  it('should highlight meals link when on meals page', () => {
    vi.mocked(usePathname).mockReturnValue('/meals');

    render(<Navigation />);

    const mealsLink = screen.getByText('食事管理').closest('a');
    expect(mealsLink).toHaveClass('bg-blue-700');

    const homeLink = screen.getByText('ホーム').closest('a');
    expect(homeLink).not.toHaveClass('bg-blue-700');
  });

  it('should highlight exercises link when on exercises page', () => {
    vi.mocked(usePathname).mockReturnValue('/exercises');

    render(<Navigation />);

    const exercisesLink = screen.getByText('運動管理').closest('a');
    expect(exercisesLink).toHaveClass('bg-blue-700');
  });

  it('should highlight stats link when on stats page', () => {
    vi.mocked(usePathname).mockReturnValue('/stats');

    render(<Navigation />);

    const statsLink = screen.getByText('統計').closest('a');
    expect(statsLink).toHaveClass('bg-blue-700');
  });

  it('should have correct href attributes', () => {
    vi.mocked(usePathname).mockReturnValue('/');

    render(<Navigation />);

    expect(screen.getByText('ホーム').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('食事管理').closest('a')).toHaveAttribute('href', '/meals');
    expect(screen.getByText('運動管理').closest('a')).toHaveAttribute('href', '/exercises');
    expect(screen.getByText('統計').closest('a')).toHaveAttribute('href', '/stats');
  });
});
