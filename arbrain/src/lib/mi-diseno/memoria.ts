/**
 * Ajustes › Diseño: el bloque corto de `.claude/memory/MEMORY.md` (se carga en cada conversación, en la app y en
 * Claude Code) para que el asistente sepa su nombre y la marca del dueño sin que nadie lo escriba a mano. Puro.
 */
import { NOMBRE_RED, REDES, type Diseno } from './validar'

export const INICIO_MEMORIA = '<!-- mi-diseno:inicio · lo escribe Ajustes › Diseño; para cambiarlo, usa esa pantalla -->'
export const FIN_MEMORIA = '<!-- mi-diseno:fin -->'
const PREFIJO = '<!-- mi-diseno:inicio'

const unaLinea = (t: string) => t.replace(/\s*\n\s*/g, ' ').trim()

/** El bloque, o '' si no hay nada que contar. */
export function bloqueMemoria(d: Diseno): string {
  const l: string[] = []
  if (d.nombre) l.push(`- Te llamas **${d.nombre}**: donde el sistema, una skill o un manual diga «Levy», eres tú; preséntate y fírmate como ${d.nombre}.`)
  if (d.negocio) l.push(`- Su negocio: **${d.negocio}**.`)
  const enlaces = [d.web ? `web ${d.web}` : '', ...REDES.filter((r) => d.redes[r]).map((r) => `${NOMBRE_RED[r]} ${d.redes[r]}`)].filter(Boolean)
  if (enlaces.length) l.push(`- Dónde lo encuentran: ${enlaces.join(' · ')}.`)
  if (d.quienSoy) l.push(`- Quién es, en sus palabras: «${unaLinea(d.quienSoy)}».`)
  if (d.aQuienAyudo) l.push(`- A quién ayuda: «${unaLinea(d.aQuienAyudo)}».`)
  if (d.objetivo) l.push(`- Su objetivo: «${unaLinea(d.objetivo)}».`)
  if (!l.length) return ''
  return [INICIO_MEMORIA, '## Su marca (Ajustes › Diseño)', '', ...l, FIN_MEMORIA].join('\n')
}

/** MEMORY.md con el bloque puesto, cambiado o quitado (bloque vacío). Lo de fuera del bloque, intacto. */
export function mezclarMemoria(md: string, bloque: string): string {
  const a = md.indexOf(PREFIJO)
  const z = md.indexOf(FIN_MEMORIA, a)
  const cierre = (t: string) => `${t.replace(/\s+$/, '')}\n`
  if (a < 0 || z < 0) return bloque ? cierre(`${md.replace(/\s+$/, '')}\n\n${bloque}`) : md
  const antes = md.slice(0, a).replace(/\s+$/, '')
  const despues = md.slice(z + FIN_MEMORIA.length).replace(/^\s+/, '')
  return cierre([antes, bloque, despues].filter(Boolean).join('\n\n'))
}
