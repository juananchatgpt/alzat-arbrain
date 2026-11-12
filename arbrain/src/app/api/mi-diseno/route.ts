// Ajustes › Diseño (mi Arbrain, 10 nov 2026; lib/mi-diseno/): leer y guardar la marca del dueño. Distinta de
// `/api/mi-marca`, que pasa sin sesión: esta escribe, así que pide la sesión de la app y origen propio al guardar.
import { soloAppCliente, NOCACHE } from '@/lib/daemon-local'
import { raizWorkspace } from '@/lib/rutas-instalacion'
import { validarDiseno } from '@/lib/mi-diseno/validar'
import { guardarDiseno, leerDiseno } from '@/lib/mi-diseno/disco'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const no = await soloAppCliente()
  if (no) return no
  return Response.json(await leerDiseno(raizWorkspace()), { headers: NOCACHE })
}

export async function POST(request: Request) {
  const no = await soloAppCliente(request, true)
  if (no) return no
  const v = validarDiseno(await request.json().catch(() => null))
  if (!v.ok) return Response.json({ error: v.error }, { status: 400, headers: NOCACHE })
  try {
    const hecho = await guardarDiseno(raizWorkspace(), v.diseno)
    return Response.json({ ok: true, ...hecho, ...(await leerDiseno(raizWorkspace())) }, { headers: NOCACHE })
  } catch (e) {
    return Response.json({ error: `No se pudo guardar: ${e instanceof Error ? e.message : String(e)}` }, { status: 500, headers: NOCACHE })
  }
}
