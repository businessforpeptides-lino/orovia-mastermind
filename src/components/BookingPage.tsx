'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PageBackground from './PageBackground';
import s from './BookingPage.module.css';

const CALENDLY_URL = 'https://calendly.com/d/ct4v-cq3-cn7/discovery-call';

export default function BookingPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', immediateRender: false } });
      tl.from('[data-badge]', { y: -28, opacity: 0, scale: 0.86, duration: 0.7 })
        .from('[data-h1] .word', { y: 44, opacity: 0, duration: 0.65, stagger: 0.1 }, '-=0.35')
        .from('[data-sub]',     { y: 18,  opacity: 0, duration: 0.55 }, '-=0.3')
        .from('[data-cal]',     { y: 56,  opacity: 0, scale: 0.97, duration: 0.85, ease: 'power2.out' }, '-=0.2');

    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className={s.root}>
      <PageBackground />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <header className={s.hero}>
        <div data-badge className={s.badge}>
          <span className={s.badgeDot} />
          You've Been Pre-Qualified
        </div>

        <h1 data-h1 className={s.h1}>
          <span className={`block word ${s.wordCream}`}>Book Your</span>
          <span className={`block word ${s.wordGold}`}>Strategy Call</span>
        </h1>

        <p data-sub className={s.sub}>
          One conversation away from a compliant,<br />
          revenue-generating peptide company.
        </p>
      </header>

      {/* ── Calendly ─────────────────────────────────────────────────────── */}
      <section className={s.calSection}>
        <p className={s.calLabel}>↓ Select a time that works for you</p>
        <div data-cal className={s.calWrapper}>
          <div
            className="calendly-inline-widget"
            data-url={CALENDLY_URL}
            style={{ minWidth: 320, height: 700 }}
          />
        </div>
        <Script
          src="https://assets.calendly.com/assets/external/widget.js"
          strategy="afterInteractive"
        />
      </section>

    </div>
  );
}
