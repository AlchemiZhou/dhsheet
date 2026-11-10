"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface ModalHeaderProps {
  title: string
  subtitle?: string | React.ReactNode
  onClose: () => void
  actions?: React.ReactNode
  className?: string
}

export function ModalHeader({
  title, subtitle, onClose, actions, className,
}: ModalHeaderProps) {
  return (
    <div className={cn("card-modal-heading p-4 flex items-center justify-between", className)}>
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          {subtitle && <span className="text-sm text-gray-500">{subtitle}</span>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <button
        type="button"
        aria-label="关闭卡牌选择"
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
      >
        ✕
      </button>
    </div>
  )
}
