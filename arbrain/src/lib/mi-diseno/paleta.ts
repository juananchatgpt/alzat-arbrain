/**
 * Ajustes › Diseño: la paleta completa desde UN color (pura). Se escribe en `mi-marca/tema.css` entre
 * `diseno:inicio` y `diseno:fin`, y pisa el morado del autor en claro, oscuro, el estilo unificado (--l-morado-*)
 * y las clases violet/purple de Tailwind. Los selectores igualan a los del autor y la hoja carga después: gana.
 */
import { colorValido } from './validar'

export type Rgb = [number, number, number]
const BLANCO: Rgb = [255, 255, 255]
const NEGRO: Rgb = [0, 0, 0]
const FONDO_OSCURO: Rgb = [9, 9, 11]

export function hexARgb(hex: string): Rgb {
  const h = colorValido(hex).slice(1)
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb
}
export const rgbAHex = (c: Rgb) => `#${c.map((x) => Math.round(Math.min(255, Math.max(0, x))).toString(16).padStart(2, '0')).join('')}`
const mezclar = (a: Rgb, b: Rgb, t: number) => a.map((x, i) => Math.round(x + (b[i] - x) * t)) as Rgb
const txt = (c: Rgb) => c.join(', ')
const rgba = (c: Rgb, a: number) => `rgba(${txt(c)}, ${a})`

function luminancia(c: Rgb): number {
  const [r, g, b] = c.map((x) => { const s = x / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
export function contraste(a: Rgb, b: Rgb): number {
  const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}
/** Contraste del texto blanco sobre el color (los botones llevan texto blanco). */
export const contrasteConBlanco = (hex: string) => (colorValido(hex) ? contraste(hexARgb(hex), BLANCO) : 0)

/** 11 tonos: 0 casi blanco, 6 el color, 10 casi negro (como --l-morado-*). */
export function rampa(hex: string): Rgb[] {
  const base = hexARgb(hex)
  return [
    ...[0.94, 0.87, 0.74, 0.58, 0.42, 0.22].map((t) => mezclar(base, BLANCO, t)),
    base,
    ...[0.18, 0.36, 0.55, 0.72].map((t) => mezclar(base, NEGRO, t)),
  ]
}
const legible = (tonos: Rgb[], fondo: Rgb) => tonos.find((t) => contraste(t, fondo) >= 4.5) ?? tonos[tonos.length - 1]

export const INICIO_TEMA = '/* diseno:inicio */'
export const FIN_TEMA = '/* diseno:fin */'
const TAILWIND = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

const SOMBRAS_CLARAS = ['0 1px 2px rgba(50, 50, 93, 0.06), 0 1px 1px rgba(0, 0, 0, 0.04)', '0 2px 4px rgba(50, 50, 93, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)', '0 4px 12px rgba(50, 50, 93, 0.10), 0 2px 4px rgba(0, 0, 0, 0.06)', '0 8px 24px rgba(50, 50, 93, 0.12), 0 4px 8px rgba(0, 0, 0, 0.07)']
const SOMBRAS_OSCURAS = ['0 1px 2px rgba(0, 0, 0, 0.5), 0 1px 1px rgba(0, 0, 0, 0.3)', '0 2px 4px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.4)', '0 4px 12px rgba(0, 0, 0, 0.55), 0 2px 4px rgba(0, 0, 0, 0.4)', '0 8px 24px rgba(0, 0, 0, 0.6), 0 4px 8px rgba(0, 0, 0, 0.45)']
const TALLAS = ['xs', 'sm', 'md', 'lg']

/**
 * El archivo con el bloque nuevo AL FINAL (el formulario manda); lo de fuera del bloque se conserva. Sin bloque
 * (primera vez), el archivo hecho a mano se reemplaza y `respaldar` pide copiarlo antes a `anteriores/`.
 */
export function mezclarTema(actual: string, bloque: string): { contenido: string; respaldar: boolean } {
  const a = actual.indexOf(INICIO_TEMA)
  const z = actual.indexOf(FIN_TEMA, a)
  if (a < 0 || z < 0) return { contenido: bloque, respaldar: actual.trim().length > 0 }
  const resto = `${actual.slice(0, a).trim()}\n${actual.slice(z + FIN_TEMA.length).trim()}`.trim()
  return { contenido: resto ? `${resto}\n\n${bloque}` : bloque, respaldar: false }
}

/** El bloque de tema.css para un color ('' si no es un color). */
export function temaDesdeColor(hex: string): string {
  const color = colorValido(hex)
  if (!color) return ''
  const r = rampa(color)
  const b = r[6]
  const h = (i: number) => rgbAHex(r[i])
  const tintaClara = rgbAHex(legible([b, r[7], r[8], r[9]], BLANCO))
  const tintaOscura = rgbAHex(legible([r[4], r[3], r[2], r[1]], FONDO_OSCURO))
  const sombras = (alfas: number[], resto: string[]) => resto.map((x, i) => `  --shadow-${TALLAS[i]}: 0 0 0 1px ${rgba(b, alfas[i])}, ${x};`)
  return [
    INICIO_TEMA,
    `/* Lo escribe Ajustes › Diseño desde tu color ${color}: se reescribe al guardar. Lo tuyo, fuera de este bloque. */`,
    'html:root {',
    ...r.map((c, i) => `  --l-morado-${i}: ${rgbAHex(c)}; --l-morado-${i}-rgb: ${txt(c)};`),
    ...TAILWIND.map((n, i) => `  --color-violet-${n}: ${h(i)}; --color-purple-${n}: ${h(i)};`),
    `  --l-tinta-morado-clara: ${h(3)}; --l-tinta-morado-oscura: ${h(7)}; --l-foco: ${rgba(b, 0.55)};`,
    '}',
    '',
    'html:root:not(.dark) {',
    `  --brand: ${color}; --brand-rgb: ${txt(b)}; --brand-ink: ${tintaClara};`,
    `  --primary: ${color}; --primary-rgb: ${txt(b)}; --primary-hover: ${h(7)}; --primary-hover-rgb: ${txt(r[7])};`,
    `  --neon-purple: ${h(8)}; --accent-purple: ${h(4)};`,
    `  --card-hover: ${rgbAHex(mezclar(b, BLANCO, 0.96))}; --card-active: ${rgbAHex(mezclar(b, BLANCO, 0.92))};`,
    ...sombras([0.04, 0.06, 0.08, 0.12], SOMBRAS_CLARAS),
    `  --glow-purple: 0 0 20px ${rgba(b, 0.15)}, 0 8px 32px ${rgba(b, 0.1)};`,
    `  --glow-purple-strong: 0 0 30px ${rgba(b, 0.3)}, 0 8px 32px ${rgba(b, 0.2)};`,
    `  --border-accent: ${rgba(b, 0.15)}; --glass-border: ${rgba(b, 0.12)}; --glass-border-strong: ${rgba(b, 0.25)};`,
    `  --glass-shadow: ${rgba(b, 0.08)}; --glass-glow: ${rgba(b, 0.18)};`,
    `  --l-identidad: ${color}; --l-identidad-rgb: ${txt(b)}; --l-morado-rgb: ${txt(b)}; --l-tinta-morado: ${tintaClara};`,
    '}',
    '',
    'html.dark:root {',
    `  --brand: ${color}; --brand-rgb: ${txt(b)}; --brand-ink: ${tintaOscura};`,
    `  --primary: ${h(5)}; --primary-rgb: ${txt(r[5])}; --primary-hover: ${h(3)}; --primary-hover-rgb: ${txt(r[3])};`,
    `  --neon-purple: ${color}; --accent-purple: ${h(3)};`,
    ...sombras([0.08, 0.12, 0.16, 0.2], SOMBRAS_OSCURAS),
    `  --glow-purple: 0 0 24px ${rgba(b, 0.3)}, 0 8px 40px ${rgba(b, 0.2)};`,
    `  --glow-purple-strong: 0 0 40px ${rgba(b, 0.5)}, 0 8px 40px ${rgba(b, 0.35)};`,
    `  --border-accent: ${rgba(b, 0.3)}; --glass-border: ${rgba(b, 0.2)}; --glass-border-strong: ${rgba(b, 0.35)}; --glass-glow: ${rgba(b, 0.25)};`,
    `  --l-identidad: ${h(7)}; --l-identidad-rgb: ${txt(r[4])}; --l-morado-rgb: ${txt(r[4])}; --l-tinta-morado: ${tintaOscura};`,
    '}',
    FIN_TEMA,
  ].join('\n') + '\n'
}
