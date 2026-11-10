"use client"

import type { CompleteAncestryCard } from '@/character/ancestry/complete-card'
import { CardMarkdown } from './card-markdown'

export function CompleteAncestryCardView({ card, onClick, selected = false }: {
  card: CompleteAncestryCard
  onClick?: () => void
  selected?: boolean
}) {
  const content = <>
    <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
      <h3 className="text-xl font-bold text-slate-900">{card.name}</h3>
      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">完整种族 · 双特性</span>
    </div>
    {card.hint && <p className="mt-3 text-xs italic text-slate-500">{card.hint}</p>}
    <div className="mt-4 space-y-4">
      {card.ancestryTraits.map((trait, index) => <section key={trait.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <h4 className="mb-2 font-semibold text-slate-900"><span className="mr-2 text-xs text-slate-500">特性{index === 0 ? '一' : '二'}</span>{trait.name}</h4>
        <div className="text-sm leading-relaxed text-slate-700"><CardMarkdown>{trait.description || '无描述。'}</CardMarkdown></div>
      </section>)}
    </div>
  </>
  const className = `flex w-full max-w-sm flex-col justify-start rounded-xl border-2 bg-white p-4 text-left shadow-md ${selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-300'} ${onClick ? 'cursor-pointer hover:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500' : ''}`
  return onClick
    ? <button type="button" className={className} onClick={onClick} aria-label={`选择${card.name}，包含两项种族特性`}>{content}</button>
    : <article className={className}>{content}</article>
}
