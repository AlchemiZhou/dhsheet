"use client";
import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import "./story-writing.css";

export function FreeStoryEditor({
  label,
  value,
  onChange,
  placeholder,
  draft,
  onUseDraft,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  draft: string;
  onUseDraft: () => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="free-story-editor">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 print:hidden">
        <span className="text-xs text-gray-500">
          连续书写，自动保存 · {value.length} 字
        </span>
        <Button size="sm" variant="outline" onClick={() => setFocused(true)}>
          专注写作：{label}
        </Button>
      </div>
      <TextareaAutosize
        aria-label={label}
        minRows={16}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="free-story-text w-full rounded border border-gray-300 bg-white p-3 text-sm leading-7 focus:outline-none focus:ring-2 focus:ring-gray-300"
      />
      {!value && draft && (
        <Button
          variant="outline"
          size="sm"
          className="mt-2 print:hidden"
          onClick={onUseDraft}
        >
          用已有回答生成{label}草稿
        </Button>
      )}
      <Dialog open={focused} onOpenChange={setFocused}>
        <DialogContent className="story-focus-dialog flex h-[90dvh] max-w-3xl flex-col gap-3 bg-white p-4">
          <DialogTitle>{label} · 专注写作</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            不必逐题作答，想到哪里就写到哪里。内容会自动保存。
          </DialogDescription>
          <textarea
            aria-label={`${label}专注编辑`}
            autoFocus
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-0 flex-1 resize-none rounded border border-gray-300 p-3 text-base leading-8 focus:outline-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {value.length} 字 · 已同步到角色记录
            </span>
            <Button onClick={() => setFocused(false)}>完成写作</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
