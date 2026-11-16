"use client";
import { useSheetStore } from "@/lib/sheet-store";
import { getProfessionPreset } from "@/character/profession-setup/catalog";
import { ProfessionDomainBadges } from "@/components/profession-domain-badges";
import { createProfessionStory } from "@/character/profession-setup/story";
import { EditorTypeface } from "./editor-panel";

export function NativeBackHeader() {
  const profession = useSheetStore((s) => s.sheetData.cards?.[0]);
  const preset = getProfessionPreset(profession);
  return (
    <header className="native-back-header">
      <EditorTypeface />
      <div>
        <h2>{preset?.name || profession?.name || "角色指南"}</h2>
        <ProfessionDomainBadges />
      </div>
      <p>角色头像、背景与关系</p>
    </header>
  );
}

export function NativeProfessionGuide() {
  const { sheetData, setSheetData } = useSheetStore();
  const items = sheetData.cards?.[0]?.professionSpecial?.["起始物品"];
  return (
    <>
      <section className="native-starting-items" aria-label="初始物品">
        <h3>初始物品</h3>
        <p>一支火把、50 英尺长的绳索、基本补给品。</p>
        <p>一瓶次级治疗药水或一瓶次级耐力药水。</p>
        {items && <p>{String(items)}</p>}
      </section>
      <section className="native-appearance" aria-label="角色形象">
        <h3>角色形象</h3>
        <p>
          描述角色的外貌、衣着、性格与习惯。下方的背景与关系问题可以改写，也可以切换为自由背景和角色介绍。
        </p>
        <button
          type="button"
          onClick={(event) => {
            setSheetData((previous) => ({
              professionStory: {
                ...(previous.professionStory ??
                  createProfessionStory(previous.cards?.[0])),
                connectionsMode: "profile",
              },
            }));
            event.currentTarget
              .closest(".native-editor")
              ?.querySelector(".profession-story-section")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          填写角色介绍
        </button>
      </section>
    </>
  );
}
