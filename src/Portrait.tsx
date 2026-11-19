export function Portrait({ kind }: { kind: string }) {
  const cat = kind === "cat",
    driver = kind === "driver",
    clerk = kind === "clerk";
  return (
    <svg
      viewBox="0 0 200 250"
      className={`character-portrait portrait-${kind}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`coat-${kind}`} x2="1" y2="1">
          <stop stopColor={cat ? "#344956" : clerk ? "#5d6882" : "#415b65"} />
          <stop offset="1" stopColor="#1b2738" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="233" rx="74" ry="12" fill="#000" opacity=".25" />
      <path
        d="M29 236 Q27 157 64 151 L136 151 Q173 164 171 236Z"
        fill={`url(#coat-${kind})`}
      />
      <path d="M78 148 L100 182 L123 148" fill="#dedbca" />
      <path
        d="M99 180 L89 211 L100 228 L111 211 L103 180"
        fill={cat ? "#db9e87" : "#a1b77f"}
      />
      {cat ? (
        <>
          <path
            d="M49 86 L42 25 L82 48 Q101 39 119 48 L158 25 L151 89 Q166 143 101 156 Q35 143 49 86Z"
            fill="#d7a66b"
          />
          <path
            d="M52 41 L59 74 L76 56 M145 41 L139 74 L122 56"
            fill="#be7e75"
          />
          <path
            d="M92 47 L99 77 L108 47 M59 75 L79 89 M143 75 L123 89"
            stroke="#b37b4e"
            strokeWidth="6"
            fill="none"
          />
          <path
            d="M67 101 L85 101 M115 101 L133 101"
            stroke="#293240"
            strokeWidth="5"
          />
          <path d="M95 117 L105 117 L100 124Z" fill="#694c49" />
          <path
            d="M100 125 Q88 135 83 127 M100 125 Q112 135 117 127"
            stroke="#694c49"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M64 117 L31 112 M65 125 L29 129 M136 117 L169 112 M135 125 L171 129"
            stroke="#ddc7a2"
            strokeWidth="2"
          />
        </>
      ) : (
        <>
          <path
            d="M59 64 Q100 37 141 64 L140 120 Q135 158 100 161 Q65 158 60 121Z"
            fill="#d4b49a"
          />
          <path
            d="M54 104 Q39 38 101 34 Q160 31 147 107 L132 78 L87 76 L63 111Z"
            fill={clerk ? "#45414d" : "#353a43"}
          />
          {driver && (
            <>
              <path d="M48 67 Q100 19 153 67 L146 82 L55 82Z" fill="#344b59" />
              <path d="M49 80 Q101 105 154 80" fill="#1b2e3d" />
              <rect
                x="92"
                y="51"
                width="16"
                height="13"
                rx="2"
                fill="#d7c18a"
              />
            </>
          )}
          <path
            d="M75 112 L85 112 M115 112 L125 112"
            stroke="#3d3a40"
            strokeWidth="4"
          />
          <path
            d="M87 138 Q101 144 115 138"
            stroke="#8b6861"
            strokeWidth="3"
            fill="none"
          />
          {clerk && (
            <>
              <rect
                x="65"
                y="101"
                width="29"
                height="22"
                rx="7"
                fill="none"
                stroke="#323846"
                strokeWidth="4"
              />
              <rect
                x="106"
                y="101"
                width="29"
                height="22"
                rx="7"
                fill="none"
                stroke="#323846"
                strokeWidth="4"
              />
              <path d="M94 109 L106 109" stroke="#323846" strokeWidth="3" />
            </>
          )}
        </>
      )}
      {kind === "keeper" && (
        <path
          d="M58 166 L75 166 L78 190 L122 190 L125 166 L142 166 L139 236 L61 236Z"
          fill="#bec28f"
        />
      )}
      <path
        d="M41 219 L72 224 M159 219 L128 224"
        stroke="#718090"
        strokeWidth="3"
        opacity=".5"
      />
    </svg>
  );
}
