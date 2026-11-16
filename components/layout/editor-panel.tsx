import type { ReactNode } from "react";
import { getBasePath } from "@/lib/utils";

/** The bevelled section frame used by the native character card. */
export function EditorPanel({
  title,
  children,
  action,
  className = "",
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`native-panel ${className}`} aria-label={title}>
      <div className="native-panel-heading">
        <h3>
          {title}
          {action}
        </h3>
      </div>
      <div className="native-panel-content">{children}</div>
    </section>
  );
}

export function EditorTypeface() {
  return (
    <style>{`@font-face{font-family:'Reference Ink';src:url('${getBasePath()}/print-templates/form-ink.woff2') format('woff2');font-display:swap}`}</style>
  );
}
