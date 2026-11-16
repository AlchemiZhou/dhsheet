"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  CardType, // Import CardType
} from "@/card"
import { useCardStore } from "@/card/stores/unified-card-store"
import { useSheetStore, useSheetArmorBoxes, useSheetProficiency, useSafeSheetData, type ArmorSelectionInput, type WeaponSelectionInput } from "@/lib/sheet-store"

// Import modals
import { WeaponSelectionModal } from "@/components/modals/weapon-selection-modal"
import { ArmorSelectionModal } from "@/components/modals/armor-selection-modal"
import { GenericCardSelectionModal } from "@/components/modals/generic-card-selection-modal"
import { useCardAutomationSetupPrompt } from "@/components/card-automation-setup"

// Import sections
import { HeaderSection } from "@/components/character-sheet-sections/header-section"
import { AttributesSection } from "@/components/character-sheet-sections/attributes-section"
import { HitPointsSection } from "@/components/character-sheet-sections/hit-points-section"
import { HopeSection } from "@/components/character-sheet-sections/hope-section"
import { ExperienceSection } from "@/components/character-sheet-sections/experience-section"
import { GoldSection } from "@/components/character-sheet-sections/gold-section"
import { WeaponSection } from "@/components/character-sheet-sections/weapon-section"
import { ArmorSection } from "@/components/character-sheet-sections/armor-section"
import { InventorySection } from "@/components/character-sheet-sections/inventory-section"
import { InventoryWeaponSection } from "@/components/character-sheet-sections/inventory-weapon-section"
import ProfessionDescriptionSection from "@/components/character-sheet-sections/profession-description-section"
import { EditorPanel } from "@/components/layout/editor-panel"
import "@/components/layout/native-editor.css"
import { ModifierFieldAnchor } from "@/components/modifiers/modifier-field-anchor"
import { ExperienceProviderAnchor } from "@/components/modifiers/experience-provider-popover"
import { EquipmentProviderAnchor } from "@/components/modifiers/equipment-provider-popover"
import { parseNumberExpressionOr } from "@/lib/number-utils"
import { findAncestryPair } from "@/character/ancestry/pair"
import { toast } from "sonner"
import { getSelectedTransformationCard } from "@/character/transformation/actions"

type WeaponSlotSelection =
  | { slotType: "primary" | "secondary" }
  | { slotType: "inventory"; index: 0 | 1 }

interface CharacterSheetProps {
  currentCharacterId?: string | null
}

export default function CharacterSheet({ currentCharacterId }: CharacterSheetProps) {
  const {
    setSheetData: setFormData,
    selectCharacterChoiceCard,
    selectAncestryPair,
    selectTransformationCard,
    setTransformationEnabled,
    clearCharacterChoiceCard,
    handleProfessionChange: changeProfessionCard,
    setCardAbilityChoiceValuesForInstance,
    auditCardInstancesOnLoad,
    updateArmorBox,
    updateProficiency,
    selectArmorSlot,
    selectWeapon,
    commitModifierTargetValue,
    sheetLoadRevision,
  } = useSheetStore();
  const armorBoxes = useSheetArmorBoxes();
  const proficiency = useSheetProficiency();
  const safeFormData = useSafeSheetData();

  // 使用全局卡牌Store
  const store = useCardStore();
  const cardsInitialized = store.initialized;
  const cardsLoading = store.loading;
  const getRuntimeCardById = store.getCardById;
  const firstAncestry = store.getCardById(safeFormData.ancestry1Ref?.id || "")
  const mixedAncestry = safeFormData.mixedAncestry === true

  const setMixedAncestry = (enabled: boolean) => {
    if (!enabled && safeFormData.ancestry1Ref?.id) {
      const pair = firstAncestry && findAncestryPair(firstAncestry, store.cards.values())
      if (!firstAncestry || !pair) {
        toast.error('无法找到当前种族的完整特性，请先选择其他种族。')
        return
      }
      if (safeFormData.ancestry2Ref?.id !== pair.id) {
        const result = selectCharacterChoiceCard('ancestry2', { id: pair.id, name: pair.name }, pair)
        if (result.kind === 'failure') { toast.error(result.message); return }
        setupPrompt.handleSelectionResult(result)
      }
    } else if (!enabled && safeFormData.ancestry2Ref?.id) {
      toast.error('请先选择第一项种族特性，再关闭混血。')
      return
    }
    setFormData(prev => ({ ...prev, mixedAncestry: enabled }))
  }
  const lastAuditedSheetLoadRevisionRef = useRef<number | null>(null)

  // 在组件加载时确保系统已初始化
  useEffect(() => {
    if (!store.initialized) {
      store.initializeSystem();
    }
  }, [store.initialized, store.initializeSystem]);

  useEffect(() => {
    if (
      !cardsInitialized ||
      cardsLoading ||
      lastAuditedSheetLoadRevisionRef.current === sheetLoadRevision
    ) {
      return
    }

    lastAuditedSheetLoadRevisionRef.current = sheetLoadRevision
    auditCardInstancesOnLoad((templateId) => getRuntimeCardById(templateId) ?? undefined)
  }, [auditCardInstancesOnLoad, cardsInitialized, cardsLoading, getRuntimeCardById, sheetLoadRevision])

  // 模态框状态
  const [weaponModalOpen, setWeaponModalOpen] = useState(false)
  const [currentWeaponSlot, setCurrentWeaponSlot] = useState<WeaponSlotSelection>({ slotType: "primary" })
  const [showReserveWeapons, setShowReserveWeapons] = useState(false)
  const hasReserveWeapons = safeFormData.equipment.weaponSlots.inventory.some(slot => slot.name || slot.trait || slot.damage || slot.feature || slot.modifierContributions.length > 0)
  const [armorModalOpen, setArmorModalOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [currentModal, setCurrentModal] = useState<{ type: "profession" | "ancestry" | "community" | "subclass" | "transformation"; field?: string; levelFilter?: number }>({ type: "profession" })
  const [armorMaxDraft, setArmorMaxDraft] = useState<string | null>(null)
  const [evasionDraft, setEvasionDraft] = useState<string | null>(null)
  const setupPrompt = useCardAutomationSetupPrompt({
    sheetData: safeFormData,
    onSaveAbility: setCardAbilityChoiceValuesForInstance,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "armorMax") {
      setArmorMaxDraft(value)
      return
    }

    if (name === "evasion") {
      setEvasionDraft(value)
      return
    }

    setFormData((prev) => {
      return { ...prev, [name]: value };
    });
  }

  const handleModifierTargetCommit = (e: React.FocusEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget
    if (name === "evasion" || name === "armorMax") {
      commitModifierTargetValue(name, value)
      if (name === "armorMax") {
        setArmorMaxDraft(null)
      }
      if (name === "evasion") {
        setEvasionDraft(null)
      }
    }
  }



  // Helper function to map modal string type to CardType enum
  const getModalCardType = (modalType: "profession" | "ancestry" | "community" | "subclass" | "transformation"): Exclude<CardType, CardType.Domain> => {
    switch (modalType) {
      case "profession":
        return CardType.Profession;
      case "ancestry":
        return CardType.Ancestry;
      case "community":
        return CardType.Community;
      case "subclass":
        return CardType.Subclass;
      case "transformation":
        return CardType.Variant;
      // No default needed as modalType is a constrained union type
    }
  };

  const handleProfessionChange = (value: string) => {
    console.log(`handleProfessionChange called with ID: ${value}`);

    if (value === "none" || !value) {
      const result = changeProfessionCard(undefined, undefined)
      setupPrompt.handleSelectionResult(result)
    } else {
      if (cardsLoading) {
        console.warn('handleProfessionChange: Cards not loaded yet');
        return;
      }
      const professionCard = store.getCardById(value);
      if (professionCard && professionCard.type === CardType.Profession) {
        // 构建完整的职业名称，包含卡牌选择信息
        let fullName = professionCard.name;
        if (professionCard.cardSelectDisplay?.item1 && professionCard.cardSelectDisplay?.item2) {
          fullName = `${professionCard.name}  -  ${professionCard.cardSelectDisplay.item1}&${professionCard.cardSelectDisplay.item2}`;
        }

        const newRef = { id: professionCard.id, name: fullName };

        const result = changeProfessionCard(newRef, professionCard);
        setupPrompt.handleSelectionResult(result);
      } else {
        console.warn(`handleProfessionChange: Profession card not found for ID: ${value}`);
      }
    }
  }

  const handleAncestryChange = (field: string, value: string) => {
    console.log(`handleAncestryChange called for field: ${field}, ID: ${value}`);
    const kind = field === "ancestry1" ? "ancestry1" : "ancestry2";

    if (value === "none" || !value) {
      clearCharacterChoiceCard(kind)
      if (!mixedAncestry) clearCharacterChoiceCard("ancestry2")
      return
    }

    if (cardsLoading) {
      console.warn('handleAncestryChange: Cards not loaded yet');
      return;
    }

    const ancestryCard = store.getCardById(value);
    if (ancestryCard && ancestryCard.type === CardType.Ancestry) {
      if (!mixedAncestry) {
        const pair = findAncestryPair(ancestryCard, store.cards.values())
        if (!pair) { toast.error('无法找到该种族完整的两项特性，请检查卡包。'); return }
        const result = selectAncestryPair(ancestryCard, pair)
        if (result.kind === 'failure') toast.error(result.message)
        setupPrompt.handleSelectionResult(result)
        return
      }
      const result = selectCharacterChoiceCard(kind, { id: ancestryCard.id, name: ancestryCard.name }, ancestryCard)
      setupPrompt.handleSelectionResult(result)
    } else {
      console.warn(`handleAncestryChange: Ancestry card not found for ID: ${value} in field: ${field}`);
    }
  }

  const handleCommunityChange = (value: string) => {
    console.log(`handleCommunityChange called with ID: ${value}`);
    if (value === "none" || !value) {
      clearCharacterChoiceCard("community")
      return
    }

    if (cardsLoading) {
      console.warn('handleCommunityChange: Cards not loaded yet');
      return;
    }

    const communityCard = store.getCardById(value);
    if (communityCard && communityCard.type === CardType.Community) {
      const result = selectCharacterChoiceCard("community", { id: communityCard.id, name: communityCard.name }, communityCard)
      setupPrompt.handleSelectionResult(result)
    } else {
      console.warn(`handleCommunityChange: Community card not found for ID: ${value}`);
    }
  }

  const handleWeaponSelect = (input: WeaponSelectionInput) => {
    selectWeapon(currentWeaponSlot, input)
    setWeaponModalOpen(false)
  }

  const handleArmorSelect = (input: ArmorSelectionInput) => {
    selectArmorSlot(input)
    setArmorModalOpen(false)
  }

  // 模态框控制函数
  const openWeaponModal = (selection: WeaponSlotSelection) => {
    setCurrentWeaponSlot(selection)
    setWeaponModalOpen(true)
  }


  const openArmorModal = () => {
    setArmorModalOpen(true)
  }

  const openGenericModal = (
    type: "profession" | "ancestry" | "community" | "subclass" | "transformation", // Add subclass type
    field?: string,
    levelFilter?: number,
  ) => {
    setCurrentModal({ type, field, levelFilter })
    setModalOpen(true)
  }

  const closeGenericModal = () => {
    setModalOpen(false)
  }

  const openProfessionModal = () => openGenericModal("profession")
  const openAncestryModal = (field: string) => openGenericModal("ancestry", field, field === "ancestry1" ? 1 : 2)
  const openCommunityModal = () => openGenericModal("community")
  const openSubclassModal = () => openGenericModal("subclass") // Ensure subclass type is supported


  const handleSubclassChange = (value: string) => {
    console.log(`handleSubclassChange called with ID: ${value}`);
    if (value === "none" || !value) {
      clearCharacterChoiceCard("subclass")
      return
    }

    if (cardsLoading) {
      console.warn('handleSubclassChange: Cards not loaded yet');
      return;
    }

    const subclassCard = store.getCardById(value);
    if (subclassCard && subclassCard.type === CardType.Subclass) {
      const result = selectCharacterChoiceCard("subclass", { id: subclassCard.id, name: subclassCard.name }, subclassCard)
      setupPrompt.handleSelectionResult(result)
    } else {
      console.warn(`handleSubclassChange: Subclass card not found for ID: ${value}`);
    }
  }


  return (
    <>
      {/* 固定位置的按钮 - 移除建卡指引按钮，因为已经移到父组件 */}
      <div></div>

      <div className="w-full max-w-[210mm] mx-auto">
        <div
          className="a4-page sheet-primary-page native-editor p-2 bg-white text-gray-800 shadow-lg print:shadow-none rounded-md"
          style={{ width: "210mm" }}
        >
          {/* Header Section */}
          <HeaderSection
            onOpenProfessionModal={openProfessionModal}
            onOpenAncestryModal={openAncestryModal}
            onOpenCommunityModal={openCommunityModal}
            onOpenSubclassModal={openSubclassModal}
            mixedAncestry={mixedAncestry}
            ancestryName={firstAncestry?.class}
            onMixedAncestryChange={setMixedAncestry}
            transformationEnabled={safeFormData.transformationEnabled === true}
            transformationName={getSelectedTransformationCard(safeFormData)?.name}
            onOpenTransformationModal={() => openGenericModal('transformation')}
            onTransformationEnabledChange={enabled => {
              const result = setTransformationEnabled(enabled)
              if (result.kind === 'failure') toast.error(result.message)
            }}
          />

          <div className="native-summary">
            <div className="native-defenses">
                <div className="sheet-defense-row flex gap-4">
                  {/* Evasion Box */}
                  <div className="flex flex-col items-center justify-start">
                    <div className="w-24 h-24 flex flex-col rounded-lg overflow-hidden border border-gray-800">
                      <div className="bg-gray-800 text-white text-center py-1">
                        <div className="flex items-center justify-center text-ms font-bold">
                          闪避值
                          <ModifierFieldAnchor target="evasion" label="闪避" />
                        </div>
                      </div>
                      <div className="flex-1 bg-white flex flex-col items-center justify-end pb-2 px-1">
                        <input
                          type="text"
                          name="evasion"
                          value={evasionDraft ?? safeFormData.evasion}
                          onChange={handleInputChange}
                          onBlur={handleModifierTargetCommit}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              handleModifierTargetCommit(event)
                              event.currentTarget.blur()
                            }
                          }}
                          placeholder={safeFormData.cards[0]?.professionSpecial?.["起始闪避"]?.toString() || ""}
                          className="w-16 text-center bg-transparent border-b border-gray-400 focus:outline-none text-xl font-bold text-gray-800 placeholder-gray-400 print-empty-hide pb-1"
                        />
                        {safeFormData.cards[0]?.professionSpecial?.["起始闪避"] !== undefined ? (
                          <div className="text-[8px] text-gray-600">
                            职业初始：{safeFormData.cards[0].professionSpecial["起始闪避"]}
                          </div>
                        ) : (
                          <div className="text-[8px] text-transparent">占位</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Armor Box and Grid */}
                  <div className="sheet-armor-layout flex flex-col">
                    <div className="sheet-armor-layout flex gap-2">
                      <div className="w-24 h-24 flex flex-col rounded-lg overflow-hidden border border-gray-800">
                        <div className="bg-gray-800 text-white text-center py-1">
                          <div className="flex items-center justify-center text-ms font-bold">
                            护甲值
                            <ModifierFieldAnchor target="armorMax" label="护甲值" />
                          </div>
                        </div>
                        <div className="flex-1 bg-white flex flex-col items-center justify-end pb-2 px-1">
                          <input
                            type="text"
                            name="armorMax"
                            value={armorMaxDraft ?? safeFormData.armorMax ?? ""}
                            onChange={handleInputChange}
                            onBlur={handleModifierTargetCommit}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                handleModifierTargetCommit(event)
                                event.currentTarget.blur()
                              }
                            }}
                            placeholder={
                              safeFormData.equipment.armorSlot.baseArmorMax === null
                                ? ""
                                : String(safeFormData.equipment.armorSlot.baseArmorMax)
                            }
                            className="w-16 text-center bg-transparent border-b border-gray-400 focus:outline-none text-xl font-bold text-gray-800 placeholder-gray-400 print-empty-hide pb-1"
                          />
                          <div className="text-[8px] text-transparent">占位</div>
                        </div>
                      </div>
                      <div className="sheet-armor-track flex flex-col">
                        <div className="flex items-center">
                          <span className="test-center text-[10px] mr-1">护甲槽</span>
                        </div>
                        {/* Armor Boxes - 3 per row, 4 rows */}
                        <div className="grid grid-cols-3 gap-1">
                          {(() => {
                            const calculatedArmorValue = parseNumberExpressionOr(String(safeFormData.armorMax ?? "0"), 0);
                            return Array(12)
                              .fill(0)
                              .map((_, i) => (
                                <div
                                  key={`armor-box-${i}`}
                                  role="checkbox"
                                  aria-label={`护甲第${i + 1}槽`}
                                  aria-checked={Boolean(armorBoxes?.[i] && i < calculatedArmorValue)}
                                  aria-disabled={i >= calculatedArmorValue}
                                  tabIndex={i < calculatedArmorValue ? 0 : -1}
                                  className={`w-4 h-4 border ${i < calculatedArmorValue
                                    ? "border-gray-800 cursor-pointer"
                                    : "border-gray-400 border-dashed"
                                    } ${armorBoxes?.[i] && i < calculatedArmorValue ? "sheet-filled-mark bg-gray-800" : "bg-white"}`}
                                  onClick={() => i < calculatedArmorValue && updateArmorBox(i)}
                                  onKeyDown={event => {
                                    if (i < calculatedArmorValue && (event.key === ' ' || event.key === 'Enter')) {
                                      event.preventDefault()
                                      updateArmorBox(i)
                                    }
                                  }}
                                ></div>
                              ));
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
</div>
            <AttributesSection />
          </div>
          <div className="native-columns">
            <div className="native-column native-character-column">
              <EditorPanel title="生命值与压力"><HitPointsSection /></EditorPanel>
              <EditorPanel title="希望点"><HopeSection /></EditorPanel>
              <EditorPanel title="经历" action={<ExperienceProviderAnchor size="compact" />}><ExperienceSection /></EditorPanel>
              <EditorPanel title="金币"><GoldSection /></EditorPanel>
              <EditorPanel title="职业特性" className="native-features"><ProfessionDescriptionSection description={safeFormData.cards[0]?.description} /></EditorPanel>
            </div>
            <div className="native-column sheet-equipment">
              <EditorPanel title="装备武器">
                  <div className="sheet-proficiency flex items-center gap-0.5 mb-1">
                    <div className="flex items-center gap-0.5">
                      <span className="text-[10px]">熟练度</span>
                      <ModifierFieldAnchor target="proficiency" label="熟练度" size="compact" />
                    </div>
                    <div className="sheet-proficiency-marks flex items-center gap-0.5">
                    {Array(6)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={`prof-${i}`}
                          role="checkbox"
                          aria-label={`熟练度第${i + 1}点`}
                          aria-checked={Boolean(Array.isArray(proficiency) && proficiency[i])}
                          tabIndex={0}
                          className={`w-3 h-3 rounded-full border-2 border-gray-800 cursor-pointer ${Array.isArray(proficiency) && proficiency[i] ? "sheet-filled-mark bg-gray-800" : "bg-white"
                            }`}
                          onClick={() => updateProficiency(i)}
                          onKeyDown={event => {
                            if (event.key === ' ' || event.key === 'Enter') {
                              event.preventDefault()
                              updateProficiency(i)
                            }
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>

                <WeaponSection isPrimary={true} slotType="primary" onOpenWeaponModal={openWeaponModal} />
                <WeaponSection isPrimary={false} slotType="secondary" onOpenWeaponModal={openWeaponModal} />
              </EditorPanel>
              <EditorPanel title="装备护甲"><ArmorSection onOpenArmorModal={openArmorModal} /></EditorPanel>
              <EditorPanel title="背包" className="sheet-inventory"><InventorySection /></EditorPanel>
              <EditorPanel title="备用武器" className="sheet-inventory native-reserve" action={<EquipmentProviderAnchor slotRef={{ type: "inventoryWeapon", index: 0 }} fallbackLabel="备用武器 1" size="compact" />}>

                {!hasReserveWeapons && <button type="button" className="native-reserve-toggle print:hidden" aria-expanded={showReserveWeapons} onClick={() => setShowReserveWeapons(value => !value)}>{showReserveWeapons ? '收起备用武器' : '展开备用武器'}</button>}
                <div className="native-reserve-fields" data-collapsed={!hasReserveWeapons && !showReserveWeapons}>
                <InventoryWeaponSection index={0} onOpenWeaponModal={openWeaponModal} />
                <InventoryWeaponSection index={1} onOpenWeaponModal={openWeaponModal} />
                </div>
              </EditorPanel>
            </div>
          </div>
          <div className="native-footer">Daggerheart © Darrington Press 2025</div>
        </div>
      </div>

      {/* Modals */}
      <WeaponSelectionModal
        isOpen={weaponModalOpen}
        onClose={() => setWeaponModalOpen(false)}
        weaponSlotType={currentWeaponSlot.slotType}
        onSelect={handleWeaponSelect}
        title="选择武器"
      />

      <ArmorSelectionModal
        isOpen={armorModalOpen}
        onClose={() => setArmorModalOpen(false)}
        onSelect={handleArmorSelect}
        title="选择护甲"
      />

      {modalOpen && (
        <GenericCardSelectionModal
          isOpen={modalOpen}
          onClose={closeGenericModal}
          onSelect={(cardId, field) => {
            console.log(`GenericModal onSelect: Type: ${currentModal.type}, ID: ${cardId}, Field: ${field}`);
            if (currentModal.type === "profession") {
              handleProfessionChange(cardId)
            } else if (currentModal.type === "ancestry" && field) {
              handleAncestryChange(field, cardId)
            } else if (currentModal.type === "transformation") {
              const card = cardId === 'none' ? undefined : store.getCardById(cardId)
              if (cardId !== 'none' && !card) { toast.error('找不到该转变卡，请重新选择。'); return }
              const result = selectTransformationCard(card ?? undefined)
              if (result.kind === 'failure') toast.error(result.message)
              setupPrompt.handleSelectionResult(result)
            } else if (currentModal.type === "community") {
              handleCommunityChange(cardId)
            } else if (currentModal.type === "subclass") {
              handleSubclassChange(cardId)
            }
            closeGenericModal()
          }}
          title={
            currentModal.type === "profession"
              ? "选择职业"
              : currentModal.type === "ancestry"
                ? "选择种族"
                : currentModal.type === "transformation"
                  ? "选择转变卡"
                : currentModal.type === "community"
                  ? "选择社群"
                  : "选择子职业"
          }
          cardType={getModalCardType(currentModal.type)} // Use the helper function here
          field={currentModal.field}
          levelFilter={currentModal.levelFilter}
          completeAncestry={currentModal.type === 'ancestry' && !mixedAncestry}
          transformationOnly={currentModal.type === 'transformation'}
        />
      )}
      {setupPrompt.dialog}
    </>
  )
}
