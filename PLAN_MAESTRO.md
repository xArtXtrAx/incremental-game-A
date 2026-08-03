# PLAN MAESTRO — Incremental Game A

> Mapa vivo de la visión general, las etapas de progresión y las expansiones previstas del juego.
>
> Este documento define **hacia dónde va el proyecto**. No sustituye la bitácora técnica ni congela fórmulas que todavía estén en discusión.

## 1. Propósito

`PLAN_MAESTRO.md` sirve para:

- conservar una visión común del juego completo;
- distinguir lo integrado, lo provisional y lo únicamente proyectado;
- evitar que una mecánica futura contradiga etapas anteriores;
- ordenar las expansiones antes de implementarlas;
- registrar decisiones de diseño de alto nivel sin llenar la bitácora técnica;
- facilitar la continuidad entre sesiones y nuevos chats.

Documentos relacionados:

- [`MODELO_MATEMATICO.md`](MODELO_MATEMATICO.md): fórmulas, curvas, límites y dependencias de balance;
- `HISTORIAL_GPT.MD`: estado técnico, integraciones y decisiones operativas;
- `PERFORMANCE_AUDIT.md`: rendimiento y arquitectura;
- `GAMEPAD_DEVICE_SELECTION.md`: selección robusta del mando;
- `SMOOTH_PROGRESS_FIX.md`: barras de progreso;
- `DUALSENSE_L2_HOTKEYS.md`: decisiones históricas del control.

## 2. Estado de este plan

| Estado | Significado |
|---|---|
| **Integrado** | Ya forma parte de `main`. |
| **Provisional** | Está integrado, pero sus números o alcance todavía pueden evolucionar. |
| **Siguiente etapa** | Es la expansión inmediata que debe diseñarse antes de programarse. |
| **Proyectado** | Forma parte del mapa general, sin mecánicas definitivas. |
| **Opcional** | Solo se desarrollará si mejora el juego después del espectro principal. |

## 3. Identidad general del juego

Incremental Game A comienza como un reactor incremental y evoluciona hacia un sistema de metaprogresión cromática.

El recorrido general debe sentirse así:

```text
REACTOR BÁSICO
    │
    ├── clic y producción
    ├── presión y cavitación
    ├── automatización y sobrecarga
    ├── refracción y Gatillo de pulso
    └── decisiones de compra y optimización
    │
    ▼
CRISTALIZACIÓN / PRESTIGIO
    │
    ▼
ESPECTRO CROMÁTICO
    │
    ├── 1. Zafiro
    ├── 2. Esmeralda
    ├── 3. Gema amarilla
    ├── 4. Gema naranja
    └── 5. Gema roja
    │
    ▼
NEXO PRISMÁTICO COMPLETO
    │
    ▼
FINAL CROMÁTICO / POSIBLE POSTJUEGO
```

## 4. Principios maestros de diseño

### 4.1 Cada gema debe tener una identidad propia

Las cinco gemas no deben convertirse únicamente en cinco multiplicadores globales parecidos. Cada etapa debe introducir una forma distinta de progreso o una nueva relación con los sistemas existentes.

### 4.2 Las expansiones deben aprovechar el reactor actual

Una nueva etapa debe dar un nuevo significado a clics, producción, automatización, presión, cavitación, sobrecarga, refracción, Gatillo y cristalización, en lugar de reemplazarlos por completo.

### 4.3 El progreso anterior debe conservar valor

Completar una gema debe ayudar a alcanzar la siguiente, pero no volver irrelevante todo lo construido antes.

### 4.4 Juego manual y automático deben seguir siendo viables

Ninguna expansión debería obligar permanentemente a un único estilo de juego. Las estrategias manual, automática y equilibrada deben conservar ventajas reales.

### 4.5 Las fórmulas deben poder explicarse

Los efectos importantes deben ser visibles, predecibles y fáciles de presentar al jugador. Se deben evitar bonos ocultos o relaciones imposibles de entender desde la interfaz.

Las fórmulas exactas, sus límites, ejemplos y archivos de implementación se mantienen en [`MODELO_MATEMATICO.md`](MODELO_MATEMATICO.md). Este plan conserva únicamente las decisiones matemáticas de alto nivel necesarias para orientar cada expansión.

### 4.6 Cada expansión debe incluir estabilidad desde el inicio

Toda etapa nueva debe contemplar:

- migración del guardado;
- controles de mouse, teclado y gamepad;
- navegación y foco visibles;
- rendimiento;
- herramientas DEV;
- pruebas de regresión;
- documentación.

## 5. Sistemas base ya integrados

### Reactor y economía

- energía por clic;
- Amplificador de pulso;
- Microgeneradores;
- Reactor de resonancia;
- Condensador de presión;
- Cámara de cavitación;
- Módulo de pulsación autónoma;
- Válvula de sobrecarga;
- Matriz de refracción;
- Gatillo de pulso;
- perfiles de Comprar todo.

### Progresión y presentación

- esfera de 5,000 clics;
- cristalización con confirmación;
- prestigio persistente;
- Zafiro visual y orbital;
- Cámara Cromática;
- Nexo Prismático;
- cinco espacios cromáticos previstos;
- interfaz DEV para inspección y pruebas.

### Entrada y estabilidad

- soporte de mouse, teclado y gamepad;
- selección del gamepad por actividad real;
- navegación confinada por zonas;
- foco visible en modo gamepad;
- hápticos contextuales;
- suspensión de vibración durante el uso del mouse;
- auditoría inicial de rendimiento;
- repositorio transversal de bugs universales.

## 6. Mapa de etapas cromáticas

```text
┌─────────────────────────────────────────────────────────────┐
│ ETAPA 1 — ZAFIRO                                           │
│ Estado: INTEGRADO / PROVISIONAL                            │
│ Niveles actuales: 1 a 5                                   │
│ Resultado: primera órbita y acceso cromático               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ ETAPA 2 — ESMERALDA                                        │
│ Estado: SIGUIENTE ETAPA                                    │
│ Niveles previstos: 1 a 5                                  │
│ Identidad y fórmulas: por definir antes de implementar      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ ETAPA 3 — GEMA AMARILLA                                    │
│ Estado: PROYECTADA                                         │
│ Identidad y mecánicas: pendientes                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ ETAPA 4 — GEMA NARANJA                                     │
│ Estado: PROYECTADA                                         │
│ Identidad y mecánicas: pendientes                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ ETAPA 5 — GEMA ROJA                                        │
│ Estado: PROYECTADA                                         │
│ Identidad y mecánicas: pendientes                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ NEXO PRISMÁTICO COMPLETO                                   │
│ Estado: PROYECTADO                                         │
│ Culminación del espectro principal                         │
└─────────────────────────────────────────────────────────────┘
```

## 7. Etapa 1 — Zafiro

**Estado:** integrado en `main`, con balance todavía provisional.

La etapa actual incluye:

- cinco niveles de Zafiro ligados a las primeras cinco cristalizaciones;
- multiplicador permanente por prestigio;
- representación visual del cristal;
- evolución de su órbita;
- acceso a la Cámara Cromática al alcanzar nivel 5;
- activación de la primera frecuencia azul del Nexo;
- señalización de Esmeralda como siguiente resonancia.

Multiplicadores actuales:

| Nivel | Multiplicador |
|---:|---:|
| 0 | ×1.00 |
| 1 | ×1.50 |
| 2 | ×1.85 |
| 3 | ×2.20 |
| 4 | ×2.60 |
| 5 | ×3.05 |

### Decisiones pendientes antes de declarar Zafiro definitivo

- decidir si el nivel 5 será el límite permanente del Zafiro;
- separar formalmente cristalizaciones totales y nivel individual de cada gema;
- definir qué recurso o condición transfiere Zafiro a Esmeralda;
- revisar el ritmo real de P0 a P5;
- confirmar el balance final de ×3.05.

## 8. Etapa 2 — Esmeralda

**Estado:** siguiente expansión de contenido.

Antes de implementar código deben definirse:

- identidad mecánica;
- condición de activación;
- recurso persistente, si lo requiere;
- fórmula de obtención;
- cinco niveles y sus costos;
- interacción con la cristalización;
- beneficio visible dentro del reactor;
- condición para completar su órbita;
- desbloqueo de la gema amarilla;
- migración del guardado.

Dirección temática discutida, todavía no aprobada:

> Esmeralda podría representar regeneración, reciclaje, conservación o renacimiento del poder generado por Zafiro 5.

Esta frase es una hipótesis de diseño, no una especificación cerrada.

## 9. Expansiones proyectadas

### Etapa 3 — Gema amarilla

- tercera frecuencia del Nexo;
- cinco niveles previstos;
- identidad pendiente;
- debe aprovechar Zafiro y Esmeralda sin duplicarlos.

### Etapa 4 — Gema naranja

- cuarta frecuencia del Nexo;
- cinco niveles previstos;
- identidad pendiente;
- debe elevar la complejidad sin volver ilegible el reactor.

### Etapa 5 — Gema roja

- quinta frecuencia del Nexo;
- cinco niveles previstos;
- identidad pendiente;
- debe preparar la culminación del espectro principal.

### Nexo Prismático completo

- cinco frecuencias enlazadas;
- resolución de la progresión cromática principal;
- transformación final del reactor;
- objetivo final, desafío final o sistema final todavía por definir.

### Posible postjuego

**Estado:** opcional.

Opciones que solo deberán evaluarse después de completar el espectro:

- ciclos prismáticos avanzados;
- variaciones de reactor;
- desafíos con reglas especiales;
- árbol de especialización;
- logros y metas de largo plazo;
- nueva partida ampliada;
- contenido narrativo o cosmético.

No debe diseñarse en profundidad antes de cerrar las cinco gemas.

## 10. Ruta técnica paralela

El contenido cromático debe avanzar junto con mejoras estructurales graduales.

### Prioridades técnicas previstas

1. fuente de estado en memoria para sistemas derivados;
2. reducción de sondeos repetidos de `localStorage`;
3. servicio unificado de entrada por etapas;
4. coordinador de guardado y migraciones;
5. perfiles de rendimiento reproducibles;
6. pruebas de sesión prolongada;
7. revisión continua de accesibilidad y gamepad.

Estas mejoras deben realizarse por ramas separadas cuando impliquen riesgo arquitectónico. No deben mezclarse innecesariamente con balance o contenido cromático.

## 11. Flujo recomendado para cada expansión

```text
IDEA
  ↓
DOCUMENTO DE DISEÑO
  ↓
FÓRMULAS Y EJEMPLOS EN MODELO_MATEMATICO.md
  ↓
SIMULACIÓN DE PROGRESIÓN
  ↓
RAMA DE DESARROLLO
  ↓
IMPLEMENTACIÓN MÍNIMA
  ↓
INTERFAZ + GAMEPAD + GUARDADO
  ↓
LINT + BUILD + PRUEBAS FÍSICAS
  ↓
AJUSTE DE BALANCE
  ↓
INTEGRACIÓN A MAIN
  ↓
BITÁCORA Y DOCUMENTACIÓN
```

### Criterios mínimos de salida

Una expansión no debe considerarse terminada hasta comprobar:

- que el ciclo principal es comprensible;
- que la recompensa justifica el tiempo invertido;
- que no invalida las etapas anteriores;
- que el guardado antiguo migra correctamente;
- que mouse, teclado y gamepad pueden recorrerla;
- que no introduce bloqueos o degradación evidente;
- que `lint` y `build` pasan;
- que las pruebas físicas principales se realizaron;
- que la bitácora y este plan fueron actualizados.

## 12. Próxima decisión maestra

La siguiente discusión debe centrarse en **Esmeralda** y responder, antes de programar:

1. ¿Qué problema o repetición del ciclo actual resolverá?
2. ¿Qué aporta que Zafiro no aporte ya?
3. ¿Cómo se obtiene su progreso?
4. ¿Qué persiste al cristalizar?
5. ¿Cómo se divide en cinco niveles?
6. ¿Cuánto debe tardar en completarse?
7. ¿Qué cambia visualmente en la Cámara y el reactor?
8. ¿Qué condición desbloquea la gema amarilla?

## 13. Regla de actualización

Actualizar este documento cuando ocurra cualquiera de estos eventos:

- se apruebe la identidad de una gema;
- se fijen fórmulas principales;
- se integre una expansión en `main`;
- cambie el orden de las etapas;
- aparezca una nueva capa de metaprogresión;
- se descarte una expansión prevista;
- se complete el Nexo Prismático.

> **Este plan debe orientar el proyecto, no impedir que evolucione.** Las ideas proyectadas pueden cambiar, pero cualquier cambio importante debe quedar registrado aquí.
