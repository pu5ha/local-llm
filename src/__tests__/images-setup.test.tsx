import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImageSetupWizard from '@/app/images/setup/ImageSetupWizard';
import type { HardwareInfo, ImageRecommendation } from '@/hooks/useHardwareDetection';

// Mac / Apple Silicon hardware profile - getToolRecommendations() should
// recommend Draw Things first for this profile (widest model support, in-app
// downloads); Mochi Diffusion is the Core ML-only alternative.
const defaultHardwareMock = (): { hardware: HardwareInfo; imageRecommendations: ImageRecommendation } => ({
  hardware: {
    os: 'mac',
    osVersion: '',
    ram: null,
    gpu: 'Apple M2',
    cores: 10,
    isLoading: false,
    error: null,
    ramDetectionMethod: 'manual',
    isRamSuspicious: false,
    suggestedRam: null,
    suggestedRamReason: null,
    isAppleSilicon: true,
    gpuType: 'apple',
    estimatedVram: 12,
    canRunImageGeneration: true,
    imageGenerationTier: 'high',
  },
  imageRecommendations: {
    canRun: true,
    tier: 'high',
    tierDescription: 'Run most models at full quality with good speed',
    recommendedModels: ['FLUX.2 Klein 4B', 'FLUX.1 Schnell', 'FLUX.1 Dev', 'SD 3.5 Medium', 'Qwen Image', 'SDXL'],
    recommendedTool: 'draw-things',
    limitations: [],
  },
});
const mockUseHardwareDetection = jest.fn(defaultHardwareMock);

jest.mock('@/hooks/useHardwareDetection', () => ({
  __esModule: true,
  default: () => mockUseHardwareDetection(),
}));

describe('Image Setup Wizard', () => {
  afterEach(() => {
    mockUseHardwareDetection.mockImplementation(defaultHardwareMock);
  });


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

    expect(screen.getByText('Draw Things')).toBeInTheDocument();
    expect(screen.getByText('Recommended')).toBeInTheDocument();
  });

  it('shows other tool options when expanded', () => {
    render(<ImageSetupWizard />);

    fireEvent.click(screen.getByText('See other options'));
    expect(screen.getByText('Other options:')).toBeInTheDocument();
  });

  it('can proceed to the install step', async () => {
    render(<ImageSetupWizard />);

    const continueButton = screen.getByRole('button', { name: /Use Draw Things/i });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText('Install Draw Things')).toBeInTheDocument();
    });
  });

  it('gates the install step on the confirmation checkbox', async () => {
    render(<ImageSetupWizard />);

    fireEvent.click(screen.getByRole('button', { name: /Use Draw Things/i }));

    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /Continue/i });
      expect(nextButton).toBeDisabled();
    });
  });

  it('shows the tier-based model list after install is confirmed', async () => {
    render(<ImageSetupWizard />);

    fireEvent.click(screen.getByRole('button', { name: /Use Draw Things/i }));
    await waitFor(() => screen.getByText('Install Draw Things'));

    fireEvent.click(screen.getByText(/I've installed/));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByText('Choose Your AI Model')).toBeInTheDocument();
    });
  });

  it('shows the manual Core ML download walkthrough for Mochi Diffusion', async () => {
    render(<ImageSetupWizard />);

    fireEvent.click(screen.getByText('See other options'));
    fireEvent.click(screen.getByText('Mochi Diffusion'));
    fireEvent.click(screen.getByRole('button', { name: /Use Mochi Diffusion/i }));
    await waitFor(() => screen.getByText('Install Mochi Diffusion'));

    fireEvent.click(screen.getByText(/I've installed/));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByText('Download a Model')).toBeInTheDocument();
      expect(screen.getByText(/Open SDXL model page/)).toBeInTheDocument();
    });
  });

  it('recommends an always-available Draw Things model, not a Community-only one, when hardware is undetected', async () => {
    mockUseHardwareDetection.mockReturnValue({
      hardware: {
        os: 'mac',
        osVersion: '',
        ram: null,
        gpu: null,
        cores: 10,
        isLoading: false,
        error: null,
        ramDetectionMethod: 'manual',
        isRamSuspicious: false,
        suggestedRam: null,
        suggestedRamReason: null,
        isAppleSilicon: true,
        gpuType: 'apple',
        estimatedVram: null,
        canRunImageGeneration: false,
        imageGenerationTier: 'none',
      },
      imageRecommendations: {
        canRun: false,
        tier: 'none',
        tierDescription: 'Unable to determine GPU capability',
        recommendedModels: [],
        recommendedTool: 'draw-things',
        limitations: [],
      },
    });

    render(<ImageSetupWizard />);

    fireEvent.click(screen.getByRole('button', { name: /Use Draw Things/i }));
    await waitFor(() => screen.getByText('Install Draw Things'));

    fireEvent.click(screen.getByText(/I've installed/));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByText('Choose Your AI Model')).toBeInTheDocument();
    });

    // Stable Diffusion 3.5 Medium is a Draw Things "Community" model, not one
    // bundled in the app's Official Models - it should never be the default
    // recommendation, since it may not appear in the app's model picker at all.
    expect(screen.queryByText('Stable Diffusion 3.5 Medium')).not.toBeInTheDocument();
    // FLUX.2 Klein 4B is preferred over FLUX.1 Schnell based on real-world
    // quality testing - confirmed noticeably better anatomy/coherence.
    expect(screen.getByText('FLUX.2 Klein 4B')).toBeInTheDocument();
    expect(screen.getByText('Recommended')).toBeInTheDocument();
  });
});
