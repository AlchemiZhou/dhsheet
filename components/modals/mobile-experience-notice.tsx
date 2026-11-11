"use client"

import { useEffect, useState } from "react"
import { Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { getMobileExperienceNoticeDismissed, setMobileExperienceNoticeDismissed } from "@/lib/app-preferences"

export function MobileExperienceNotice({
  isMobile,
  onAcknowledge,
}: {
  isMobile: boolean
  onAcknowledge: () => void
}) {
  const [dismissed, setDismissed] = useState<boolean | null>(null)
  useEffect(() => setDismissed(getMobileExperienceNoticeDismissed()), [])

  const acknowledge = (remember: boolean) => {
    if (remember) setMobileExperienceNoticeDismissed(true)
    setDismissed(true)
    onAcknowledge()
  }

  return (
    <Dialog
      open={isMobile && dismissed === false}
      onOpenChange={(open) => {
        if (!open) acknowledge(false)
      }}
    >
      <DialogContent
        className="max-w-md border-t-4 border-t-red-800 bg-white p-5 print:hidden"
        onEscapeKeyDown={(event) => event.stopPropagation()}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-800">
          <Monitor aria-hidden="true" className="h-6 w-6" />
        </div>
        <DialogTitle className="pr-5 text-xl leading-7">使用电脑，体验更完整</DialogTitle>
        <DialogDescription className="text-base leading-7 text-gray-700">
          本在线车卡器以电脑端体验为基础设计。虽然手机端的适配已大幅提升，使用电脑仍能获得最佳体验。
        </DialogDescription>
        <p className="text-sm leading-6 text-gray-500">你也可以继续使用手机创建、编辑和查看角色。</p>
        <div className="flex flex-col gap-2">
          <Button
            className="min-h-11 bg-red-800 text-white hover:bg-red-900"
            onClick={() => acknowledge(false)}
          >
            知道了，继续使用
          </Button>
          <Button variant="ghost" className="min-h-11 text-gray-600" onClick={() => acknowledge(true)}>
            不再提醒
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
