/**
 * El cursor de pintar (lápiz, marcador y goma).
 *
 * Antes era `crosshair`: la cruz fina del sistema, que sobre el lienzo oscuro
 * (y en Windows, siempre) casi no se ve. Este cursor es un círculo del tamaño
 * REAL del trazo en pantalla (grosor × zoom), relleno con el color de la tinta,
 * dentro de un aro doble blanco y oscuro que se lee sobre cualquier fondo.
 * Pedido de Juanan, 2026-11-07: «cuando voy a pintar, el cursor no se ve nada».
 */

export type HerramientaTinta = 'pen' | 'highlighter' | 'eraser'

/** Los navegadores ignoran cursores de más de 128 px; Windows se queda cómodo bajo 64. */
const MAX = 64

export function cursorTinta(
  herramienta: HerramientaTinta,
  opciones: { color: string; grosor: number; zoom: number },
): string {
  const grosorPantalla = Math.max(0, opciones.grosor * opciones.zoom)
  const goma = herramienta === 'eraser'
  // El punto: el trazo real, con un mínimo para que siempre se vea.
  const punto = goma ? 0 : Math.min(MAX - 12, Math.max(4, grosorPantalla))
  // El aro: siempre al menos 18 px de diámetro, para encontrarlo de un vistazo.
  const aro = Math.min(MAX - 4, Math.max(goma ? 20 : 18, punto + 8))
  const lado = Math.ceil(aro + 4)
  const c = lado / 2
  const r = aro / 2
  const relleno = herramienta === 'highlighter' ? `fill-opacity="0.55"` : ''
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 ${lado} ${lado}">` +
    `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="#ffffff" stroke-width="3"/>` +
    `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="#111827" stroke-width="1.5"/>` +
    (goma
      ? `<line x1="${c - 4}" y1="${c - 4}" x2="${c + 4}" y2="${c + 4}" stroke="#111827" stroke-width="1.5"/>` +
        `<line x1="${c - 4}" y1="${c + 4}" x2="${c + 4}" y2="${c - 4}" stroke="#111827" stroke-width="1.5"/>`
      : `<circle cx="${c}" cy="${c}" r="${punto / 2}" fill="${opciones.color}" ${relleno} stroke="#ffffff" stroke-width="1"/>`) +
    `</svg>`
  const centro = Math.round(c)
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${centro} ${centro}, crosshair`
}
