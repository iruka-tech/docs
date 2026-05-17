import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const docsDir = path.join(root, 'docs')
const publicDir = path.join(docsDir, 'public')
const baseUrl = 'https://docs.iruka.tech'

const preferredOrder = [
  'index.md',
  'get-started/getting-started.md',
  'product/public-signal-model.md',
  'product/usage-limits.md',
  'product/definition.md',
  'product/dsl.md',
  'reference/api.md',
  'reference/external-triggers.md',
  'integrations/webhook-delivery.md',
  'integrations/telegram-delivery.md',
  'product/create-a-signal.md',
]

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'public') continue

    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(path.relative(docsDir, fullPath).split(path.sep).join('/'))
    }
  }

  return files
}

function stripFrontmatter(markdown) {
  if (!markdown.startsWith('---\n')) return markdown.trim()
  const end = markdown.indexOf('\n---\n', 4)
  return end === -1 ? markdown.trim() : markdown.slice(end + 5).trim()
}

function titleFor(markdown, relPath) {
  const match = markdown.match(/^#\s+(.+)$/m)
  if (match) return match[1].trim()
  return relPath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '').replace(/[-/]/g, ' ').trim()
}

function routeFor(relPath) {
  if (relPath === 'index.md') return '/'
  return `/${relPath.replace(/\.md$/, '')}`
}

const files = await walk(docsDir)
const ordered = [
  ...preferredOrder.filter(file => files.includes(file)),
  ...files.filter(file => !preferredOrder.includes(file)).sort(),
]

const pages = []
for (const relPath of ordered) {
  const raw = await readFile(path.join(docsDir, relPath), 'utf8')
  const markdown = stripFrontmatter(raw)
  pages.push({
    relPath,
    route: routeFor(relPath),
    title: titleFor(markdown, relPath),
    markdown,
  })
}

const llmsTxt = [
  '# Iruka Docs',
  '',
  '> Plain-markdown index for agents reading Iruka product, API, and integration documentation.',
  '',
  'Generated from the docs source.',
  '',
  '## Full plain-markdown export',
  '',
  '- [All Iruka docs as one markdown file](/llms-full.txt)',
  '',
  '## Docs pages',
  '',
  ...pages.map(page => `- [${page.title}](${page.route}): source \`${page.relPath}\``),
  '',
].join('\n')

const llmsFullTxt = [
  '# Iruka Docs — Full Plain Markdown Export',
  '',
  'Generated from the docs source.',
  '',
  `Canonical docs site: ${baseUrl}`,
  '',
  'This file concatenates the public markdown documentation so agents can read Iruka without crawling the rendered site.',
  '',
  '## Table of contents',
  '',
  ...pages.map(page => `- [${page.title}](#${page.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}) — ${page.relPath}`),
  '',
  ...pages.flatMap(page => [
    '---',
    '',
    `# ${page.title}`,
    '',
    `Source: \`${page.relPath}\``,
    '',
    `Canonical URL: ${baseUrl}${page.route}`,
    '',
    page.markdown.replace(/^#\s+.+$/m, '').trim(),
    '',
  ]),
].join('\n')

await mkdir(publicDir, { recursive: true })
await writeFile(path.join(publicDir, 'llms.txt'), llmsTxt)
await writeFile(path.join(publicDir, 'llms-full.txt'), llmsFullTxt)

console.log(`Generated docs/public/llms.txt and docs/public/llms-full.txt from ${pages.length} markdown files.`)
