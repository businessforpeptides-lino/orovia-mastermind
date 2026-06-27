/**
 * Film grain overlay using SVG turbulence.
 * Fixed, full-viewport, mix-blend-mode: overlay, opacity ~6%.
 * Adds the analog texture that makes glass and gold feel real.
 */
export default function FilmGrain() {
  return (
    <svg
      className="film-grain"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="film-grain-filter">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="3"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#film-grain-filter)" />
    </svg>
  );
}
