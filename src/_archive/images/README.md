# Archived Image Generation Code

This folder contains the archived image generation feature code that was too complex for the initial launch.

## Files

- `setup-page.tsx` - The full multi-step setup wizard for image generation
- `overview-page.tsx` - The images overview/landing page
- `imageTools.ts` - Data file containing all image generation tools (Mochi Diffusion, Draw Things, Fooocus, ComfyUI, etc.)
- `imageModels.ts` - Data file containing image models (SDXL, FLUX, SD 1.5, etc.) with VRAM requirements

## To Restore

1. Copy `setup-page.tsx` back to `/src/app/images/setup/page.tsx`
2. Copy `overview-page.tsx` to `/src/app/images/page.tsx` (or modify the existing coming soon page)
3. Copy `imageTools.ts` and `imageModels.ts` to `/src/data/`
4. Update the navigation and use cases to include images again

## Features This Code Supported

- Hardware detection for GPU/VRAM
- Mac-native app recommendations (Mochi Diffusion, Draw Things, DiffusionBee)
- Cross-platform tools (Fooocus, ComfyUI, Forge, etc.)
- Step-by-step installation guides
- Model recommendations based on VRAM
- Example prompts and tips for image generation
