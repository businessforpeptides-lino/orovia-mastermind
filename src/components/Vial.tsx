/**
 * Squat apothecary peptide vial — brushed silver flip-off cap with crimp ring,
 * rubber stopper, gold-tinted liquid fill with meniscus, gold rim highlights.
 * viewBox 0 0 100 155 — wider, shorter silhouette than the previous vial.
 * Uses unique gradient IDs per instance to avoid SVG ID collisions.
 */
export default function Vial({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 100 155"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', width: '100%', height: '100%' }}
    >
      <defs>
        {/* Glass body — left-edge highlight, slight centre gloss, right shadow */}
        <linearGradient id={`gb-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.05)" />
          <stop offset="10%"  stopColor="rgba(255,255,255,0.22)" />
          <stop offset="32%"  stopColor="rgba(255,255,255,0.09)" />
          <stop offset="50%"  stopColor="rgba(255,255,255,0.04)" />
          <stop offset="68%"  stopColor="rgba(255,255,255,0.09)" />
          <stop offset="90%"  stopColor="rgba(255,255,255,0.20)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
        </linearGradient>

        {/* Gold-tinted liquid */}
        <linearGradient id={`liq-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="rgba(180,148,20,0.25)" />
          <stop offset="35%"  stopColor="rgba(212,175,55,0.38)" />
          <stop offset="65%"  stopColor="rgba(200,162,40,0.30)" />
          <stop offset="100%" stopColor="rgba(160,130,18,0.18)" />
        </linearGradient>

        {/* Brushed silver cap */}
        <linearGradient id={`cap-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#3a3a3a" />
          <stop offset="12%"  stopColor="#7a7a7a" />
          <stop offset="28%"  stopColor="#b0b0b0" />
          <stop offset="45%"  stopColor="#d8d8d8" />
          <stop offset="55%"  stopColor="#d8d8d8" />
          <stop offset="72%"  stopColor="#a8a8a8" />
          <stop offset="88%"  stopColor="#686868" />
          <stop offset="100%" stopColor="#2a2a2a" />
        </linearGradient>

        {/* Flip-off dome — radial highlight */}
        <radialGradient id={`dome-${id}`} cx="38%" cy="30%" r="60%">
          <stop offset="0%"   stopColor="#f0f0f0" />
          <stop offset="40%"  stopColor="#b0b0b0" />
          <stop offset="100%" stopColor="#404040" />
        </radialGradient>

        {/* Rubber stopper */}
        <linearGradient id={`stop-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#1a120a" />
          <stop offset="50%"  stopColor="#3a2f1c" />
          <stop offset="100%" stopColor="#0d0905" />
        </linearGradient>

        {/* Gold rim-light on glass edges */}
        <linearGradient id={`rim-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="rgba(212,175,55,0.55)" />
          <stop offset="100%" stopColor="rgba(212,175,55,0.0)" />
        </linearGradient>
      </defs>

      {/* ── Drop shadow at base ── */}
      <ellipse cx="50" cy="151" rx="30" ry="2.2" fill="rgba(0,0,0,0.55)" />

      {/* ── Glass body — squat bottle shape ── */}
      <path
        d="M 34 32 L 34 44 Q 34 52 27 57 Q 22 61 21 68 L 21 138 Q 21 150 31 151 L 69 151 Q 79 150 79 138 L 79 68 Q 78 61 73 57 Q 66 52 66 44 L 66 32 Z"
        fill={`url(#gb-${id})`}
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="0.5"
      />

      {/* ── Gold rim highlights on left and right glass edges ── */}
      <line x1="21" y1="68" x2="21" y2="138" stroke="rgba(212,175,55,0.45)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="79" y1="68" x2="79" y2="138" stroke="rgba(212,175,55,0.28)" strokeWidth="0.8" strokeLinecap="round" />

      {/* ── Gold-tinted liquid fill ── */}
      <path
        d="M 25 80 L 75 80 L 75 138 Q 75 149 67 150 L 33 150 Q 25 149 25 138 Z"
        fill={`url(#liq-${id})`}
      />

      {/* ── Meniscus — liquid surface ── */}
      <ellipse cx="50" cy="80" rx="25" ry="1.4" fill="rgba(255,220,80,0.55)" />
      <ellipse cx="50" cy="80" rx="25" ry="1.4" fill="none" stroke="rgba(255,220,80,0.7)" strokeWidth="0.4" />

      {/* ── Glass specular highlights ── */}
      <line x1="26" y1="70" x2="26" y2="140" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="30" y1="80" x2="30" y2="132" stroke="rgba(255,255,255,0.22)" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="74" y1="80" x2="74" y2="132" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" strokeLinecap="round" />

      {/* ── Shoulder curve highlight ── */}
      <path d="M 27 57 Q 23 62 22 68" stroke="rgba(255,255,255,0.30)" strokeWidth="0.8" strokeLinecap="round" fill="none" />
      <path d="M 73 57 Q 77 62 78 68" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" strokeLinecap="round" fill="none" />

      {/* ── Base highlight ── */}
      <path d="M 28 148 Q 50 152 72 148" stroke="rgba(255,255,255,0.28)" strokeWidth="0.6" fill="none" />

      {/* ── Rubber stopper ── */}
      <rect x="35" y="28" width="30" height="10" fill={`url(#stop-${id})`} rx="0.5" />
      <rect x="35" y="28" width="30" height="1.8" fill="rgba(0,0,0,0.5)" rx="0.3" />

      {/* ── Brushed silver cap body ── */}
      <rect x="22" y="10" width="56" height="22" fill={`url(#cap-${id})`} rx="1.5" />

      {/* ── Vertical striations on cap ── */}
      <g opacity="0.5">
        <line x1="22.5" y1="13" x2="77.5" y2="13" stroke="rgba(0,0,0,0.20)" strokeWidth="0.35" />
        <line x1="22.5" y1="15" x2="77.5" y2="15" stroke="rgba(255,255,255,0.18)" strokeWidth="0.28" />
        <line x1="22.5" y1="17" x2="77.5" y2="17" stroke="rgba(0,0,0,0.18)" strokeWidth="0.32" />
        <line x1="22.5" y1="19" x2="77.5" y2="19" stroke="rgba(255,255,255,0.16)" strokeWidth="0.25" />
        <line x1="22.5" y1="21" x2="77.5" y2="21" stroke="rgba(0,0,0,0.20)" strokeWidth="0.35" />
        <line x1="22.5" y1="23" x2="77.5" y2="23" stroke="rgba(255,255,255,0.18)" strokeWidth="0.28" />
        <line x1="22.5" y1="25" x2="77.5" y2="25" stroke="rgba(0,0,0,0.18)" strokeWidth="0.32" />
        <line x1="22.5" y1="27" x2="77.5" y2="27" stroke="rgba(255,255,255,0.16)" strokeWidth="0.25" />
        <line x1="22.5" y1="29" x2="77.5" y2="29" stroke="rgba(0,0,0,0.20)" strokeWidth="0.35" />
      </g>

      {/* ── Crimp ring (bottom of cap) ── */}
      <line x1="22" y1="30" x2="78" y2="30" stroke="rgba(0,0,0,0.50)" strokeWidth="0.7" />
      <line x1="22" y1="31.4" x2="78" y2="31.4" stroke="rgba(255,255,255,0.22)" strokeWidth="0.35" />

      {/* ── Flip-off dome ── */}
      <ellipse cx="50" cy="10" rx="28" ry="3.5" fill={`url(#dome-${id})`} />

      {/* ── Recessed centre of dome ── */}
      <ellipse cx="50" cy="10" rx="13" ry="2.2" fill="rgba(0,0,0,0.5)" />
      <ellipse cx="50" cy="9.5" rx="11.5" ry="1.6" fill="#2a2a2a" />
      <ellipse cx="50" cy="9.2" rx="9.5"  ry="0.7" fill="rgba(0,0,0,0.55)" />

      {/* ── Cap specular — left bright stripe, right shadow ── */}
      <rect x="25" y="12" width="2.6" height="16" fill="rgba(255,255,255,0.65)" rx="1" />
      <rect x="29" y="14" width="1.1" height="12" fill="rgba(255,255,255,0.35)" rx="0.5" />
      <rect x="72" y="12" width="2.6" height="16" fill="rgba(0,0,0,0.40)" rx="1" />
    </svg>
  );
}
