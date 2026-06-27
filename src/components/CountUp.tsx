'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

interface Props {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  format?: 'currency' | 'integer' | 'days';
  className?: string;
  style?: React.CSSProperties;
  /**
   * Optional gate. When provided, the count-up waits until `start` first
   * becomes true before firing. Once it has fired, it never resets — even if
   * `start` toggles back to false (e.g. scrolling back into and out of the
   * triggering scroll position).
   *
   * Use this for elements that live behind a scroll-driven flip / pin so they
   * count up exactly once when the user reaches them, instead of restarting
   * each time the parent visibility flag flickers.
   */
  start?: boolean;
}

// Standard easeOutExpo with the t === 1 snap so the curve lands exactly on
// the target value (otherwise easeOutExpo(1) ≈ 0.999 and the count-up rounds
// short of the target — e.g. $19,980 instead of $20,000).
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

function formatValue(value: number, format: Props['format'], prefix = '', suffix = '') {
  let body = '';
  if (format === 'currency') {
    body = '$' + Math.round(value).toLocaleString('en-US');
  } else if (format === 'days') {
    body = Math.round(value) + ' days';
  } else {
    body = Math.round(value).toLocaleString('en-US');
  }
  return prefix + body + suffix;
}

/**
 * Count-up that fires when scrolled into view (or when an external `start`
 * gate first goes true). Uses requestAnimationFrame so digits update at 60fps
 * without re-rendering the whole React tree. Lands exactly on `to` and stays
 * there — no restart on subsequent scroll movements.
 */
export default function CountUp({
  to,
  duration = 1.6,
  prefix = '',
  suffix = '',
  format = 'integer',
  className,
  style,
  start,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [value, setValue] = useState(0);
  const hasFiredRef = useRef(false);

  // Fire the count-up exactly once. The gate is `start` if supplied,
  // otherwise the element coming into view.
  const trigger = start === undefined ? inView : start;

  useEffect(() => {
    if (!trigger || hasFiredRef.current) return;
    hasFiredRef.current = true;

    let raf = 0;
    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / (duration * 1000));
      setValue(t >= 1 ? to : easeOutExpo(t) * to);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [trigger, to, duration]);

  return (
    <span ref={ref} className={className} style={style}>
      {formatValue(value, format, prefix, suffix)}
    </span>
  );
}
