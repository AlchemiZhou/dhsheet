"use client";
import { Button } from "@/components/ui/button";
import "./mobile-equipment.css";
export function MobileEquipmentCard({
  name,
  tier,
  source,
  stats,
  feature,
  description,
  label,
  onChoose,
}: {
  name: string;
  tier: string;
  source: string;
  stats: Array<[string, string]>;
  feature?: string;
  description?: string;
  label: string;
  onChoose: () => void;
}) {
  return (
    <article className="mobile-equipment-card rounded-lg border border-gray-300 bg-white p-3">
      <header className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-gray-900">{name}</h3>
          <p className="mt-1 break-words text-xs text-gray-500">{source}</p>
        </div>
        <span className="rounded bg-gray-100 px-2 py-1 text-sm font-semibold">
          {tier}
        </span>
      </header>
      <dl className="grid grid-cols-2 gap-2 rounded bg-gray-50 p-2">
        {stats.map(([key, value]) => (
          <div key={key}>
            <dt className="text-xs text-gray-500">{key}</dt>
            <dd className="break-words text-sm font-medium text-gray-900">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      {(feature || description) && (
        <div className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
          {feature && <p className="font-semibold text-gray-900">{feature}</p>}
          {description && <p>{description}</p>}
        </div>
      )}
      <Button
        aria-label={label}
        className="mt-3 min-h-11 w-full"
        onClick={onChoose}
      >
        {label.startsWith("套用") ? "套用为自定义起点" : "选择这件装备"}
      </Button>
    </article>
  );
}
