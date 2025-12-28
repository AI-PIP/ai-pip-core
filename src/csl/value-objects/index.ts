// Tipos
export type { TrustLevel } from './TrustLevel'
export type { Origin } from './Origin'
export type { LineageEntry } from './LineageEntry'
export type { ContentHash } from './ContentHash'

// Funciones de creación
export { createTrustLevel, isTrusted, isSemiTrusted, isUntrusted } from './TrustLevel'
export { createOrigin, isDom, isUser, isSystem, isInjected, isUnknown, isNetworkFetched, isExternal } from './Origin'
export { createLineageEntry } from './LineageEntry'
export { createContentHash, isSha256, isSha512 } from './ContentHash'

// Origin-map
export { originMap, validateOriginMap } from './Origin-map'
