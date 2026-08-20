import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Homepage', () => {
  it('renders the main headline', () => {
    render(<Home />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/Your AI conversations,\s*seen by no one\./i);
  });

  it('has CTA buttons linking to /setup (not /computers)', () => {
    render(<Home />);

    const ctaButtons = screen.getAllByText('Show Me How');
    expect(ctaButtons.length).toBeGreaterThan(0);
    ctaButtons.forEach(button => {
      const link = button.closest('a');
      expect(link).toHaveAttribute('href', '/setup');
      expect(link).not.toHaveAttribute('href', '/computers');
    });
  });

  it('does not contain any links to /computers', () => {
    render(<Home />);

    const allLinks = screen.getAllByRole('link');
    allLinks.forEach(link => {
      const href = link.getAttribute('href');
      expect(href).not.toBe('/computers');
      expect(href).not.toContain('/computers');
    });
  });

  it('does not display fake social proof numbers', () => {
    render(<Home />);

    // Should NOT have the fake "2,500+ people" stat
    expect(screen.queryByText(/2,500\+/)).not.toBeInTheDocument();
    expect(screen.queryByText(/people have made the switch/)).not.toBeInTheDocument();
  });

  it('displays truthful value propositions', () => {
    render(<Home />);

    expect(screen.getByText('Not a company')).toBeInTheDocument();
    expect(screen.getAllByText(/just a setup guide/).length).toBeGreaterThan(0);
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText(/open source tools/)).toBeInTheDocument();
    expect(screen.getByText('Zero')).toBeInTheDocument();
    expect(screen.getByText(/data leaves your computer/)).toBeInTheDocument();
  });

  it('renders the How It Works section with correct steps', () => {
    render(<Home />);

    expect(screen.getByText('Choose your app')).toBeInTheDocument();
    expect(screen.getByText('Install it')).toBeInTheDocument();
    expect(screen.getByText('Download an AI model')).toBeInTheDocument();
    expect(screen.getByText('Start chatting')).toBeInTheDocument();
  });

  it('has a link to the Learn page', () => {
    render(<Home />);

    const learnLink = screen.getByText(/Want to understand more/);
    expect(learnLink.closest('a')).toHaveAttribute('href', '/learn');
  });
});
