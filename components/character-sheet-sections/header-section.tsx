"use client"

import type React from "react"
import { useState } from "react"
import { useAutoResizeFont } from "@/hooks/use-auto-resize-font"
import { getCardPreviewSize, useCardPreview } from "@/hooks/use-card-preview"
import { CardHoverPreview } from "@/components/ui/card-hover-preview"
import { useSheetStore } from "@/lib/sheet-store"
import { useTextModeStore } from "@/lib/text-mode-store"
import { PageHeader } from "@/components/page-header"
import { getSheetAncestryCard } from '@/character/ancestry/complete-card'

interface HeaderSectionProps {
  onOpenProfessionModal: () => void;
  onOpenAncestryModal: (field: string) => void;
  onOpenCommunityModal: () => void;
  onOpenSubclassModal: () => void;
  mixedAncestry: boolean;
  ancestryName?: string;
  onMixedAncestryChange: (enabled: boolean) => void;
}

export function HeaderSection({
  onOpenProfessionModal,
  onOpenAncestryModal,
  onOpenCommunityModal,
  onOpenSubclassModal,
  mixedAncestry,
  ancestryName,
  onMixedAncestryChange
}: HeaderSectionProps) {
  const { sheetData: formData, setSheetData, updateLevel } = useSheetStore()
  const { isTextMode } = useTextModeStore()
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const [levelEditingValue, setLevelEditingValue] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === 'level') {
      // 只允许空字符串或 1-10 的数字
      if (value === '' || /^([1-9]|10)$/.test(value)) {
        setLevelEditingValue(value)
      }
      // 非法输入直接忽略
    } else {
      setSheetData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleLevelFocus = () => {
    setLevelEditingValue(formData.level)
  }

  const handleLevelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()  // 触发失焦
    }
  }

  const handleLevelBlur = () => {
    const committedLevel = levelEditingValue ?? formData.level

    // 用于比较的数值（空视为1级）
    const oldLevelNum = parseInt(formData.level || "1")
    const newLevelNum = parseInt(committedLevel || "1")

    // 如果等级真的发生了变化，触发完整的等级更新逻辑
    if (oldLevelNum !== newLevelNum || committedLevel !== formData.level) {
      updateLevel(committedLevel)
    }

    // 清除编辑状态
    setLevelEditingValue(null)
  }

  const openProfessionModal = () => {
    onOpenProfessionModal()
  }

  const openAncestryModal = (field: string) => {
    onOpenAncestryModal(field)
  }

  const openCommunityModal = () => {
    onOpenCommunityModal()
  }

  const openSubclassModal = () => {
    onOpenSubclassModal()
  }

  const startEditingName = (field: string, currentValue: string) => {
    setEditingField(field)
    setEditingValue(currentValue || "")
  }

  const saveEditingName = () => {
    if (editingField) {
      setSheetData((prev) => ({
        ...prev,
        [editingField]: {
          ...(prev as any)[editingField],
          name: editingValue
        }
      }))
      setEditingField(null)
      setEditingValue("")
    }
  }

  const cancelEditing = () => {
    setEditingField(null)
    setEditingValue("")
  }

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveEditingName()
    } else if (e.key === 'Escape') {
      cancelEditing()
    }
  }

  const { getElementProps } = useAutoResizeFont({
    maxFontSize: 14,
    minFontSize: 10
  })

  const completeAncestryCard = getSheetAncestryCard(formData)
  const {
    hoveredCard,
    previewPosition,
    handleMouseEnter,
    handleMouseLeave
  } = useCardPreview({
    cards: (formData.cards || []).map(card => completeAncestryCard && card.id === completeAncestryCard.id ? completeAncestryCard : card),
    previewSize: getCardPreviewSize(isTextMode),
  })

  const renderChoiceControl = (
    field: 'professionRef' | 'subclassRef' | 'communityRef' | 'ancestry1Ref' | 'ancestry2Ref',
    onSelect: () => void,
    placeholder: string,
    displayName?: string,
  ) => {
    const reference = formData[field]
    if (editingField === field) {
      return <input
        type="text"
        aria-label={`编辑${placeholder.replace('选择', '')}名称`}
        value={editingValue}
        onChange={(e) => setEditingValue(e.target.value)}
        onKeyDown={handleEditKeyDown}
        onBlur={saveEditingName}
        className="h-7 w-full min-w-0 rounded border border-gray-400 bg-white px-2 text-xs text-gray-800 focus:border-blue-500 focus:outline-none"
        autoFocus
      />
    }
    return <div
      className="group flex h-7 min-h-7 min-w-0 flex-1 overflow-hidden rounded border border-gray-400 bg-white"
      onMouseEnter={(e) => handleMouseEnter(reference, e.currentTarget)}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 truncate px-2 py-0.5 text-left text-xs text-gray-800 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
      >
        {displayName || reference?.name || <span className="print:hidden">{placeholder}</span>}
      </button>
      {reference?.name && <button
        type="button"
        onClick={() => startEditingName(field, reference.name)}
        className="flex w-7 shrink-0 items-center justify-center border-l border-gray-300 text-gray-500 opacity-0 transition-opacity hover:bg-gray-50 focus:outline-none group-hover:opacity-100 group-focus-within:opacity-100 print:hidden"
        title="编辑名称"
      >
        <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M11.498 1.5a.5.5 0 0 1 .707 0l2.295 2.295a.5.5 0 0 1 0 .707l-9.435 9.435a.5.5 0 0 1-.354.146H1.5a.5.5 0 0 1-.5-.5v-3.211a.5.5 0 0 1 .146-.354L10.582 1.5h.916zm-1 2.207-8.646 8.646v2.36h2.36l8.647-8.647L10.498 3.707z" />
        </svg>
      </button>}
    </div>
  }

  return (
    <div className="relative flex items-center gap-4 rounded-t-md bg-gray-800 p-2 pb-5 text-white">
      <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)] items-end gap-x-3 gap-y-2">
        <div className="flex min-w-0 flex-col gap-1" role="group" aria-label="职业">
          <span className="text-[9px] text-gray-300">职业</span>
          {renderChoiceControl('professionRef', openProfessionModal, '选择职业')}
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <label htmlFor="character-name" className="text-[9px] text-gray-300">名称</label>
          <input
            id="character-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            {...getElementProps(formData.name, 'character-name')}
            className="h-7 w-full min-w-0 rounded border border-gray-400 bg-white px-2 text-xs text-gray-800 focus:outline-none print-empty-hide"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-1" role="group" aria-label="社群">
          <span className="text-[9px] text-gray-300">社群</span>
          {renderChoiceControl('communityRef', openCommunityModal, '选择社群')}
        </div>
        <div className="flex min-w-0 flex-col gap-1" role="group" aria-label="子职业">
          <span className="text-[9px] text-gray-300">子职业</span>
          {renderChoiceControl('subclassRef', openSubclassModal, '选择子职业')}
        </div>
        <div className="flex min-w-0 flex-col gap-1" role="group" aria-label="种族">
          <span className="text-[9px] text-gray-300">种族</span>
          <div className="flex min-w-0 items-center gap-1">
            {renderChoiceControl('ancestry1Ref', () => openAncestryModal('ancestry1'), '选择种族', !mixedAncestry ? ancestryName : undefined)}
            {mixedAncestry && <>
              <span className="shrink-0 text-xs">+</span>
              {renderChoiceControl('ancestry2Ref', () => openAncestryModal('ancestry2'), '选择种族')}
            </>}
          </div>
        </div>
        <div className="flex h-7 min-w-0 items-center print:invisible">
          <button
            type="button"
            role="switch"
            aria-checked={mixedAncestry}
            onClick={() => onMixedAncestryChange(!mixedAncestry)}
            className={`inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-[11px] font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${mixedAncestry ? 'border-red-300 bg-red-600 text-white hover:bg-red-500' : 'border-gray-300 bg-white text-gray-800 hover:bg-sky-100'}`}
          >
            <span aria-hidden="true" className={`relative h-3.5 w-6 shrink-0 rounded-full ${mixedAncestry ? 'bg-red-200' : 'bg-gray-300'}`}>
              <span className={`absolute left-0 top-0.5 h-2.5 w-2.5 rounded-full bg-white shadow transition-transform ${mixedAncestry ? 'translate-x-3' : 'translate-x-0.5'}`} />
            </span>
            混血：{mixedAncestry ? '开启' : '关闭'}
          </button>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-center self-center">
        <div className="w-16 h-16 bg-white text-gray-800 rounded-md border-4 border-gray-600 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xs font-bold">LEVEL</div>
            <input
              type="text"
              name="level"
              value={levelEditingValue ?? formData.level}
              placeholder="1"
              onChange={handleInputChange}
              onFocus={handleLevelFocus}
              onBlur={handleLevelBlur}
              onKeyDown={handleLevelKeyDown}
              className="w-8 text-center border-b border-gray-400 focus:outline-none text-xl font-bold print-empty-hide"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            // 如果当前等级为空或无效，升到1级
            if (!formData.level || formData.level.trim() === "") {
              updateLevel("1")
              return
            }

            const currentLevel = parseInt(formData.level)
            // 如果当前等级大于等于10，不再升级
            if (currentLevel >= 10) {
              return
            }

            // 否则加1，最大为10
            const newLevel = Math.min(currentLevel + 1, 10)
            updateLevel(String(newLevel))
          }}
          className="mt-1 px-2 py-0.5 bg-gray-600 hover:bg-gray-500 text-white text-[10px] font-bold rounded print:hidden transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
          disabled={parseInt(formData.level) >= 10}
        >
          Level Up!
        </button>
      </div>
      <div className="absolute bottom-0.5 left-2 [&>div]:m-0 [&>div]:p-0"><PageHeader /></div>
      {hoveredCard && (
        <div className="z-50 pointer-events-none" style={previewPosition}>
          <CardHoverPreview card={hoveredCard} isTextMode={isTextMode} />
        </div>
      )}
    </div>
  )
}
