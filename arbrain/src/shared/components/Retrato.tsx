/**
 * Retrato ligero de un agente (5 oct 2026). Un avatar de 28 px bajaba el PNG de 1024 px de Levy (1.38 MB) y por
 * Funnel desde la laptop eso pesa. Aquí el navegador elige AVIF o WebP al ancho que de verdad pinta (`size` en
 * px de CSS × la densidad de su pantalla), de 1.5 a 15 KB. Los archivos los genera scripts/retratos.sh con
 * versión en el nombre: se sirven con caché inmutable (next.config.ts).
 */
'use client'
import type { CSSProperties } from 'react'
import { useMiMarca } from '@/lib/mi-marca-cliente'

export type AgenteRetrato = 'levy' | 'trinity' | 'sensei'

const VERSION = 'v1'
// Anchos generados por agente: el retrato de Trinity y Sensei mide 192 px de origen y no se escala hacia arriba.
const ANCHOS: Record<AgenteRetrato, number[]> = { levy: [64, 128, 256], trinity: [64, 128, 192], sensei: [64, 128, 192] }
// Respaldo para un navegador sin AVIF ni WebP: la imagen original.
const ORIGINAL: Record<AgenteRetrato, string> = {
  levy: '/levy-face/assets/levy.png', trinity: '/agentes-3d/trinity.jpg', sensei: '/agentes-3d/sensei.jpg',
}

export function srcsetRetrato(agente: AgenteRetrato, formato: 'avif' | 'webp'): string {
  return ANCHOS[agente].map(w => `/retratos/${agente}.${VERSION}.${w}.${formato} ${w}w`).join(', ')
}

export function Retrato({ agente, size, className, style, alt = '', prioridad = false }: {
  agente: AgenteRetrato
  /** Lado que se pinta, en px de CSS. Decide qué ancho baja el navegador. */
  size: number | string
  className?: string
  style?: CSSProperties
  alt?: string
  /** Arriba del pliegue (la cabecera, el sello del chat vacío): sin `loading="lazy"`. */
  prioridad?: boolean
}) {
  const sizes = typeof size === 'number' ? `${size}px` : size
  // Mi marca (Ajustes › Diseño, 10 nov 2026): con logo propio, el asistente lleva ese logo en vez del retrato de fábrica.
  const { logo } = useMiMarca()
  if (agente === 'levy' && logo) {
    const lado = typeof size === 'number' ? size : undefined
    return <img src={logo} alt={alt} className={className} style={style} width={lado} height={lado} loading={prioridad ? 'eager' : 'lazy'} decoding="async" draggable={false} />
  }
  return (
    <picture>
      <source type="image/avif" srcSet={srcsetRetrato(agente, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcsetRetrato(agente, 'webp')} sizes={sizes} />
      <img
        src={ORIGINAL[agente]}
        alt={alt}
        className={className}
        style={style}
        width={typeof size === 'number' ? size : undefined}
        height={typeof size === 'number' ? size : undefined}
        loading={prioridad ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
      />
    </picture>
  )
}
