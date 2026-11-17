import type { CSSProperties } from "react";
import { Skull, BookOpen } from "lucide-react";
import type { StandardCard } from "@/card/card-types";
import { getDomainCardLabel } from "@/card/display/domain-label";
import { getBasePath } from "@/lib/utils";
import "./domain-card-label.css";

/** A structural domain/level identifier, independent of optional card illustrations. */
export function DomainCardLabel({ card }: { card: StandardCard }) {
  const label = getDomainCardLabel(card);
  if (!label) return null;
  const Icon = label.id === "dread" ? Skull : BookOpen;
  return (
    <span
      className="domain-card-label"
      data-domain={label.id || "custom"}
      aria-label={`${label.name}领域，${label.level ? `等级 ${label.level}` : "未标等级"}`}
      style={{ "--card-domain-color": label.color } as CSSProperties}
    >
      {label.asset ? (
        <img
          className="domain-label-art"
          data-domain-ribbon
          src={`${getBasePath()}${label.asset}`}
          width={14}
          height={22}
          alt=""
          loading="eager"
        />
      ) : (
        <span className="domain-label-fallback" aria-hidden="true">
          <Icon size={11} />
        </span>
      )}
      <span className="domain-label-name">{label.name}</span>
      <span className="domain-label-level">
        {label.level ? `Lv.${label.level}` : "未标等级"}
      </span>
    </span>
  );
}
