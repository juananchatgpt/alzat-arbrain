// Segundo Cerebro — detalle de un nodo: contenido markdown completo (read-only),
// outlinks y backlinks resueltos. Server-side por el gotcha RLS/desktop.
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hasRole } from '@/lib/auth-utils'
import { esEdicionCliente } from '@/lib/edicion'
import { planningOwner } from '@/lib/planning/server'
import { getNodeDetail } from '@/features/cerebro/server/graph'

export const dynamic = 'force-dynamic'

async function authorized(): Promise<boolean> {
  // Edición cliente (mi Arbrain, 26 oct 2026): sin Supabase; el dueño es el mismo que abre su calendario y sus archivos.
  if (esEdicionCliente()) return planningOwner().then(() => true, () => false)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return !!user && (await hasRole(user.id, 'owner', 'admin'))
}

export async function GET(request: Request) {
  if (!(await authorized())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const id = new URL(request.url).searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }
  const detail = await getNodeDetail(id)
  if (!detail) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  return NextResponse.json(detail)
}
