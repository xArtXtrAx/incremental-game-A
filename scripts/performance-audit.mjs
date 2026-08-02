import { readFile, readdir, stat } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import process from 'node:process'

const ROOT = resolve(process.cwd())
const SOURCE_ROOT = resolve(ROOT, 'src')
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx'])
const JSON_OUTPUT = process.argv.includes('--json')

const PATTERNS = [
  { id: 'intervals', label: 'setInterval', regex: /\bsetInterval\s*\(/g },
  {
    id: 'animationFrames',
    label: 'requestAnimationFrame',
    regex: /\brequestAnimationFrame\s*\(/g,
  },
  {
    id: 'storageReads',
    label: 'localStorage.getItem',
    regex: /\blocalStorage\.getItem\s*\(/g,
  },
  {
    id: 'storageWrites',
    label: 'localStorage.setItem',
    regex: /\blocalStorage\.setItem\s*\(/g,
  },
  {
    id: 'mutationObservers',
    label: 'MutationObserver',
    regex: /\bnew\s+MutationObserver\s*\(/g,
  },
  {
    id: 'bodySubtreeObservers',
    label: 'observación completa del body',
    regex:
      /\.observe\s*\(\s*document\.body\s*,\s*\{[^}]*childList\s*:\s*true[^}]*subtree\s*:\s*true[^}]*\}\s*\)/gs,
  },
  {
    id: 'querySelectorAll',
    label: 'querySelectorAll',
    regex: /\bquerySelectorAll\s*(?:<[^;()]+>)?\s*\(/g,
  },
  {
    id: 'jsonParse',
    label: 'JSON.parse',
    regex: /\bJSON\.parse\s*\(/g,
  },
  {
    id: 'jsonStringify',
    label: 'JSON.stringify',
    regex: /\bJSON\.stringify\s*\(/g,
  },
  { id: 'effects', label: 'useEffect', regex: /\buseEffect\s*\(/g },
  {
    id: 'stateHooks',
    label: 'useState',
    regex: /\buseState\s*(?:<[^;()]+>)?\s*\(/g,
  },
]

function extensionOf(path) {
  const dot = path.lastIndexOf('.')
  return dot >= 0 ? path.slice(dot) : ''
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(path)))
    } else if (
      entry.isFile() &&
      SOURCE_EXTENSIONS.has(extensionOf(entry.name))
    ) {
      files.push(path)
    }
  }

  return files
}

function lineNumberAt(content, offset) {
  let line = 1
  for (let index = 0; index < offset; index += 1) {
    if (content.charCodeAt(index) === 10) line += 1
  }
  return line
}

function excerptAt(content, offset) {
  const lineStart = content.lastIndexOf('\n', Math.max(0, offset - 1)) + 1
  const lineEnd = content.indexOf('\n', offset)
  return content
    .slice(lineStart, lineEnd >= 0 ? lineEnd : content.length)
    .trim()
    .slice(0, 140)
}

function scanPattern(content, pattern) {
  const matches = []
  pattern.regex.lastIndex = 0

  for (const match of content.matchAll(pattern.regex)) {
    const offset = match.index ?? 0
    matches.push({
      line: lineNumberAt(content, offset),
      excerpt: excerptAt(content, offset),
    })
  }

  return matches
}

function buildAlerts(file) {
  const counts = file.counts
  const alerts = []

  if (counts.intervals > 0 && counts.storageReads > 0) {
    alerts.push('Sondeo periódico combinado con lectura de localStorage')
  }
  if (counts.animationFrames > 0 && counts.storageReads > 0) {
    alerts.push('Bucle por frame combinado con lectura de almacenamiento')
  }
  if (counts.bodySubtreeObservers > 0) {
    alerts.push('MutationObserver sobre todo document.body')
  }
  if (counts.jsonParse >= 2) {
    alerts.push('Múltiples deserializaciones en el mismo módulo')
  }

  return alerts
}

function printText(report) {
  console.log('Auditoría estructural de rendimiento')
  console.log(`Raíz: ${report.root}`)
  console.log(
    `Código: ${report.summary.files} archivos · ${report.summary.lines.toLocaleString('en-US')} líneas · ${report.summary.bytes.toLocaleString('en-US')} bytes`,
  )
  console.log('')

  console.log('Indicadores globales')
  for (const pattern of PATTERNS) {
    console.log(`- ${pattern.label}: ${report.summary.counts[pattern.id]}`)
  }
  console.log('')

  console.log('Archivos más grandes')
  for (const file of report.largestFiles) {
    console.log(
      `- ${file.path}: ${file.lines.toLocaleString('en-US')} líneas · ${file.bytes.toLocaleString('en-US')} bytes`,
    )
  }
  console.log('')

  if (report.alerts.length === 0) {
    console.log(
      'No se detectaron combinaciones de riesgo mediante las reglas actuales.',
    )
  } else {
    console.log('Puntos que requieren revisión humana')
    for (const item of report.alerts) {
      console.log(`- ${item.path}: ${item.alerts.join('; ')}`)
    }
  }
  console.log('')
  console.log(
    'Este inventario no sustituye un perfilador de ejecución. Consulta PERFORMANCE_AUDIT.md para el protocolo de medición y los umbrales.',
  )
}

async function main() {
  try {
    const sourceStats = await stat(SOURCE_ROOT)
    if (!sourceStats.isDirectory()) throw new Error('src no es un directorio')
  } catch {
    throw new Error(`No se encontró el directorio de código: ${SOURCE_ROOT}`)
  }

  const paths = await walk(SOURCE_ROOT)
  const files = []
  const totalCounts = Object.fromEntries(
    PATTERNS.map((pattern) => [pattern.id, 0]),
  )

  for (const path of paths) {
    const content = await readFile(path, 'utf8')
    const findings = {}
    const counts = {}

    for (const pattern of PATTERNS) {
      const matches = scanPattern(content, pattern)
      findings[pattern.id] = matches
      counts[pattern.id] = matches.length
      totalCounts[pattern.id] += matches.length
    }

    const file = {
      path: relative(ROOT, path).replaceAll('\\', '/'),
      lines: content.length === 0 ? 0 : content.split(/\r?\n/).length,
      bytes: Buffer.byteLength(content),
      counts,
      findings,
    }
    file.alerts = buildAlerts(file)
    files.push(file)
  }

  files.sort((a, b) => a.path.localeCompare(b.path))
  const report = {
    generatedAt: new Date().toISOString(),
    root: ROOT,
    summary: {
      files: files.length,
      lines: files.reduce((sum, file) => sum + file.lines, 0),
      bytes: files.reduce((sum, file) => sum + file.bytes, 0),
      counts: totalCounts,
    },
    largestFiles: [...files]
      .sort((a, b) => b.lines - a.lines || b.bytes - a.bytes)
      .slice(0, 10)
      .map(({ path, lines, bytes }) => ({ path, lines, bytes })),
    alerts: files
      .filter((file) => file.alerts.length > 0)
      .map(({ path, alerts }) => ({ path, alerts })),
    files,
  }

  if (JSON_OUTPUT) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    printText(report)
  }
}

main().catch((error) => {
  console.error(
    error instanceof Error ? `Error: ${error.message}` : 'Error desconocido',
  )
  process.exitCode = 1
})
