// Textos legales de Alzat (12 nov 2026, España): sin aviso de borrador ni huecos [COMPLETAR], el aviso de privacidad
// trae lo que exige el art. 13 del RGPD con los datos de ALZAT, los términos no eximen de dolo ni culpa grave, y la huella fijada obliga a subir VERSION_TEXTOS al cambiar una palabra (la app vuelve a pedirlos).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { DOCUMENTOS_LEGALES, LICENCIA, PRIVACIDAD, RESPONSABLE, TERMINOS, VERSION_TEXTOS } from '../../src/features/primer-arranque/textos/legales'

const fuente = (r: string) => readFileSync(new URL(`../../${r}`, import.meta.url), 'utf8')
const huella = () => createHash('sha256').update(`${VERSION_TEXTOS}\n${DOCUMENTOS_LEGALES.map(d => `${d.titulo}\n${d.resumen}\n${d.cuerpo}`).join('\n\n')}`).digest('hex')

test('la huella de los textos está fijada a su versión: cambiar una palabra exige subir VERSION_TEXTOS', () => {
  assert.equal(VERSION_TEXTOS, '2026-11-12-alzat')
  assert.equal(huella(), '80c87220a912b81b636a7880d867ee98788b92ffc25bcd3a1d3854b3577b9733', 'cambiaste un texto legal: sube VERSION_TEXTOS y actualiza esta huella')
})

test('sin borrador ni huecos: ni [COMPLETAR], ni «revisión legal», ni el aviso amarillo', () => {
  for (const d of DOCUMENTOS_LEGALES) assert.ok(!/\[COMPLETAR|\[NOMBRE|revisión legal|BORRADOR/i.test(`${d.resumen}\n${d.cuerpo}`), d.id)
  const ui = fuente('src/features/primer-arranque/components/DocumentosLegales.tsx')
  assert.match(ui, /\{AVISO_VERSION\}/)
  assert.ok(!/AVISO_BORRADOR|bg-warning/.test(ui))
  assert.ok(!/bg-warning/.test(fuente('src/features/seguridad/components/ConsentimientoAutonomia.tsx')))
  assert.ok(!/Borrador pendiente de revisión legal/.test(fuente('src/features/primer-arranque/components/PrimerArranque.tsx')))
})

test('aviso de privacidad: lo que exige el art. 13 del RGPD, con ALZAT como responsable', () => {
  const c = PRIVACIDAD.cuerpo
  for (const dato of [RESPONSABLE.nombre, RESPONSABLE.nif, RESPONSABLE.domicilio, RESPONSABLE.correo]) assert.ok(c.includes(dato), `13.1.a: ${dato}`)
  assert.match(c, /Reglamento General de Protección de Datos \(RGPD\)[^\n]+LOPDGDD/, 'normativa')
  assert.match(c, /## Lo que nos llega\nNada\./, 'la app no envía nada a ALZAT')
  assert.match(c, /artículo 6\.1\.b y 6\.1\.c del RGPD/, '13.1.c: base jurídica')
  assert.match(c, /fuera del Espacio Económico Europeo/, '13.1.f: transferencias')
  assert.match(c, /contrato de encargado del tratamiento \(artículo 28 del RGPD\)/, 'datos de sus clientes')
  assert.match(c, /acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad/, '13.2.b: derechos')
  assert.match(c, /Agencia Española de Protección de Datos/, '13.2.d: reclamación')
  assert.match(c, /No tomamos decisiones automatizadas/, '13.2.f')
  assert.match(c, /## Cambios a este aviso\nSi cambia, Alzat te muestra la versión nueva/, 'cambios')
  // Lo que de verdad sale (server/src/cliente/progreso.ts) está dicho, y queda claro que lo trata un tercero.
  assert.match(c, /## La conexión con arbrain\.ai \(de un tercero, apagada por defecto\)/)
  assert.match(c, /expediente y tu camino/)
  assert.match(c, /ALZAT no los recibe/)
  assert.ok(!/LFPDPPP|Diario Oficial|Secretaría Anticorrupción|saasfactory/.test(c), 'nada de la ley mexicana ni del correo de Daniel')
})

test('términos y licencia: España, sin exención de dolo, sin tribunal inventado y sin ostentar una marca como registrada', () => {
  assert.match(TERMINOS.cuerpo, /Nada de esto limita nuestra responsabilidad por dolo o culpa grave/)
  assert.match(TERMINOS.cuerpo, /Ley General para la Defensa de los Consumidores y Usuarios/)
  assert.match(TERMINOS.cuerpo, /se rigen por la ley española/)
  assert.ok(!/renunciando a cualquier otro fuero|se limita a|Estados Unidos Mexicanos|Procuraduría/.test(TERMINOS.cuerpo))
  assert.match(TERMINOS.cuerpo, /asunto «Seguridad»/)
  assert.match(LICENCIA.cuerpo, /signos distintivos de /)
  assert.ok(!/registrad[ao]|IMPI|OEPM/.test(LICENCIA.cuerpo), 'no decir «registrada» sin registro')
  assert.match(LICENCIA.cuerpo, /archivo NOTICE/)
  assert.match(LICENCIA.cuerpo, /de buena fe, que tu trabajo se basa en Alzat o en Arbrain/)
  assert.match(LICENCIA.cuerpo, /Se basa en Arbrain, de Jorge Daniel Carreón Guzmán/)
})
