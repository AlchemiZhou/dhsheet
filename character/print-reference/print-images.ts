/** Wait for the actual preview images, including artwork that is still being resolved. */
export async function waitForPrintImages(root: ParentNode): Promise<void> {
  const deadline = Date.now() + 30_000
  const retried = new Set<HTMLImageElement>()
  while (true) {
    const images = Array.from(root.querySelectorAll<HTMLImageElement>('img'))
    for (const image of images) {
      const compact = image.dataset.printRetrySrc
      if (compact && image.complete && !image.naturalWidth && !retried.has(image)) {
        // A failed request stays broken in the mounted preview. Each export gets one fresh attempt.
        retried.add(image)
        const url = new URL(compact, image.baseURI)
        url.searchParams.set('retry', String(Date.now()))
        image.src = url.href
      }
    }
    const pending = images.find(image => !image.complete || !image.naturalWidth)
    const artwork = root.querySelector<HTMLElement>('[data-pending-artwork]')
    if (!pending && !artwork) return
    if (Date.now() >= deadline) {
      throw new Error('「' + (pending?.alt || artwork?.dataset.pendingArtwork || '角色卡图片') + '」未能加载。请检查网络后重新导出。')
    }
    await new Promise<void>(resolve => setTimeout(resolve, 100))
  }
}
