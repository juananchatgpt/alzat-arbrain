// Autorreparación del arranque (mi Arbrain, 20 nov 2026): plazo a las compilaciones y candado del daemon con pid
// reutilizado. Nunca toca la instalación real: procesos de prueba y carpetas temporales.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { correrConPlazo, decidirCandado, plazoCompilarMs, repararCandadoWindows } from '../../scripts/servidor/reparar.mjs'

const PROGRAMA = 'C:\\Users\\x\\AppData\\Roaming\\ai.arbrain.servidor\\programa'

test('plazo por defecto 5 min y configurable', () => {
  assert.equal(plazoCompilarMs({}), 5 * 60_000)
  assert.equal(plazoCompilarMs({ ARBRAIN_PLAZO_COMPILAR_MIN: '2' }), 2 * 60_000)
  assert.equal(plazoCompilarMs({ ARBRAIN_PLAZO_COMPILAR_MIN: 'nada' }), 5 * 60_000)
})

test('una compilación colgada se corta al vencer el plazo', async () => {
  let aviso = 0
  const inicio = Date.now()
  const r = await correrConPlazo(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { plazoMs: 800, alVencer: () => { aviso++ } })
  assert.equal(r.vencido, true)
  assert.equal(r.codigo, 124)
  assert.equal(aviso, 1)
  assert.ok(Date.now() - inicio < 10_000)
})

test('una compilación que termina devuelve su código sin cortar', async () => {
  assert.deepEqual(await correrConPlazo(process.execPath, ['-e', 'process.exit(0)'], { plazoMs: 20_000 }), { codigo: 0, vencido: false })
  assert.deepEqual(await correrConPlazo(process.execPath, ['-e', 'process.exit(3)'], { plazoMs: 20_000 }), { codigo: 3, vencido: false })
})

test('candado: pid reutilizado por otro programa se aparta; daemon propio se apaga', () => {
  const claude = '"C:\\Program Files\\WindowsApps\\Claude\\app\\Claude.exe" --type=utility'
  const daemon = `"C:\\Program Files\\nodejs\\node.exe" ${PROGRAMA}\\daemon-abc\\dist\\index.js`
  assert.equal(decidirCandado({ pid: 12916, lineaDeComando: claude, programa: PROGRAMA, propioPid: 1 }), 'apartar')
  assert.equal(decidirCandado({ pid: 12916, lineaDeComando: daemon, programa: PROGRAMA, propioPid: 1 }), 'apagar')
  assert.equal(decidirCandado({ pid: 12916, lineaDeComando: daemon.replace(/\\/g, '/').toUpperCase(), programa: PROGRAMA, propioPid: 1 }), 'apagar')
  assert.equal(decidirCandado({ pid: 12916, lineaDeComando: '', programa: PROGRAMA, propioPid: 1 }), 'nada')
  assert.equal(decidirCandado({ pid: Number.NaN, lineaDeComando: claude, programa: PROGRAMA, propioPid: 1 }), 'nada')
  assert.equal(decidirCandado({ pid: 7, lineaDeComando: claude, programa: PROGRAMA, propioPid: 7 }), 'nada')
})

test('candado en Windows: lo renombra (no lo borra) cuando el pid es de otro programa', { skip: process.platform !== 'win32' }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'arbrain-candado-'))
  try {
    const archivo = join(dir, 'claudeclaw.pid')
    writeFileSync(archivo, '12916\n')
    const accion = repararCandadoWindows({ archivo, programa: PROGRAMA, consultar: () => 'C:\\otro\\Claude.exe' })
    assert.equal(accion, 'apartar')
    assert.equal(existsSync(archivo), false)
    assert.ok(readdirSync(dir).some((f) => f.startsWith('claudeclaw.pid.viejo-12916-')))
  } finally { rmSync(dir, { recursive: true, force: true }) }
})
