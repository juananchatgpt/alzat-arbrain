// Autorreparación del arranque (mi Arbrain, 20 nov 2026).
//
// Dos fallos reales del 20 nov dejaron Arbrain en «Encendiendo…» sin salida:
//   1. `next build` se quedó colgado 84 min sin gastar CPU; el arranque lo esperaba sin límite (spawnSync sin plazo).
//   2. El candado `store/claudeclaw.pid` apuntaba a un pid que Windows ya había dado a otro programa (Claude.exe):
//      el daemon solo mira «¿existe ese pid?» y salía con «Another instance is already running», una y otra vez.
//
// Este módulo pone un plazo a las compilaciones (si se pasa, corta el árbol de procesos y deja que el bucle de
// reintentos vuelva a probar) y, en Windows, revisa el candado antes de lanzar el daemon: si el pid es un daemon
// huérfano de esta instalación lo apaga; si es otro programa, aparta el candado (lo renombra, no lo borra).

import { spawn, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, renameSync } from 'node:fs'

const WIN = process.platform === 'win32'

/** Plazo de cada compilación: 5 min por defecto (lo normal es ~1 min); `ARBRAIN_PLAZO_COMPILAR_MIN` lo cambia. */
export function plazoCompilarMs(env = process.env) {
  const min = Number.parseFloat(env.ARBRAIN_PLAZO_COMPILAR_MIN ?? '')
  return (Number.isFinite(min) && min > 0 ? min : 5) * 60_000
}

/** Apaga un proceso y todos sus hijos (Windows: taskkill /T /F; resto: SIGKILL al grupo y al proceso). */
export function matarArbol(pid) {
  if (!Number.isInteger(pid) || pid <= 1) return
  if (WIN) { spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true }); return }
  try { process.kill(-pid, 'SIGKILL') } catch { /* sin grupo propio */ }
  try { process.kill(pid, 'SIGKILL') } catch { /* ya salió */ }
}

/**
 * Como `correr` (salida a la terminal y al log), pero con plazo. Si vence, avisa, corta el árbol entero y devuelve
 * `{ codigo: 124, vencido: true }` para que quien llama lo trate como un intento fallido.
 */
export function correrConPlazo(cmd, args, { cwd, env = process.env, plazoMs = plazoCompilarMs(env), alVencer } = {}) {
  return new Promise((ok) => {
    let vencido = false
    let hijo
    try {
      hijo = spawn(cmd, args, { cwd, env, stdio: 'inherit', windowsHide: true, detached: !WIN })
    } catch (e) {
      ok({ codigo: 1, vencido: false, error: e })
      return
    }
    const reloj = setTimeout(() => {
      vencido = true
      alVencer?.(plazoMs)
      matarArbol(hijo.pid)
    }, plazoMs)
    hijo.on('error', (e) => { clearTimeout(reloj); ok({ codigo: 1, vencido, error: e }) })
    hijo.on('exit', (codigo) => { clearTimeout(reloj); ok({ codigo: vencido ? 124 : (codigo ?? 1), vencido }) })
  })
}

/** Línea de comando de un pid en Windows ('' si no existe). Exportada para las pruebas. */
export function lineaDeComandoWindows(pid) {
  const r = spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-Command',
    `$p = Get-CimInstance Win32_Process -Filter 'ProcessId=${Number(pid)}'; if ($p) { [Console]::Out.Write($p.CommandLine) }`],
  { encoding: 'utf8', windowsHide: true, timeout: 15_000 })
  return (r.stdout ?? '').trim()
}

const normal = (s) => String(s).replace(/\\/g, '/').toLowerCase()

/**
 * Qué hacer con el candado del daemon. Pura (las pruebas la usan sin procesos):
 *   - 'nada'      sin candado, pid inválido o el proceso ya no existe (eso lo limpia el propio daemon);
 *   - 'apagar'    el pid es un node que corre un daemon de esta carpeta de programas (huérfano de otra corrida);
 *   - 'apartar'   el pid lo tiene otro programa (Windows reutilizó el número): el candado miente.
 */
export function decidirCandado({ pid, lineaDeComando, programa, propioPid = process.pid }) {
  if (!Number.isInteger(pid) || pid <= 1 || pid === propioPid) return 'nada'
  if (!lineaDeComando) return 'nada'
  return normal(lineaDeComando).includes(normal(programa)) ? 'apagar' : 'apartar'
}

/** Windows: revisa `claudeclaw.pid` antes de lanzar el daemon y lo repara. Fuera de Windows no hace nada. */
export function repararCandadoWindows({ archivo, programa, registrar = () => {}, consultar = lineaDeComandoWindows }) {
  if (!WIN || !existsSync(archivo)) return 'nada'
  let pid
  try { pid = Number.parseInt(readFileSync(archivo, 'utf8').trim(), 10) } catch { return 'nada' }
  const accion = decidirCandado({ pid, lineaDeComando: Number.isInteger(pid) ? consultar(pid) : '', programa })
  if (accion === 'apagar') {
    registrar(`Reparación automática: daemon huérfano de una corrida anterior (pid ${pid}); lo apago.`)
    matarArbol(pid)
  } else if (accion === 'apartar') {
    const destino = `${archivo}.viejo-${pid}-${Date.now()}`
    try {
      renameSync(archivo, destino)
      registrar(`Reparación automática: el candado del daemon apuntaba al pid ${pid}, que ahora es otro programa. Lo aparté (${destino}).`)
    } catch (e) {
      registrar(`Reparación automática: no pude apartar el candado del daemon (${e?.message ?? e}).`)
    }
  }
  return accion
}
