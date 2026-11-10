"use client"
import type { CSSProperties } from 'react'
import { Sparkles, Swords, Bone, BookOpen, Drama, Moon, Leaf, Sun, Shield, Skull } from 'lucide-react'
import { useCardStore } from '@/card/stores/unified-card-store'
import { useSheetStore } from '@/lib/sheet-store'
import { DOMAIN_COLORS, DOMAIN_NAMES, PROFESSION_THEMES, resolveDomainId, resolveProfessionThemeId } from '@/character/appearance/theme'
const icons = { arcana: Sparkles, blade: Swords, bone: Bone, codex: BookOpen, grace: Drama, midnight: Moon, sage: Leaf, splendor: Sun, valor: Shield, dread: Skull }

export function ProfessionDomainBadges() {
  const ref = useSheetStore(state => state.sheetData.professionRef)
  const snapshot = useSheetStore(state => state.sheetData.cards?.[0])
  const cards = useCardStore(state => state.cards)
  const card = (ref?.id ? cards.get(ref.id) : undefined) ?? (snapshot?.type === 'profession' && snapshot.id ? snapshot : undefined)
  const id = resolveProfessionThemeId(card)
  const domains = id ? PROFESSION_THEMES[id].domains : [card?.cardSelectDisplay.item1, card?.cardSelectDisplay.item2].map(value => value ? resolveDomainId(value) : undefined)
  return <span className="profession-domain-badges inline-flex gap-1">
    {domains.map((domain, index) => {
      if (!domain) return null
      const Icon = icons[domain]
      const rawLabel = [card?.cardSelectDisplay.item1, card?.cardSelectDisplay.item2].find(value => value && resolveDomainId(value) === domain)
      return <span key={domain} className={`domain-badge domain-badge-${index === 0 ? 'primary' : 'secondary'}`} style={{ '--domain-color': DOMAIN_COLORS[domain] } as CSSProperties} title={`${rawLabel || DOMAIN_NAMES[domain]}领域`}><Icon size={10} aria-hidden="true" />{rawLabel || DOMAIN_NAMES[domain]}</span>
    })}
  </span>
}
