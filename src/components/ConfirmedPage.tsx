"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PageBackground from "./PageBackground";
import s from "./ConfirmedPage.module.css";

const FAQ_ITEMS = [
  {
    q: "What should I do to prepare for the call?",
    a: "Watch the video above in full before the call. Know your current monthly revenue and what you are doing now to generate it. The call moves fast. Come ready, not curious.",
  },
  {
    q: "What if I miss my call or need to reschedule?",
    a: "Reply YES to our text immediately to confirm your slot. If you need to reschedule, contact us at least 24 hours in advance. Same-day cancellations without notice forfeit the spot.",
  },
  {
    q: "How is this different from other programs?",
    a: "We build the infrastructure for you. Most programs hand you a course and a Discord. We give you a live brand, real COAs, a compliant processor, and a system that has already generated revenue for other affiliates.",
  },
];

const CHECKPOINTS = [
  {
    label: "Check email",
    body: "Calendar invite is on the way. Save the link immediately.",
  },
  {
    label: "Reply to our text",
    body: "Team will text to confirm. Reply YES right away. Slots expire.",
  },
  {
    label: "Watch the video above",
    body: "Required. Come ready, not curious.",
  },
  {
    label: "Show up ready",
    body: "Know your monthly revenue goal. Be ready to move when we give you the green light.",
  },
];

/* 5 discord screenshot placeholders — each has a unique accent for variety */
const DISCORD_CARDS = [
  { label: "@lino_peptides", accent: "201, 169, 97" },
  { label: "@heroes_discord", accent: "88, 101, 242" },
  { label: "@abdullah_scales", accent: "201, 169, 97" },
  { label: "@jordan_ecom", accent: "88, 101, 242" },
  { label: "@marcus_info", accent: "201, 169, 97" },
];

export default function ConfirmedPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // ── Hero entrance ──────────────────────────────────────────────────────
      const heroTl = gsap.timeline({
        defaults: { ease: "power3.out", immediateRender: false },
      });
      heroTl
        .from("[data-badge]", {
          y: -28,
          opacity: 0,
          scale: 0.86,
          duration: 0.7,
        })
        .from(
          "[data-h1-line]",
          { y: 60, opacity: 0, duration: 0.7, stagger: 0.12 },
          "-=0.2",
        )
        .from("[data-hero-sub]", { y: 20, opacity: 0, duration: 0.6 }, "-=0.25")
        .from(
          "[data-hero-chips] > *",
          { y: 16, opacity: 0, duration: 0.45, stagger: 0.1 },
          "-=0.3",
        );

      // ── Video section ──────────────────────────────────────────────────────
      gsap.from("[data-video-wrap]", {
        y: 50,
        opacity: 0,
        scale: 0.96,
        duration: 0.8,
        ease: "power2.out",
        immediateRender: false,
        scrollTrigger: { trigger: "[data-video-wrap]", start: "top 82%" },
      });

      // ── Alert ──────────────────────────────────────────────────────────────
      gsap.from("[data-alert]", {
        y: 28,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        immediateRender: false,
        scrollTrigger: { trigger: "[data-alert]", start: "top 84%" },
      });

      // ── Confirm section ────────────────────────────────────────────────────
      gsap.from("[data-confirm]", {
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        immediateRender: false,
        scrollTrigger: { trigger: "[data-confirm]", start: "top 84%" },
      });

      // ── FAQ tiles — fly in from alternating sides ──────────────────────────
      gsap.from("[data-faq]", {
        opacity: 0,
        scale: 0.94,
        duration: 0.65,
        x: (i: number) => (i % 2 === 0 ? -65 : 65),
        stagger: 0.1,
        ease: "power2.out",
        immediateRender: false,
        scrollTrigger: { trigger: "[data-faq-grid]", start: "top 82%" },
      });

      // ── Checkpoints ────────────────────────────────────────────────────────
      gsap.from("[data-checkpoint]", {
        x: -50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: "power2.out",
        immediateRender: false,
        scrollTrigger: { trigger: "[data-checkpoints]", start: "top 84%" },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className={s.root}>
      <PageBackground />

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 1 — Hero
      ───────────────────────────────────────────────────────────────────── */}
      <header className={s.hero}>
        <div data-badge className={s.warnBadge}>
          <span className={s.warnDot} />
          <span className={s.warnTag}>CALL</span>
          BOOKED
        </div>

        <div className={s.h1Wrap}>
          <span data-h1-line className={`${s.h1Line} ${s.h1LineWhite}`}>
            You&apos;re
          </span>
          <span data-h1-line className={`${s.h1Line} ${s.h1LineRed}`}>
            Not In Yet.
          </span>
        </div>

        <p data-hero-sub className={s.heroSub}>
          There&apos;s still a couple of things you need to do before you leave.
        </p>

        <div data-hero-chips className={s.heroChips}>
          <div className={s.chip}>
            <span className={s.chipLabel}>Email</span>
            <span className={s.chipValue}>Check your inbox</span>
          </div>
          <span className={s.chipDivider} />
          <div className={s.chip}>
            <span className={s.chipLabel}>Text</span>
            <span className={s.chipValue}>Reply YES immediately</span>
          </div>
          <span className={s.chipDivider} />
          <div className={s.chip}>
            <span className={s.chipLabel}>Video</span>
            <span className={s.chipValue}>Watch before the call</span>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 2 — Required Video
      ───────────────────────────────────────────────────────────────────── */}
      <section className={s.videoSection}>
        <div className={s.videoLabel}>
          <span className={s.videoRequired}>* Required</span>
          Watch This Before Your Call
        </div>

        <div data-video-wrap className={s.videoWrap}>
          <div className={s.videoFrame}>
            <iframe
              src="https://www.youtube.com/embed/QaxjUU3o-Z4"
              title="28 June 2026"
              style={{ width: "100%", height: "100%", border: "none" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </section>
      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 4 — Alert
      ───────────────────────────────────────────────────────────────────── */}
      <section className={s.alertSection}>
        <div data-alert className={s.alertCard}>
          <div className={s.alertInner}>
            <div className={s.alertGlow} />
            <p className={s.alertLine1}>
              Our team will reach out soon.{" "}
              <strong className={s.alertStrong}>Please reply.</strong>
            </p>
            <p className={s.alertLine2}>
              If we don&apos;t hear from you we will assume you won&apos;t show
              up and cancel your call.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 5 — Confirm Your Call
      ───────────────────────────────────────────────────────────────────── */}
      <section className={s.confirmSection}>
        <div className={s.sectionHeader}>
          <h2 className={s.sectionH2}>
            Confirm Your <span className={s.gold}>Call</span>
          </h2>
        </div>
        {/* Gmail calendar invite mockup */}
        <div data-confirm className={s.calMockup}>
          <p className={s.calInstruct}>
            Do both of these in your inbox right now
          </p>

          <div className={s.calCard}>
            {/* Banner */}
            <div className={s.calBanner}>
              <span className={s.calBannerWarning}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ flexShrink: 0 }}
                >
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="17"
                    rx="2"
                    stroke="#5f6368"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path d="M3 9h18" stroke="#5f6368" strokeWidth="1.5" />
                  <path
                    d="M8 2v4M16 2v4"
                    stroke="#5f6368"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                This event isn&apos;t in your calendar yet
              </span>
              <div className={s.calBannerActions}>
                <div className={s.calAnnotateWrap}>
                  <button className={s.calAddBtn}>Add to calendar</button>
                  <span className={s.calRing} />
                  <span className={s.calRingLabel}>Step 1</span>
                </div>
                <button className={s.calSpamBtn}>Report spam</button>
              </div>
            </div>

            {/* Event row */}
            <div className={s.calEvent}>
              <div className={s.calDateBox}>
                <span className={s.calDateMon}>MAY</span>
                <span className={s.calDateNum}>6</span>
              </div>
              <div className={s.calEventInfo}>
                <div className={s.calEventTitle}>
                  Your Strategy Call: Orovia
                </div>
                <div className={s.calEventMeta}>
                  <span className={s.calEventMetaKey}>When</span>
                  Wed May 6 · 9:00 – 9:45 am PDT
                </div>
                <div className={s.calEventMeta}>
                  <span className={s.calEventMetaKey}>Where</span>
                  Google Meet
                </div>
                <div className={s.calRsvpRow}>
                  <div className={s.calAnnotateWrap}>
                    <button className={`${s.calRsvpBtn} ${s.calRsvpYes}`}>
                      Yes
                    </button>
                    <span className={s.calRing} />
                    <span className={s.calRingLabel}>Step 2</span>
                  </div>
                  <button className={s.calRsvpBtn}>Maybe</button>
                  <button className={s.calRsvpBtn}>No</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 6 — FAQ Accordion
      ───────────────────────────────────────────────────────────────────── */}
      <section className={s.faqSection}>
        <div className={s.sectionHeader}>
          <div className={s.sectionEye}>Before Your Call</div>
          <h2 className={s.sectionH2}>
            Questions answered
            <br />
            <span className={s.gold}>before you ask them.</span>
          </h2>
        </div>

        <div data-faq-grid className={s.faqAccordion}>
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              data-faq
              className={`${s.faqItem}${openFaq === i ? ` ${s.faqItemOpen}` : ""}`}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className={s.faqQ}>
                <span>{item.q}</span>
                <span className={s.faqChevron}>
                  {openFaq === i ? "−" : "+"}
                </span>
              </div>
              {openFaq === i && <div className={s.faqA}>{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 7 — Screenshot Testimonial Carousel
      ───────────────────────────────────────────────────────────────────── */}
      <section className={s.ssStrip}>
        <div className={s.proofCloudHead}>
          <div className={s.sectionEye}>Results</div>
          <h2 className={s.sectionH2}>
            Real partners.
            <br />
            <span className={s.gold}>Real money.</span>
          </h2>
        </div>
        <div className={s.ssTrack}>
          <div className={s.ssInner}>
            {[
              "/wins/win-0378.png",
              "/wins/win-0380.png",
              "/wins/win-0381.png",
              "/wins/win-0382.png",
              "/wins/win-0383.png",
              "/wins/win-0384.png",
              "/wins/win-0385.png",
              "/wins/win-0386.png",
              "/wins/win-0387.png",
              "/wins/win-0388.png",
              "/wins/win-0378.png",
              "/wins/win-0380.png",
              "/wins/win-0381.png",
              "/wins/win-0382.png",
              "/wins/win-0383.png",
              "/wins/win-0384.png",
              "/wins/win-0385.png",
              "/wins/win-0386.png",
              "/wins/win-0387.png",
              "/wins/win-0388.png",
            ].map((src, i) => (
              <div key={i} className={s.ssSlide}>
                <img src={src} alt="Partner win" className={s.ssImg} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 8 — Essential Checkpoints
      ───────────────────────────────────────────────────────────────────── */}
      <section className={s.checkSection}>
        <div className={s.sectionHeader}>
          <h2 className={s.sectionH2}>
            Essential
            <br />
            <span className={s.gold}>Checkpoints</span>
          </h2>
        </div>

        <div data-checkpoints className={s.checkGrid}>
          {CHECKPOINTS.map((c, i) => (
            <div key={i} data-checkpoint className={s.checkCard}>
              <div className={s.checkMetal} />
              <span className={s.checkNum}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <div className={s.checkLabel}>{c.label}</div>
                <div className={s.checkBody}>{c.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
