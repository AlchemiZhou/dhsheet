"use client"

import React from 'react'
import type { SheetData } from '@/lib/sheet-data'
import { getVisiblePages } from '@/lib/page-registry'
import { useSheetAppearanceAttributes } from '@/components/sheet-appearance-provider'
import { SHEET_APPEARANCE_STYLES } from '@/character/appearance/styles'

interface PrintPageRendererProps {
  sheetData: SheetData
  excludePageIds?: readonly string[]
}

/**
 * 动态渲染打印页面
 * 根据页面注册信息和当前数据状态自动渲染所有可见页面
 */
export function PrintPageRenderer({ sheetData, excludePageIds = [] }: PrintPageRendererProps) {
  const appearanceAttributes = useSheetAppearanceAttributes()
  const visiblePages = getVisiblePages(sheetData).filter(page => !excludePageIds.includes(page.id))
  const lastPageIndex = visiblePages.length - 1
  
  return (
    <div {...appearanceAttributes} className={`pb-40 print:pb-0 ${appearanceAttributes.className}`}>
      {visiblePages.map((page, index) => {
        const Component = page.printComponent ?? page.component
        const isLastPage = index === lastPageIndex
        
        return (
          <div
            key={page.id}
            className={`${page.printClass} flex justify-center items-start ${
              isLastPage ? 'last-printed-page' : ''
            }`}
          >
            {index === 0 && <style>{SHEET_APPEARANCE_STYLES}</style>}
            <Component />
          </div>
        )
      })}
    </div>
  )
}
