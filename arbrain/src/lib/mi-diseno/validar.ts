/**
 * Ajustes › Diseño (mi Arbrain, 10 nov 2026, pedido de Juanan): la marca del dueño en un formulario, sin tocar
 * archivos. Esta pieza valida lo que llega del formulario. Pura. El resto: paleta.ts, memoria.ts y disco.ts.
 */
// Sin importar lib/mi-marca.ts (usa node:fs): esta pieza también la carga el formulario en el navegador.
export const MAX_NOMBRE = 40 // el mismo tope que lib/mi-marca.ts › MAX_NOMBRE (lo comprueba el test)

/** El mismo criterio que lib/mi-marca.ts › nombreValido: una línea corta, sin < ni >. */
export function nombreValido(valor: unknown): string | null {
  if (typeof valor !== 'string') return null
  const n = valor.trim()
  if (!n || n.length > MAX_NOMBRE || /[\u0000-\u001f\u007f<>]/.test(n)) return null
  return n
}

export const REDES = ['instagram', 'linkedin', 'facebook', 'youtube', 'tiktok', 'x'] as const
export type Red = typeof REDES[number]
export const NOMBRE_RED: Record<Red, string> = { instagram: 'Instagram', linkedin: 'LinkedIn', facebook: 'Facebook', youtube: 'YouTube', tiktok: 'TikTok', x: 'X (Twitter)' }
export const MAX_TEXTO = 500
export const MAX_URL = 300

export interface Diseno {
  nombre: string
  negocio: string
  color: string
  web: string
  redes: Record<Red, string>
  quienSoy: string
  aQuienAyudo: string
  objetivo: string
}

export const redesVacias = (): Record<Red, string> => ({ instagram: '', linkedin: '', facebook: '', youtube: '', tiktok: '', x: '' })
export const disenoVacio = (): Diseno => ({ nombre: '', negocio: '', color: '', web: '', redes: redesVacias(), quienSoy: '', aQuienAyudo: '', objetivo: '' })

const texto = (v: unknown) => (typeof v === 'string' ? v : '')
const obj = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {})

/** Texto libre: sin caracteres de control (salvo saltos de línea), recortado y con tope. */
export function textoLibre(v: unknown, max = MAX_TEXTO): string {
  return texto(v).replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ').trim().slice(0, max)
}

/** `#rrggbb` en minúsculas (acepta `#rgb`), o '' si no es un color. */
export function colorValido(v: unknown): string {
  const t = texto(v).trim().toLowerCase()
  if (/^#[0-9a-f]{6}$/.test(t)) return t
  const c = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(t)
  return c ? `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}` : ''
}

/** Enlace http(s); sin esquema se le pone `https://`. '' si vino vacío; null si no es un enlace. */
export function urlValida(v: unknown): string | null {
  let t = texto(v).trim()
  if (!t) return ''
  if (t.length > MAX_URL || /[\s<>"'`]/.test(t)) return null
  if (!/^[a-z][a-z0-9+.-]*:/i.test(t)) t = `https://${t.replace(/^\/+/, '')}`
  try {
    const u = new URL(t)
    if ((u.protocol !== 'https:' && u.protocol !== 'http:') || !u.hostname.includes('.')) return null
    return u.toString()
  } catch {
    return null
  }
}

export type Validacion = { ok: true; diseno: Diseno } | { ok: false; error: string }

export function validarDiseno(entrada: unknown): Validacion {
  const e = obj(entrada)
  const crudo = texto(e.nombre).trim()
  const nombre = crudo ? nombreValido(crudo) : ''
  if (nombre === null) return { ok: false, error: `El nombre va en una sola línea, hasta ${MAX_NOMBRE} letras y sin < ni >.` }
  const negocio = texto(e.negocio).trim()
  if (negocio.length > 60 || /[\u0000-\u001f\u007f<>]/.test(negocio)) return { ok: false, error: 'El negocio va en una sola línea, hasta 60 letras y sin < ni >.' }
  const color = colorValido(e.color)
  if (texto(e.color).trim() && !color) return { ok: false, error: 'El color va como #RRGGBB (por ejemplo, #2563EB).' }
  const web = urlValida(e.web)
  if (web === null) return { ok: false, error: 'La página web no parece un enlace (por ejemplo, https://tunegocio.com).' }
  const redes = redesVacias()
  for (const red of REDES) {
    const u = urlValida(obj(e.redes)[red])
    if (u === null) return { ok: false, error: `El enlace de ${NOMBRE_RED[red]} no parece un enlace: pega la dirección completa de tu perfil.` }
    redes[red] = u
  }
  return { ok: true, diseno: { nombre, negocio, color, web, redes, quienSoy: textoLibre(e.quienSoy), aQuienAyudo: textoLibre(e.aQuienAyudo), objetivo: textoLibre(e.objetivo) } }
}

/** Lo guardado en marca.json, con lo que falte vacío (para el formulario). */
export function disenoDeJson(json: unknown): Diseno {
  const j = obj(json)
  const redes = redesVacias()
  for (const red of REDES) redes[red] = texto(obj(j.redes)[red])
  return { nombre: texto(j.nombre), negocio: texto(j.negocio), color: colorValido(j.color), web: texto(j.web), redes, quienSoy: texto(j.quienSoy), aQuienAyudo: texto(j.aQuienAyudo), objetivo: texto(j.objetivo) }
}
