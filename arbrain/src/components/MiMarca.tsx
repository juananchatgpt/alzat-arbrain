'use client'

/**
 * Mi marca (lib/mi-marca.ts): aplica en la ventana el nombre y el logo de `mi-marca/` del dueño. Los colores no pasan
 * por aquí: `tema.css` lo enlaza el layout como hoja de estilos. Next reescribe el título y los iconos al navegar, así
 * que un observador del <head> los vuelve a poner. Sin `mi-marca/`, no hace nada.
 * Mi Arbrain (10 nov 2026): lee de la tienda compartida (lib/mi-marca-cliente.ts), así que lo que se guarda en
 * Ajustes › Diseño se ve al momento, sin recargar.
 */
import { useEffect } from 'react'
import { tituloConMarca } from '@/lib/mi-marca-titulo'
import { useMiMarca } from '@/lib/mi-marca-cliente'

export function MiMarca() {
  const { nombre, logo } = useMiMarca()
  useEffect(() => {
    if (!nombre && !logo) return
    const aplicar = () => {
      const t = tituloConMarca(document.title, nombre)
      if (t !== document.title) document.title = t
      if (logo) {
        for (const l of document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"], link[rel="apple-touch-icon"]')) {
          if (l.getAttribute('href') !== logo) l.setAttribute('href', logo)
        }
      }
    }
    aplicar()
    const observador = new MutationObserver(aplicar)
    observador.observe(document.head, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['href'] })
    return () => observador.disconnect()
  }, [nombre, logo])
  return null
}
