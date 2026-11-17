import type { ProfessionThemeId } from "@/character/appearance/theme";
import { PAPER_IDENTITY_CONTROLS } from "@/character/print-reference/identity-controls";
import {
  REFERENCE_PAGE_WIDTH as W,
  REFERENCE_PAGE_HEIGHT as H,
} from "@/character/print-reference/layout";
import metadata from "@/data/character/paper-attribute-headings.json";

function frame(x: number, y: number, right: number, bottom: number) {
  const c = 2.244;
  return `M${x + c} ${y}H${right - c}L${right} ${y + c}V${bottom - c}L${right - c} ${bottom}H${x + c}L${x} ${bottom - c}V${y + c}Z`;
}
/** Original chamfered field ends and source-PDF palette; online controls only. */
export function ReferenceIdentityFrames({ id }: { id: ProfessionThemeId }) {
  const palette = metadata.identity[id];
  return (
    <svg
      className="paper-identity-frames"
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
    >
      {Object.values(PAPER_IDENTITY_CONTROLS).map(({ right, control }) => {
        const [x, y, r, b] = control;
        const start = right - 2.7;
        return (
          <g key={x}>
            <rect
              x={start}
              y={26.1}
              width={r + 0.7 - start}
              height={18.9}
              fill={palette.background}
            />
            <path
              d={`M${start} ${y}H${right - 2.244}L${right} ${y + 2.244}V${b - 2.244}L${right - 2.244} ${b}H${start}Z`}
              fill="white"
            />
            <path
              d={`M${start} ${y}H${right - 2.244}L${right} ${y + 2.244}V${b - 2.244}L${right - 2.244} ${b}H${start}`}
              fill="none"
              stroke={palette.border}
              strokeWidth={0.486}
            />
            <path
              d={frame(x, y, r, b)}
              fill="white"
              stroke={palette.border}
              strokeWidth={0.486}
            />
          </g>
        );
      })}
    </svg>
  );
}
