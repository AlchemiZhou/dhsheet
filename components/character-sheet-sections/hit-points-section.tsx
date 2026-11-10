"use client"

import type React from "react"
import { useState } from "react"
import { useSheetStore } from "@/lib/sheet-store"
import { ModifierFieldAnchor } from "@/components/modifiers/modifier-field-anchor"
import { CHARACTER_RESOURCE_LIMIT } from "@/character/resources/limits"

export function HitPointsSection() {
  const { sheetData: formData, setSheetData, commitModifierTargetValue } = useSheetStore()
  const [maxDrafts, setMaxDrafts] = useState<Partial<Record<"hpMax" | "stressMax", string>>>({})
  const [thresholdDrafts, setThresholdDrafts] = useState<Partial<Record<"minorThreshold" | "majorThreshold", string>>>({})
  const baseThresholds = formData.equipment.armorSlot.baseThresholds
  const level = Number(formData.level)
  const thresholdPlaceholder = (baseThreshold: number | null) => {
    if (baseThreshold === null || !Number.isFinite(level)) {
      return ""
    }
    return String(baseThreshold + level)
  }
  const numericMax = (value: unknown) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, CHARACTER_RESOURCE_LIMIT) : 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === "minorThreshold" || name === "majorThreshold") {
      setThresholdDrafts((drafts) => ({ ...drafts, [name]: value }))
      return
    }

    setSheetData((prev) => ({ ...prev, [name]: value }))
  }

  const commitTextTarget = (name: string, value: string) => {
    if (name === "minorThreshold" || name === "majorThreshold") {
      commitModifierTargetValue(name, value)
      setThresholdDrafts((drafts) => {
        const next = { ...drafts }
        delete next[name]
        return next
      })
    }
  }

  const handleMaxChange = (field: "hp" | "stress", value: string, commit = false) => {
    const maxField = `${field}Max` as "hpMax" | "stressMax"

    if (commit) {
      if (/^\d+$/.test(value)) {
        const intValue = parseInt(value) || 0
        if (intValue >= 1 && intValue <= CHARACTER_RESOURCE_LIMIT) {
          commitModifierTargetValue(maxField, intValue)
        }
      }
      setMaxDrafts((prev) => {
        const next = { ...prev }
        delete next[maxField]
        return next
      })
      return
    }

    setMaxDrafts((prev) => ({ ...prev, [maxField]: value }))
  }

  const maxInputValue = (field: "hp" | "stress") => {
    const maxField = `${field}Max` as "hpMax" | "stressMax"
    return maxDrafts[maxField] ?? formData[maxField] ?? ""
  }

  // 增加上限
  const handleIncreaseMax = (field: "hp" | "stress") => {
    const maxField = `${field}Max` as "hpMax" | "stressMax"
    const currentMax = numericMax(formData[maxField])
    if (currentMax < CHARACTER_RESOURCE_LIMIT) {
      handleMaxChange(field, String(currentMax + 1), true)
    }
  }

  // 减少上限
  const handleDecreaseMax = (field: "hp" | "stress") => {
    const maxField = `${field}Max` as "hpMax" | "stressMax"
    const currentMax = numericMax(formData[maxField])
    if (currentMax > 1) {
      handleMaxChange(field, String(currentMax - 1), true)
    }
  }

  const renderBoxes = (field: "hp" | "stress", max: number) => {
    const label = field === "hp" ? "生命" : "压力"
    const fieldArray = Array.from({ length: CHARACTER_RESOURCE_LIMIT }, (_, i) => Boolean(formData[field]?.[i]))

    const handleClick = (index: number) => {
      const newFieldData = [...fieldArray]
      const lastCheckedIndex = fieldArray.lastIndexOf(true)

      if (lastCheckedIndex === index) {
        // If clicking the last checked box, uncheck all
        for (let i = 0; i < newFieldData.length; i++) {
          newFieldData[i] = false
        }
      } else {
        // Otherwise, check up to the clicked box
        for (let i = 0; i < newFieldData.length; i++) {
          newFieldData[i] = i <= index
        }
      }
      setSheetData((prev) => ({ ...prev, [field]: newFieldData }))
    }

    return (
      <div role="group" aria-label={`${label}标记`} className="grid grid-cols-2 gap-3">
        {[0, 6].map((start) => (
          <div key={start} className="grid grid-cols-6 gap-1">
          {Array.from({ length: 6 }, (_, offset) => {
            const i = start + offset
            const isWithinMax = i < max
            const isChecked = fieldArray[i] || false

            return (
              <div
                key={`${String(field)}-${i}`}
                role="checkbox"
                aria-label={`${label}第${i + 1}格`}
                aria-checked={isChecked}
                aria-disabled={!isWithinMax}
                tabIndex={isWithinMax ? 0 : -1}
                className={`h-4 min-w-0 rounded-[3px] border-2 text-center text-[11px] leading-3 font-bold select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${isWithinMax ? "border-gray-800 cursor-pointer hover:ring-1 hover:ring-gray-400" : "border-gray-400 border-dashed"
                  } ${isChecked ? "sheet-filled-mark bg-gray-800 text-white" : "bg-white text-gray-800"}`}
                onClick={() => {
                  if (isWithinMax) {
                    handleClick(i)
                  }
                }}
                onKeyDown={(event) => {
                  if (isWithinMax && (event.key === " " || event.key === "Enter")) {
                    event.preventDefault()
                    handleClick(i)
                  }
                }}
              >{isChecked ? "×" : ""}</div>
            )
          })}
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="py-1 mb-1 print:mt-1.5">
      <h3 className="text-xs font-bold text-center mb-2.5">生命值与压力</h3>

      <div className="flex justify-between items-center gap-1">
        <div className="bg-gray-800 text-white text-[10px] p-1 text-center rounded-md flex-1">
          <div>轻度伤害</div>
          <div className="text-[8px] mt-0.5 text-gray-300">Mark 1 HP</div>
        </div>
        <input
          type="text"
          name="minorThreshold"
          value={thresholdDrafts.minorThreshold ?? formData.minorThreshold ?? ""}
          onChange={handleInputChange}
          onBlur={(event) => commitTextTarget(event.currentTarget.name, event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commitTextTarget(event.currentTarget.name, event.currentTarget.value)
              event.currentTarget.blur()
            }
          }}
          placeholder={thresholdPlaceholder(baseThresholds.minor)}
          className="w-10 text-center text-m border border-gray-400 rounded mx-1 placeholder-gray-400 print-empty-hide"
        />
        <div className="bg-gray-800 text-white text-[10px] p-1 text-center rounded-md flex-1">
          <div className="flex items-center justify-center">
            重度伤害
            <ModifierFieldAnchor target="minorThreshold" label="重伤阈值" size="compact" />
          </div>
          <div className="text-[8px] mt-0.5 text-gray-300">Mark 2 HP</div>
        </div>
        <input
          type="text"
          name="majorThreshold"
          value={thresholdDrafts.majorThreshold ?? formData.majorThreshold ?? ""}
          onChange={handleInputChange}
          onBlur={(event) => commitTextTarget(event.currentTarget.name, event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commitTextTarget(event.currentTarget.name, event.currentTarget.value)
              event.currentTarget.blur()
            }
          }}
          placeholder={thresholdPlaceholder(baseThresholds.major)}
          className="w-10 text-center text-m border border-gray-400 rounded mx-1 placeholder-gray-400 print-empty-hide"
        />
        <div className="bg-gray-800 text-white text-[10px] p-1 text-center rounded-md flex-1">
          <div className="flex items-center justify-center">
            严重伤害
            <ModifierFieldAnchor target="majorThreshold" label="严重阈值" size="compact" />
          </div>
          <div className="text-[8px] mt-0.5 text-gray-300">Mark 3 HP</div>
        </div>
      </div>

      <div className="mt-2 grid gap-1.5 print:gap-1">
        {(["hp", "stress"] as const).map((field) => {
          const label = field === "hp" ? "生命" : "压力"
          const buttonLabel = field === "hp" ? "HP" : "压力"
          const maxField = `${field}Max` as "hpMax" | "stressMax"
          const max = numericMax(formData[maxField])
          const marked = formData[field]?.slice(0, max).filter(Boolean).length ?? 0
          return (
            <div key={field} className="px-0 py-1 print:py-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex min-w-0 items-center gap-1">
                  <span className="text-xs font-bold">{label}</span>
                  <ModifierFieldAnchor target={maxField} label={`${label}上限`} size="compact" />
                  <span className="text-[10px] text-gray-600 tabular-nums">已标记 {marked} / {max || "—"}</span>
                </div>
                <div className="flex shrink-0 items-center gap-1 text-[10px]">
                  <span>上限</span>
                  <button
                    type="button"
                    onClick={() => handleDecreaseMax(field)}
                    disabled={max <= 1}
                    className="w-5 h-5 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-sm print:hidden"
                    title={`减少${buttonLabel}上限`}
                  >−</button>
                  <input
                    aria-label={`${label}最大值`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={maxInputValue(field)}
                    onChange={(event) => handleMaxChange(field, event.target.value)}
                    onBlur={(event) => handleMaxChange(field, event.currentTarget.value, true)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") event.currentTarget.blur()
                    }}
                    onFocus={(event) => event.target.select()}
                    className="w-7 h-5 text-center font-semibold tabular-nums border border-gray-400 rounded bg-white print:hidden"
                  />
                  <span className="hidden print:inline font-semibold tabular-nums">{max || "—"}</span>
                  <button
                    type="button"
                    onClick={() => handleIncreaseMax(field)}
                    disabled={max >= CHARACTER_RESOURCE_LIMIT}
                    className="w-5 h-5 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-sm print:hidden"
                    title={`增加${buttonLabel}上限`}
                  >＋</button>
                </div>
              </div>
              {renderBoxes(field, max)}
            </div>
          )
        })}
      </div>
    </div>
  )
}
