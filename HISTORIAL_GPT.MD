# HISTORIAL_GPT — Incremental Game A

> Bitácora compartida entre Arturo y GPT.  
> **Regla para nuevos chats:** leer este archivo, leer `PERFORMANCE_AUDIT.md`, leer `GAMEPAD_DEVICE_SELECTION.md` y comprobar la rama activa antes de modificar el proyecto.

## 1. Estado actual del repositorio

- Repositorio: `xArtXtrAx/incremental-game-A`.
- **Repositorio transversal de bugs críticos corregidos:** [`xArtXtrAx/bugs-universales-corregidos`](https://github.com/xArtXtrAx/bugs-universales-corregidos).
- **IMPORTANCIA MAYÚSCULA:** cada bug crítico, difícil de detectar o reutilizable que encontremos, resolvamos y validemos debe documentarse también en ese repositorio como conocimiento aplicable a todos los videojuegos futuros.
- El repositorio universal debe registrar, como mínimo: síntoma, condiciones que revelaron el fallo, causa raíz, solución genérica, riesgos, matriz de pruebas y lección arquitectónica reutilizable.
- Esta práctica forma parte obligatoria del flujo de desarrollo: su objetivo es acumular defensas comprobadas, evitar repetir fallos y conseguir progresos mucho más estables en todos los juegos futuros.
- La documentación universal complementa la bitácora específica de cada proyecto; no la sustituye.
- El fallo de selección del primer gamepad enumerado es el primer candidato para ese repositorio, una vez terminada su validación física.
- Rama estable: `main`.
- Commit estable desde el que comenzó la auditoría: `756a6aefb28091e564057dcaa3b4b5bf1a90e13e`.
- Rama de trabajo activa: `Dev-Performance-Audit`.
- La rama de auditoría no está integrada a `main`.
- La rama contiene diagnóstico, documentación, herramientas de medición y un parche aislado de robustez para seleccionar el mando por actividad real; no cambia gameplay, economía, balance ni presentación visual.
- Últimas ramas funcionales aprobadas e integradas:
  - `Dev-Camara-Cromatica`;
  - `Dev-Smooth-Progress-Bars`;
  - `Dev-DualSense-L2-Hotkeys`.
- Entorno: React 19 + TypeScript 6 + Vite 8 + Motion.
- Guardado principal: `incremental-game-a:save:v1`.
- Ajustes de mando: `incremental-game-a:gamepad:v1`.
- Reserva del Gatillo: `incremental-game-a:pulse-trigger:v1`.
- Última actualización: **2 de agosto de 2026, 20:31 CDMX**.

`main` contiene la versión jugable aprobada por Arturo. La auditoría actual busca preparar la arquitectura para varias capas cromáticas sin optimizar prematuramente ni alterar la sensación del juego.

El repositorio `bugs-universales-corregidos` debe tratarse como una biblioteca de estabilidad entre proyectos. Cuando una corrección crítica quede validada, se preparará allí una versión autocontenida y generalizada, sin depender innecesariamente de la arquitectura particular del juego donde apareció.

## 2. Forma de trabajo obligatoria

- Trabajar de forma directa y evitar microcomprobaciones redundantes.
- Usar GitHub Desktop para el flujo local normal.
- Crear ramas para cambios visuales, estructurales o mecánicos importantes.
- Antes de integrar, comparar la rama con `main`, reportar alcance y esperar autorización explícita de Arturo.
- Nunca integrar a `main` ni eliminar ramas sin autorización explícita.
- Conservar ramas remotas como respaldo salvo instrucción contraria.
- Evitar reescrituras destructivas del historial, `force push`, resets agresivos y divergencias innecesarias.
- Evitar ZIP, manifiestos y hashes salvo necesidad técnica o petición expresa.
- Agrupar validaciones; no repetir `git status` ni comprobaciones equivalentes sin motivo.
- No afirmar que se ejecutaron `npm run build`, `npm run lint`, pruebas físicas o benchmarks cuando no se ejecutaron realmente.
- Mantener gameplay, fórmulas y visuales idénticos durante la auditoría salvo aprobación específica.
- Cuando un bug crítico corregido tenga aplicación transversal, documentarlo también en `xArtXtrAx/bugs-universales-corregidos` después de validarlo.
- No se encontró un archivo `WORKFLOW_RULES.md`; estas reglas son la referencia vigente.

## 3. Estado jugable estable en `main`

### Interfaz

- Resumen superior compacto.
- Núcleo fijo a la izquierda en escritorio.
- Evoluciones en panel desplazable con pestañas Producción, Núcleo y Avanzadas.
- Tarjetas expandibles.
- Navegación móvil entre Núcleo y Evoluciones.
- Panel DEV responsivo.
- Selección de texto deshabilitada salvo campos editables.
- Guía visual por regiones para mouse y mando.
- Acceso superior a la Cámara Cromática desde P0, bloqueado hasta Zafiro P5.

### Evoluciones actuales

1. Amplificador de pulso.
2. Microgenerador.
3. Reactor de resonancia.
4. Condensador de presión.
5. Cámara de cavitación.
6. Válvula de sobrecarga.
7. Módulo de pulsación autónoma.
8. Matriz de refracción.
9. Acelerador de pulso del Gatillo, con nivel máximo 6.

Las mecánicas están conectadas: clics, producción, presión, cavitación, autoclick, sobrecarga, PRISMA, Gatillo y prestigio comparten el reducer autoritativo.

### Gatillo de pulso

- 10 clics directos generan 1 segundo de reserva.
- Reserva máxima: 10 segundos.
- Cadencia: `min(9, 6 + 0.5 × nivel)` pulsos/s.
- Se activa con R2/RT, botón visual, teclado o clic derecho en el área jugable.
- El clic izquierdo puede usarse simultáneamente.
- Gatillo y Autoclicker no recargan la reserva.
- Los pulsos usan el clic real del núcleo.
- La reserva se guarda separada del estado principal.

### Prestigio y Zafiro

- La esfera se llena a 5,000 clics.
- La cristalización siempre requiere confirmación.
- Multiplicadores actuales:
  - P0 ×1.00;
  - P1 ×1.50;
  - P2 ×1.85;
  - P3 ×2.20;
  - P4 ×2.60;
  - P5 ×3.05;
  - posteriores +0.50 mientras se diseña la progresión cromática.
- El Zafiro usa geometría WebGL, iluminación orbital, chispa y estela.
- La duración orbital depende del llenado:

```text
duración = 3 + 17 × (1 − clics / 5000)^1.6
```

### Barras de progreso

- Componente universal para costos, requisitos y ciclos internos.
- Barras de Presión, Cavitación, Autoclicker, Sobrecarga y Refracción.
- Animación mediante Web Animations API.
- Cada trayectoria parte de la posición visual real.
- Ciclos correctos:

```text
70% → 100% → 0% → 10%
```

- No existe doble interpolación CSS.
- Arturo validó visualmente continuidad, reinicios y ausencia de congelamientos.

### Comprar todo estratégico

Perfiles:

- `Equilibrado`;
- `Juego activo`;
- `Automático`.

El planificador simula compras mediante el reducer, calcula utilidad y aplica un único estado final. Límite actual: 320 compras por ejecución.

### Cámara Cromática

- Nexo Prismático con cinco frecuencias previstas:
  - Zafiro;
  - Esmeralda;
  - Amarilla;
  - Naranja;
  - Roja.
- En P5 se activa la primera órbita azul y la Esmeralda queda señalada como siguiente frecuencia.
- Las otras cuatro gemas todavía no tienen economía ni bonificaciones.
- El Zafiro orbita por delante y por detrás del Nexo y produce un reflejo dinámico.
- Existe acceso DEV y previsualización visual de los cinco colores sin alterar guardado, economía ni prestigio.
- El reactor sigue funcionando mientras la Cámara está abierta.

## 4. Controles finales DualSense / Gamepad

### Reactor

- X/A: pulsa siempre la esfera.
- X/A no pulsa la esfera mientras L2/LT está sostenido.
- Cuadrado/X de Xbox: selector general; activa el control enfocado.
- R2/RT: Gatillo de pulso.
- L2 + Triángulo / LT + Y: cambia estrategia de Comprar todo.
- L2 + Cuadrado / LT + X: Comprar todo lo posible.
- Triángulo/Y sin L2 conserva el atajo anterior de compra global.
- L1/LB: Núcleo.
- R1/RB: Evoluciones.
- Cruceta y stick: navegación espacial.
- La cruceta no cambia directamente de ventana en el reactor.
- Izquierda/derecha ajustan sliders cuando tienen foco.
- Círculo/B: volver o cerrar según contexto.
- Options/Menu: panel del mando.

### Cámara Cromática

- L1/R1 o cruceta izquierda/derecha recorren gemas.
- Cruceta arriba enfoca regresar.
- Cruceta abajo vuelve a la gema seleccionada.
- X/A activa el control de la Cámara y no pulsa el núcleo por detrás.
- Círculo/B regresa al reactor.

Arturo validó físicamente DualSense, vibraciones, Gatillo, hotkeys, selector general y navegación libre antes del parche de selección por actividad. La corrección nueva requiere repetir la validación física.

## 5. Arquitectura relevante

- `src/game.ts`: `GameState`, reducer, costos, migración y guardado.
- `src/App.tsx`: estado autoritativo, tick, efectos visuales y aplicación de acciones.
- `src/refraction.ts`: Matriz y PRISMA.
- `src/bulkPurchase.ts`: simulación estratégica.
- `src/UpgradesPanelCompact.tsx`: panel y tarjetas.
- `src/UpgradeProgressBar.tsx`: animación nativa de barras.
- `src/UpgradeProgressSystem.tsx`: portales y snapshots de barras.
- `src/gamepad.ts`: etiquetas, ajustes, detección y selección del mando por actividad real.
- `src/GamepadController.tsx`: navegación y hotkeys del reactor.
- `src/ChromaticGamepadBridge.tsx`: navegación específica de la Cámara.
- `src/GamepadEventHaptics.tsx`: vibraciones contextuales.
- `src/pulseTrigger.ts`: reserva, fórmulas y eventos del Gatillo.
- `src/PulseTriggerSystem.tsx`: entradas, disparos y portal del Gatillo.
- `src/ChromaticChamberSystem.tsx`: acceso, Cámara e inspector.
- `src/SapphireGem3D.tsx` y `src/SapphireOrbit3D.tsx`: WebGL.
- `src/DeveloperPanel.tsx`: herramientas DEV.
- `SMOOTH_PROGRESS_FIX.md`: decisiones de barras.
- `DUALSENSE_L2_HOTKEYS.md`: decisiones del mando.
- `GAMEPAD_DEVICE_SELECTION.md`: bug crítico, causa raíz, parche y regla universal de selección por actividad.
- `PERFORMANCE_AUDIT.md`: auditoría actual detallada.

## 6. Auditoría de rendimiento activa

### Rama y alcance

- Rama: `Dev-Performance-Audit`.
- Base: `main` en `756a6aef...`.
- La rama comenzó como auditoría sin cambios de gameplay.
- Incluye una corrección aislada de infraestructura de entrada para seleccionar el gamepad activo por actividad real.
- Archivos principales de la auditoría y corrección:
  - `PERFORMANCE_AUDIT.md`;
  - `GAMEPAD_DEVICE_SELECTION.md`;
  - `scripts/performance-audit.mjs`;
  - `package.json` con comandos de auditoría;
  - `src/gamepad.ts` con selección robusta del dispositivo;
  - esta actualización de `HISTORIAL_GPT.MD`.

### Comandos añadidos

```powershell
npm run audit:performance
npm run audit:performance:json
```

El auditor estático recorre `src/**/*.ts` y `src/**/*.tsx` y reporta:

- archivos, líneas y bytes;
- archivos más grandes;
- `setInterval`;
- bucles `requestAnimationFrame`;
- lecturas y escrituras de `localStorage`;
- `JSON.parse` y `JSON.stringify`;
- `MutationObserver` global;
- consultas DOM;
- cantidad aproximada de hooks React;
- patrones que requieren revisión humana.

No se añadieron dependencias. La línea base local de auditoría, lint y build se ejecutó correctamente antes del parche de selección del mando; las comprobaciones deben repetirse después de actualizar la rama local.

## 7. Hallazgos confirmados de la auditoría

### P0 — Nunca seleccionar el mando solamente por orden de enumeración

Un cierre inesperado de Chrome reveló que podían coexistir:

- `DualSense Wireless Controller`, enumerado primero pero neutral;
- `Controller (XBOX 360 For Windows)`, que recibía las entradas reales.

El juego mostraba un control conectado, pero no respondía porque elegía el primer objeto devuelto por `navigator.getGamepads()`. La presencia y el índice no demuestran intención ni actividad.

La corrección en `src/gamepad.ts` conserva la interfaz existente, pero selecciona por actividad real y mantiene estable el índice activo. La lección completa está en `GAMEPAD_DEVICE_SELECTION.md` y debe convertirse en el primer caso del repositorio universal una vez aprobada físicamente.

### P1 — `localStorage` se usa como bus interno

Además del guardado después de cada cambio de `game`, varios sistemas releen y deserializan el estado periódicamente:

- `UpgradeProgressSystem`: cada 100 ms.
- `PulseTriggerSystem`: cada 160 ms.
- `ChromaticChamberSystem`: cada 180 ms.

Esto fue práctico para montar portales, pero no escala bien. Produce trabajo duplicado, retraso artificial y varias copias parciales del estado.

**Primera recomendación estructural:** crear una fuente ligera de snapshots en memoria, compatible con suscripciones selectivas, y reservar `localStorage` exclusivamente para persistencia.

Orden propuesto:

1. barras;
2. Cámara;
3. Gatillo.

El reducer debe seguir siendo la única autoridad del gameplay.

### P1 — Sondeo duplicado del mando

Existen bucles independientes en:

- `GamepadController`;
- `PulseTriggerSystem` para R2;
- `ChromaticGamepadBridge`.

A mediano plazo conviene un servicio único de entrada que produzca botones, flancos, ejes y conexión. Esta migración debe realizarse después y por separado de la fuente de estado para facilitar pruebas físicas.

### P1 — Guardado completo y síncrono por cada estado

`App` ejecuta `saveGameState(game)` cada vez que cambia el estado principal. El objeto es pequeño hoy, pero clics, Gatillo y automatizaciones futuras aumentarán la frecuencia.

Recomendación posterior:

- marca `dirty`;
- debounce de 250–500 ms;
- guardado inmediato en cristalización y reset;
- flush en `visibilitychange` y `pagehide`;
- métricas de tamaño y duración;
- conservar migración y sanitización.

No debe cambiarse sin medir y definir eventos críticos.

### P1/P2 — Demasiados relojes independientes

Conviven:

- tick de 1 segundo;
- reloj de 100 ms para estados temporales;
- sondeo de barras de 100 ms;
- sondeo del Gatillo de 160 ms;
- sondeo cromático de 180 ms;
- varios `requestAnimationFrame` de mando;
- WebGL y Web Animations API.

`clockNow` vive en `App`, por lo que Sobrecarga o PRISMA pueden provocar reevaluaciones globales cada 100 ms aunque solo algunas cuentas regresivas lo necesiten.

Recomendación: reloj visual compartido y selectivo; aislar temporizadores visibles de los renders globales.

### P2 — Barras integradas mediante DOM y persistencia

`UpgradeProgressSystem`:

- carga su propia copia del guardado;
- compara claves;
- observa todo el `body`;
- busca tarjetas por texto visible;
- crea hosts imperativos.

Debe conservarse `UpgradeProgressBar` y la animación nativa. El mecanismo de alimentación y montaje debe evolucionar hacia estado en memoria e IDs/hosts declarativos.

### P2 — Gatillo y Cámara mantienen snapshots parciales

El Gatillo obtiene energía, nivel y prestigio desde el guardado. La Cámara obtiene `prestigeCount` del mismo modo. Ambos deben migrar gradualmente a la fuente compartida.

### P2 — Comprar todo escala por rondas y candidatos

Con 320 rondas y nueve candidatos puede alcanzar hasta 2,880 intentos de compra, además de cálculos de utilidad.

No se debe reescribir aún. Primero medir duración por estrategia y estado. Si supera el presupuesto:

- caché de partes invariantes;
- descarte temprano;
- registro central de mejoras;
- compras por bloques;
- fórmulas cerradas y búsqueda binaria para costos geométricos;
- Web Worker solo si sigue bloqueando la interfaz.

### P2 — Autoclicks individuales

El tick procesa los clics automáticos uno a uno. El límite actual de 20/s hace que sea correcto y seguro. Una futura función por lotes deberá probar equivalencia exacta para energía, presión, cavitación, sobrecarga y PRISMA.

No optimizar todavía.

### P2 — Definiciones distribuidas

Costos, requisitos, etiquetas, categorías, acciones, barras y pesos estratégicos aparecen en varios archivos. Antes de crecer mucho conviene un registro tipado de mejoras con IDs estables, sin quitar al reducer su validación autoritativa.

### Estrategia numérica

`number` es suficiente hoy. No introducir todavía BigNumber, mantisa/exponente ni librerías decimales. Primero decidir si el juego tendrá cifras contenidas o progresión exponencial extrema. Centralizar formateo y operaciones sensibles antes de que muchas gemas dependan directamente de operadores numéricos.

## 8. Presupuestos iniciales de rendimiento

Objetivos orientativos:

| Operación | Objetivo | Señal de intervención |
|---|---:|---:|
| Tick de 1 segundo | promedio < 1 ms | máximo repetido > 4 ms |
| Comprar todo normal | < 16 ms | repetido > 25 ms |
| Comprar todo extremo | < 50 ms | > 100 ms o bloqueo visible |
| Serializar y guardar | < 2 ms | repetido > 5 ms |
| Tamaño del guardado | < 20 KB | > 100 KB |
| Commit React normal | < 8 ms | repetido > 16 ms |
| Cuadro visual | p95 < 20 ms | tirones repetidos > 33 ms |
| Memoria tras 30 min | estable | crecimiento continuo |

Deben medirse en la PC principal y posteriormente en un equipo de gama media.

## 9. Escenarios de medición

### A — Partida nueva

- P0 y sin mejoras.
- 30 segundos de clics.
- Abrir tarjetas y cambiar categorías con mando.

### B — Reactor cargado

- Esfera llena.
- Todas las evoluciones actuales.
- Sobrecarga y PRISMA activos.
- Gatillo, clic manual y Autoclicker simultáneos.

### C — Comprar todo

- Energía alta desde DEV.
- Medir las tres estrategias.
- Registrar duración, compras y estado final.

### D — Cámara Cromática

- P5 y modo DEV.
- Mantenerla abierta al menos 60 segundos.
- Navegar con mouse y DualSense.
- Confirmar continuidad del reactor.

### E — Sesión prolongada

- 30–60 minutos.
- Cambios repetidos entre reactor y Cámara.
- Revisar memoria, listeners, timers y nodos desconectados.

## 10. Orden recomendado para continuar

### Fase A — Línea base

Estado: iniciada y con línea base estructural local capturada antes del parche de gamepad.

1. Cambiar en GitHub Desktop a `Dev-Performance-Audit`.
2. Ejecutar después de actualizar la rama:

```powershell
npm run lint
npm run build
npm run audit:performance
npm run dev
```

3. Validar físicamente la selección del gamepad activo.
4. Guardar la nueva salida del auditor.
5. Medir Chrome Performance en escenarios A–D.
6. Medir renders con React Profiler.
7. Registrar resultados en `PERFORMANCE_AUDIT.md`.
8. Decidir el primer cambio estructural con datos reales.

### Fase B — Comunicación interna

Sujeta a medición:

- fuente de snapshots en memoria;
- eliminar sondeos de `localStorage` en barras, Cámara y Gatillo;
- conservar guardado y migraciones;
- comparar antes/después.

### Fase C — Entrada del mando

- unificar los bucles de mando;
- separar dispositivo de entrada, dispositivo háptico e identidad visual;
- migrar reactor, Gatillo y Cámara por etapas;
- prueba física completa.

### Fase D — Persistencia

- coordinador `dirty` + debounce + flush;
- pruebas de cierre, reset y cristalización.

### Fase E — Preparación para Esmeralda

- registro tipado de mejoras;
- selectores y view models;
- división de paneles grandes;
- pruebas del reducer y Comprar todo;
- nueva medición antes de añadir economía verde.

## 11. Optimizaciones que deben esperar

No implementar todavía:

- ECS;
- Typed Arrays para niveles;
- reemplazar objetos por `Map` indiscriminadamente;
- min-heap para los pocos temporizadores actuales;
- Web Workers para el tick normal;
- IndexedDB para el guardado actual;
- biblioteca de números enormes sin definir escala;
- memoización indiscriminada;
- reescritura completa del reducer;
- cambios simultáneos de arquitectura y balance.

## 12. Validaciones pendientes

Se ejecutaron correctamente en la PC local antes del parche de selección por actividad:

- `npm run lint`: 0 errores y 3 advertencias no bloqueantes;
- `npm run build`: compilación de producción correcta;
- `npm run audit:performance`: línea base de 28 archivos y 8,852 líneas;
- `npm run audit:performance:json`: captura guardada en `%TEMP%`.

Pendiente después de actualizar la rama local:

- repetir lint, build y auditor;
- prueba física del mando virtual activo con DualSense neutral enumerado primero;
- X, Cuadrado, L1/R1, cruceta, R2 y combinaciones con L2;
- Cámara Cromática;
- cambio entre dispositivos y reconexión;
- vibración después del cambio de dispositivo activo;
- benchmarks de duración;
- Chrome Performance;
- React Profiler;
- sesión prolongada.

La rama no debe integrarse a `main` hasta completar mediciones, probar equivalencia, validar físicamente el parche y recibir autorización expresa de Arturo.

## 13. Prompt recomendado para el siguiente chat

> Continúa el proyecto privado `xArtXtrAx/incremental-game-A`. La rama estable es `main`, pero el trabajo activo está en `Dev-Performance-Audit`, creada desde el commit estable `756a6aefb28091e564057dcaa3b4b5bf1a90e13e`. Lee primero `HISTORIAL_GPT.MD`, `PERFORMANCE_AUDIT.md` y `GAMEPAD_DEVICE_SELECTION.md`. No crees otra rama y no integres nada a `main` sin mi autorización explícita. Existe un repositorio transversal de máxima importancia, `xArtXtrAx/bugs-universales-corregidos`, donde cada bug crítico resuelto y validado debe documentarse como ejemplo reutilizable para todos los juegos futuros. La rama de auditoría contiene el informe, `scripts/performance-audit.mjs`, los comandos `npm run audit:performance` y `npm run audit:performance:json`, y un parche aislado en `src/gamepad.ts` que selecciona el mando por actividad real en vez de confiar en el primer índice enumerado. Primero actualiza la rama local, ejecuta lint, build y auditor, y valida físicamente el caso DualSense neutral + mando virtual activo. Después continúa las mediciones antes de refactorizar. Los principales hallazgos actuales son: selección de gamepad por actividad real; `localStorage` usado como canal interno por barras, Gatillo y Cámara; varios relojes y bucles de mando independientes; guardado completo tras cada estado; `clockNow` con posibles renders globales cada 100 ms; Comprar todo con hasta 320 rondas por nueve candidatos; autoclics individuales; y definiciones de mejoras distribuidas. La primera refactorización recomendada, sujeta a medición, es una fuente ligera de snapshots en memoria para retirar el sondeo de `localStorage`, empezando por barras, luego Cámara y Gatillo. Mantén reducer, fórmulas, balance, visuales, barras fluidas y controles exactamente iguales. Trabaja de forma directa, evita comprobaciones redundantes y usa GitHub Desktop para el flujo local normal.