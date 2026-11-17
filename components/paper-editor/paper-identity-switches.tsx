import type { SheetData } from "@/lib/sheet-data";
import { PAPER_IDENTITY_CONTROLS } from "@/character/print-reference/identity-controls";
import { referenceRectPosition } from "@/character/print-reference/layout";

export function PaperIdentitySwitches({
  sheet,
  onMixedChange,
  onTransformationChange,
  onConfigureMixed,
  onConfigureTransformation,
}: {
  sheet: SheetData;
  onMixedChange?: (enabled: boolean) => void;
  onTransformationChange?: (enabled: boolean) => void;
  onConfigureMixed: () => void;
  onConfigureTransformation?: () => void;
}) {
  return (
    <>
      {(
        [
          {
            kind: "mixed",
            label: "混血",
            enabled: sheet.mixedAncestry === true,
            rect: PAPER_IDENTITY_CONTROLS.community.control,
            onChange: onMixedChange,
            onConfigure: onConfigureMixed,
            configure: "选择混血种族",
          },
          {
            kind: "transformation",
            label: "转变",
            enabled: sheet.transformationEnabled === true,
            rect: PAPER_IDENTITY_CONTROLS.subclass.control,
            onChange: onTransformationChange,
            onConfigure: onConfigureTransformation,
            configure: "选择转变卡",
          },
        ] as const
      ).map(
        ({ kind, label, enabled, rect, onChange, onConfigure, configure }) => (
          <div
            key={kind}
            className="paper-identity-control"
            style={referenceRectPosition(rect)}
          >
            <button
              type="button"
              role="switch"
              className="paper-native-switch"
              data-kind={kind}
              aria-label={label}
              aria-checked={enabled}
              title={`${label}：${enabled ? "开启" : "关闭"}`}
              onClick={() => onChange?.(!enabled)}
            >
              <span>{label}</span>
              <svg viewBox="0 0 10 10" aria-hidden="true">
                <rect
                  x="1"
                  y="1"
                  width="8"
                  height="8"
                  fill={enabled ? "currentColor" : "white"}
                  stroke="currentColor"
                  strokeWidth=".7"
                />
                {enabled && (
                  <path
                    d="M2.4 5l1.7 1.8L7.8 3"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                  />
                )}
              </svg>
            </button>
            {enabled && (
              <button
                type="button"
                className="paper-native-configure"
                aria-label={configure}
                title={configure}
                onClick={onConfigure}
              >
                <svg viewBox="0 0 8 8" aria-hidden="true">
                  <path
                    d="M1 2.5l3 3 3-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth=".8"
                  />
                </svg>
              </button>
            )}
          </div>
        ),
      )}
    </>
  );
}
