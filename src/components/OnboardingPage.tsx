'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import PageBackground from './PageBackground';
import s from './OnboardingPage.module.css';

export default function OnboardingPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    requestAnimationFrame(() => el.classList.add(s.mounted));
  }, []);

  return (
    <div ref={rootRef} className={s.root}>
      <PageBackground showVials />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <header className={s.hero}>
        <div className={s.badge}>
          <span className={s.badgeDot} />
          OROVIA PROTOCOL
        </div>

        <h1 className={s.h1}>
          <span className={s.h1White}>Welcome to the</span>
          <span className={s.h1Gold}>Orovia Protocol.</span>
        </h1>

        <p className={s.heroSub}>
          You&apos;ve just made the best decision of your life.
        </p>

        <p className={s.heroBody}>
          Watch the video below to get started. Then fill out your onboarding
          form so we can build your game plan from day one.
        </p>
      </header>

      {/* ── VIDEO ────────────────────────────────────────────────── */}
      <section className={s.videoSection}>
        <div className={s.videoLabel}>
          <span className={s.videoStep}>Step 01</span>
          Watch This First
        </div>

        <div className={s.videoWrap}>
          <div className={s.videoEmbed}>
            <div className={s.videoPlaceholder}>
              <div className={s.videoPlayBtn}>
                <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
                  <path d="M1 1.5l20 11L1 24.5V1.5z" fill="#D4AF37" />
                </svg>
              </div>
              <p className={s.videoPlaceholderText}>Onboarding video coming soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FORM ─────────────────────────────────────────────────── */}
      <section className={s.formSection}>
        <div className={s.formLabel}>
          <span className={s.videoStep}>Step 02</span>
          Fill Out Your Onboarding Form
        </div>

        <p className={s.formIntro}>
          This form helps us understand your current situation so we can bring
          our best strategies to help you scale. Takes 3 to 5 minutes.
        </p>

        <div className={s.formWrap}>
          <div data-tf-live="01KR32WEA3RE6J0SKXG75CHNGK"></div>
        </div>
      </section>

      {/* Typeform embed script — loads after page is interactive */}
      <Script src="//embed.typeform.com/next/embed.js" strategy="afterInteractive" />
    </div>
  );
}
