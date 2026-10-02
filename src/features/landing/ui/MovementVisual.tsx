export function MovementVisual() {
  return (
    <div
      className="fit-movement-visual"
      role="img"
      aria-label="Minh họa phân tích tư thế squat với điểm khớp và đường đo chuyển động"
    >
      <div className="fit-visual-top fit-label">
        <span>PHÂN TÍCH VIDEO</span>
        <span>01 / SQUAT</span>
      </div>
      <svg viewBox="0 0 640 500" aria-hidden="true">
        <defs>
          <pattern id="fit-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeOpacity=".08" />
          </pattern>
        </defs>
        <rect width="640" height="500" fill="url(#fit-grid)" />
        <ellipse cx="333" cy="446" rx="165" ry="3" fill="currentColor" opacity=".1" />
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M350 136 L307 249 L390 326 L331 427 M305 250 L230 324 L263 426"
            strokeWidth="48"
            opacity=".1"
          />
          <path
            d="M345 151 L405 211 L473 198 M343 159 L383 235 L458 240"
            strokeWidth="25"
            opacity=".1"
          />
          <circle cx="366" cy="91" r="33" fill="currentColor" opacity=".11" stroke="none" />
          <path
            d="M350 136 L307 249 L390 326 L331 427 M307 249 L230 324 L263 426 M350 136 L405 211 L473 198 M350 136 L383 235 L458 240"
            strokeWidth="2.2"
          />
          <path d="M365 109 L350 136 M331 427 L370 434 M263 426 L297 434" strokeWidth="2.2" />
          <path d="M346 285 Q362 323 373 347" strokeWidth="1" strokeDasharray="4 5" />
          <path
            d="M390 326 H533 M350 136 H192 M307 249 H112"
            strokeWidth="1"
            opacity=".4"
            strokeDasharray="3 4"
          />
          <path
            d="M185 58 H157 V96 M487 58 H515 V96 M157 389 V445 H194 M515 389 V445 H480"
            strokeWidth="1"
            opacity=".35"
          />
        </g>
        {[
          [350, 136],
          [307, 249],
          [390, 326],
          [331, 427],
          [230, 324],
          [263, 426],
          [405, 211],
          [473, 198],
          [383, 235],
          [458, 240],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="5" fill="#A7F0DD" stroke="#345C32" strokeWidth="2" />
        ))}
        <g fill="currentColor" fontFamily="monospace" fontSize="10" letterSpacing="1">
          <text x="79" y="240">
            ĐIỂM KHỚP
          </text>
          <text x="438" y="315">
            BIÊN ĐỘ
          </text>
          <text x="105" y="125">
            TƯ THẾ
          </text>
        </g>
      </svg>
      <div className="fit-visual-bottom fit-label">
        <span>VIDEO → PHÂN TÍCH → PHẢN HỒI</span>
        <span>HÌNH MINH HỌA</span>
      </div>
    </div>
  );
}
