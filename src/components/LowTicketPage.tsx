'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LowTicketBackground from './LowTicketBackground';
import IncomeCalculator from './IncomeCalculator';
import s from './LowTicketPage.module.css';

const FANBASIS_URL = 'https://whop.com/orovia-protocol/plug-play1/';
const IG_URL       = 'https://instagram.com/itslinoaguayo';
const TIKTOK_URL   = 'https://tiktok.com/@itslinoaguayo';
const YOUTUBE_URL  = 'https://youtube.com/@itslinoaguayo';

// Username wins — standalone cards (high-ticket Orovia Protocol members)
const USERNAME_WINS = [
  '/wins/win-0378.png',
  '/wins/win-0380.png',
  '/wins/win-0381.png',
  '/wins/win-0382.png',
  '/wins/win-0383.png',
  '/wins/win-0384.png',
  '/wins/win-0385.png',
  '/wins/win-0386.png',
  '/wins/win-0387.png',
  '/wins/win-0388.png',
];

// Order screenshots — stacked 2 per slot (show buyer's cost, not affiliate profit)
const ORDER_WINS = [
  '/wins/order-0389.png',
  '/wins/order-0390.png',
  '/wins/order-0391.png',
  '/wins/order-0392.png',
  '/wins/order-0393.png',
  '/wins/order-0394.png',
  '/wins/order-0395.png',
  '/wins/order-0396.png',
  '/wins/order-0397.png',
  '/wins/order-0398.png',
  '/wins/order-0399.png',
  '/wins/order-0400.png',
  '/wins/order-0401.png',
  '/wins/order-0402.png',
  '/wins/order-0403.png',
];

// Build interleaved strip: username → pair → username → pair …
type SlideItem =
  | { type: 'single'; src: string }
  | { type: 'pair'; src1: string; src2: string };

const buildStrip = (): SlideItem[] => {
  const items: SlideItem[] = [];
  const pairs: [string, string][] = [];
  for (let i = 0; i + 1 < ORDER_WINS.length; i += 2) {
    pairs.push([ORDER_WINS[i], ORDER_WINS[i + 1]]);
  }
  const maxLen = Math.max(USERNAME_WINS.length, pairs.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < USERNAME_WINS.length) items.push({ type: 'single', src: USERNAME_WINS[i] });
    if (i < pairs.length) items.push({ type: 'pair', src1: pairs[i][0], src2: pairs[i][1] });
  }
  return items;
};
const STRIP_ITEMS = buildStrip();

const PROBLEMS = [
  {
    title: 'No reliable product to sell',
    desc: 'Sourcing legit peptides takes months of vetting. Most suppliers are gray market with no documentation and zero accountability if something goes wrong.',
  },
  {
    title: 'COAs cost $300-500 per batch',
    desc: 'Third-party lab testing is non-negotiable for serious buyers. Without Certificates of Analysis, you lose every sale to someone who has them.',
  },
  {
    title: 'Payment processors reject you',
    desc: 'Stripe and PayPal flat-out ban peptide transactions. Finding a compliant processor, navigating reserves, and setting up the workflow solo is a nightmare.',
  },
  {
    title: 'Legal exposure with no playbook',
    desc: 'Research use disclaimers, compliant marketing language, platform rules. One wrong caption and you are flagged. There is no solo roadmap for this.',
  },
  {
    title: 'Zero brand credibility day one',
    desc: 'Buyers do not trust no-name affiliates. Building a brand from scratch takes 6 to 12 months, real marketing spend, and an audience you have not built yet.',
  },
  {
    title: 'No sales system or close framework',
    desc: 'Most people post once, get no response, and give up. Without DM scripts, follow-up sequences, and a closing process, every sale is a guess.',
  },
];

const SKOOL_MODULES = [
  { num: '01', title: 'Introduction',   lessons: 8,  tag: 'Getting Started',          img: 'introduction'   },
  { num: '02', title: 'Marketing',      lessons: 12, tag: 'Positioning and Outreach',  img: 'marketing'      },
  { num: '03', title: 'Peptides 101',   lessons: 15, tag: 'Product Knowledge',         img: 'peptides-101'   },
  { num: '04', title: 'Sales',          lessons: 10, tag: 'Close and Fulfill',          img: 'sales'          },
  { num: '05', title: 'Scaling',        lessons: 9,  tag: 'Growth Systems',             img: 'scaling'        },
  { num: '06', title: 'Peptide Extras', lessons: 7,  tag: 'Bonus Content',              img: 'peptide-extras' },
];

const MODULE_CARDS = [
  {
    num: '01',
    title: 'Introduction',
    desc: 'Hit the ground running. We walk through the affiliate dashboard, how orders move from buyer to doorstep, and a day-by-day sprint plan to land your first sale inside 7 days. No theory. It is exactly what to do from day one.',
    points: ['Affiliate dashboard and account setup', 'Order flow walkthrough start to finish', 'Day 0 to 7 first-sale sprint plan'],
  },
  {
    num: '02',
    title: 'Marketing',
    desc: 'Positioning is how you make buyers come to you instead of chasing them. This module covers your affiliate identity, who your best buyers actually are, and the exact messaging framework that gets attention in any niche without triggering platform flags.',
    points: ['Affiliate identity and niche selection', 'ICP and dream buyer definition', 'Platform-safe messaging framework'],
  },
  {
    num: '03',
    title: 'Peptides 101',
    desc: 'You do not need a biology degree. You need to sound credible, answer questions confidently, and know which products solve which problems. We cover BPC-157, GHK-Cu, 5-Amino-1MQ, and more with dosage guides, protocols, and the COA vocabulary that makes buyers trust you on the spot.',
    points: ['Full compound library with protocols', 'Dosage guides and cycle recommendations', 'COA vocabulary and trust-closing language'],
  },
  {
    num: '04',
    title: 'Sales',
    desc: 'No sales experience required. This is a step-by-step DM and close framework that moves people from "what is this" to "how do I pay" using scripts affiliates are running right now. Includes processor setup, objection handling, and the COA close that kills every last concern.',
    points: ['DM scripts and closing framework', 'Payment processor setup and reserve management', 'Objection handling for the 5 most common hesitations'],
  },
  {
    num: '05',
    title: 'Scaling',
    desc: 'One happy buyer becomes ten if you set up the referral loop right. This module covers the referral engine, volume bonus tiers, and how to build an affiliate roster under you so your income compounds without adding more of your own time.',
    points: ['Referral engine setup and automation', 'Volume bonus tiers and qualification', 'Sub-affiliate roster and passive income layer'],
  },
  {
    num: '06',
    title: 'Peptide Extras',
    desc: 'For affiliates who want to go deeper. Advanced compound profiles, combination protocols, premium tier product walkthroughs, and the edge-case questions your best clients will eventually ask. This is where $250 buyers become $600 buyers.',
    points: ['Advanced compound and combo protocols', 'Premium product tier walkthroughs', 'Edge cases and high-value client questions'],
  },
];

const FAQ_ITEMS = [
  {
    q: 'What exactly am I buying?',
    a: "Access to a digital education program with four core training modules, supporting templates and scripts, a community of operators, and warm introductions to vetted infrastructure partners. You are not purchasing physical product through this platform.",
  },
  {
    q: 'What brand am I selling?',
    a: "You're selling under Orovia Wellness, Lino's established peptide brand currently pulling in six figures a month. The brand is already battle-tested, trusted in the market, and comes with all the certificates of authentication ready to hand to your buyers. Building a recognized brand with verified product, lab certificates, and real customer trust takes years. You skip that phase entirely and step in with a name people already trust.",
  },
  {
    q: 'Do I need experience to start?',
    a: "No. The program is built to take someone with zero background in this space and walk them through the full operator playbook step by step. If you have existing audience or sales experience, you'll move faster, but it's not required.",
  },
  {
    q: 'Do I need a big following to start?',
    a: "No. Most affiliates close their first sales through direct outreach and warm networks, not a content audience. We have members running this with nothing more than their personal network: five friends, a few coworkers, gym buddies. That's enough to start. An audience helps you scale, but it is not a requirement to get your first dollar. Peptides are not a one-time impulse buy. People come back every month and most increase their order size over time.",
  },
  {
    q: "What's the average order value and margin I can expect?",
    a: "Average orders run $200 to $300. Stacked protocols from higher-intent buyers push $400 to $600 per order. Your margin as a Plug and Play affiliate is 60 to 80% after processor fees, depending on your volume tier. Most affiliates hit a 60% floor on day one and unlock higher tiers as they scale.",
  },
  {
    q: 'What about payment processor fees?',
    a: "Stripe and PayPal do not work for peptide transactions. We route through a processor built specifically for this space. The fee is 9.5% plus a 10% rolling reserve released after 90 days. Factor that into your pricing and you still clear 50%+ margins on every order.",
  },
  {
    q: 'How is this different from an affiliate program?',
    a: "Affiliate programs pay you a small percentage. This program teaches you how to operate as the front-end of a real business, where you control the customer relationship and keep the majority of what each sale generates. You're learning to run an operation, not collect referral fees.",
  },
  {
    q: "What's the difference between white label and Plug and Play?",
    a: "White label means you build your own brand, website, and compliance infrastructure from zero. Plug and Play means you sell under an established brand using their COAs, processor, and supply chain. You bring the buyers. Lower startup cost, faster first dollar.",
  },
  {
    q: 'What do I actually need to get started?',
    a: "A phone, a laptop, and the willingness to follow the system. Everything else is included: templates, scripts, frameworks, and warm introductions to vetted partners.",
  },
  {
    q: 'Do I need a website?',
    a: "No. Most partners generate their first sales through direct messages and Instagram Stories before ever touching a website. Want to build a full dropshipping site? Go for it. Want to text five people and ship orders? That works too. The program flexes around however you want to operate.",
  },
  {
    q: 'Is this legal? What about FDA compliance?',
    a: "Yes. Peptides sold for research use are legal to distribute. Every product comes with COAs and endotoxin testing from accredited labs. All certificates of analysis and third-party lab verification are provided through the partner network. We coach you on compliant language so you focus on transformation outcomes, not medical claims. You're not figuring out the legal landscape alone.",
  },
  {
    q: 'Is the actual product sold through Whop?',
    a: "No. Whop hosts the education and community. All product transactions happen independently between members and third-party fulfillment partners, who handle their own sourcing, testing, shipping, and compliance.",
  },
  {
    q: 'How do I post about peptides without getting banned?',
    a: "Talk about the outcome, not the compound. Energy, recovery, body composition, longevity. We give you caption frameworks and scripts tested across hundreds of posts. Social platforms flag medical claims, not keywords.",
  },
  {
    q: 'Can clients ask for COAs?',
    a: "Absolutely, and you should share them proactively. All products come with third-party Certificates of Analysis from accredited labs. Most gray-market sellers do not have them. You do. That is how you close.",
  },
  {
    q: 'What kind of support do I get?',
    a: "Community access, ongoing Q&A, and direct guidance from operators who've built in this space. You're not handed a course and left alone.",
  },
  {
    q: 'How long until I see results?',
    a: "That depends entirely on how fast you implement. Some operators move in the first 30 days. Others take longer. The program gives you the system. Speed is on you.",
  },
  {
    q: 'Are there any income guarantees?',
    a: "No. We don't make income claims. What we provide is education, structure, and access to a vetted network. Outcomes depend on the operator.",
  },
  {
    q: 'Can I do this part-time?',
    a: "Yes. Most members start while working a full-time job or running another business. The system is built to be operated in focused blocks of time.",
  },
  {
    q: 'Do I need an LLC?',
    a: "Not to start. Many partners begin collecting as individuals and form an LLC once revenue justifies the overhead. We will flag when that threshold makes sense for your situation.",
  },
  {
    q: 'Can you ship to Canada or internationally?',
    a: "US domestic shipping is fully handled. International orders including Canada are case by case based on destination regulations. Contact us before quoting any client outside the US.",
  },
];

export default function LowTicketPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', immediateRender: false } });
      heroTl
        .from('[data-lt-eyebrow]', { y: -24, opacity: 0, scale: 0.88, duration: 0.65 })
        .from('[data-lt-h1] .ltWord', { y: 52, opacity: 0, duration: 0.7, stagger: 0.1 }, '-=0.3')
        .from('[data-lt-sub]',        { y: 18, opacity: 0, duration: 0.55 }, '-=0.25');

      gsap.from('[data-lt-ss-strip]', {
        opacity: 0, duration: 0.6, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: '[data-lt-ss-strip]', start: 'top 88%' },
      });

      gsap.from('[data-lt-opp]', {
        y: 24, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: '[data-lt-opp]', start: 'top 86%' },
      });

      gsap.from('[data-lt-prob]', {
        y: 28, opacity: 0, scale: 0.97, duration: 0.55, stagger: 0.08, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: '[data-lt-prob-grid]', start: 'top 84%' },
      });

      gsap.from('[data-lt-module]', {
        y: 50, opacity: 0, scale: 0.93, duration: 0.7, stagger: 0.1, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: '[data-lt-modules]', start: 'top 82%' },
      });

      // Hover float on module cover cards
      const moduleWrappers = rootRef.current?.querySelectorAll('[data-lt-module]');
      moduleWrappers?.forEach(el => {
        el.addEventListener('mouseenter', () => {
          gsap.to(el, { y: -18, scale: 1.05, duration: 0.4, ease: 'power2.out', overwrite: true });
        });
        el.addEventListener('mouseleave', () => {
          gsap.to(el, { y: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.55)', overwrite: true });
        });
      });

      gsap.from('[data-lt-mcard]', {
        y: 36, opacity: 0, scale: 0.96, duration: 0.65, stagger: 0.1, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: '[data-lt-mcards]', start: 'top 82%' },
      });

      gsap.from('[data-lt-pricing]', {
        y: 48, opacity: 0, scale: 0.97, duration: 0.75, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: '[data-lt-pricing]', start: 'top 86%' },
      });

      gsap.from('[data-lt-faq]', {
        y: 28, opacity: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: '[data-lt-faq-wrap]', start: 'top 84%' },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className={s.root}>
      <LowTicketBackground />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className={s.heroStage}>
        <header className={s.hero}>
          <div data-lt-eyebrow className={s.eyebrow}>
            <span className={s.eyebrowDot} />
            The Plug &amp; Play Program
          </div>

          <h1 data-lt-h1 className={s.h1}>
            <span className={`ltWord ${s.h1Cream}`}>The Peptide</span>
            <span className={`ltWord ${s.h1Gold}`}>Gold Rush.</span>
          </h1>

        </header>
      </div>

      {/* ── WHAT IT IS / OPPORTUNITY ─────────────────────────────────────── */}
      <section className={s.whatSection}>
        <div className={s.sectionInner}>
          <div className={s.sectionEye}>The Model</div>
          <h2 className={`${s.sectionH2} ${s.whatH2}`}>
            The simplest way to<br />
            <span className={s.gold}>add a peptide income stream.</span>
          </h2>
          <div className={s.offerCardsRow}>
            <div data-lt-opp className={s.offerCard}>
              <div className={s.offerCardGlow} />
              <div className={s.offerCardEye}>The Market</div>
              <div className={s.offerCardTitle}>A gold rush hiding in plain sight</div>
              <ul className={s.offerCardPoints}>
                <li>Demand from biohackers, med spas &amp; health-optimizers accelerating</li>
                <li>Average orders: <strong>$200–$300</strong></li>
                <li>Stacked protocols: <strong>$400–$600</strong></li>
                <li>Buyers reorder every single month. Recurring cash flow.</li>
              </ul>
            </div>
            <div data-lt-opp className={s.offerCard}>
              <div className={s.offerCardGlow} />
              <div className={s.offerCardEye}>The Infrastructure</div>
              <div className={s.offerCardTitle}>60–80% margin. Zero setup.</div>
              <ul className={s.offerCardPoints}>
                <li>Production, lab testing and COAs: all handled</li>
                <li>Compliant processor already wired in</li>
                <li>Shipping, compliance and legal playbook: all included</li>
                <li>You focus on one thing: finding buyers</li>
              </ul>
            </div>
            <div data-lt-opp className={s.offerCard}>
              <div className={s.offerCardGlow} />
              <div className={s.offerCardEye}>The System</div>
              <div className={s.offerCardTitle}>Step in on day one. Skip the trial.</div>
              <ul className={s.offerCardPoints}>
                <li>Sell under <strong>Orovia Wellness</strong>, a brand buyers already trust</li>
                <li>DM scripts, close frameworks &amp; full operator playbook</li>
                <li>Warm intros to vetted fulfillment partners</li>
                <li>Pressure-tested across hundreds of affiliates</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── SCREENSHOT TESTIMONIAL CAROUSEL ──────────────────────────────── */}
      <section data-lt-ss-strip className={s.ssStrip}>
        <div className={s.sectionInner}>
          <div className={s.sectionEye}>What Affiliates Are Saying</div>
          <h2 className={s.sectionH2}>
            Real results.<br />
            <span className={s.gold}>Real numbers.</span>
          </h2>
          <p className={s.ssDisclaimer}>
            Some of these screenshots only show what buyers paid, not what affiliates made.<br />
            Most of these orders cleared 60 to 80% profit on top of the cost shown.
          </p>
        </div>
        <div className={s.ssTrack}>
          <div className={s.ssInner}>
            {[...STRIP_ITEMS, ...STRIP_ITEMS].map((item, i) =>
              item.type === 'single' ? (
                <div key={i} className={s.ssSlide}>
                  <img src={item.src} alt="Affiliate win" className={s.ssImg} />
                </div>
              ) : (
                <div key={i} className={s.ssSlideStack}>
                  <img src={item.src1} alt="Affiliate order" className={s.ssImgSmall} />
                  <img src={item.src2} alt="Affiliate order" className={s.ssImgSmall} />
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM ──────────────────────────────────────────────────── */}
      <section className={s.problemSection}>
        <div className={s.sectionInner}>
          <div className={s.sectionEye}>The Hard Way</div>
          <h2 className={s.sectionH2}>
            What it looks like<br />
            <span className={s.gold}>trying to do this solo.</span>
          </h2>
          <div data-lt-prob-grid className={s.problemGrid}>
            {PROBLEMS.map((p, i) => (
              <div key={i} data-lt-prob className={s.problemItem}>
                <span className={s.problemX}>&#xD7;</span>
                <div>
                  <div className={s.problemTitle}>{p.title}</div>
                  <p className={s.problemDesc}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INCOME CALCULATOR ────────────────────────────────────────────── */}
      <IncomeCalculator />

      {/* ── SKOOL MODULE COVER CARDS ─────────────────────────────────────── */}
      <section className={s.modulesSection}>
        <div className={s.sectionInner}>
          <div className={s.sectionEye}>Inside The Program</div>
          <h2 className={s.sectionH2}>
            Six modules.<br />
            <span className={s.gold}>Everything you need to start earning.</span>
          </h2>
        </div>
        <div data-lt-modules className={s.modulesGrid}>
          {SKOOL_MODULES.map((mod, i) => (
            <div key={i} data-lt-module className={s.moduleCardWrap} style={{ cursor: 'pointer' }}>
              <div className={s.moduleCardFloat}>
                <div className={s.moduleCard}>
                  <div
                    className={s.moduleCardCover}
                    style={{ backgroundImage: `url('/modules/${mod.img}.png')` }}
                  >
                    <div className={s.moduleCardSheen} />
                    <span className={s.moduleCardBadge}>Module {mod.num}</span>
                  </div>
                  <div className={s.moduleCardBody}>
                    <div className={s.moduleCardTitle}>{mod.title}</div>
                    <div className={s.moduleCardMeta}>
                      <span className={s.moduleCardLessons}>{mod.lessons} lessons</span>
                      <span className={s.moduleCardSep}>·</span>
                      <span className={s.moduleCardTag}>{mod.tag}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MODULE DESCRIPTION CARDS ─────────────────────────────────────── */}
      <section className={s.valueSection}>
        <div className={s.sectionInner}>
          <div className={s.sectionEye}>What You Get</div>
          <h2 className={s.sectionH2}>
            Six modules.<br />
            <span className={s.gold}>Built for operators, not students.</span>
          </h2>
          <div data-lt-mcards className={s.moduleCardsGrid}>
            {MODULE_CARDS.map((card, i) => (
              <div key={i} data-lt-mcard className={s.moduleDescCard}>
                <div className={s.moduleDescCardGlow} />
                <div className={s.moduleDescNum}>{card.num}</div>
                <div className={s.moduleDescTitle}>{card.title}</div>
                <p className={s.moduleDescBody}>{card.desc}</p>
                <ul className={s.moduleDescPoints}>
                  {card.points.map((pt, j) => (
                    <li key={j} className={s.moduleDescPoint}>
                      <span className={s.moduleDescCheck}>&#10003;</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section className={s.pricingSection}>
        <div className={s.sectionInner}>
          <div data-lt-pricing className={s.pricingCard}>
            <div className={s.pricingGlow} />
            <div className={s.pricingEye}>Get Started Today</div>
            <div className={s.pricingAmount}>
              <span className={s.pricingCurrency}>$</span>500
              <span className={s.pricingPer}>/mo</span>
            </div>
            <p className={s.pricingCaption}>
              Cancel anytime. No contracts. No inventory risk.
            </p>
            <a
              href={FANBASIS_URL}
              className="btn-clipped btn-clipped--gold"
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginTop: 28, display: 'inline-block' }}
            >
              Get Access
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className={s.faqSection}>
        <div className={s.sectionInner}>
          <div className={s.sectionEye}>FAQ</div>
          <h2 className={s.sectionH2}>
            Questions answered<br />
            <span className={s.gold}>before you ask them.</span>
          </h2>
          <div data-lt-faq-wrap className={s.faqGrid}>
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                data-lt-faq
                className={`${s.faqItem}${openFaq === i ? ` ${s.faqItemOpen}` : ''}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className={s.faqQ}>
                  <span>{item.q}</span>
                  <span className={s.faqChevron}>{openFaq === i ? '−' : '+'}</span>
                </div>
                {openFaq === i && <div className={s.faqA}>{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FALLBACK / SOCIAL ────────────────────────────────────────────── */}
      <section className={s.fallbackSection}>
        <div className={s.sectionInner}>
          <p className={s.fallbackHeading}>Not ready right now?</p>
          <p className={s.fallbackSub}>
            Follow and watch all our free content to get started.
          </p>
          <div className={s.socialRow}>
            <a href={IG_URL} target="_blank" rel="noopener noreferrer" className={s.socialBtn}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.8"/>
                <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8"/>
                <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/>
              </svg>
              Follow on Instagram
            </a>
            <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className={s.socialBtn}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-6.13 6.33 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.41a8.16 8.16 0 0 0 4.77 1.52V7.48a4.85 4.85 0 0 1-2-.79z"/>
              </svg>
              Follow on TikTok
            </a>
            <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className={s.socialBtn}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M21.58 7.19c-.23-.86-.91-1.54-1.78-1.77C18.25 5 12 5 12 5s-6.25 0-7.8.42c-.87.23-1.55.91-1.78 1.77C2 8.74 2 12 2 12s0 3.26.42 4.81c.23.86.91 1.54 1.78 1.77C5.75 19 12 19 12 19s6.25 0 7.8-.42c.87-.23 1.55-.91 1.78-1.77C22 15.26 22 12 22 12s0-3.26-.42-4.81zM10 15V9l5.2 3-5.2 3z"/>
              </svg>
              Sub to YouTube
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
