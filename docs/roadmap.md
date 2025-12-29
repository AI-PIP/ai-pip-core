# Roadmap - AI-PIP Protocol

> Plan de desarrollo y evolución del protocolo AI-PIP

**Última Actualización**: Enero 2025

---

## 📊 Estado Actual

### ✅ Fase 1: Capas Core

**Estado**: Completado

#### Capas Implementadas ✅

- **CSL (Context Segmentation Layer)**: ✅ Completado
  - Segmentación de contenido
  - Clasificación por origen (source/origin)
  - Inicialización de linaje
  - Value objects inmutables
  - Funciones puras

- **ISL (Instruction Sanitization Layer)**: ✅ Completado
  - Sanitización diferenciada por trust level
  - Detección de prompt injection (estructura básica)
  - Políticas de seguridad (PolicyRule)
  - Anomaly scoring
  - Value objects inmutables

- **CPE (Cryptographic Prompt Envelope)**: ✅ Completado
  - Generación de metadata de seguridad
  - Firma criptográfica HMAC-SHA256
  - Construcción de envelope
  - Preservación de linaje completo

- **Shared (Features Compartidas)**: ✅ Completado
  - Linaje global e incremental
  - Funciones puras compartidas entre capas
  - Auditoría completa del procesamiento

---

## 🗺️ Fases de Desarrollo

### 🔵 Fase 1: Capas Core del Protocolo

**Objetivo**: Implementar todas las capas core del protocolo AI-PIP

**Estado**: 100% completado (optimizaciones pendientes)

#### Tareas Completadas ✅

- [x] CSL - Context Segmentation Layer
- [x] ISL - Instruction Sanitization Layer
- [x] CPE - Cryptographic Prompt Envelope
- [x] Shared - Features compartidas (linaje global)
- [x] Value objects inmutables
- [x] Funciones puras sin efectos secundarios
- [x] Sistema de linaje (lineage) global e incremental
- [x] Tests unitarios (>80% cobertura)
- [x] Documentación completa de capas
- [x] Whitepaper del protocolo

#### Tareas Pendientes 🔄

- [ ] Reducir tamaño del core para hacerlo más liviano
- [ ] Nuevas funciones puras para fortalecer los SDKs
- [ ] Mejorar calidad de código (refactoring, optimizaciones)
- [ ] Optimización de rendimiento
- [ ] Mejoras en la documentación técnica

**Estimación**: Q1-Q2 2026

---

### 🟢 Fase 2: SDK Implementation (TypeScript/JavaScript)

**Objetivo**: Implementar SDK beta funcional y auditable del protocolo AI-PIP para entornos reales

**Estado**: No iniciado

#### SDK Beta - Objetivos Principales

Proveer una implementación funcional y auditable del protocolo AI-PIP capaz de:
- Detectar, localizar y mitigar prompt injection
- Identificar superficies de ataque en entornos reales (especialmente navegador)
- Integrar escaneo DOM completo
- Proporcionar lineage preciso por nodo
- Implementar políticas configurables
- Soportar flujos de agente
- Habilitar prevención, visualización y auditoría exacta de riesgos antes de la interacción con modelos de IA

#### Tareas del SDK TypeScript/JavaScript

- [ ] Arquitectura hexagonal
- [ ] Clases y estados para uso por desarrolladores
- [ ] Escaneo DOM completo y detección de contenido
- [ ] Lineage preciso por nodo DOM
- [ ] Serialización/deserialización de envelopes
- [ ] Gestión de claves secretas
- [ ] Políticas configurables de seguridad
- [ ] Integración con navegadores (extensiones, inyectables)
- [ ] Visualización de riesgos y auditoría
- [ ] Flujos de agente integrados
- [ ] Documentación y ejemplos
- [ ] Tests de integración en entornos reales

#### SDK Python

**Estado**: No planeado hasta finalizar SDK TypeScript/JavaScript

**Estimación**: Q3-Q4 2026 (después de completar SDK TypeScript)

---

### 🟡 Fase 3: Integración y Testing en Entornos Reales

**Objetivo**: Integrar el protocolo en entornos reales para validar su efectividad y robustez

**Estado**: No iniciado

#### Tareas de Integración

- [ ] Integración con navegadores reales (Chrome, Firefox, Safari)
- [ ] Testing en aplicaciones web reales
- [ ] Validación de detección de prompt injection en casos reales
- [ ] Testing de rendimiento en producción
- [ ] Validación de lineage en escenarios complejos
- [ ] Testing de políticas configurables
- [ ] Integración con agentes de IA reales
- [ ] Auditoría de seguridad en entornos reales
- [ ] Recopilación de métricas y feedback
- [ ] Optimización basada en resultados reales

**Estimación**: Q3-Q4 2026

---

### 🟠 Fase 4: Extensibilidad y Ecosistema

**Objetivo**: Crear un ecosistema alrededor del protocolo AI-PIP e integrar con agentes MCP

**Estado**: No iniciado

#### Implementaciones de Referencia

- [ ] **SDK-browser**
  - SDK / extensión de navegador basada en AI-PIP
  - Implementa CSL / ISL / CPE usando el SDK oficial
  - Detección de contexto oculto en DOM
  - Integración con agentes de navegador
  - Bloqueo de acciones mediante AAL (cuando esté disponible)
  - Caso de uso: navegación web asistida por IA segura

#### Tareas Planificadas

- [ ] Sistema de plugins
- [ ] Integraciones con frameworks de IA
- [ ] **Integración con agentes MCP (Model Context Protocol)**
  - [ ] Adaptador MCP para AI-PIP
  - [ ] Protección de contextos MCP con CSL/ISL/CPE
  - [ ] Validación de herramientas MCP
  - [ ] Sanitización de respuestas de agentes MCP
  - [ ] Integración con servidores MCP
  - [ ] Documentación de integración MCP
- [ ] Mejoras del SDK basadas en feedback
- [ ] Caché de resultados
- [ ] Optimización de rendimiento avanzada
- [ ] Métricas y observabilidad avanzada
- [ ] Herramientas de desarrollo
- [ ] CLI tools
- [ ] Dashboard de monitoreo
- [ ] Comunidad y contribuciones

**Estimación**: 2027

---

### 🔴 Fase 5: Escalabilidad y Producción

**Objetivo**: Optimizar para uso en producción a gran escala

**Estado**: No iniciado

#### Tareas Planificadas

- [ ] Optimización de rendimiento
- [ ] Escalabilidad horizontal
- [ ] Alta disponibilidad
- [ ] Distribución geográfica
- [ ] Compliance y certificaciones
- [ ] Auditorías de seguridad

**Estimación**: 2027-2028

---

## 📈 Métricas de Progreso

### Fase 1: Capas Core
- **Progreso**: 100% (3/3 capas core completadas + Shared)
- **Cobertura de Tests**: 87%
- **Documentación**: 100% (capas + whitepaper)

### Fase 2: SDK Implementation
- **Progreso**: 0%
- **Estado**: Esperando completar optimizaciones del core

---

## 🎯 Objetivos a Corto Plazo

1. **Core Robusto** (Q1-Q2 2026)
   - Reducir tamaño del core para hacerlo más liviano
   - Nuevas funciones puras para fortalecer los SDKs
   - Mejorar calidad de código
   - Optimizaciones de rendimiento

2. **SDK Beta del Protocolo** (Q2-Q3 2026)
   - Proveer una implementación funcional y auditable del protocolo AI-PIP
   - Capaz de detectar, localizar y mitigar prompt injection y superficies de ataque en entornos reales (especialmente navegador)
   - Integrando escaneo DOM, lineage preciso por nodo, políticas configurables y flujos de agente
   - Para habilitar prevención, visualización y auditoría exacta de riesgos antes de la interacción con modelos de IA

3. **Testing en Entornos Reales** (Q3-Q4 2026)
   - Validar efectividad del protocolo en producción
   - Recopilar métricas y feedback

---

## 📝 Notas

- Las estimaciones son aproximadas y pueden variar según prioridades
- Las fases pueden solaparse si hay recursos disponibles
- Las funcionalidades pueden ajustarse según feedback de la comunidad

---

## 🤝 Contribuciones

¿Quieres contribuir? Revisa las tareas pendientes en cada fase y contacta al equipo para coordinar.

**Repositorio**: https://github.com/AI-PIP/ai-pip-core  
**Issues**: https://github.com/AI-PIP/ai-pip-core/issues

