#!/usr/bin/env node
// @ts-check
/**
 * アプリに同梱する OSS ライセンス一覧を生成する
 *
 * package.json の dependencies を起点に、node_modules を辿って
 * 実行時に同梱されるパッケージだけを集める（devDependencies は対象外）。
 * 生成物は src/assets/licenses.json で、これをコミットしてアプリから読む。
 *
 * @example
 * yarn licenses:generate
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUTPUT = join(ROOT, 'src', 'assets', 'licenses.json')

/**
 * ライセンス本文が入っていそうなファイル名
 */
const LICENSE_FILE_PATTERN =
  /^(licen[cs]e|copying|notice)([-._].*)?(\.(md|txt))?$/i

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))

/**
 * node の解決規則にならって、親ディレクトリを遡りながら node_modules を探す
 */
const resolvePackageDir = (name, fromDir) => {
  let current = fromDir
  for (;;) {
    const candidate = join(current, 'node_modules', name)
    try {
      if (statSync(join(candidate, 'package.json')).isFile()) {
        return candidate
      }
    } catch {
      // 見つからなければ親へ
    }
    const parent = dirname(current)
    if (parent === current) {
      return undefined
    }
    current = parent
  }
}

const readLicenseText = (packageDir) => {
  let entries = []
  try {
    entries = readdirSync(packageDir, { withFileTypes: true })
  } catch {
    return undefined
  }

  const file = entries
    .filter((entry) => entry.isFile() && LICENSE_FILE_PATTERN.test(entry.name))
    // LICENSE より LICENSE-MIT のような枝番を後ろに回し、短い名前を優先する
    .sort(
      (a, b) => a.name.length - b.name.length || a.name.localeCompare(b.name),
    )
    .at(0)

  if (!file) {
    return undefined
  }
  return readFileSync(join(packageDir, file.name), 'utf8').trim()
}

/**
 * package.json の license 表記はゆらぎがあるので文字列に均す
 */
const readLicenseName = (manifest) => {
  if (typeof manifest.license === 'string') {
    return manifest.license
  }
  if (manifest.license?.type) {
    return manifest.license.type
  }
  if (Array.isArray(manifest.licenses)) {
    return manifest.licenses
      .map((value) => value?.type ?? value)
      .filter(Boolean)
      .join(', ')
  }
  return undefined
}

const readHomepage = (manifest) => {
  if (manifest.homepage) {
    return manifest.homepage
  }
  const url =
    typeof manifest.repository === 'string'
      ? manifest.repository
      : manifest.repository?.url
  if (!url) {
    return undefined
  }
  return url
    .replace(/^git\+/, '')
    .replace(/^git:\/\//, 'https://')
    .replace(/^ssh:\/\/git@/, 'https://')
    .replace(/\.git$/, '')
}

const readAuthor = (manifest) => {
  if (typeof manifest.author === 'string') {
    return manifest.author
  }
  return manifest.author?.name
}

const collect = () => {
  const rootManifest = readJson(join(ROOT, 'package.json'))
  const collected = new Map()
  const queue = Object.keys(rootManifest.dependencies ?? {}).map((name) => ({
    name,
    fromDir: ROOT,
  }))
  const missing = []

  while (queue.length > 0) {
    const { name, fromDir } = queue.shift()
    const packageDir = resolvePackageDir(name, fromDir)
    if (!packageDir) {
      missing.push(name)
      continue
    }

    const manifest = readJson(join(packageDir, 'package.json'))
    const key = `${manifest.name}@${manifest.version}`
    if (collected.has(key)) {
      continue
    }

    collected.set(key, {
      name: manifest.name,
      version: manifest.version,
      license: readLicenseName(manifest) ?? 'UNKNOWN',
      author: readAuthor(manifest),
      homepage: readHomepage(manifest),
      licenseText: readLicenseText(packageDir),
    })

    for (const dependency of Object.keys(manifest.dependencies ?? {})) {
      queue.push({ name: dependency, fromDir: packageDir })
    }
  }

  return { packages: [...collected.values()], missing }
}

const { packages, missing } = collect()

packages.sort(
  (a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version),
)

writeFileSync(OUTPUT, `${JSON.stringify(packages, null, 2)}\n`, 'utf8')

console.log(`generated ${OUTPUT}`)
console.log(`  packages: ${packages.length}`)

const withoutText = packages.filter(({ licenseText }) => !licenseText)
if (withoutText.length > 0) {
  console.log(
    `  ライセンス本文が同梱されていないパッケージ: ${withoutText.length}`,
  )
  for (const { name, version, license } of withoutText) {
    console.log(`    - ${name}@${version} (${license})`)
  }
}
if (missing.length > 0) {
  console.log(
    `  node_modules に見つからないパッケージ: ${[...new Set(missing)].join(', ')}`,
  )
}
