'use client'
/**
 * Ajustes › Diseño (mi Arbrain, 10 nov 2026, Juanan): el nombre del asistente, el logo, el color, la web, las redes y
 * quién es el dueño, en un formulario. Guarda en `mi-marca/` y en su memoria (lib/mi-diseno/) y se ve al momento.
 */
import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { recargarMiMarca } from '@/lib/mi-marca-cliente'
import { colorValido, disenoVacio, NOMBRE_RED, REDES, type Diseno, type Red } from '@/lib/mi-diseno/validar'
import { contrasteConBlanco } from '@/lib/mi-diseno/paleta'

type Aviso = { tipo: 'ok' | 'error'; texto: string } | null
const COLORES = [
  { nombre: 'Azul', hex: '#2563eb' }, { nombre: 'Verde', hex: '#0e7c66' }, { nombre: 'Naranja', hex: '#ea580c' },
  { nombre: 'Rojo', hex: '#dc2626' }, { nombre: 'Navy', hex: '#24466a' }, { nombre: 'Morado de fábrica', hex: '#8c27f1' },
]

function Tarjeta({ titulo, detalle, children }: { titulo: string; detalle: string; children: React.ReactNode }) {
  return (
    <section className="solid-card overflow-hidden">
      <div className="border-b border-border-subtle px-4 py-3 sm:px-5">
        <h3 className="text-sm font-semibold text-foreground/90">{titulo}</h3>
        <p className="mt-0.5 text-xs leading-snug text-muted">{detalle}</p>
      </div>
      <div className="space-y-4 px-4 py-4 sm:px-5">{children}</div>
    </section>
  )
}

function Campo({ id, etiqueta, ayuda, children }: { id: string; etiqueta: string; ayuda?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted">{etiqueta}</label>
      {children}
      {ayuda && <p className="text-[11px] leading-snug text-muted/80">{ayuda}</p>}
    </div>
  )
}

const entrada = 'input-field min-h-11 w-full px-3 text-sm md:min-h-9'

export function SeccionDiseno() {
  const [d, setD] = useState<Diseno>(disenoVacio)
  const [logo, setLogo] = useState<string | null>(null)
  const [cargado, setCargado] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [aviso, setAviso] = useState<Aviso>(null)
  const archivo = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/mi-diseno', { cache: 'no-store' })
      .then(async (r) => {
        const j = await r.json().catch(() => null) as { diseno?: Diseno; logo?: string | null; error?: string } | null
        if (!r.ok || !j?.diseno) throw new Error(j?.error ?? `código ${r.status}`)
        setD(j.diseno); setLogo(j.logo ?? null)
      })
      .catch((e: Error) => setAviso({ tipo: 'error', texto: `No pude leer tu diseño: ${e.message}` }))
      .finally(() => setCargado(true))
  }, [])

  const poner = <K extends keyof Diseno>(k: K, v: Diseno[K]) => setD((x) => ({ ...x, [k]: v }))
  const ponerRed = (red: Red, v: string) => setD((x) => ({ ...x, redes: { ...x.redes, [red]: v } }))

  const guardar = async () => {
    setGuardando(true); setAviso(null)
    try {
      const r = await fetch('/api/mi-diseno', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
      const j = await r.json().catch(() => null) as { diseno?: Diseno; memoria?: boolean; error?: string } | null
      if (!r.ok || !j?.diseno) throw new Error(j?.error ?? `código ${r.status}`)
      setD(j.diseno)
      recargarMiMarca()
      setAviso({ tipo: 'ok', texto: j.memoria ? 'Guardado. Tu asistente lo sabrá desde la próxima conversación.' : 'Guardado.' })
    } catch (e) {
      setAviso({ tipo: 'error', texto: e instanceof Error ? e.message : String(e) })
    } finally {
      setGuardando(false)
    }
  }

  const subirLogo = async (f: File | undefined, quitar = false) => {
    if (!f && !quitar) return
    setSubiendo(true); setAviso(null)
    try {
      const fd = new FormData()
      if (f) fd.append('logo', f)
      const r = await fetch('/api/mi-diseno/logo', quitar ? { method: 'DELETE' } : { method: 'POST', body: fd })
      const j = await r.json().catch(() => null) as { logo?: string | null; error?: string } | null
      if (!r.ok) throw new Error(j?.error ?? `código ${r.status}`)
      setLogo(j?.logo ?? null)
      recargarMiMarca()
      setAviso({ tipo: 'ok', texto: quitar ? 'Logo quitado: vuelve el de fábrica.' : 'Logo puesto.' })
    } catch (e) {
      setAviso({ tipo: 'error', texto: e instanceof Error ? e.message : String(e) })
    } finally {
      setSubiendo(false)
      if (archivo.current) archivo.current.value = ''
    }
  }

  const color = colorValido(d.color)
  const pocoContraste = color && contrasteConBlanco(color) < 3

  if (!cargado) return <p className="flex items-center gap-2 text-xs text-muted"><Loader2 size={14} className="animate-spin" />Leyendo tu diseño…</p>

  return (
    <div className="space-y-4">
      <Tarjeta titulo="Tu asistente" detalle="Cómo se llama y qué imagen lleva. El nombre sale en la cabecera, el chat y el título de la ventana.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="diseno-nombre" etiqueta="Nombre del asistente">
            <input id="diseno-nombre" className={entrada} value={d.nombre} maxLength={40} placeholder="Levy" onChange={(e) => poner('nombre', e.target.value)} />
          </Campo>
          <Campo id="diseno-negocio" etiqueta="Tu negocio">
            <input id="diseno-negocio" className={entrada} value={d.negocio} maxLength={60} placeholder="El nombre de tu empresa" onChange={(e) => poner('negocio', e.target.value)} />
          </Campo>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {logo ? <img src={logo} alt="Tu logo" className="size-full object-cover" /> : <ImagePlus size={20} className="text-muted" aria-hidden />}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-primary min-h-11 px-3 text-xs md:min-h-9" disabled={subiendo} onClick={() => archivo.current?.click()}>
              {subiendo ? 'Subiendo…' : logo ? 'Cambiar logo' : 'Subir logo'}
            </button>
            {logo && (
              <button type="button" className="btn-secondary inline-flex min-h-11 items-center gap-1.5 px-3 text-xs md:min-h-9" disabled={subiendo} onClick={() => subirLogo(undefined, true)}>
                <Trash2 size={13} aria-hidden />Quitar
              </button>
            )}
            <p className="w-full text-[11px] text-muted/80">Cuadrado, PNG, WebP, JPG o SVG, hasta 2 MB. El anterior se guarda en mi-marca/anteriores.</p>
          </div>
          <input ref={archivo} type="file" accept="image/png,image/webp,image/jpeg,image/svg+xml" className="hidden" onChange={(e) => subirLogo(e.target.files?.[0])} />
        </div>
      </Tarjeta>

      <Tarjeta titulo="Color principal" detalle="Sustituye el morado de fábrica en botones, enlaces, foco y acentos, en modo claro y oscuro.">
        <div className="flex flex-wrap items-center gap-3">
          <input type="color" aria-label="Elegir color" value={color || '#8c27f1'} onChange={(e) => poner('color', e.target.value)} className="h-10 w-14 cursor-pointer rounded-md border border-border bg-transparent" />
          <input aria-label="Color en hexadecimal" className={`${entrada} max-w-32 font-mono`} value={d.color} placeholder="#2563eb" onChange={(e) => poner('color', e.target.value)} />
          <span className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ background: color || '#8c27f1' }}>Así se ve un botón</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {COLORES.map((c) => (
            <button key={c.hex} type="button" title={c.nombre} aria-label={c.nombre} onClick={() => poner('color', c.hex)}
              className={`size-7 rounded-full border-2 ${color === c.hex ? 'border-foreground' : 'border-transparent'}`} style={{ background: c.hex }} />
          ))}
        </div>
        {pocoContraste && <p className="text-[11px] text-warning">Ojo: el texto blanco se lee mal sobre este color. Prueba un tono más oscuro.</p>}
      </Tarjeta>

      <Tarjeta titulo="Dónde te encuentran" detalle="Tu página web y tus redes. Tu asistente las usa al preparar contenido, firmas o propuestas. Deja vacío lo que no uses.">
        <Campo id="diseno-web" etiqueta="Página web">
          <input id="diseno-web" className={entrada} value={d.web} inputMode="url" placeholder="tunegocio.com" onChange={(e) => poner('web', e.target.value)} />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          {REDES.map((red) => (
            <Campo key={red} id={`diseno-${red}`} etiqueta={NOMBRE_RED[red]}>
              <input id={`diseno-${red}`} className={entrada} value={d.redes[red]} inputMode="url" placeholder="El enlace de tu perfil" onChange={(e) => ponerRed(red, e.target.value)} />
            </Campo>
          ))}
        </div>
      </Tarjeta>

      <Tarjeta titulo="Quién eres" detalle="En pocas líneas y con tus palabras. Va a la memoria de tu asistente para que te conozca desde el primer día.">
        <Campo id="diseno-quien" etiqueta="Quién soy" ayuda="A qué te dedicas y qué vendes.">
          <textarea id="diseno-quien" className="input-field min-h-20 w-full px-3 py-2 text-sm" maxLength={500} value={d.quienSoy} onChange={(e) => poner('quienSoy', e.target.value)} />
        </Campo>
        <Campo id="diseno-ayudo" etiqueta="A quién ayudo" ayuda="Tu cliente ideal: tamaño, sector o problema.">
          <textarea id="diseno-ayudo" className="input-field min-h-16 w-full px-3 py-2 text-sm" maxLength={500} value={d.aQuienAyudo} onChange={(e) => poner('aQuienAyudo', e.target.value)} />
        </Campo>
        <Campo id="diseno-objetivo" etiqueta="Mi objetivo" ayuda="En una frase y con un número, si lo tienes.">
          <textarea id="diseno-objetivo" className="input-field min-h-16 w-full px-3 py-2 text-sm" maxLength={500} value={d.objetivo} onChange={(e) => poner('objetivo', e.target.value)} />
        </Campo>
      </Tarjeta>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {aviso && <p role="status" className={`rounded-lg px-3 py-2 text-xs ${aviso.tipo === 'ok' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>{aviso.texto}</p>}
        <button type="button" className="btn-primary min-h-11 px-4 text-sm md:min-h-9" disabled={guardando} onClick={guardar}>
          {guardando ? 'Guardando…' : 'Guardar diseño'}
        </button>
      </div>
    </div>
  )
}
