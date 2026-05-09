import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')
const distDir = join(projectRoot, 'dist')

const routePages = [
  {
    path: 'natpaper',
    title: 'NATpaper — DMT-NAT Bitcoin Security Budget White Paper',
    description:
      'Read the NATpaper: DMT-NAT’s thesis for reinforcing Bitcoin’s long-term security budget, miner incentives, and proof-of-work economics.',
    canonical: 'https://natgmi.com/natpaper',
    image: 'https://natgmi.com/natpaper-og-v2.png',
    imageType: 'image/png',
    imageWidth: '1200',
    imageHeight: '630',
    imageAlt: 'NATpaper — DMT-NAT Bitcoin Security Budget White Paper',
  },
]

function setTitle(html, title) {
  return html.replace(/<title>.*?<\/title>/s, `<title>${title}</title>`)
}

function setOrInsertMeta(html, selectorAttr, selectorValue, content) {
  const attr = selectorAttr === 'property' ? 'property' : 'name'
  const escaped = selectorValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`<meta\\s+${attr}=["']${escaped}["'][^>]*>`, 'i')
  const tag = `<meta ${attr}="${selectorValue}" content="${content}" />`

  if (re.test(html)) return html.replace(re, tag)
  return html.replace('</head>', `    ${tag}\n  </head>`)
}

function setOrInsertCanonical(html, href) {
  const tag = `<link rel="canonical" href="${href}" />`
  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
    return html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, tag)
  }
  return html.replace('</head>', `    ${tag}\n  </head>`)
}

function buildRouteHtml(baseHtml, page) {
  let html = baseHtml
  html = setTitle(html, page.title)
  html = setOrInsertMeta(html, 'name', 'description', page.description)
  html = setOrInsertMeta(html, 'name', 'robots', 'index, follow')
  html = setOrInsertCanonical(html, page.canonical)

  html = setOrInsertMeta(html, 'property', 'og:type', 'article')
  html = setOrInsertMeta(html, 'property', 'og:url', page.canonical)
  html = setOrInsertMeta(html, 'property', 'og:title', page.title)
  html = setOrInsertMeta(html, 'property', 'og:description', page.description)
  html = setOrInsertMeta(html, 'property', 'og:image', page.image)
  html = setOrInsertMeta(html, 'property', 'og:image:secure_url', page.image)
  html = setOrInsertMeta(html, 'property', 'og:image:type', page.imageType)
  html = setOrInsertMeta(html, 'property', 'og:image:width', page.imageWidth)
  html = setOrInsertMeta(html, 'property', 'og:image:height', page.imageHeight)
  html = setOrInsertMeta(html, 'property', 'og:image:alt', page.imageAlt)
  html = setOrInsertMeta(html, 'property', 'og:site_name', 'NATGMI')

  html = setOrInsertMeta(html, 'name', 'twitter:card', 'summary_large_image')
  html = setOrInsertMeta(html, 'name', 'twitter:site', '@NATGMI')
  html = setOrInsertMeta(html, 'name', 'twitter:creator', '@NATGMI')
  html = setOrInsertMeta(html, 'name', 'twitter:url', page.canonical)
  html = setOrInsertMeta(html, 'name', 'twitter:title', page.title)
  html = setOrInsertMeta(html, 'name', 'twitter:description', page.description)
  html = setOrInsertMeta(html, 'name', 'twitter:image', page.image)
  html = setOrInsertMeta(html, 'name', 'twitter:image:alt', page.imageAlt)

  return html
}

const baseHtml = readFileSync(join(distDir, 'index.html'), 'utf8')

for (const page of routePages) {
  const html = buildRouteHtml(baseHtml, page)
  const outputDir = join(distDir, page.path)
  mkdirSync(outputDir, { recursive: true })
  writeFileSync(join(outputDir, 'index.html'), html)
  writeFileSync(join(distDir, `${page.path}.html`), html)
  console.log(`Created route metadata page: /${page.path}`)
}
