import type { ProfessionThemeId } from "@/character/appearance/theme";
import { getBasePath } from "@/lib/utils";

/** One original banner and geometry for both editable page headers. */
export function ProfessionHeaderArt({
  id,
  alt = "",
}: {
  id: ProfessionThemeId;
  alt?: string;
}) {
  return (
    <img
      className="native-profession-art"
      src={`${getBasePath()}/print-templates/profession-headers/${id}.webp`}
      width={264.431}
      height={74.071}
      alt={alt}
      draggable={false}
    />
  );
}
