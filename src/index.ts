/**
 * @ai-pip/core - Core implementation of the AI-PIP protocol
 * 
 * @remarks
 * Main entry point that re-exports all layers (CSL, ISL, Shared)
 * 
 * You can also import specific layers:
 * - import { segment } from '@ai-pip/core/csl'
 * - import { sanitize } from '@ai-pip/core/isl'
 * - import { addLineageEntry } from '@ai-pip/core/shared'
 * - import { envelope } from '@ai-pip/core/cpe'
 */

// Re-export all layers
export * from './csl'
export * from './isl'
export * from './shared'
export * from './cpe'


