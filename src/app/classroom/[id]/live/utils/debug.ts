const GLOBAL_DEBUG_FLAG = 'debug:live-classroom'
const ENV_DEBUG_FLAG = process.env.NEXT_PUBLIC_DEBUG_LIVE_CLASSROOM

function isDebugEnabled(): boolean {
  if (ENV_DEBUG_FLAG) {
    return ENV_DEBUG_FLAG === 'true' || ENV_DEBUG_FLAG === '1'
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(GLOBAL_DEBUG_FLAG)
      if (stored !== null) {
        return stored === 'true'
      }
    } catch (error) {
      console.warn('[LiveClassroom:debug] Failed to access localStorage', error)
    }
  }

  return process.env.NODE_ENV !== 'production'
}

export type DebugLogger = {
  log: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
  time: (label: string) => void
  timeEnd: (label: string) => void
}

export function createDebugLogger(namespace: string): DebugLogger {
  const prefix = `[LiveClassroom:${namespace}]`

  const emit = (level: 'log' | 'info' | 'warn' | 'error', args: unknown[]) => {
    const shouldEmit = level === 'error' ? true : isDebugEnabled()
    if (!shouldEmit) {
      return
    }

    const consoleMethod = console[level] ?? console.log
    consoleMethod(prefix, ...args)
  }

  const timers = new Set<string>()

  return {
    log: (...args: unknown[]) => emit('log', args),
    info: (...args: unknown[]) => emit('info', args),
    warn: (...args: unknown[]) => emit('warn', args),
    error: (...args: unknown[]) => emit('error', args),
    time: (label: string) => {
      if (!isDebugEnabled()) return
      if (timers.has(label)) return
      timers.add(label)
      console.time(`${prefix} ${label}`)
    },
    timeEnd: (label: string) => {
      if (!isDebugEnabled()) return
      if (!timers.has(label)) return
      timers.delete(label)
      console.timeEnd(`${prefix} ${label}`)
    }
  }
}

export function toggleDebugLogging(enabled: boolean): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(GLOBAL_DEBUG_FLAG, enabled ? 'true' : 'false')
    console.log('[LiveClassroom:debug] Logging updated', { enabled })
  } catch (error) {
    console.warn('[LiveClassroom:debug] Failed to update debug flag', error)
  }
}
