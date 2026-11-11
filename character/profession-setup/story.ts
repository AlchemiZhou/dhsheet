import type { StandardCard } from "@/card/card-types";
import { getProfessionPreset } from "./catalog";

export interface StoryEntry {
  question: string;
  answer: string;
}
export interface ProfessionStory {
  professionId: string;
  background: StoryEntry[];
  connections: StoryEntry[];
  backgroundMode?: "questions" | "free";
  connectionsMode?: "questions" | "profile";
}
export function normalizeProfessionStory(
  value: unknown,
): ProfessionStory | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return undefined;
  const source = value as Partial<ProfessionStory>;
  const entries = (items: unknown): StoryEntry[] =>
    Array.from({ length: 3 }, (_, i) => {
      const entry = Array.isArray(items) ? items[i] : undefined;
      return {
        question: typeof entry?.question === "string" ? entry.question : "",
        answer: typeof entry?.answer === "string" ? entry.answer : "",
      };
    });
  return {
    professionId:
      typeof source.professionId === "string" ? source.professionId : "",
    background: entries(source.background),
    connections: entries(source.connections),
    ...(source.backgroundMode !== undefined
      ? {
          backgroundMode:
            source.backgroundMode === "free"
              ? ("free" as const)
              : ("questions" as const),
        }
      : {}),
    ...(source.connectionsMode !== undefined
      ? {
          connectionsMode:
            source.connectionsMode === "profile"
              ? ("profile" as const)
              : ("questions" as const),
        }
      : {}),
  };
}
export function createProfessionStory(
  card?: StandardCard,
  previous?: ProfessionStory,
): ProfessionStory {
  const preset = getProfessionPreset(card);
  const group = (key: "background" | "connections"): StoryEntry[] =>
    Array.from({ length: 3 }, (_, i) => ({
      question: preset?.[key][i] ?? "",
      answer: previous?.[key][i]?.answer ?? "",
    }));
  return {
    ...previous,
    professionId: card?.id ?? "",
    background: group("background"),
    connections: group("connections"),
  };
}

export function storyWritingModes(sheet: {
  professionStory?: ProfessionStory;
  characterBackground?: string;
  characterAppearance?: string;
}) {
  return {
    background:
      sheet.professionStory?.backgroundMode ??
      (sheet.characterBackground?.trim() ? "free" : "questions"),
    connections:
      sheet.professionStory?.connectionsMode ??
      (sheet.characterAppearance?.trim() ? "profile" : "questions"),
  } as const;
}

export function storyAnswersToDraft(entries: StoryEntry[]): string {
  return entries
    .filter((entry) => entry.answer.trim())
    .map((entry) =>
      [entry.question.trim(), entry.answer].filter(Boolean).join("\n"),
    )
    .join("\n\n");
}
