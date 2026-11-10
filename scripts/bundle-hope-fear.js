#!/usr/bin/env node

// Convert the supplied legacy resource ZIP into bundled data and static images.
// Only cards.json and images belonging to its card IDs are read.
const fs = require('fs/promises')
const path = require('path')
const { createHash } = require('crypto')
const JSZip = require('jszip')

async function main() {
  const input = process.argv[2]
  if (!input) throw new Error('Usage: node scripts/bundle-hope-fear.js <resource.zip>')
  const archive = await JSZip.loadAsync(await fs.readFile(input))
  const payloadFile = archive.file('cards.json')
  if (!payloadFile) throw new Error('Missing cards.json')
  const payload = JSON.parse(await payloadFile.async('string'))
  const root = path.join(__dirname, '..')
  const images = path.join(root, 'public/image/hope-fear')
  const groups = ['profession', 'ancestry', 'community', 'subclass', 'domain', 'variant']
  const ids = new Set()
  const writes = []

  for (const group of groups) {
    if (!Array.isArray(payload[group])) throw new Error(`Missing card group: ${group}`)
    for (const card of payload[group]) {
      if (typeof card.id !== 'string' || !card.id || ids.has(card.id)) throw new Error('Invalid or duplicate card ID')
      ids.add(card.id)
      const image = archive.file(`images/${card.id}.webp`)
      card.hasLocalImage = false
      card.imageUrl = 'empty-card.webp'
      if (image) {
        // Safe on Windows too: source IDs can contain Chinese text and colons.
        const name = createHash('sha256').update(card.id).digest('hex').slice(0, 24) + '.webp'
        const bytes = await image.async('nodebuffer')
        if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') {
          throw new Error(`Invalid WebP for ${card.id}`)
        }
        writes.push({ name, bytes })
        card.imageUrl = `hope-fear/${name}`
      }
    }
  }

  await fs.mkdir(images, { recursive: true })
  for (const image of writes) await fs.writeFile(path.join(images, image.name), image.bytes)
  await fs.writeFile(path.join(root, 'data/cards/builtin-hope-fear.json'), JSON.stringify(payload, null, 2) + '\n')
  console.log(`Bundled ${ids.size} cards and ${writes.length} images from ${payload.name} ${payload.version}`)
}

main().catch(error => { console.error(error.message); process.exitCode = 1 })
