/**
 * Official namespace identifier for AI-PIP semantic tags.
 *
 * This namespace is used by upper layers (SDK) to serialize
 * ThreatTags into textual encapsulation form:
 *
 * <aipip:threat-type>...</aipip>
 *
 * The core does not perform serialization.
 * This value must remain stable across versions.
 */
export const AIPIP_NAMESPACE = "aipip" as const;


/**
 * Current schema version for AI-PIP tag structure.
 * Used for forward compatibility if needed.
 */
export const AIPIP_TAG_SCHEMA_VERSION = 1 as const;



