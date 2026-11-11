"use client";
import { useEffect } from "react";
import { Undo2, Redo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSheetHistoryStore } from "@/lib/sheet-store";

export function SheetHistoryControls() {
  const history = useSheetHistoryStore();
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target?.closest("input,textarea,[contenteditable=true],[role=dialog]")
      )
        return;
      if (event.key.toLowerCase() === "z") {
        event.preventDefault();
        event.shiftKey
          ? useSheetHistoryStore.getState().redo()
          : useSheetHistoryStore.getState().undo();
      }
      if (event.key.toLowerCase() === "y") {
        event.preventDefault();
        useSheetHistoryStore.getState().redo();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);
  return (
    <div className="sheet-history-controls flex gap-1">
      <Button
        size="icon"
        aria-label="撤回"
        title="撤回 Ctrl+Z"
        disabled={!history.past.length}
        onClick={history.undo}
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        aria-label="重做"
        title="重做 Ctrl+Shift+Z"
        disabled={!history.future.length}
        onClick={history.redo}
      >
        <Redo2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
