// Ajustes › Diseño: subir o quitar el logo (lib/mi-diseno/disco.ts). El tipo se decide por los bytes, no por el
// navegador; el anterior va a `mi-marca/anteriores/`. Se sirve por `/api/mi-marca/logo` (con CSP de caja de arena).
import { soloAppCliente, NOCACHE } from '@/lib/daemon-local'
import { raizWorkspace } from '@/lib/rutas-instalacion'
import { MAX_LOGO } from '@/lib/mi-marca'
import { guardarLogo, leerDiseno, quitarLogo } from '@/lib/mi-diseno/disco'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const no = await soloAppCliente(request, true)
  if (no) return no
  const largo = Number(request.headers.get('content-length') ?? 0)
  if (largo > MAX_LOGO + 64 * 1024) return Response.json({ error: 'El logo pasa de 2 MB: usa uno más ligero.' }, { status: 413, headers: NOCACHE })
  const form = await request.formData().catch(() => null)
  const archivo = form?.get('logo')
  if (!archivo || typeof archivo === 'string') return Response.json({ error: 'Falta el archivo del logo.' }, { status: 400, headers: NOCACHE })
  const r = await guardarLogo(raizWorkspace(), Buffer.from(await archivo.arrayBuffer()))
  if (!r.ok) return Response.json({ error: r.error }, { status: 400, headers: NOCACHE })
  return Response.json({ ok: true, logo: (await leerDiseno(raizWorkspace())).logo }, { headers: NOCACHE })
}

export async function DELETE(request: Request) {
  const no = await soloAppCliente(request, true)
  if (no) return no
  await quitarLogo(raizWorkspace())
  return Response.json({ ok: true, logo: null }, { headers: NOCACHE })
}
