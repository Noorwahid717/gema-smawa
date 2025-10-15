// Live classroom debug utilities removed. Minimal placeholder to avoid import errors.
export function createDebugLogger(_namespace: string) {
  const noop = (..._args: unknown[]) => undefined
  return {
    log: noop,
    info: noop,
    warn: noop,
    error: noop,
    time: noop,
    timeEnd: noop
  }
}

export function toggleDebugLogging(_enabled: boolean): void {
  // no-op: live classroom debug removed
}
