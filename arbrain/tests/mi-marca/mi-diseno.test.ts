// Ajustes › Diseño (mi Arbrain, 10 nov 2026; lib/mi-diseno/): validar, paleta desde un color, bloque de memoria y
// escritura en disco. Carpetas temporales; nunca el cerebro real.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { MAX_NOMBRE as MAX_MARCA } from '../../src/lib/mi-marca'
import { colorValido, MAX_NOMBRE, validarDiseno } from '../../src/lib/mi-diseno/validar'
import { FIN_TEMA, INICIO_TEMA, mezclarTema, temaDesdeColor } from '../../src/lib/mi-diseno/paleta'
import { bloqueMemoria, mezclarMemoria } from '../../src/lib/mi-diseno/memoria'
import { guardarDiseno, guardarLogo } from '../../src/lib/mi-diseno/disco'
import { apiPermitidaEnCliente } from '../../src/lib/edicion'
import { decidirCliente } from '../../src/lib/proxy-cliente'

const valido = (e: unknown) => { const v = validarDiseno(e); assert.ok(v.ok, JSON.stringify(v)); return v.diseno }

test('validar: nombre, color y enlaces; lo malo se rechaza con un mensaje claro', () => {
  assert.equal(MAX_NOMBRE, MAX_MARCA, 'el mismo tope que lib/mi-marca.ts')
  const d = valido({ nombre: ' Jade ', color: '#2563EB', web: 'alzat.es', redes: { linkedin: 'linkedin.com/in/alguien' } })
  assert.equal(d.nombre, 'Jade')
  assert.equal(d.color, '#2563eb')
  assert.match(d.web, /^https:\/\/alzat\.es\/?$/)
  assert.match(d.redes.linkedin, /^https:\/\/linkedin\.com\/in\/alguien$/)
  assert.equal(colorValido('#abc'), '#aabbcc')
  for (const malo of [{ nombre: '<b>' }, { color: 'azul' }, { web: 'javascript:alert(1)' }, { redes: { x: 'no es un enlace' } }]) {
    const v = validarDiseno(malo)
    assert.ok(!v.ok && v.error.length > 10, JSON.stringify(malo))
  }
})

test('paleta: un color pinta claro, oscuro, el estilo unificado y las clases violeta; sin el morado de fábrica', () => {
  const css = temaDesdeColor('#2563eb')
  assert.ok(css.startsWith(INICIO_TEMA) && css.trim().endsWith(FIN_TEMA))
  const selectores = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{/g)].map((m) => m[1].trim())
  assert.deepEqual(selectores, ['html:root', 'html:root:not(.dark)', 'html.dark:root'])
  const oscuro = css.slice(css.indexOf('html.dark:root'))
  assert.match(oscuro, /--brand: #2563eb;/, 'el modo oscuro también deja de ser morado')
  assert.match(css, /--color-violet-500:/)
  assert.match(css, /--l-morado-6: #2563eb;/)
  assert.doesNotMatch(css.toLowerCase(), /8c27f1|683acc|140, 39, 241/)
  assert.equal(temaDesdeColor('nada'), '')
})

test('tema.css: la primera vez se respalda lo hecho a mano; después solo cambia el bloque, al final', () => {
  const a = mezclarTema('html:root:not(.dark) { --primary: red; }', temaDesdeColor('#2563eb'))
  assert.ok(a.respaldar)
  assert.ok(a.contenido.startsWith(INICIO_TEMA))
  const mio = `.mio { color: red; }\n\n${a.contenido}`
  const b = mezclarTema(mio, temaDesdeColor('#0e7c66'))
  assert.ok(!b.respaldar)
  assert.ok(b.contenido.startsWith('.mio { color: red; }'), 'lo de fuera del bloque se conserva')
  assert.equal(b.contenido.split(INICIO_TEMA).length, 2, 'un solo bloque')
  assert.match(b.contenido, /#0e7c66/)
  assert.doesNotMatch(b.contenido, /--primary: #2563eb/)
})

test('memoria: un bloque con marcadores; se cambia sin duplicarse y se quita si queda vacío', () => {
  const d = valido({ nombre: 'Jade', negocio: 'ALZAT', objetivo: '3.000 € al mes\ndel sistema nuevo' })
  const bloque = bloqueMemoria(d)
  assert.match(bloque, /Te llamas \*\*Jade\*\*/)
  assert.match(bloque, /«3\.000 € al mes del sistema nuevo»/, 'una sola línea')
  const md = '# Memoria\n\nLo mío.\n'
  const una = mezclarMemoria(md, bloque)
  assert.ok(una.startsWith('# Memoria\n\nLo mío.'))
  const dos = mezclarMemoria(una, bloqueMemoria(valido({ nombre: 'Ana' })))
  assert.equal(dos.split('mi-diseno:inicio').length, 2)
  assert.match(dos, /Ana/)
  assert.doesNotMatch(dos, /Jade/)
  assert.equal(mezclarMemoria(dos, '').trim(), '# Memoria\n\nLo mío.')
  assert.equal(bloqueMemoria(valido({})), '')
})

test('disco: marca.json conserva lo ajeno, tema y logo anteriores van a anteriores/, MEMORY.md recibe el bloque', async () => {
  const raiz = mkdtempSync(join(tmpdir(), 'mi-diseno-'))
  mkdirSync(join(raiz, 'mi-marca'), { recursive: true })
  mkdirSync(join(raiz, '.claude', 'memory'), { recursive: true })
  writeFileSync(join(raiz, 'mi-marca', 'marca.json'), '{ "otra": 1 }')
  writeFileSync(join(raiz, 'mi-marca', 'tema.css'), 'html:root:not(.dark) { --primary: red; }')
  writeFileSync(join(raiz, '.claude', 'memory', 'MEMORY.md'), '# Memoria\n')
  const hecho = await guardarDiseno(raiz, valido({ nombre: 'Jade', color: '#2563eb' }))
  assert.deepEqual(hecho, { tema: true, memoria: true })
  const json = JSON.parse(readFileSync(join(raiz, 'mi-marca', 'marca.json'), 'utf8'))
  assert.equal(json.otra, 1)
  assert.equal(json.nombre, 'Jade')
  assert.ok(readdirSync(join(raiz, 'mi-marca', 'anteriores')).some((f) => f.startsWith('tema-')), 'el tema hecho a mano no se pierde')
  assert.match(readFileSync(join(raiz, '.claude', 'memory', 'MEMORY.md'), 'utf8'), /Te llamas \*\*Jade\*\*/)

  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0])
  writeFileSync(join(raiz, 'mi-marca', 'logo.svg'), '<svg></svg>')
  assert.deepEqual(await guardarLogo(raiz, png), { ok: true })
  assert.ok(existsSync(join(raiz, 'mi-marca', 'logo.png')))
  assert.ok(!existsSync(join(raiz, 'mi-marca', 'logo.svg')), 'solo un logo vivo')
  assert.ok(readdirSync(join(raiz, 'mi-marca', 'anteriores')).some((f) => f.startsWith('logo-')))
  const r = await guardarLogo(raiz, Buffer.from('MZ ejecutable'))
  assert.ok(!r.ok)
})

test('proxy: /api/mi-diseno existe en cliente y SIN sesión no pasa (escribe)', () => {
  assert.ok(apiPermitidaEnCliente('/api/mi-diseno'))
  assert.ok(apiPermitidaEnCliente('/api/mi-diseno/logo'))
  assert.deepEqual(decidirCliente('/api/mi-diseno', false, false), { tipo: 'json', status: 401, error: 'Abre Arbrain desde la app.' })
  assert.deepEqual(decidirCliente('/api/mi-diseno/logo', true, false), { tipo: 'pasa' })
})
