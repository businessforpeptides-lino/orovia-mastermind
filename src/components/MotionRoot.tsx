'use client';

import { MotionConfig } from 'framer-motion';

/**
 * Force entrance animations to run even when the OS / browser has
 * `prefers-reduced-motion: reduce` set. The page's entire content reveal
 * relies on opacity / transform animations — without them the page reads
 * as blank because elements stay at `initial={{ opacity: 0 }}`.
 *
 * Trade-off: this overrides the user's accessibility preference. Acceptable
 * for a marketing hero page; for content-heavy pages, prefer designing
 * around reduced motion instead of overriding it.
 */
export default function MotionRoot({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="never">{children}</MotionConfig>;
}
