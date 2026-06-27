'use client';

import dynamic from 'next/dynamic';

// Below-fold sections lazy-loaded so gsap + their JS aren't blocking first
// paint. Hero is the LCP target — it stays in the initial bundle. Cost +
// FinalCTA + StickyApply only need to be on the wire by the time the user
// scrolls or the network is idle.
//
// Why this file exists: Next 16 disallows `next/dynamic` with `ssr: false`
// inside Server Components. By wrapping the dynamic imports in a tiny client
// component we get the code-split + skip-SSR behavior without forcing the
// whole page.tsx to become client-rendered (Hero stays SSR for fast LCP).
const CostOfDoingNothing = dynamic(
  () => import('./CostOfDoingNothing'),
  { ssr: false }
);
const FinalCTA = dynamic(() => import('./FinalCTA'), { ssr: false });
const StickyApplyButton = dynamic(
  () => import('./StickyApplyButton'),
  { ssr: false }
);

export default function BelowFold() {
  return (
    <>
      <CostOfDoingNothing />
      <FinalCTA />
      <StickyApplyButton />
    </>
  );
}
