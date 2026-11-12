'use client'
/**
 * Mi marca en la ventana (mi Arbrain, 10 nov 2026): el nombre y el logo de `mi-marca/` para cualquier componente
 * (cabecera, chat, retrato). Una sola petición a `/api/mi-marca` compartida; Ajustes › Diseño llama a
 * `recargarMiMarca()` al guardar y todo se repinta sin recargar, también los colores (`tema.css` con versión nueva).
 * El último valor se recuerda en localStorage para no enseñar «Levy» un instante en cada apertura.
 */
import { useSyncExternalStore } from 'react'

export interface MarcaVentana { nombre: string | null; logo: string | null }

export const NOMBRE_DE_FABRICA = 'Levy'
const CLAVE = 'arbrain:mi-marca'
const VACIA: MarcaVentana = { nombre: null, logo: null }
let estado: MarcaVentana = VACIA
let pedida = false
const oyentes = new Set<() => void>()

function avisar(m: MarcaVentana) {
  estado = m
  try { localStorage.setItem(CLAVE, JSON.stringify(m)) } catch { /* sin almacenamiento: da igual */ }
  for (const f of oyentes) f()
}

function pedir() {
  pedida = true
  fetch('/api/mi-marca', { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((m: Partial<MarcaVentana> | null) => { if (m) avisar({ nombre: m.nombre ?? null, logo: m.logo ?? null }) })
    .catch(() => { /* sin marca propia: la de fábrica */ })
}

function suscribir(f: () => void) {
  if (!pedida) {
    try {
      const guardada = JSON.parse(localStorage.getItem(CLAVE) ?? 'null') as MarcaVentana | null
      if (guardada && estado === VACIA) estado = { nombre: guardada.nombre ?? null, logo: guardada.logo ?? null }
    } catch { /* nada guardado */ }
    pedir()
  }
  oyentes.add(f)
  return () => { oyentes.delete(f) }
}

export function useMiMarca(): MarcaVentana {
  return useSyncExternalStore(suscribir, () => estado, () => VACIA)
}

/** El nombre del asistente: el de Ajustes › Diseño o el de fábrica. */
export function useNombreAsistente(): string {
  return useMiMarca().nombre ?? NOMBRE_DE_FABRICA
}

/** Lo mismo fuera de React (mensajes dentro de callbacks): el valor de este momento. */
export function nombreAsistenteAhora(): string {
  return estado.nombre ?? NOMBRE_DE_FABRICA
}

/** Tras guardar en Ajustes › Diseño: nombre, logo y colores nuevos sin recargar la ventana. */
export function recargarMiMarca() {
  pedir()
  for (const l of document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href^="/api/mi-marca/tema"]')) {
    l.href = `/api/mi-marca/tema?v=${Date.now()}`
  }
}
