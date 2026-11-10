"use client"

import React from "react"
import type { StandardCard, ExtendedStandardCard } from "@/card/card-types"
import { ImageCard } from "@/components/ui/image-card"
import { SelectableCard } from "@/components/ui/selectable-card"
import { useTextModeStore } from "@/lib/text-mode-store"
import { cn } from "@/lib/utils"
import { isCompleteAncestryCard } from '@/character/ancestry/complete-card'
import { CompleteAncestryCardView } from '@/components/ui/complete-ancestry-card'

interface CardGridProps<T extends StandardCard | ExtendedStandardCard> {
  cards: T[]
  onCardClick?: (card: T) => void
  isTextMode?: boolean
  selectedCardId?: string
  refreshTrigger?: number
  className?: string
}

export function CardGrid<T extends StandardCard | ExtendedStandardCard>({
  cards, onCardClick, isTextMode: isTextModeProp,
  selectedCardId, refreshTrigger, className,
}: CardGridProps<T>) {
  const { isTextMode: globalTextMode } = useTextModeStore()
  const isTextMode = isTextModeProp ?? globalTextMode
  const hasCompleteAncestryCards = cards.some(isCompleteAncestryCard)

  return (
    <div
      className={cn(
        "grid gap-4 justify-items-center",
        hasCompleteAncestryCards
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          : isTextMode
          ? "grid-cols-[repeat(auto-fit,minmax(min(18rem,100%),18rem))] justify-center"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {cards.map((card, index) =>
        isCompleteAncestryCard(card) ? (
          <CompleteAncestryCardView key={card.id} card={card} onClick={() => onCardClick?.(card)} selected={card.id === selectedCardId} />
        ) : isTextMode ? (
          <SelectableCard
            key={card.id}
            card={card}
            onClick={() => onCardClick?.(card)}
            isSelected={card.id === selectedCardId}
          />
        ) : (
          <ImageCard
            key={card.id}
            card={card}
            onClick={() => onCardClick?.(card)}
            isSelected={card.id === selectedCardId}
            priority={index < 6}
            refreshTrigger={refreshTrigger}
          />
        )
      )}
    </div>
  )
}
