/**
 * Ajustes › Diseño: lo que se escribe en disco. Todo en la capa del dueño (`mi-marca/` y su MEMORY.md), nunca en el
 * código del autor. Nada se borra: lo reemplazado va a `mi-marca/anteriores/` con la fecha en el nombre.
 */
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { CARPETA_MI_MARCA, LOGOS, MARCA, MAX_LOGO, TEMA, leerLogo } from '../mi-marca'
import { disenoDeJson, type Diseno } from './validar'
import { mezclarTema, temaDesdeColor } from './paleta'
import { bloqueMemoria, mezclarMemoria } from './memoria'

export const ANTERIORES = 'anteriores'
const sello = () => new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const esArchivo = async (ruta: string) => (await stat(ruta).catch(() => null))?.isFile() ?? false

async function aAnteriores(dir: string, archivo: string): Promise<void> {
  if (!(await esArchivo(join(dir, archivo)))) return
  await mkdir(join(dir, ANTERIORES), { recursive: true })
  const p = archivo.lastIndexOf('.')
  await rename(join(dir, archivo), join(dir, ANTERIORES, `${archivo.slice(0, p)}-${sello()}${archivo.slice(p)}`))
}

async function leerJson(ruta: string): Promise<Record<string, unknown>> {
  try {
    const j = JSON.parse(await readFile(ruta, 'utf8')) as unknown
    return j && typeof j === 'object' && !Array.isArray(j) ? j as Record<string, unknown> : {}
  } catch {
    return {}
  }
}

export async function leerDiseno(raiz: string): Promise<{ diseno: Diseno; logo: string | null }> {
  const dir = join(raiz, CARPETA_MI_MARCA)
  const logo = await leerLogo(dir)
  return { diseno: disenoDeJson(await leerJson(join(dir, MARCA))), logo: logo ? `/api/mi-marca/logo?v=${logo.mtime}` : null }
}

/** marca.json (conserva las claves que este formulario no conoce), el bloque de tema.css y el de MEMORY.md. */
export async function guardarDiseno(raiz: string, d: Diseno): Promise<{ tema: boolean; memoria: boolean }> {
  const dir = join(raiz, CARPETA_MI_MARCA)
  await mkdir(dir, { recursive: true })
  const json: Record<string, unknown> = { ...(await leerJson(join(dir, MARCA))), ...d, actualizado: new Date().toISOString() }
  if (!d.nombre) delete json.nombre
  await writeFile(join(dir, MARCA), JSON.stringify(json, null, 2) + '\n', 'utf8')

  let tema = false
  if (d.color) {
    const actual = await readFile(join(dir, TEMA), 'utf8').catch(() => '')
    const { contenido, respaldar } = mezclarTema(actual, temaDesdeColor(d.color))
    if (contenido !== actual) {
      if (respaldar) {
        await mkdir(join(dir, ANTERIORES), { recursive: true })
        await writeFile(join(dir, ANTERIORES, `tema-${sello()}.css`), actual, 'utf8')
      }
      await writeFile(join(dir, TEMA), contenido, 'utf8')
      tema = true
    }
  }

  let memoria = false
  const rutaMemoria = join(raiz, '.claude', 'memory', 'MEMORY.md')
  const md = await readFile(rutaMemoria, 'utf8').catch(() => null)
  if (md !== null) {
    const nuevo = mezclarMemoria(md, bloqueMemoria(d))
    if (nuevo !== md) { await writeFile(rutaMemoria, nuevo, 'utf8'); memoria = true }
  }
  return { tema, memoria }
}

/** Qué imagen es por sus primeros bytes, no por lo que diga el navegador. */
export function tipoDeLogo(buf: Buffer): typeof LOGOS[number] | null {
  const de = (archivo: string) => LOGOS.find((l) => l.archivo === archivo) ?? null
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return de('logo.png')
  if (buf.length >= 12 && buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP') return de('logo.webp')
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return de('logo.jpg')
  const inicio = buf.toString('utf8', 0, Math.min(buf.length, 2048)).replace(/^﻿/, '').trimStart()
  if (/^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE svg[^>]*>\s*)?<svg[\s>]/i.test(inicio)) return de('logo.svg')
  return null
}

/** Pone el logo nuevo; los anteriores (de cualquier formato) van a `anteriores/`. */
export async function guardarLogo(raiz: string, buf: Buffer): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!buf.length) return { ok: false, error: 'El archivo llegó vacío.' }
  if (buf.length > MAX_LOGO) return { ok: false, error: 'El logo pasa de 2 MB: usa uno más ligero (512 × 512 px basta).' }
  const tipo = tipoDeLogo(buf)
  if (!tipo) return { ok: false, error: 'El logo debe ser PNG, WebP, JPG o SVG.' }
  const dir = join(raiz, CARPETA_MI_MARCA)
  await mkdir(dir, { recursive: true })
  for (const l of LOGOS) await aAnteriores(dir, l.archivo)
  await writeFile(join(dir, tipo.archivo), buf)
  return { ok: true }
}

/** Quita el logo (a `anteriores/`): vuelve el de fábrica. */
export async function quitarLogo(raiz: string): Promise<void> {
  const dir = join(raiz, CARPETA_MI_MARCA)
  for (const l of LOGOS) await aAnteriores(dir, l.archivo)
}
