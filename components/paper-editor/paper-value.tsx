"use client";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ReferenceFieldBox } from "@/character/print-reference/model";
export { referenceRectPosition as paperPosition } from "@/character/print-reference/layout";
import { referenceRectPosition as paperPosition } from "@/character/print-reference/layout";
export function PaperValue({
  label,
  value,
  box,
  onCommit,
  multiline = false,
  allowedDraft,
  live = false,
}: {
  label: string;
  value: string;
  box: ReferenceFieldBox;
  onCommit: (value: string) => void;
  multiline?: boolean;
  allowedDraft?: (value: string) => boolean;
  live?: boolean;
}) {
  const mobile = useIsMobile();
  const initialValue = useRef(value);
  const [active, setActive] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    if (!active) setDraft(value);
  }, [value, active]);
  const save = () => {
    if (!live || mobile || draft !== value) onCommit(draft);
    setActive(false);
  };
  const keyDown = (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (e.key === "Escape") {
      e.preventDefault();
      if (live && !mobile) onCommit(initialValue.current);
      setActive(false);
    }
    if (e.key === "Enter" && (!multiline || e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      save();
    }
  };
  const props = {
    "aria-label": `编辑${label}`,
    value: draft,
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      const next = e.target.value;
      if (!allowedDraft || allowedDraft(next)) {
        setDraft(next);
        if (live && !mobile) onCommit(next);
      }
    },
    onKeyDown: keyDown,
    autoFocus: true,
  };
  return (
    <>
      {active && !mobile ? (
        <div className="paper-inline-value" style={paperPosition(box.rect)}>
          {multiline ? (
            <textarea
              {...props}
              onBlur={save}
              style={{ fontSize: `${box.fontSize || 10}pt` }}
            />
          ) : (
            <input
              {...props}
              onBlur={save}
              style={{ fontSize: `${box.fontSize || 10}pt` }}
            />
          )}
        </div>
      ) : (
        <button
          type="button"
          className="paper-hit paper-value-hit"
          style={paperPosition(box.rect)}
          aria-label={`编辑${label}`}
          title={`编辑${label}`}
          onClick={() => {
            initialValue.current = value;
            setDraft(value);
            setActive(true);
          }}
        />
      )}
      <Dialog
        open={active && mobile}
        onOpenChange={(open) => {
          if (!open) setActive(false);
        }}
      >
        <DialogContent className="paper-mobile-value-dialog bg-white">
          <DialogTitle>编辑{label}</DialogTitle>
          <DialogDescription>完成后保存到角色卡。</DialogDescription>
          {multiline ? <textarea {...props} rows={10} /> : <input {...props} />}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setActive(false)}>
              取消
            </button>
            <button type="button" onClick={save}>
              完成
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
