// =============================================================================
// FONT SYSTEM — Inter Tight only (one family, just the weights we actually use)
// -----------------------------------------------------------------------------
// We previously loaded 8 Google Font families x multiple weights = ~30+ font
// files. The site only ever uses Inter Tight (display + body, mostly weight
// 900 with select 500/600/700 for eyebrows/body). Slimming the font payload
// drops ~25 font requests off the critical path, which is the biggest single
// LCP win we can ship without changing the design.
// =============================================================================

import { Inter_Tight } from 'next/font/google';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['500', '600', '700', '900'],
  variable: '--font-inter-tight',
  display: 'swap',
});

// All previous exports map to Inter Tight so existing layout.tsx imports keep
// working without a refactor — globals.css already uses --font-inter-tight
// everywhere, and fontFamily inline styles all reference it explicitly.
export const helveticaNowDisplay = interTight;
export const helveticaNowText = interTight;
export const citadelScript = interTight;
export const wordmarkFont = interTight;
export const monoFont = interTight;
export const dmSerifDisplay = interTight;
export const interTightFont = interTight;
export const cormorantFont = interTight;
