"use client";

export const MASCOT_NAME = "Minnu";

/** Minnu: a chubby smiling star. Bounces and chatters while `talking`. */
export function Mascot({ talking = false, className = "" }: { talking?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 200 210"
      className={`mascot ${talking ? "talking" : ""} ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="minnu-fill" cx="42%" cy="35%" r="70%">
          <stop offset="0" stopColor="#FFF5B8" />
          <stop offset="0.55" stopColor="#FFD43B" />
          <stop offset="1" stopColor="#FFB800" />
        </radialGradient>
      </defs>

      <ellipse className="mascot-shadow" cx="100" cy="198" rx="48" ry="7" fill="rgb(43 42 76 / 0.12)" />

      <g className="mascot-body">
        <path
          d="M100 23 L127 67.8 L178 79.7 L143.7 119.2 L148.2 171.3 L100 151 L51.8 171.3 L56.3 119.2 L22 79.7 L73 67.8 Z"
          fill="url(#minnu-fill)"
          stroke="#F5B000"
          strokeWidth="13"
          strokeLinejoin="round"
        />
        {/* shine */}
        <path d="M84 52 Q90 44 97 42" stroke="#FFFBE0" strokeWidth="6" strokeLinecap="round" fill="none" />

        <g className="mascot-eyes">
          <ellipse cx="83" cy="99" rx="7.5" ry="9.5" fill="#3B2A1A" />
          <ellipse cx="117" cy="99" rx="7.5" ry="9.5" fill="#3B2A1A" />
          <circle cx="85.5" cy="95.5" r="2.8" fill="#fff" />
          <circle cx="119.5" cy="95.5" r="2.8" fill="#fff" />
        </g>

        <ellipse cx="68" cy="117" rx="9" ry="5.5" fill="#FF8FA3" opacity="0.75" />
        <ellipse cx="132" cy="117" rx="9" ry="5.5" fill="#FF8FA3" opacity="0.75" />

        <path
          className="mascot-mouth-smile"
          d="M88 115 Q100 129 112 115"
          stroke="#3B2A1A"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <g className="mascot-mouth-open">
          <ellipse cx="100" cy="121" rx="10" ry="8.5" fill="#7A2E2E" />
          <ellipse cx="100" cy="125.5" rx="6" ry="3.5" fill="#FF7B8A" />
        </g>
      </g>
    </svg>
  );
}
