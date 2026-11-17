"use client";
import { useState, type CSSProperties } from "react";
import { Skull, BookOpen } from "lucide-react";
import type { StandardCard } from "@/card/card-types";
import { getDomainCardLabel } from "@/card/display/domain-label";
import { getBasePath } from "@/lib/utils";
import "./domain-card-label.css";

/** Structural identifiers stay readable with hidden or unavailable illustrations. */
export function DomainCardLabel({
  card,
  variant = "inline",
}: {
  card: StandardCard;
  variant?: "inline" | "ribbon";
}) {
  const [failedAsset, setFailedAsset] = useState<string>();
  const label = getDomainCardLabel(card);
  if (!label) return null;
  const Icon = label.id === "dread" ? Skull : BookOpen;
  const illustrated = Boolean(label.asset && failedAsset !== label.asset);
  const ink =
    illustrated && (label.id === "bone" || label.id === "splendor")
      ? "#292929"
      : "#ffffff";
  const ribbon = variant === "ribbon";
  return (
    <span
      className={`domain-card-label${ribbon ? " domain-card-label--ribbon" : ""}`}
      role={ribbon ? "img" : undefined}
      data-domain={label.id || "custom"}
      data-card-level={label.level}
      aria-label={`${label.name}领域，${label.level ? `等级 ${label.level}` : "未标等级"}`}
      style={
        {
          "--card-domain-color": label.color,
        } as CSSProperties
      }
    >
      {illustrated ? (
        <img
          className="domain-label-art"
          data-domain-ribbon
          src={`${getBasePath()}${label.asset}`}
          width={ribbon ? 37 : 14}
          height={ribbon ? 58 : 22}
          alt=""
          loading="eager"
          draggable={false}
          onError={() => setFailedAsset(label.asset)}
        />
      ) : ribbon ? (
        <svg
          className="domain-ribbon-fallback"
          viewBox="0 0 37 58"
          aria-hidden="true"
        >
          <path
            className="domain-ribbon-field"
            d="M1 0H36V48L25 57L18.5 50L12 57L1 48Z"
          />
          <path
            className="domain-ribbon-edge"
            d="M1 0V48L12 57L18.5 50L25 57L36 48V0M4 0V45L13 52L18.5 46L24 52L33 45V0"
          />
          <Icon x={12} y={32} width={13} height={13} stroke="#ffffff" />
        </svg>
      ) : (
        <span className="domain-label-fallback" aria-hidden="true">
          <Icon size={11} />
        </span>
      )}
      {ribbon ? (
        <svg
          className="domain-ribbon-number"
          viewBox="0 0 37 58"
          aria-hidden="true"
        >
          <text
            x="18.5"
            y="21"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="700"
            fontSize={(label.level?.length || 1) > 1 ? 17 : 19}
            fill={ink}
            stroke={ink}
            strokeWidth=".3"
          >
            {label.level || "?"}
          </text>
        </svg>
      ) : (
        <>
          <span className="domain-label-name">{label.name}</span>
          <span className="domain-label-level">
            {label.level ? `Lv.${label.level}` : "未标等级"}
          </span>
        </>
      )}
    </span>
  );
}
