import { defineConfig } from '@vite-pwa/assets-generator/config';

// Bird-only, transparent-background artwork (public/icon-source.svg) is the canonical
// icon now, following Apple's App Icon guidelines (full-bleed subject, no baked-in
// background/shape — the system supplies its own mask + "Liquid Glass" backdrop on
// iOS 26+, Android applies its own adaptive-icon shape). The `maskable`/`apple` variants
// below are the two exceptions that must stay opaque: both get hard-cropped to a shape
// by their OS, so a transparent background there would show through as a hole rather
// than letting the system's own glass material show through (that compositing only
// exists for native Icon Composer-built app icons, not a plain web `apple-touch-icon`).
export default defineConfig({
  images: 'public/icon-source.svg',
  preset: {
    transparent: {
      sizes: [64, 192, 512],
      favicons: [[64, 'favicon.ico']],
    },
    maskable: {
      sizes: [512],
      resizeOptions: { fit: 'contain', background: '#010818' },
    },
    apple: {
      sizes: [180],
      resizeOptions: { fit: 'contain', background: '#010818' },
    },
  },
});
