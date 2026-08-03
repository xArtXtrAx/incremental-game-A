# MODELO MATEMÁTICO — Incremental Game A

> Referencia viva de las fórmulas que gobiernan economía, producción, progresión y sistemas avanzados.
>
> **Autoridad final:** el código de `main`. Este documento explica el comportamiento vigente, pero debe actualizarse cuando cambie una fórmula, un límite o una condición de desbloqueo.

## 1. Propósito

`MODELO_MATEMATICO.md` sirve para:

- reunir en un solo lugar las fórmulas relevantes para el jugador;
- distinguir comportamiento integrado, balance provisional e ideas todavía no aprobadas;
- detectar multiplicadores que se combinan y posibles riesgos de inflación;
- facilitar simulaciones de progresión y ajustes de balance;
- preparar nuevas etapas cromáticas sin contradecir el reactor existente;
- indicar dónde está implementada cada fórmula.

Este documento **no** pretende registrar funciones puramente técnicas de interfaz, almacenamiento, DOM, gamepad o saneamiento que no alteren la economía o la progresión.

Documentos relacionados:

- [`PLAN_MAESTRO.md`](PLAN_MAESTRO.md): visión y secuencia de expansiones;
- `HISTORIAL_GPT.MD`: estado técnico e integraciones;
- `PERFORMANCE_AUDIT.md`: rendimiento y arquitectura;
- `SMOOTH_PROGRESS_FIX.md`: comportamiento visual de barras.

## 2. Estados de las fórmulas

| Estado | Significado |
|---|---|
| **Integrada** | Coincide con el comportamiento vigente de `main`. |
| **Provisional** | Está integrada, pero puede cambiar durante balance o expansión. |
| **Propuesta** | Idea de diseño; no forma parte del juego. |
| **Pendiente** | La etapa existe en el plan, pero todavía no tiene fórmula aprobada. |

## 3. Convenciones y notación

| Símbolo | Significado |
|---|---|
| `L` | Nivel actual de una mejora antes de comprar el siguiente nivel. |
| `C` | Clics manuales acumulados en la partida actual. |
| `P` | Número total de cristalizaciones o prestigios. |
| `E` | Energía disponible. |
| `G` | Nivel o cantidad de Microgeneradores. |
| `R` | Nivel del Reactor de resonancia. |
| `S` | Multiplicador permanente del Zafiro. |
| `M_p` | Multiplicador de Presión. |
| `M_o` | Multiplicador temporal de Sobrecarga. |
| `M_r` | Multiplicador temporal de Refracción/PRISMA. |
| `M_t` | Producto de multiplicadores temporales activos. |

### Redondeo vigente

- Costos: redondeo hacia arriba con `ceil`.
- Energía: redondeo a dos decimales.
- Progreso fraccional: redondeo a cuatro decimales.
- Niveles, clics y contadores: enteros no negativos.

Implementación principal:

```text
src/game.ts
  getScaledCost()
  roundEnergy()
  roundProgress()
```

## 4. Mapa de dependencias matemáticas

```text
CLICS MANUALES
    │
    ├── llenado de esfera
    ├── nivel de presión efectivo
    ├── carga de cavitación
    ├── carga de sobrecarga
    └── carga del Gatillo de pulso

NIVELES DEL REACTOR
    │
    ├── energía base por clic
    ├── producción base por segundo
    ├── umbrales y duraciones
    └── costos exponenciales

MULTIPLICADORES
    │
    ├── Presión
    ├── Sobrecarga
    ├── PRISMA
    └── Zafiro
    │
    ▼
ENERGÍA FINAL
    │
    ├── clic
    ├── producción pasiva
    ├── recompensa de cavitación
    └── descarga de refracción

CRISTALIZACIÓN
    │
    ├── reinicio del estado principal
    ├── incremento de prestigio
    └── aumento provisional del Zafiro
```

## 5. Curva general de costos

**Estado:** Integrada.

La mayoría de las mejoras utiliza crecimiento exponencial:

```text
Costo(L) = ceil(Base × Crecimiento^L)
```

`L = 0` representa el costo de comprar el primer nivel.

Implementación:

```text
src/game.ts       → getScaledCost()
src/pulseTrigger.ts → getPulseTriggerUpgradeCost()
src/refraction.ts → getRefractionCost()
```

### Parámetros vigentes

| Sistema | Costo base | Crecimiento | Límite de nivel |
|---|---:|---:|---:|
| Amplificador de pulso | 10 | 1.70 | Sin límite explícito |
| Microgenerador | 25 | 1.80 | Sin límite explícito |
| Reactor de resonancia | 120 | 2.20 | Sin límite explícito |
| Condensador de presión | 500 | 2.40 | Sin límite explícito |
| Cámara de cavitación | 2,000 | 2.60 | Sin límite explícito |
| Pulsación autónoma | 5,000 | 2.80 | Sin límite explícito; tasa limitada |
| Válvula de sobrecarga | 10,000 | 3.00 | Sin límite explícito; umbral limitado |
| Gatillo de pulso | 6,000 | 2.25 | 6 |
| Matriz de refracción | 25,000 | 3.15 | Sin límite explícito |

### Primeros cinco costos

| Sistema | Nivel 1 | Nivel 2 | Nivel 3 | Nivel 4 | Nivel 5 |
|---|---:|---:|---:|---:|---:|
| Amplificador | 10 | 17 | 29 | 50 | 84 |
| Microgenerador | 25 | 45 | 81 | 146 | 263 |
| Resonancia | 120 | 264 | 581 | 1,278 | 2,812 |
| Presión | 500 | 1,200 | 2,880 | 6,912 | 16,589 |
| Cavitación | 2,000 | 5,200 | 13,521 | 35,152 | 91,396 |
| Autoclicker | 5,000 | 14,000 | 39,200 | 109,760 | 307,328 |
| Sobrecarga | 10,000 | 30,000 | 90,000 | 270,000 | 810,000 |
| Gatillo | 6,000 | 13,500 | 30,375 | 68,344 | 153,774 |
| Refracción | 25,000 | 78,750 | 248,063 | 781,397 | 2,461,401 |

### Lectura de balance

El crecimiento del costo no indica por sí solo la potencia real. Algunas mejoras aumentan una suma base, otras multiplican toda la producción y otras reducen umbrales. Por ello, comparar únicamente precios puede resultar engañoso.

## 6. Esfera y cristalización

### 6.1 Capacidad de la esfera

**Estado:** Integrada.

```text
Capacidad = 5,000 clics
```

```text
Llenado(C) = min(C / 5,000, 1)
```

En porcentaje:

```text
Llenado%(C) = min((C / 5,000) × 100, 100)
```

Implementación:

```text
src/game.ts → SPHERE_CLICK_CAPACITY
src/game.ts → getSphereFillPercentage()
```

### 6.2 Condición de cristalización

**Estado:** Integrada.

```text
PuedeCristalizar = C ≥ 5,000
```

Al cristalizar, el reducer crea el estado inicial y conserva únicamente:

```text
PrestigioNuevo = PrestigioAnterior + 1
```

Los niveles, energía, clics, cargas y temporizadores pertenecientes a `GameState` regresan a sus valores iniciales.

Implementación:

```text
src/game.ts → canCrystallize()
src/game.ts → gameReducer(), caso 'crystallize'
```

## 7. Condensador de presión

**Estado:** Integrada.

La esfera se divide matemáticamente en diez tramos de 10%.

```text
Tramo(C) = min(floor(Llenado%(C) / 10), 10)
```

Cada tramo aporta 2% por nivel de Presión:

```text
BonoPresión%(C, L) = Tramo(C) × 2 × L
```

```text
M_p(C, L) = 1 + BonoPresión%(C, L) / 100
```

Implementación:

```text
src/game.ts → getPressureTier()
src/game.ts → getPressureBonusPercent()
src/game.ts → getPressureMultiplier()
```

### Ejemplo

Con 2,500 clics y Presión nivel 3:

```text
Llenado = 50%
Tramo = 5
Bono = 5 × 2 × 3 = 30%
M_p = 1.30
```

### Observación de balance

La Presión escala simultáneamente con el nivel comprado y con el progreso de la esfera. Su beneficio máximo vigente es:

```text
M_p máximo para un nivel L = 1 + 0.20 × L
```

No existe un límite explícito de nivel; por ello, esta curva debe vigilarse cuando aumente la duración del juego.

## 8. Multiplicadores temporales

**Estado:** Integrada.

Sobrecarga y PRISMA se multiplican entre sí cuando están activos:

```text
M_t = M_o × M_r
```

Cuando un efecto está inactivo, su multiplicador vale `1`.

Implementación:

```text
src/game.ts → getActiveTemporaryMultiplier()
```

Esto significa que dos bonos temporales simultáneos generan crecimiento multiplicativo, no aditivo.

## 9. Energía por clic

**Estado:** Integrada.

```text
BaseClic = NivelAmplificador + 1
```

```text
EnergíaPorClic =
  BaseClic
  × M_p
  × M_t
  × S
```

Forma compacta:

```text
Clic = (L_clic + 1) × M_p × M_o × M_r × S
```

Implementación:

```text
src/game.ts → getClickPower()
src/game.ts → getClickOutcome()
```

La fórmula usa el número de clics **después** de sumar el clic actual para calcular la Presión de esa pulsación.

## 10. Producción por segundo

**Estado:** Integrada.

El nivel de Resonancia funciona como multiplicador lineal:

```text
MultiplicadorResonancia(R) = R + 1
```

La producción final es:

```text
ProducciónPorSegundo =
  G
  × (R + 1)
  × M_p
  × M_t
  × S
```

Implementación:

```text
src/game.ts → getResonanceMultiplier()
src/game.ts → getEnergyPerSecond()
```

### Ejemplo combinado

Supongamos:

```text
G = 4
R = 2
M_p = 1.30
M_o = 2.50
M_r = 1.30
S = 3.05
```

Entonces:

```text
M_t = 2.50 × 1.30 = 3.25
Producción = 4 × 3 × 1.30 × 3.25 × 3.05
Producción ≈ 154.64 energía/s
```

## 11. Cámara de cavitación

**Estado:** Integrada.

### 11.1 Clics requeridos

Para nivel mayor que cero:

```text
UmbralCavitación(L) = max(10, 28 − 3L)
```

El umbral nunca baja de 10 clics.

### 11.2 Segundos de producción recompensados

```text
SegundosCavitación(L) = 3 + 2L
```

### 11.3 Recompensa

```text
RecompensaCavitación =
  ProducciónPorSegundo × SegundosCavitación(L)
```

La producción usada incluye Presión, efectos temporales activos y Zafiro.

Implementación:

```text
src/game.ts → getCavitationClicksRequired()
src/game.ts → getCavitationSeconds()
src/game.ts → getCavitationReward()
```

### Ejemplo

En nivel 3:

```text
Umbral = 28 − 9 = 19 clics
Segundos recompensados = 3 + 6 = 9
Recompensa = 9 × producción por segundo
```

## 12. Módulo de pulsación autónoma

**Estado:** Integrada.

Para `L ≥ 1`:

```text
TasaAutoclick(L) = min(20, 0.2 × 1.6^(L−1))
```

Para `L = 0`:

```text
TasaAutoclick(0) = 0
```

Implementación:

```text
src/game.ts → getAutoclickRate()
```

### Curva de tasa

| Nivel | Clics/s aproximados |
|---:|---:|
| 1 | 0.2000 |
| 2 | 0.3200 |
| 3 | 0.5120 |
| 4 | 0.8192 |
| 5 | 1.3107 |
| 6 | 2.0972 |
| 7 | 3.3554 |
| 8 | 5.3687 |
| 9 | 8.5899 |
| 10 | 13.7439 |
| 11+ | 20.0000 |

### Procesamiento fraccional

Cada tick de un segundo suma la tasa al progreso acumulado:

```text
ProgresoNuevo = ProgresoAnterior + TasaAutoclick
ClicsEjecutados = floor(ProgresoNuevo)
Resto = ProgresoNuevo − ClicsEjecutados
```

Los clics automáticos pasan por la misma función autoritativa de clic que los clics directos, pero la lógica externa del Gatillo evita que recarguen su reserva.

## 13. Válvula de sobrecarga

**Estado:** Integrada.

### 13.1 Clics requeridos

```text
UmbralSobrecarga(L) = max(40, 110 − 10L)
```

El umbral nunca baja de 40 clics.

### 13.2 Duración

```text
DuraciónSobrecarga(L) = 12 + 3L segundos
```

### 13.3 Multiplicador

```text
M_o(L) = 1.5 + 0.5L
```

Implementación:

```text
src/game.ts → getOverloadClicksRequired()
src/game.ts → getOverloadDurationSeconds()
src/game.ts → getOverloadMultiplier()
```

### Condición de carga

La carga comienza únicamente cuando:

```text
nivel de Sobrecarga > 0
esfera llena
Sobrecarga no activa
```

### Ejemplo

En nivel 3:

```text
Umbral = 80 clics
Duración = 21 segundos
Multiplicador = ×3.00
```

## 14. Matriz de refracción / PRISMA

**Estado:** Integrada.

Implementación principal:

```text
src/refraction.ts
```

### 14.1 Desbloqueo

```text
Prestigio requerido = 1
```

También requiere al menos un Microgenerador para comprar el primer nivel.

### 14.2 Costo

```text
CostoRefracción(L) = ceil(25,000 × 3.15^L)
```

### 14.3 Facetas por prestigio

```text
P = 1      → 6 facetas
P = 2      → 8 facetas
P = 3      → 10 facetas
P ≥ 4      → 12 facetas
```

### 14.4 Velocidad de carga

Para `L > 0`:

```text
TasaCarga(L) = 1 + 0.15(L − 1)
```

### 14.5 Duración orbital

Primero:

```text
ProgresoEsfera = clamp(C / 5,000, 0, 1)
```

Después:

```text
DuraciónÓrbita(C) = 3 + 17 × (1 − ProgresoEsfera)^1.6
```

Por tanto:

```text
C = 0       → 20 segundos
C = 5,000   → 3 segundos
```

### 14.6 Avance por tick

El tick principal ocurre cada segundo:

```text
Avance = TasaCarga(L) / DuraciónÓrbita(C)
```

```text
ProgresoAcumulado = ProgresoAnterior + Avance
CargasCompletas = floor(ProgresoAcumulado)
RestoOrbital = ProgresoAcumulado − CargasCompletas
```

Cada carga completa añade una faceta. Al completar todas las facetas ocurre una descarga.

### 14.7 Multiplicador de PRISMA

```text
M_r(L) = 1.2 + 0.05L
```

### 14.8 Duración de PRISMA

```text
DuraciónPRISMA(L) = 4 + L segundos
```

Las descargas nuevas extienden el efecto desde el final del periodo activo cuando todavía queda tiempo.

### 14.9 Recompensa instantánea

```text
SegundosRecompensados(L) = 8 + 3L
```

```text
RecompensaRefracción =
  ProducciónBase × SegundosRecompensados(L)
```

La `ProducciónBase` utilizada para esta descarga:

- incluye Presión;
- incluye Sobrecarga cuando está activa;
- incluye Zafiro;
- excluye el propio multiplicador PRISMA para evitar autorreferencia directa.

### Ejemplo en nivel 2 y prestigio 2

```text
Facetas = 8
Tasa de carga = 1.15
M_r = ×1.30
Duración PRISMA = 6 segundos
Recompensa = 14 segundos de producción base
```

## 15. Gatillo de pulso

**Estado:** Integrada.

Implementación:

```text
src/pulseTrigger.ts
```

### 15.1 Carga de reserva

```text
10 clics directos = 1,000 ms de reserva
Reserva máxima = 10,000 ms
```

Los clics sintéticos generados por el propio Gatillo no recargan la reserva.

### 15.2 Cadencia

El nivel se limita internamente al rango `0…6`:

```text
TasaGatillo(L) = min(9, 6 + 0.5L) pulsos/s
```

```text
Intervalo(L) = 1,000 / TasaGatillo(L) ms
```

| Nivel | Pulsos/s | Intervalo aproximado |
|---:|---:|---:|
| 0 | 6.0 | 166.67 ms |
| 1 | 6.5 | 153.85 ms |
| 2 | 7.0 | 142.86 ms |
| 3 | 7.5 | 133.33 ms |
| 4 | 8.0 | 125.00 ms |
| 5 | 8.5 | 117.65 ms |
| 6 | 9.0 | 111.11 ms |

Con la reserva llena, el máximo teórico es:

```text
PulsosDisponibles = 10 × TasaGatillo(L)
```

En nivel 6:

```text
PulsosDisponibles = 90
```

### 15.3 Costo

```text
CostoGatillo(L) = ceil(6,000 × 2.25^L)
```

## 16. Zafiro y prestigio

**Estado:** Integrado / Provisional.

Implementación:

```text
src/game.ts → getSapphireMultiplier()
src/game.ts → getNextSapphireMultiplier()
src/ChromaticChamberSystem.tsx → nivel visual del Zafiro
```

### 16.1 Multiplicadores de P0 a P5

| Prestigio | Nivel visual del Zafiro | Multiplicador |
|---:|---:|---:|
| 0 | 0 | ×1.00 |
| 1 | 1 | ×1.50 |
| 2 | 2 | ×1.85 |
| 3 | 3 | ×2.20 |
| 4 | 4 | ×2.60 |
| 5 | 5 | ×3.05 |

### 16.2 Comportamiento actual después de P5

El nivel visual está limitado a 5, pero la fórmula económica continúa creciendo:

```text
Para P ≥ 6:
S(P) = 3.05 + 0.50 × (P − 5)
```

Ejemplos:

| Prestigio | Nivel visual | Multiplicador actual |
|---:|---:|---:|
| 5 | 5 | ×3.05 |
| 6 | 5 | ×3.55 |
| 7 | 5 | ×4.05 |
| 8 | 5 | ×4.55 |

### Advertencia de diseño

Esta diferencia es intencionalmente marcada como **provisional**. Antes de implementar Esmeralda debe decidirse si:

1. Zafiro queda fijado permanentemente en nivel 5 y ×3.05;
2. los prestigios posteriores alimentan un recurso nuevo;
3. cristalizaciones totales y niveles individuales de gema se separan formalmente;
4. parte del crecimiento posterior se traslada a Esmeralda.

No debe asumirse que `+0.50 por prestigio` es la fórmula definitiva del espectro cromático.

## 17. Multiplicación total de la economía

En condiciones donde todos los sistemas aplican, el núcleo actual combina:

```text
ProducciónFinal =
  ProducciónBase
  × Presión
  × Sobrecarga
  × PRISMA
  × Zafiro
```

Este producto explica por qué el balance futuro debe considerar las fórmulas como un sistema completo y no como mejoras aisladas.

### Riesgos principales

- Presión no tiene límite explícito de nivel.
- Sobrecarga aumenta linealmente sin límite de multiplicador.
- PRISMA aumenta linealmente sin límite de multiplicador.
- Zafiro continúa creciendo después de su nivel visual máximo.
- Los costos crecen exponencialmente, pero varios beneficios se multiplican entre sí.
- Nuevas gemas basadas únicamente en multiplicadores globales podrían acelerar demasiado la inflación.

## 18. Condiciones de descubrimiento y desbloqueo

**Estado:** Integradas.

En la primera partida, antes de obtener prestigio:

| Sistema | Condición adicional inicial |
|---|---|
| Presión | 100 clics |
| Cavitación | 500 clics y al menos un Microgenerador |
| Autoclicker | 500 clics y al menos un Microgenerador |
| Sobrecarga | Esfera llena y Cavitación comprada |
| Refracción | Prestigio ≥ 1 y al menos un Microgenerador |

Después del primer prestigio, `hasUnlockedBlueprints()` elimina los requisitos de descubrimiento por clics de Presión, Cavitación, Autoclicker y Sobrecarga. Los requisitos estructurales, como necesitar generador o cavitación, se conservan.

Implementación:

```text
src/game.ts → hasUnlockedBlueprints()
src/game.ts → casos de compra del reducer
```

## 19. Comprar todo estratégico

**Estado:** Integrado.

Los perfiles `Equilibrado`, `Juego activo` y `Automático` no introducen una fórmula económica nueva. El planificador:

- simula compras mediante el mismo reducer autoritativo;
- evalúa utilidad según la estrategia activa;
- aplica un único estado final;
- limita el proceso a 320 compras por ejecución.

Por tanto, los costos y beneficios descritos en este documento siguen siendo la autoridad matemática de esas compras.

Implementación:

```text
src/bulkPurchase.ts
```

## 20. Etapas cromáticas futuras

### 20.1 Esmeralda

**Estado:** Pendiente.

No existe todavía una fórmula aprobada ni implementada para:

- recurso de Esmeralda;
- obtención por cristalización;
- costo de sus cinco niveles;
- reciclaje o regeneración;
- beneficio persistente;
- condición de completar la segunda órbita.

Las ideas discutidas sobre regeneración, conservación o semilla inicial continúan siendo **propuestas**, no especificaciones.

Antes de aprobar fórmulas deben compararse al menos:

- duración real de una partida en P5;
- energía total generada por ciclo;
- energía gastada por categoría;
- cantidad de sistemas utilizados;
- número deseado de ciclos para completar Esmeralda;
- efecto sobre los primeros minutos después de cristalizar.

### 20.2 Amarilla, Naranja y Roja

**Estado:** Pendiente.

No tienen fórmulas aprobadas. Cada gema deberá evitar duplicar:

- poder permanente del Zafiro;
- futura identidad regenerativa de Esmeralda, si se aprueba;
- multiplicadores temporales ya cubiertos por Sobrecarga y PRISMA.

## 21. Método recomendado para aprobar una fórmula nueva

```text
IDEA
  ↓
DEFINIR VARIABLES Y LÍMITES
  ↓
CALCULAR EJEMPLOS TEMPRANO / MEDIO / TARDÍO
  ↓
SIMULAR VARIOS CICLOS
  ↓
COMPARAR CON LAS CURVAS EXISTENTES
  ↓
IMPLEMENTAR EN RAMA
  ↓
PROBAR GUARDADO Y MIGRACIÓN
  ↓
VALIDAR EXPERIENCIA REAL
  ↓
ACTUALIZAR ESTE DOCUMENTO
```

### Preguntas obligatorias

1. ¿El jugador puede entender la fórmula desde la interfaz?
2. ¿Tiene límite o rendimientos decrecientes?
3. ¿Se suma o se multiplica con los sistemas actuales?
4. ¿Favorece excesivamente una sola estrategia?
5. ¿Reduce o incrementa la repetición entre prestigios?
6. ¿Sigue funcionando con números mucho mayores?
7. ¿Cómo migra un guardado anterior?
8. ¿Qué ejemplo demuestra que la recompensa vale el esfuerzo?

## 22. Regla de actualización

Actualizar este documento cuando:

- cambie una constante de costo o crecimiento;
- cambie una fórmula de producción o recompensa;
- se añada o retire un límite;
- se modifique una condición de desbloqueo;
- se apruebe una fórmula cromática;
- se integre una nueva gema;
- una fórmula provisional se convierta en definitiva;
- el código y el documento dejen de coincidir.

En cada actualización debe indicarse:

```text
Estado
Archivo de implementación
Función principal
Fecha o commit de verificación
```

## 23. Verificación de esta versión

- Rama revisada: `main`.
- Fecha de revisión: 3 de agosto de 2026.
- Fuentes principales:
  - `src/game.ts`;
  - `src/refraction.ts`;
  - `src/pulseTrigger.ts`;
  - `src/bulkPurchase.ts`.
- Esmeralda y gemas posteriores permanecen sin fórmulas aprobadas.

> **Una fórmula documentada no queda congelada para siempre; queda visible, discutible y comprobable.**
