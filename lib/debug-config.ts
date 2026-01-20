/**
 * Debug Configuration for Production
 *
 * Enable verbose logging in production by setting URL param: ?debug=true
 */

export function isDebugMode(): boolean {
  if (typeof window === 'undefined') return false

  const params = new URLSearchParams(window.location.search)
  return params.get('debug') === 'true'
}

export function debugLog(message: string, ...args: any[]) {
  if (isDebugMode()) {
    console.log(`[DEBUG] ${message}`, ...args)
  }
}

export function debugWarn(message: string, ...args: any[]) {
  if (isDebugMode()) {
    console.warn(`[DEBUG] ${message}`, ...args)
  }
}

export function debugError(message: string, ...args: any[]) {
  if (isDebugMode()) {
    console.error(`[DEBUG] ${message}`, ...args)
  }
}
