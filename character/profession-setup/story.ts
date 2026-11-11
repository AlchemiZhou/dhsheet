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
    professionId: card?.id ?? "",
    background: group("background"),
    connections: group("connections"),
  };
}
