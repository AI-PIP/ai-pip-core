# CPE - Cryptographic Prompt Envelope

> **Envoltorio Criptográfico de Prompts** - Tercera capa del protocolo AI-PIP

## 📋 Descripción General

La **Cryptographic Prompt Envelope (CPE)** es la tercera capa del protocolo AI-PIP. Su función principal es generar un envoltorio criptográfico que garantiza la integridad y autenticidad del prompt procesado por las capas anteriores.

### Principios Fundamentales

- **Integridad Criptográfica**: Firma HMAC-SHA256 del contenido
- **No Repudio**: Timestamp y nonce únicos
- **Trazabilidad Completa**: Linaje completo preservado
- **Metadata de Seguridad**: Información de auditoría

## 🎯 Funcionalidades Principales

### 1. Generación de Metadata de Seguridad

CPE genera metadata que incluye:

- **Timestamp**: Momento de creación del envelope
- **Nonce**: Valor único para prevenir ataques de replay
- **Protocol Version**: Versión del protocolo AI-PIP
- **Previous Signatures**: Firmas opcionales de capas anteriores (CSL, ISL)

```typescript
import { createMetadata, CURRENT_PROTOCOL_VERSION } from '@ai-pip/core/cpe'

const metadata = createMetadata(
  Date.now(),
  nonce,
  CURRENT_PROTOCOL_VERSION,
  {
    csl: 'csl-signature-123',  // Opcional
    isl: 'isl-signature-456'   // Opcional
  }
)
```

### 2. Firma Criptográfica HMAC-SHA256

CPE genera una firma criptográfica del contenido usando HMAC-SHA256:

```typescript
import { createSignature, verifySignature } from '@ai-pip/core/cpe'

// Generar firma
const signature = createSignature(
  signableContent,
  secretKey
)

// Verificar firma
const isValid = verifySignature(
  content,
  signature.value,
  secretKey
)
```

### 3. Construcción del Envelope

CPE construye el envelope criptográfico completo:

```typescript
import { envelope } from '@ai-pip/core/cpe'

const cpeResult = envelope(islResult, secretKey)

// cpeResult.envelope contiene:
// - payload: contenido procesado (semántico)
// - metadata: metadata de seguridad
// - signature: firma criptográfica
// - lineage: linaje completo
```

## 📦 Componentes

### Funciones Principales

- **`envelope(islResult: ISLResult, secretKey: string): CPEResult`** - Función principal de generación de envelope

### Value Objects

- **`Nonce`** - Valor único para prevenir replay attacks
- **`Metadata`** - Metadata de seguridad del envelope
- **`SignatureVO`** - Firma criptográfica (value + algorithm)

### Tipos

- **`CPEEvelope`** - Envoltorio criptográfico completo
- **`CPEResult`** - Resultado de generación del envelope
- **`CPEMetadata`** - Metadata de seguridad
- **`SignatureAlgorithm`** - Algoritmo de firma (HMAC-SHA256)
- **`ProtocolVersion`** - Versión del protocolo
- **`Timestamp`** - Timestamp Unix en milisegundos
- **`NonceValue`** - Valor del nonce

## 🔄 Flujo de Procesamiento

```
ISLResult (contenido sanitizado)
    ↓
Generar metadata (timestamp, nonce, versión)
    ↓
Preparar payload semántico
    ↓
Generar firma HMAC-SHA256
    ↓
Actualizar linaje con entrada CPE
    ↓
Construir envelope criptográfico
    ↓
CPEResult (envelope + metadata)
```

## ✅ Garantías

1. **Integridad**: Firma criptográfica garantiza integridad del contenido
2. **Autenticidad**: HMAC-SHA256 con clave secreta garantiza autenticidad
3. **No Repudio**: Timestamp y nonce únicos previenen replay attacks
4. **Trazabilidad**: Linaje completo preservado para auditoría

## 📝 Ejemplo de Uso

```typescript
import { envelope, createNonce, verifySignature } from '@ai-pip/core/cpe'
import { sanitize } from '@ai-pip/core/isl'
import { segment } from '@ai-pip/core/csl'

// 1. Procesar contenido a través de CSL e ISL
const cslResult = segment({ content: '...', source: 'UI' })
const islResult = sanitize(cslResult)

// 2. Generar envelope criptográfico
const secretKey = 'your-secret-key' // Debe ser proporcionado por el SDK
const cpeResult = envelope(islResult, secretKey)

// cpeResult.envelope contiene:
// - payload: {
//     segments: [
//       { id, content, trust, sanitizationLevel }
//     ]
//   }
// - metadata: {
//     timestamp: 1234567890,
//     nonce: 'unique-nonce-value',
//     protocolVersion: '1.0.0',
//     previousSignatures: { csl, isl } // Opcional
//   }
// - signature: {
//     value: 'hmac-sha256-signature',
//     algorithm: 'HMAC-SHA256'
//   }
// - lineage: [ /* linaje completo */ ]

// 3. Verificar firma (en el SDK o aplicación)
const isValid = verifySignature(
  serializedContent,
  cpeResult.envelope.signature.value,
  secretKey
)
```

## 🔗 Integración con ISL y ModelGateway

### Entrada desde ISL

CPE recibe `ISLResult` con contenido sanitizado y linaje actualizado.

### Salida hacia ModelGateway

CPE produce `CPEResult` que contiene el envelope criptográfico completo listo para ser enviado al modelo.

## 🔐 Seguridad

### Algoritmo de Firma

- **HMAC-SHA256**: Algoritmo estándar para garantizar integridad y autenticidad
- **Clave Secreta**: Debe ser proporcionada por el SDK o aplicación
- **Validación de Formato**: Verificación de formato de firma (64 caracteres hex)

### Prevención de Replay Attacks

- **Nonce Único**: Cada envelope tiene un nonce único
- **Timestamp**: Validación de timestamp para prevenir ataques de replay
- **Validación de Futuro**: Timestamps del futuro son rechazados (con margen de 5 minutos)

## ⚠️ Limitaciones del Core

El core de CPE **NO incluye**:
- Serialización del envelope (va al SDK)
- Deserialización del envelope (va al SDK)
- Gestión de claves secretas (va al SDK)
- Validación de timestamps en tiempo real (va al SDK)

Estas funcionalidades se implementan en el SDK o en la aplicación.

