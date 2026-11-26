// Match the 2x A4 raster used by the PDF exporter. Large originals stay available for desktop printing.
const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')

async function prepare() {
  const source = path.join(__dirname, '../public/print-templates')
  const output = path.join(source, 'mobile')
  await fs.mkdir(output, { recursive: true })
  for (const file of await fs.readdir(source)) {
    if (!file.endsWith('.webp')) continue
    await sharp(path.join(source, file))
      .resize({ width: 1588, withoutEnlargement: true })
      .png()
      .toFile(path.join(output, path.basename(file, '.webp') + '.png'))
  }
}

prepare().catch(error => {
  console.error(error)
  process.exitCode = 1
})
