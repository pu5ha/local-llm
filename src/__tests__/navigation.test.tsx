import { render, screen } from '@testing-library/react';
import Navigation from '@/components/Navigation';

describe('Navigation', () => {
  it('renders all navigation links', () => {
    render(<Navigation />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Why Private AI?')).toBeInTheDocument();
    expect(screen.getByText('Learn')).toBeInTheDocument();
    expect(screen.getByText('Images')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
    expect(screen.getByText('News')).toBeInTheDocument();
  });

  it('has correct href for Start link (should be /setup, not /computers)', () => {
    render(<Navigation />);

    const startLinks = screen.getAllByText('Start');
    // Get the nav link (not the CTA button)
    const navStartLink = startLinks[0].closest('a');

    expect(navStartLink).toHaveAttribute('href', '/setup');
  });

  it('does not link to /computers anywhere', () => {
    render(<Navigation />);

    const allLinks = screen.getAllByRole('link');
    allLinks.forEach(link => {
      expect(link).not.toHaveAttribute('href', '/computers');
      expect(link.getAttribute('href')).not.toContain('/computers');
    });
  });

  it('renders the CTA button linking to /setup', () => {
    render(<Navigation />);

    const ctaButton = screen.getByText('Start Your Private AI');
    const ctaLink = ctaButton.closest('a');

    expect(ctaLink).toHaveAttribute('href', '/setup');
  });

  it('renders the PrivateAI logo/brand', () => {
    render(<Navigation />);

    expect(screen.getByText('Private')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
  });
});
