// Tipos
export type { TrustLevel } from './TrustLevel.js'
export type { Origin } from './Origin.js'
export type { LineageEntry } from './LineageEntry.js'
export type { ContentHash } from './ContentHash.js'

// Funciones de creación
export { createTrustLevel, isTrusted, isSemiTrusted, isUntrusted } from './TrustLevel.js'
export { createOrigin, isDom, isUser, isSystem, isInjected, isUnknown, isNetworkFetched, isExternal } from './Origin.js'
export { createLineageEntry } from './LineageEntry.js'
export { createContentHash, isSha256, isSha512 } from './ContentHash.js'

// Origin-map
export { originMap, validateOriginMap } from './Origin-map.js'
