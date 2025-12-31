/**
 * Unit Tests for QuickActionCards Component
 *
 * Tests the QuickActionCards component for proper rendering, prop validation,
 * and interaction handling. Verifies that cards display correctly and
 * maintain accessibility standards.
 *
 * @see /specs/001-phase2-homepage-ui/spec.md - Phase 4: T032
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickActionCards, QuickActionCardsProps } from '@/components/HomePage/QuickActionCards';
import { FileText, Calendar, Users } from 'lucide-react';

// Mock data for testing
const mockCards: QuickActionCardsProps['cards'] = [
  {
    id: 'test-1',
    icon: FileText,
    title: 'Test Card 1',
    description: 'This is a test card',
    link: '/test1'
  },
  {
    id: 'test-2',
    icon: Calendar,
    title: 'Test Card 2',
    description: 'This is another test card',
    link: '/test2'
  },
  {
    id: 'test-3',
    icon: Users,
    title: 'Test Card 3',
    description: 'This is the third test card',
    link: '/test3'
  }
];

describe('QuickActionCards Component', () => {
  const defaultProps: QuickActionCardsProps = {
    cards: mockCards
  };

  it('renders without crashing', () => {
    render(<QuickActionCards {...defaultProps} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('renders the correct number of cards', () => {
    render(<QuickActionCards {...defaultProps} />);
    const cards = screen.getAllByRole('listitem');
    expect(cards).toHaveLength(3);
  });

  it('displays card titles correctly', () => {
    render(<QuickActionCards {...defaultProps} />);
    mockCards.forEach(card => {
      expect(screen.getByText(card.title)).toBeInTheDocument();
    });
  });

  it('displays card descriptions correctly', () => {
    render(<QuickActionCards {...defaultProps} />);
    mockCards.forEach(card => {
      expect(screen.getByText(card.description)).toBeInTheDocument();
    });
  });

  it('renders icons for each card', () => {
    render(<QuickActionCards {...defaultProps} />);
    const icons = screen.getAllByRole('img', { hidden: true }); // Lucide icons have aria-hidden=true
    expect(icons).toHaveLength(3);
  });

  it('renders links with correct href attributes', () => {
    render(<QuickActionCards {...defaultProps} />);
    mockCards.forEach(card => {
      const link = screen.getByRole('link', { name: `${card.title}: ${card.description}` });
      expect(link).toHaveAttribute('href', card.link);
    });
  });

  it('applies the correct CSS classes for responsive grid', () => {
    render(<QuickActionCards {...defaultProps} />);
    const gridContainer = screen.getByRole('list');
    expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
  });

  it('applies custom className when provided', () => {
    const customClassName = 'custom-quick-actions';
    render(<QuickActionCards {...defaultProps} className={customClassName} />);
    expect(screen.getByRole('main').parentElement).toHaveClass(customClassName);
  });

  it('renders section with proper heading', () => {
    render(<QuickActionCards {...defaultProps} />);
    const heading = screen.getByRole('heading', {
      name: 'Quick Actions',
      level: 2
    });
    expect(heading).toBeInTheDocument();
  });

  it('has proper aria-label for the list container', () => {
    render(<QuickActionCards {...defaultProps} />);
    const listContainer = screen.getByRole('list');
    expect(listContainer).toHaveAttribute('aria-label', 'Quick action cards');
  });

  it('has proper aria-label for each list item', () => {
    render(<QuickActionCards {...defaultProps} />);
    mockCards.forEach(card => {
      const listItem = screen.getByRole('link', { name: `${card.title}: ${card.description}` });
      expect(listItem).toBeInTheDocument();
    });
  });

  it('handles external links with proper rel attribute', () => {
    const externalCards = [
      ...mockCards,
      {
        id: 'test-4',
        icon: FileText,
        title: 'External Link',
        description: 'This is an external link',
        link: 'https://example.com',
        target: '_blank' as const
      }
    ];

    render(<QuickActionCards cards={externalCards} />);
    const externalLink = screen.getByRole('link', { name: 'External Link: This is an external link' });
    expect(externalLink).toHaveAttribute('target', '_blank');
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders "Learn more" text on each card', () => {
    render(<QuickActionCards {...defaultProps} />);
    const learnMoreText = screen.getAllByText('Learn more');
    expect(learnMoreText).toHaveLength(3);
  });
});