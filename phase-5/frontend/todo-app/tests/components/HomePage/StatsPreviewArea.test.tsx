/**
 * StatsPreviewArea Component Tests
 *
 * Unit tests for StatsPreviewArea component using React Testing Library.
 * Tests cover rendering, props handling, loading states, and accessibility.
 *
 * @see /specs/001-phase2-homepage-ui/spec.md - Phase 6: T053
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatsPreviewArea, StatsPreviewAreaProps } from '@/components/HomePage/StatsPreviewArea';
import { StatPlaceholder } from '@/types';

// Mock data for testing
const mockStats: StatPlaceholder[] = [
  {
    id: 'stats-1',
    label: 'System Performance',
    description: 'Real-time performance metrics',
    chartType: 'line'
  },
  {
    id: 'stats-2',
    label: 'User Activity',
    description: 'Active users and engagement',
    chartType: 'area'
  },
  {
    id: 'stats-3',
    label: 'Resource Usage',
    description: 'CPU, memory, and storage utilization',
    chartType: 'bar'
  }
];

describe('StatsPreviewArea', () => {
  const defaultProps: StatsPreviewAreaProps = {
    stats: mockStats,
    isLoading: false,
    className: ''
  };

  it('renders without crashing', () => {
    render(<StatsPreviewArea {...defaultProps} />);
    expect(screen.getByRole('region', { name: /statistics preview containers/i })).toBeInTheDocument();
  });

  it('displays the correct heading', () => {
    render(<StatsPreviewArea {...defaultProps} />);
    expect(screen.getByRole('heading', { name: /System Analytics/i })).toBeInTheDocument();
  });

  it('renders the correct number of stat cards', () => {
    render(<StatsPreviewArea {...defaultProps} />);
    const statCards = screen.getAllByRole('listitem');
    expect(statCards).toHaveLength(mockStats.length);
  });

  it('displays stat card labels and descriptions', () => {
    render(<StatsPreviewArea {...defaultProps} />);

    mockStats.forEach(stat => {
      expect(screen.getByText(stat.label)).toBeInTheDocument();
      expect(screen.getByText(stat.description)).toBeInTheDocument();
    });
  });

  it('shows chart placeholders when not loading', () => {
    render(<StatsPreviewArea {...defaultProps} />);

    mockStats.forEach(stat => {
      expect(screen.getByText('Chart placeholder')).toBeInTheDocument();
      expect(screen.getByText(new RegExp(stat.chartType || 'Chart Visualizer', 'i'))).toBeInTheDocument();
    });
  });

  it('shows skeleton loaders when loading is true', () => {
    render(<StatsPreviewArea {...defaultProps} isLoading={true} />);

    const skeletonElements = screen.getAllByRole('status');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-stats-class';
    render(<StatsPreviewArea {...defaultProps} className={customClass} />);

    const sectionElement = screen.getByRole('region', { name: /statistics preview containers/i });
    expect(sectionElement).toHaveClass(customClass);
  });

  it('renders placeholder hint for Chart Visualizer integration', () => {
    render(<StatsPreviewArea {...defaultProps} />);

    const hints = screen.getAllByText(/Ready for Chart Visualizer Sub-Agent integration/i);
    expect(hints).toHaveLength(mockStats.length);
  });

  it('renders chart type information in placeholders', () => {
    render(<StatsPreviewArea {...defaultProps} />);

    mockStats.forEach(stat => {
      if (stat.chartType) {
        expect(screen.getByText(new RegExp(`Type: ${stat.chartType}`, 'i'))).toBeInTheDocument();
      }
    });
  });

  it('displays default content when no stats are provided', () => {
    render(<StatsPreviewArea {...defaultProps} stats={undefined} />);

    // Should still render with default stats
    expect(screen.getByRole('region', { name: /statistics preview containers/i })).toBeInTheDocument();
  });
});