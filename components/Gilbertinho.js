export default function Gilbertinho({ size = 220 }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 200 240" role="img" aria-label="Gilbertinho, o técnico da TEC-SAT">
      {/* antena */}
      <line x1="150" y1="165" x2="172" y2="58" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" />
      <line x1="160" y1="80" x2="192" y2="68" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
      <line x1="164" y1="96" x2="190" y2="88" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
      <line x1="168" y1="112" x2="188" y2="106" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />

      {/* corpo (uniforme) */}
      <rect x="52" y="138" width="96" height="96" rx="32" fill="#f97316" />
      <rect x="92" y="150" width="16" height="70" rx="4" fill="#ea580c" />
      <circle cx="78" cy="170" r="9" fill="#ffffff" />
      <text x="78" y="174" textAnchor="middle" fontSize="10" fontWeight="800" fill="#f97316">TS</text>

      {/* braço segurando a antena */}
      <rect x="128" y="150" width="34" height="18" rx="9" fill="#f97316" transform="rotate(-35 128 150)" />
      <circle cx="152" cy="160" r="10" fill="#f5c6a0" />

      {/* cabeça */}
      <circle cx="100" cy="96" r="44" fill="#f5c6a0" />
      <circle cx="58" cy="98" r="8" fill="#f5c6a0" />
      <circle cx="142" cy="98" r="8" fill="#f5c6a0" />

      {/* boné */}
      <path d="M58 82 Q60 44 100 42 Q140 44 142 82 Z" fill="#facc15" />
      <rect x="56" y="76" width="88" height="10" rx="5" fill="#eab308" />
      <path d="M100 80 Q138 78 160 88 Q130 92 100 88 Z" fill="#eab308" />

      {/* olhos */}
      <circle cx="84" cy="98" r="5" fill="#1f2933" />
      <circle cx="116" cy="98" r="5" fill="#1f2933" />
      <circle cx="86" cy="96" r="1.6" fill="#ffffff" />
      <circle cx="118" cy="96" r="1.6" fill="#ffffff" />

      {/* bochechas */}
      <circle cx="74" cy="112" r="6" fill="#fca5a5" opacity="0.7" />
      <circle cx="126" cy="112" r="6" fill="#fca5a5" opacity="0.7" />

      {/* bigode e sorriso */}
      <path d="M82 116 Q92 110 100 116 Q108 110 118 116 Q108 122 100 118 Q92 122 82 116 Z" fill="#6b4f3a" />
      <path d="M88 124 Q100 134 112 124" stroke="#9a3412" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}