# HISTORIAL_GPT — Incremental Game A

> Bitácora compartida entre Arturo y GPT.  
> **Regla para nuevos chats:** leer este archivo, `PERFORMANCE_AUDIT.md` y `GAMEPAD_DEVICE_SELECTION.md`; después comprobar la rama activa antes de modificar el proyecto.

## 1. Estado actual del repositorio

- Repositorio: `xArtXtrAx/incremental-game-A`.
- Rama activa y estable: `main`.
- Commit actual de integración: `8a6d628613d9dec47873a7a653e984a781ec2a04`.
- PR integrado: **#1 — Integrar auditoría de rendimiento y selección robusta de gamepad**.
- Rama integrada: `Dev-Performance-Audit`.
- `Dev-Performance-Audit` se conserva como respaldo histórico; ya no es la rama activa.
- La integración incorporó 8 commits y 6 archivos modificados.
- No se modificaron gameplay, economía, balance ni presentación visual.
- Entorno: React 19 + TypeScript 6 + Vite 8 + Motion.
- Guardado principal: `incremental-game-a:save:v1`.
- Ajustes de mando: `incremental-game-a:gamepad:v1`.
- Reserva del Gatillo: `incremental-game-a:pulse-trigger:v1`.
- Última actualización: **2 de agosto de 2026, 21:05 CDMX**.

### Repositorio transversal de estabilidad

- Repositorio: [`xArtXtrAx/bugs-universales-corregidos`](https://github.com/xArtXtrAx/bugs-universales-corregidos).
- **IMPORTANCIA MAYÚSCULA:** cada bug crítico, difícil de detectar o reutilizable que encontremos, resolvamos y validemos debe documentarse también allí como conocimiento aplicable a todos los videojuegos futuros.
- Cada reporte universal debe registrar, como mínimo: síntoma, condiciones que revelaron el fallo, causa raíz, antipatrón, solución genérica, riesgos, matriz de pruebas y lección arquitectónica.
- Esta práctica es parte obligatoria del flujo de desarrollo: busca acumular defensas comprobadas, evitar repetir fallos y lograr progresos más estables en todos los juegos futuros.
- La biblioteca universal complementa la bitácora específica de cada proyecto; no la sustituye.
- Primer caso publicado: `BUG-001 — El primer gamepad conectado puede no ser el que recibe las entradas`.
- Estado del BUG-001: **validado físicamente en el incidente original**.

## 2. Forma de trabajo obligatoria

- Trabajar de forma directa y evitar microcomprobaciones redundantes.
- Usar GitHub Desktop para el flujo local normal.
- Crear ramas para cambios visuales, estructurales o mecánicos importantes.
- Antes de integrar, comparar la rama con `main`, reportar alcance y esperar autorización explícita de Arturo.
- Nunca integrar a `main` ni eliminar ramas sin autorización explícita.
- Conservar ramas remotas como respaldo salvo instrucción contraria.
- Evitar reescrituras destructivas, `force push`, resets agresivos y divergencias innecesarias.
- Evitar ZIP, manifiestos y hashes salvo necesidad técnica o petición expresa.
- Agrupar validaciones; no repetir `git status` ni comprobaciones equivalentes sin motivo.
- No afirmar que se ejecutaron lint, build, benchmarks o pruebas físicas cuando no se ejecutaron realmente.
- Mantener gameplay, fórmulas y visuales idénticos durante refactorizaciones de infraestructura salvo aprobación específica.
- Cuando un bug crítico corregido tenga aplicación transversal, publicarlo en `bugs-universales-corregidos` después de validarlo.
- No se encontró `WORKFLOW_RULES.md`; esta bitácora es la referencia vigente.

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
9. Acelerador de pulso del Gatillo, nivel máximo 6.

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
- Duración orbital:

```text
duración = 3 + 17 × (1 − clics / 5000)^1.6
```

### Barras de progreso

- Componente universal para costos, requisitos y ciclos internos.
- Barras de Presión, Cavitación, Autoclicker, Sobrecarga y Refracción.
- Animación mediante Web Animations API.
- Cada trayectoria parte de la posición visual real.
- Ciclo validado:

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
- Existe acceso DEV y previsualización de los cinco colores sin alterar guardado, economía ni prestigio.
- El reactor sigue funcionando mientras la Cámara está abierta.

## 4. Controles finales DualSense / Gamepad

### Reactor

- X/A: pulsa la esfera.
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

### Selección robusta del dispositivo

- El juego ya no supone que el primer objeto enumerado por `navigator.getGamepads()` es el mando activo.
- `src/gamepad.ts` detecta actividad real en botones, gatillos y ejes.
- Conserva estable el índice activo mientras el dispositivo siga conectado.
- Un mando neutral no bloquea a otro dispositivo físico o virtual que sí recibe entradas.
- Se usa un umbral alto para seleccionar por ejes y evitar cambios por deriva leve.
- Arturo reprodujo la condición problemática —DualSense neutral enumerado junto con un dispositivo Xbox virtual activo— y confirmó que el control volvió a funcionar.
- La corrección del incidente original está **validada físicamente**.
- La matriz amplia de regresión permanece en `GAMEPAD_DEVICE_SELECTION.md` y en el BUG-001.

## 5. Arquitectura relevante

- `src/game.ts`: `GameState`, reducer, costos, migración y guardado.
- `src/App.tsx`: estado autoritativo, tick, efectos visuales y aplicación de acciones.
- `src/refraction.ts`: Matriz y PRISMA.
- `src/bulkPurchase.ts`: simulación estratégica.
- `src/UpgradesPanelCompact.tsx`: panel y tarjetas.
- `src/UpgradeProgressBar.tsx`: animación nativa de barras.
- `src/UpgradeProgressSystem.tsx`: portales y snapshots de barras.
- `src/gamepad.ts`: etiquetas, ajustes, detección y selección por actividad real.
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
- `GAMEPAD_DEVICE_SELECTION.md`: bug crítico, causa raíz, parche y regla universal.
- `PERFORMANCE_AUDIT.md`: línea base y recomendaciones de rendimiento.

## 6. Auditoría de rendimiento integrada

La auditoría ya forma parte de `main`; no es una rama pendiente.

### Archivos y herramientas incorporados

- `PERFORMANCE_AUDIT.md`.
- `GAMEPAD_DEVICE_SELECTION.md`.
- `scripts/performance-audit.mjs`.
- Comandos en `package.json`.
- Parche de selección robusta en `src/gamepad.ts`.

### Comandos disponibles

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

No se añadieron dependencias.

### Línea base local registrada

- 28 archivos.
- 8,852 líneas.
- 276,662 bytes.
- `setInterval`: 6.
- `requestAnimationFrame`: 18.
- lecturas de `localStorage`: 6.
- escrituras de `localStorage`: 4.
- `MutationObserver`: 4.
- observadores del `body` completo: 3.
- `querySelectorAll`: 5.
- `JSON.parse`: 5.
- `JSON.stringify`: 4.
- `useEffect`: 45.
- `useState`: 37.

Archivos más grandes en esa captura:

- `game.ts`: 892 líneas.
- `GameCore`: 776.
- `UpgradesPanel`: 665.
- `GamepadController`: 657.
- `SapphireGem3D`: 579.
- `App`: 498.
- `UpgradeProgressSystem`: 486.
- `DeveloperPanel`: 465.
- `bulkPurchase`: 445.
- `PulseTrigger`: 418.

## 7. Hallazgos confirmados

### P0 — Nunca seleccionar el mando solo por orden de enumeración

Un cierre inesperado de Chrome reveló que podían coexistir:

- `DualSense Wireless Controller`, enumerado primero pero neutral;
- `Controller (XBOX 360 For Windows)`, que recibía las entradas reales.

La corrección selecciona por actividad real y mantiene estable el dispositivo activo. El incidente original fue validado físicamente y se publicó como `BUG-001` en el repositorio universal.

### P1 — `localStorage` se usa como bus interno

Además del guardado, varios sistemas releen y deserializan el estado periódicamente:

- `UpgradeProgressSystem`: cada 100 ms.
- `PulseTriggerSystem`: cada 160 ms.
- `ChromaticChamberSystem`: cada 180 ms.

Primera recomendación estructural: crear una fuente ligera de snapshots en memoria con suscripciones selectivas y reservar `localStorage` para persistencia.

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

A mediano plazo conviene un servicio único de entrada que produzca botones, flancos, ejes y conexión. Esta migración debe hacerse por separado y con prueba física completa.

### P1 — Guardado completo y síncrono por cada estado

`App` ejecuta `saveGameState(game)` cada vez que cambia el estado principal.

Recomendación futura:

- marca `dirty`;
- debounce de 250–500 ms;
- guardado inmediato en cristalización y reset;
- flush en `visibilitychange` y `pagehide`;
- métricas de tamaño y duración;
- conservar migración y sanitización.

No cambiar sin medir y definir eventos críticos.

### P1/P2 — Demasiados relojes independientes

Conviven tick de 1 segundo, reloj de 100 ms, sondeos de 100/160/180 ms, varios bucles de mando, WebGL y Web Animations API.

Recomendación: reloj visual compartido y selectivo; aislar temporizadores visibles de los renders globales.

### P2 — Barras integradas mediante DOM y persistencia

`UpgradeProgressSystem` carga su propia copia del guardado, observa el `body`, busca tarjetas por texto y crea hosts imperativos.

Debe conservarse `UpgradeProgressBar` y la animación nativa, migrando alimentación y montaje hacia estado en memoria e IDs declarativos.

### P2 — Gatillo y Cámara mantienen snapshots parciales

Ambos deben migrar gradualmente a la fuente compartida después de las barras.

### P2 — Comprar todo escala por rondas y candidatos

Con 320 rondas y nueve candidatos puede alcanzar hasta 2,880 intentos de compra.

No reescribir aún. Primero medir duración por estrategia y estado.

### P2 — Autoclicks individuales

El límite actual de 20/s hace que el enfoque sea correcto y seguro. No optimizar todavía sin pruebas de equivalencia exacta.

### P2 — Definiciones distribuidas

Costos, requisitos, etiquetas, categorías, acciones, barras y pesos estratégicos aparecen en varios archivos. Antes de crecer mucho conviene un registro tipado de mejoras con IDs estables, sin quitar autoridad al reducer.

### Estrategia numérica

`number` es suficiente hoy. No introducir BigNumber ni librerías decimales hasta definir la escala real del juego.

## 8. Presupuestos iniciales de rendimiento

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

### Fase A — Validación posterior a la integración

1. Cambiar en GitHub Desktop a `main`.
2. Ejecutar:

```powershell
npm run lint
npm run build
npm run audit:performance
npm run dev
```

3. Confirmar que el juego y el control siguen funcionando desde `main`.
4. Registrar la nueva salida del auditor si cambia.
5. Medir Chrome Performance en escenarios A–D.
6. Medir renders con React Profiler.
7. Registrar resultados en `PERFORMANCE_AUDIT.md`.
8. Decidir el primer cambio estructural con datos reales.

### Fase B — Comunicación interna

Sujeta a medición:

- fuente de snapshots en memoria;
- retirar sondeos de `localStorage` en barras, Cámara y Gatillo;
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

## 12. Validaciones realizadas y pendientes

### Realizadas

- `npm run lint` antes del parche de gamepad: 0 errores y 3 advertencias no bloqueantes.
- `npm run build` antes del parche: compilación de producción correcta.
- `npm run audit:performance`: línea base de 28 archivos y 8,852 líneas.
- `npm run audit:performance:json`: captura guardada en `%TEMP%`.
- Diagnóstico directo de todos los objetos de `navigator.getGamepads()`.
- Reproducción de DualSense neutral + dispositivo Xbox virtual activo.
- Prueba física después del parche: el control volvió a funcionar.
- Publicación y validación del `BUG-001`.
- Integración autorizada a `main` mediante el PR #1.

### Pendientes

- Repetir `npm run lint` después del parche y desde `main`.
- Repetir `npm run build` después del parche y desde `main`.
- Repetir el auditor desde `main` y comparar la línea base.
- Perfil de Chrome Performance.
- React Profiler.
- Benchmarks de duración.
- Sesión prolongada de 30–60 minutos.
- Matriz amplia de regresión de gamepad antes de una futura refactorización del sistema de entrada.

La integración actual fue autorizada por Arturo después de validar físicamente el incidente original. Las comprobaciones pendientes deben completarse antes de comenzar una refactorización estructural nueva.

## 13. Prompt recomendado para el siguiente chat

> Continúa el proyecto privado `xArtXtrAx/incremental-game-A`. La rama activa y estable es `main`, actualmente en la integración `8a6d628613d9dec47873a7a653e984a781ec2a04`. `Dev-Performance-Audit` ya fue integrada mediante el PR #1 y se conserva solo como respaldo histórico. Lee primero `HISTORIAL_GPT.MD`, `PERFORMANCE_AUDIT.md` y `GAMEPAD_DEVICE_SELECTION.md`. Existe un repositorio transversal de importancia mayúscula, `xArtXtrAx/bugs-universales-corregidos`, donde cada bug crítico resuelto y validado debe documentarse como ejemplo reutilizable. El `BUG-001`, sobre seleccionar el gamepad por actividad real en vez del primer índice enumerado, ya fue publicado y validado físicamente: Arturo confirmó que el control volvió a funcionar con un DualSense neutral enumerado junto con un dispositivo Xbox virtual activo. No integres ramas ni elimines respaldos sin autorización explícita. Antes de refactorizar, actualiza `main` localmente y ejecuta `npm run lint`, `npm run build`, `npm run audit:performance` y `npm run dev`; lint y build posteriores al parche todavía están pendientes. Después completa perfiles de Chrome Performance y React Profiler. Los hallazgos principales son: `localStorage` usado como canal interno por barras, Gatillo y Cámara; varios relojes y bucles de mando independientes; guardado completo tras cada estado; posibles renders globales cada 100 ms; Comprar todo con hasta 320 rondas por nueve candidatos; autoclics individuales; y definiciones de mejoras distribuidas. La primera refactorización recomendada, sujeta a medición, es una fuente ligera de snapshots en memoria para retirar el sondeo de `localStorage`, empezando por barras, luego Cámara y Gatillo. Mantén reducer, fórmulas, balance, visuales, barras fluidas y controles exactamente iguales. Trabaja de forma directa, evita comprobaciones redundantes y usa GitHub Desktop para el flujo local normal.
