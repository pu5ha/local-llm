import { render, screen } from '@testing-library/react';
import Navigation from '@/components/Navigation';
import Home from '@/app/page';
import WhyPage from '@/app/why/page';
import LearnPage from '@/app/learn/page';

// Mock useHardwareDetection for pages that use it
jest.mock('@/hooks/useHardwareDetection', () => ({
  __esModule: true,
  default: () => ({
    hardware: {
      os: 'mac',
      cores: 8,
      gpu: 'Apple M1',
      suggestedRam: 16,
      isLoading: false,
    },
    recommendations: {
      canRun4GB: true,
      canRun8GB: true,
      canRun16GB: true,
    },
  }),
}));

describe('No /computers links exist anywhere', () => {
  const checkNoComputersLinks = (component: React.ReactElement, componentName: string) => {
    render(component);

    const allLinks = screen.queryAllByRole('link');
    allLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        expect(href).not.toBe('/computers');
        expect(href).not.toContain('/computers');
      }
    });
  };

  it('Navigation has no /computers links', () => {
    checkNoComputersLinks(<Navigation />, 'Navigation');
  });

  it('Homepage has no /computers links', () => {
    checkNoComputersLinks(<Home />, 'Homepage');
  });

  it('Why page has no /computers links', () => {
    checkNoComputersLinks(<WhyPage />, 'Why Page');
  });

  it('Learn page has no /computers links', () => {
    checkNoComputersLinks(<LearnPage />, 'Learn Page');
  });

  it('All CTA buttons link to /setup', () => {
    render(<Home />);

    const ctaTexts = ['Get Started Free'];
    ctaTexts.forEach(text => {
      const buttons = screen.queryAllByText(text);
      buttons.forEach(button => {
        const link = button.closest('a');
        if (link) {
          expect(link.getAttribute('href')).toBe('/setup');
        }
      });
    });
  });
});

describe('Setup flow starts directly at /setup', () => {
  it('Navigation Start link goes to /setup', () => {
    render(<Navigation />);

    const startLinks = screen.getAllByText('Start');
    const navLink = startLinks[0].closest('a');

    expect(navLink).toHaveAttribute('href', '/setup');
  });

  it('Homepage CTA goes directly to /setup', () => {
    render(<Home />);

    const ctaButtons = screen.getAllByText('Get Started Free');
    const firstCta = ctaButtons[0].closest('a');

    expect(firstCta).toHaveAttribute('href', '/setup');
  });

  it('Why page CTA goes to /setup', () => {
    render(<WhyPage />);

    const cta = screen.getByText('Check My Computer');
    const link = cta.closest('a');

    expect(link).toHaveAttribute('href', '/setup');
  });

  it('Learn page CTA goes to /setup', () => {
    render(<LearnPage />);

    const cta = screen.getByText('Check My Computer');
    const link = cta.closest('a');

    expect(link).toHaveAttribute('href', '/setup');
  });
});
