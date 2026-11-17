/** Keep the URL alive while the browser hands the file to its download service. */
export function downloadCharacterFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  try {
    link.href = url
    link.download = filename
    link.hidden = true
    document.body.appendChild(link)
    link.click()
  } finally {
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }
}
