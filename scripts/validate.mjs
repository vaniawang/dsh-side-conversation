#!/usr/bin/env node
/**
 * Validates the package metadata that the DSH plugin manager and the curated
 * market rely on. Runs in CI and locally via `npm run check`.
 */
import { readFileSync, existsSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const errors = []

const required = ['name', 'version', 'description', 'type', 'main', 'exports', 'files', 'engines', 'license', 'dsh']
for (const key of required) if (!pkg[key]) errors.push(`package.json: missing "${key}"`)

if (pkg.private === true) errors.push('package.json: "private" must be removed before publishing')
if (!pkg.dsh?.bundle?.patch) errors.push('package.json: missing dsh.bundle.patch')
if (!pkg.dsh?.client) errors.push('package.json: missing dsh.client')
if (!pkg.exports?.['.']) errors.push('package.json: missing "." export')
if (!pkg.exports?.['./client']) errors.push('package.json: missing "./client" export')
if (!pkg.exports?.['./icon']) errors.push('package.json: missing "./icon" export')
if (!pkg.engines?.dsh) errors.push('package.json: missing engines.dsh')
if (!pkg.engines?.node) errors.push('package.json: missing engines.node')

const patchPath = new URL(`../${pkg.dsh?.bundle?.patch ?? 'cordis.patch.yml'}`, import.meta.url)
if (!existsSync(patchPath)) {
  errors.push('bundle patch file is missing')
} else {
  const patch = readFileSync(patchPath, 'utf8')
  if (!patch.includes(`name: '${pkg.name}'`)) errors.push(`bundle patch must insert a row named '${pkg.name}'`)
}

for (const entry of ['client.js', 'index.js', 'src/context.js', 'icon.svg', 'README.md', 'LICENSE']) {
  if (!existsSync(new URL(`../${entry}`, import.meta.url))) errors.push(`missing packaged file: ${entry}`)
}

if (errors.length > 0) {
  console.error('package validation failed:')
  for (const error of errors) console.error(' - ' + error)
  process.exit(1)
}
console.log(`package validation passed: ${pkg.name}@${pkg.version}`)
