import { prefersPDFFileExport } from '@/lib/mobile-viewport'
import { getBasePath } from '@/lib/utils'

export function ReferenceBackground({ asset, alt }: { asset: string; alt: string }) {
  const folder = getBasePath() + '/print-templates/'
  const compact = folder + 'mobile/' + asset + '.png'
  const original = folder + asset + '.webp'
  const mobile = typeof window !== 'undefined' && prefersPDFFileExport(window)
  const primary = mobile ? compact : original
  const fallback = mobile ? original : compact
  return <img
    key={primary}
    className="reference-background"
    src={primary}
    alt={alt}
    loading="eager"
    data-print-retry-src={compact}
    onError={event => {
      const image = event.currentTarget
      if (image.getAttribute('src') === primary) image.src = fallback
    }}
  />
}
