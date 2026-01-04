import { OriginType } from '../types.js'

/**
 * Origin - tipo puro
 */
export type Origin = {
  readonly type: OriginType
}

/**
 * Crea un Origin - función pura
 */
export function createOrigin(type: OriginType): Origin {
  if (!Object.values(OriginType).includes(type)) {
    throw new Error(`Invalid Origin type: ${type}`)
  }
  return { type }
}

/**
 * Funciones puras para Origin
 */
export function isDom(origin: Origin): boolean {
  return origin.type === OriginType.DOM_HIDDEN ||
         origin.type === OriginType.DOM_VISIBLE ||
         origin.type === OriginType.DOM_ATTRIBUTE
}

export function isUser(origin: Origin): boolean {
  return origin.type === OriginType.USER
}

export function isSystem(origin: Origin): boolean {
  return origin.type === OriginType.SYSTEM_GENERATED
}

export function isInjected(origin: Origin): boolean {
  return origin.type === OriginType.SCRIPT_INJECTED
}

export function isUnknown(origin: Origin): boolean {
  return origin.type === OriginType.UNKNOWN
}

export function isNetworkFetched(origin: Origin): boolean {
  return origin.type === OriginType.NETWORK_FETCHED
}

export function isExternal(origin: Origin): boolean {
  return origin.type === OriginType.NETWORK_FETCHED ||
         origin.type === OriginType.SCRIPT_INJECTED
}
