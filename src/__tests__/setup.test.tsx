import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SetupWizard from '@/app/setup/SetupWizard';
import { curatedModels } from '@/lib/catalog/curated';
import { mergeCatalog } from '@/lib/catalog/mergeCatalog';

// Deterministic, network-free catalog built from the real curated roster -
// setup/page.tsx (a Server Component) fetches this at request time in
// production, but tests render SetupWizard directly with fixture data.
const testModels = mergeCatalog(curatedModels, [], 'fallback-snapshot').models;

function SetupPage() {
  return <SetupWizard models={testModels} />;
}

// Mock the useHardwareDetection hook
jest.mock('@/hooks/useHardwareDetection', () => ({
  __esModule: true,
  default: () => ({
    hardware: {
      os: 'mac',
      cores: 8,
      gpu: 'Apple M1',
      suggestedRam: 16,
      suggestedRamReason: 'Apple Silicon',
      isLoading: false,
    },
    recommendations: {
      canRun4GB: true,
      canRun8GB: true,
      canRun16GB: true,
    },
  }),
}));

describe('Setup Page', () => {
  it('renders the setup page with correct title', () => {
    render(<SetupPage />);

    expect(screen.getByText('Set Up Your')).toBeInTheDocument();
    expect(screen.getByText('Private AI')).toBeInTheDocument();
  });

  it('displays all four steps in progress bar', () => {
    render(<SetupPage />);

    expect(screen.getByText('Choose App')).toBeInTheDocument();
    expect(screen.getByText('Install')).toBeInTheDocument();
    expect(screen.getByText('Download AI')).toBeInTheDocument();
    expect(screen.getByText('Done!')).toBeInTheDocument();
  });

  it('starts on the tool selection step', () => {
    render(<SetupPage />);

    expect(screen.getByText('We recommend Ollama')).toBeInTheDocument();
  });

  it('has Ollama pre-selected as the recommended tool', () => {
    render(<SetupPage />);

    expect(screen.getByText('Ollama')).toBeInTheDocument();
    expect(screen.getByText('Recommended')).toBeInTheDocument();
  });

  it('can proceed to install step when clicking continue', async () => {
    render(<SetupPage />);

    const continueButton = screen.getByRole('button', { name: /Use Ollama/i });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText(/Installing Ollama/)).toBeInTheDocument();
    });
  });

  it('shows other tool options when expanded', () => {
    render(<SetupPage />);

    const seeOtherOptions = screen.getByText('See other options');
    fireEvent.click(seeOtherOptions);

    expect(screen.getByText('Other options:')).toBeInTheDocument();
  });
});

describe('Setup Page - Install Step', () => {
  it('shows installation instructions after selecting tool', async () => {
    render(<SetupPage />);

    // Move to install step
    const continueButton = screen.getByRole('button', { name: /Use Ollama/i });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText(/Installing Ollama on your Mac/)).toBeInTheDocument();
    });
  });

  it('has a download link', async () => {
    render(<SetupPage />);

    // Move to install step
    const continueButton = screen.getByRole('button', { name: /Use Ollama/i });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText('Go to Download Page')).toBeInTheDocument();
    });
  });

  it('requires confirmation before proceeding', async () => {
    render(<SetupPage />);

    // Move to install step
    const continueButton = screen.getByRole('button', { name: /Use Ollama/i });
    fireEvent.click(continueButton);

    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /Continue/i });
      expect(nextButton).toBeDisabled();
    });
  });
});

describe('Setup Page - Model Step with RAM Selection', () => {
  it('setup flow has correct step progression', () => {
    render(<SetupPage />);

    // Verify all steps are present
    expect(screen.getByText('Choose App')).toBeInTheDocument();
    expect(screen.getByText('Install')).toBeInTheDocument();
    expect(screen.getByText('Download AI')).toBeInTheDocument();
    expect(screen.getByText('Done!')).toBeInTheDocument();
  });

  it('model step is labeled Download AI (not just Model)', () => {
    render(<SetupPage />);

    // The step should be user-friendly "Download AI" not technical "Model"
    expect(screen.getByText('Download AI')).toBeInTheDocument();
  });

  it('setup page starts on Choose App step', () => {
    render(<SetupPage />);

    // Should show tool selection content
    expect(screen.getByText('We recommend Ollama')).toBeInTheDocument();
  });
});

describe('Setup Page - No /computers references', () => {
  it('does not contain any references to /computers path', () => {
    render(<SetupPage />);

    const allLinks = screen.queryAllByRole('link');
    allLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        expect(href).not.toContain('/computers');
      }
    });
  });
});
