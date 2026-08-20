import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImageSetupWizard from '@/app/images/setup/ImageSetupWizard';

// Mac / Apple Silicon hardware profile - getToolRecommendations() should
// recommend Mochi Diffusion first for this profile.
jest.mock('@/hooks/useHardwareDetection', () => ({
  __esModule: true,
  default: () => ({
    hardware: {
      os: 'mac',
      cores: 10,
      gpu: 'Apple M2',
      gpuType: 'apple',
      isAppleSilicon: true,
      estimatedVram: 12,
      isLoading: false,
    },
    imageRecommendations: {
      canRun: true,
      tier: 'high',
      tierDescription: 'Run most models at full quality with good speed',
      recommendedModels: ['Mochi Diffusion'],
      recommendedTool: 'mochi-diffusion',
      limitations: [],
    },
  }),
}));

describe('Image Setup Wizard', () => {
  it('renders with the correct title', () => {
    render(<ImageSetupWizard />);

    expect(screen.getByText('Set Up Private')).toBeInTheDocument();
    expect(screen.getByText('Image Creation')).toBeInTheDocument();
  });

  it('displays all four steps in the progress bar', () => {
    render(<ImageSetupWizard />);

    expect(screen.getByText('Choose Tool')).toBeInTheDocument();
    expect(screen.getByText('Install')).toBeInTheDocument();
    expect(screen.getByText('Choose Model')).toBeInTheDocument();
    expect(screen.getByText('Create!')).toBeInTheDocument();
  });

  it('starts on the tool selection step with a hardware check', () => {
    render(<ImageSetupWizard />);

    expect(screen.getByText('Can your computer create AI images?')).toBeInTheDocument();
  });

  it('has the top-recommended tool pre-selected for this hardware profile', () => {
    render(<ImageSetupWizard />);

    expect(screen.getByText('Mochi Diffusion')).toBeInTheDocument();
    expect(screen.getByText('Recommended')).toBeInTheDocument();
  });

  it('shows other tool options when expanded', () => {
    render(<ImageSetupWizard />);

    fireEvent.click(screen.getByText('See other options'));
    expect(screen.getByText('Other options:')).toBeInTheDocument();
  });

  it('can proceed to the install step', async () => {
    render(<ImageSetupWizard />);

    const continueButton = screen.getByRole('button', { name: /Use Mochi Diffusion/i });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText('Install Mochi Diffusion')).toBeInTheDocument();
    });
  });

  it('gates the install step on the confirmation checkbox', async () => {
    render(<ImageSetupWizard />);

    fireEvent.click(screen.getByRole('button', { name: /Use Mochi Diffusion/i }));

    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /Continue/i });
      expect(nextButton).toBeDisabled();
    });
  });

  it('shows the model download walkthrough after install is confirmed', async () => {
    render(<ImageSetupWizard />);

    fireEvent.click(screen.getByRole('button', { name: /Use Mochi Diffusion/i }));
    await waitFor(() => screen.getByText('Install Mochi Diffusion'));

    fireEvent.click(screen.getByText(/I've installed/));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByText('Download a Model')).toBeInTheDocument();
    });
  });
});
