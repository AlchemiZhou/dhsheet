"use client"
import { useCardArtworkStore } from '@/lib/card-artwork-store'

import React, { useMemo } from "react"
import { type StandardCard } from "@/card/card-types"
import { PrintImageCard } from "@/components/ui/print-image-card"
import { CardContent } from "@/components/ui/card-content"
import { useTextModeStore } from "@/lib/text-mode-store"
import { getPrintableCards } from "@/character/print-reference/cards"
import { useSheetStore } from "@/lib/sheet-store"

/**
 * 卡组打印区域组件
 *
 * 纯渲染组件，不负责状态追踪。
 */
interface CardDeckPrintSectionProps {
    cards: StandardCard[]
    title: string
}

const CardDeckPrintSection: React.FC<CardDeckPrintSectionProps> = ({ cards, title }) => {
    const { isTextMode: preferredTextMode } = useTextModeStore()
    const artworkEnabled = useCardArtworkStore(state => state.enabled)
    const isTextMode = preferredTextMode || !artworkEnabled

    // 按行分组，每行 3 张
    const cardRows = useMemo(() => {
        const rows: StandardCard[][] = []
        for (let i = 0; i < cards.length; i += 3) {
            rows.push(cards.slice(i, i + 3))
        }
        return rows
    }, [cards])

    if (cards.length === 0) {
        return null
    }

    return (
        <div className="print-deck-section">
            {/* 卡组标题 */}
            <div className="print-deck-header flex items-center justify-center">
                <div className="flex-1 h-px bg-gray-400"></div>
                <h2 className="px-3 text-sm font-medium text-gray-700">{title}</h2>
                <div className="flex-1 h-px bg-gray-400"></div>
            </div>

            {/* 卡牌网格 */}
            <div className="print-card-grid">
                {cardRows.map((row, rowIndex) => (
                    <div
                        key={`row-${rowIndex}`}
                        className={`grid grid-cols-3 gap-2 mt-2 print:gap-1 ${isTextMode ? 'card-row-text' : 'card-row'}`}
                    >
                        {row.map((card, cardIndex) => (
                            <div
                                key={`${rowIndex}-${cardIndex}`}
                                className={isTextMode ? "card-item-text" : "card-item"}
                            >
                                {isTextMode ? (
                                    <div className="border rounded p-2 bg-white text-xs h-full flex flex-col">
                                        <CardContent card={card} />
                                    </div>
                                ) : (
                                    <PrintImageCard card={card} />
                                )}
                            </div>
                        ))}

                        {/* 填充空白格子 */}
                        {Array.from({ length: 3 - row.length }).map((_, emptyIndex) => (
                            <div key={`empty-${rowIndex}-${emptyIndex}`} className="card-placeholder"></div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Print the loadout and vault in slot order on the same nine-card sheets. */
export function CharacterSheetPageFour() {
    const sheet = useSheetStore(state => state.sheetData)
    if (!sheet) return null

    const cards = getPrintableCards(sheet)
    const pages = []
    for (let start = 0; start < cards.length; start += 9) {
        pages.push(
            <div className="a4-page printed-card-sheet bg-white p-4" key={start}>
                <CardDeckPrintSection cards={cards.slice(start, start + 9)} title="角色卡牌" />
            </div>
        )
    }
    return <div className="printed-card-sheets w-full max-w-[210mm] mx-auto">{pages}</div>
}
