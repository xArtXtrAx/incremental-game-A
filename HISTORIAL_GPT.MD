# HISTORIAL_GPT — Incremental Game A

> Bitácora compartida entre Arturo y GPT.  
> **Regla para nuevos chats:** leer este archivo, `PERFORMANCE_AUDIT.md` y `GAMEPAD_DEVICE_SELECTION.md`; después comprobar la rama activa antes de modificar el proyecto.

## 1. Estado actual del repositorio

- Repositorio: `xArtXtrAx/incremental-game-A`.
- Rama estable: `main`.
- Último commit estable antes del ajuste actual: `ef0dcf2cbd81457b346809e2046edb4a354016c6`.
- Rama de trabajo activa: `Dev-Gamepad-Zone-Navigation`.
- Base de la rama: `main` en `ef0dcf2cbd81457b346809e2046edb4a354016c6`.
- La rama actual no está integrada en `main`.
- Objetivo de la rama: confinar cruceta y joystick a la zona activa, reservar L1/R1 como única vía de cambio entre Núcleo y Evoluciones, y retirar temporalmente el acceso L1+R1 a la Cámara Cromática.
- Los cambios afectan únicamente navegación y mapa de controles; no modifican gameplay, economía, balance, guardado ni presentación visual.
- `Dev-Performance-Audit` ya fue integrada mediante el PR #1 y se conserva como respaldo histórico.
- Entorno: React 19 + TypeScript 6 + Vite 8 + Motion.
- Guardado principal: `incremental-game-a:save:v1`.
- Ajustes de mando: `incremental-game-a:gamepad:v1`.
- Reserva del Gatillo: `incremental-game-a:pulse-trigger:v1`.
- Última actualización: **2 de agosto de 2026, 23:21 CDMX**.

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

- Nexo Prismático con cinco frecuencias previstas: Zafiro, Esmeralda, Amarilla, Naranja y Roja.
- En P5 se activa la primera órbita azul y la Esmeralda queda señalada como siguiente frecuencia.
- Las otras cuatro gemas todavía no tienen economía ni bonificaciones.
- El Zafiro orbita por delante y por detrás del Nexo y produce un reflejo dinámico.
- Existe acceso DEV y previsualización de los cinco colores sin alterar guardado, economía ni prestigio.
- El reactor sigue funcionando mientras la Cámara está abierta.

## 4. Controles DualSense / Gamepad

### Controles estables conservados

- X/A: pulsa la esfera.
- X/A no pulsa la esfera mientras L2/LT está sostenido.
- Cuadrado/X de Xbox: selector general; activa el control enfocado.
- R2/RT: Gatillo de pulso.
- L2 + Triángulo / LT + Y: cambia estrategia de Comprar todo.
- L2 + Cuadrado / LT + X: Comprar todo lo posible.
- Triángulo/Y sin L2 conserva el atajo anterior de compra global.
- Izquierda/derecha ajustan sliders cuando tienen foco.
- Options/Menu: abre o cierra el panel del mando.

### Ajuste actual en `Dev-Gamepad-Zone-Navigation`

- L1/LB selecciona y enfoca exclusivamente el Núcleo.
- R1/RB selecciona y enfoca exclusivamente Evoluciones.
- **L1 y R1 son la única vía de cambio entre las dos zonas mediante el mando.**
- Cruceta y joystick navegan solamente entre controles de la zona activa.
- Desde el Núcleo, la navegación direccional no puede saltar a Evoluciones.
- Desde Evoluciones, la navegación direccional no puede saltar al Núcleo.
- Las pestañas principales quedan fuera del selector general de Cuadrado para impedir cambios indirectos de zona.
- Círculo/B deja de regresar automáticamente al Núcleo desde el reactor; se reserva para acciones contextuales como cerrar la Cámara.
- Abrir y cerrar el panel del mando conserva la zona que estaba activa.
- Los atajos globales de estrategia y Comprar todo ejecutan su acción sin arrastrar el foco a Evoluciones cuando el jugador estaba en el Núcleo.
- Presionar L1+R1 simultáneamente no cambia de zona y ya no abre la Cámara Cromática.
- La navegación genérica del reactor se suspende mientras la Cámara está abierta para no mover controles detrás del overlay.

### Cámara Cromática en esta rama

- Se eliminó temporalmente el atajo L1+R1 para entrar.
- La Cámara debe abrirse por su control visual o por herramientas DEV mientras se diseña el acceso definitivo.
- Una vez abierta, L1/R1 y cruceta izquierda/derecha continúan recorriendo gemas.
- Cruceta arriba enfoca regresar.
- Cruceta abajo vuelve a la gema seleccionada.
- X/A activa el control de la Cámara y no pulsa el núcleo por detrás.
- Círculo/B cierra la Cámara.

### Selección robusta del dispositivo

- El juego no supone que el primer objeto enumerado por `navigator.getGamepads()` es el mando activo.
- `src/gamepad.ts` detecta actividad real en botones, gatillos y ejes.
- Conserva estable el índice activo mientras el dispositivo siga conectado.
- Un mando neutral no bloquea a otro dispositivo físico o virtual que sí recibe entradas.
- Arturo reprodujo la condición DualSense neutral + dispositivo Xbox virtual activo y confirmó que el control volvió a funcionar.
- La corrección está validada físicamente y documentada en `GAMEPAD_DEVICE_SELECTION.md` y en el BUG-001.

## 5. Arquitectura relevante

- `src/game.ts`: `GameState`, reducer, costos, migración y guardado.
- `src/App.tsx`: estado autoritativo, tick, efectos visuales y aplicación de acciones.
- `src/refraction.ts`: Matriz y PRISMA.
- `src/bulkPurchase.ts`: simulación estratégica.
- `src/UpgradesPanelCompact.tsx`: panel y tarjetas.
- `src/UpgradeProgressBar.tsx`: animación nativa de barras.
- `src/UpgradeProgressSystem.tsx`: portales y snapshots de barras.
- `src/gamepad.ts`: etiquetas, ajustes, detección y selección por actividad real.
- `src/GamepadController.tsx`: navegación, confinamiento por zona y hotkeys del reactor.
- `src/ChromaticGamepadBridge.tsx`: navegación específica de la Cámara; el acceso L1+R1 fue retirado en la rama actual.
- `src/GamepadEventHaptics.tsx`: vibraciones contextuales.
- `src/pulseTrigger.ts`: reserva, fórmulas y eventos del Gatillo.
- `src/PulseTriggerSystem.tsx`: entradas, disparos y portal del Gatillo.
- `src/ChromaticChamberSystem.tsx`: acceso, Cámara e inspector.
- `src/SapphireGem3D.tsx` y `src/SapphireOrbit3D.tsx`: WebGL.
- `src/DeveloperPanel.tsx`: herramientas DEV.
- `SMOOTH_PROGRESS_FIX.md`: decisiones de barras.
- `DUALSENSE_L2_HOTKEYS.md`: decisiones anteriores del mando.
- `GAMEPAD_DEVICE_SELECTION.md`: bug crítico, causa raíz, parche y regla universal.
- `PERFORMANCE_AUDIT.md`: línea base y recomendaciones de rendimiento.

## 6. Auditoría de rendimiento integrada

La auditoría ya forma parte de `main`; no es una rama pendiente.

### Herramientas incorporadas

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

Archivos más grandes en esa captura: `game.ts` 892 líneas, `GameCore` 776, `UpgradesPanel` 665, `GamepadController` 657, `SapphireGem3D` 579, `App` 498, `UpgradeProgressSystem` 486, `DeveloperPanel` 465, `bulkPurchase` 445 y `PulseTrigger` 418.

## 7. Hallazgos confirmados

### P0 — Nunca seleccionar el mando solo por orden de enumeración

Un cierre inesperado de Chrome reveló un DualSense enumerado primero pero neutral y un dispositivo Xbox virtual que recibía las entradas. La corrección selecciona por actividad real, fue validada físicamente y se publicó como BUG-001.

### P1 — `localStorage` se usa como bus interno

`UpgradeProgressSystem`, `PulseTriggerSystem` y `ChromaticChamberSystem` releen y deserializan el guardado cada 100, 160 y 180 ms respectivamente.

Primera recomendación estructural: crear una fuente ligera de snapshots en memoria con suscripciones selectivas y reservar `localStorage` para persistencia. Orden propuesto: barras, Cámara y Gatillo. El reducer debe seguir siendo la única autoridad del gameplay.

### P1 — Sondeo duplicado del mando

Existen bucles independientes en `GamepadController`, `PulseTriggerSystem` y `ChromaticGamepadBridge`. A mediano plazo conviene un servicio único de entrada, pero debe migrarse por separado y con prueba física completa.

### P1 — Guardado completo y síncrono por cada estado

`App` ejecuta `saveGameState(game)` cada vez que cambia el estado principal. La recomendación futura es coordinador `dirty`, debounce, guardados inmediatos en eventos críticos y flush en `visibilitychange`/`pagehide`.

### P1/P2 — Demasiados relojes independientes

Conviven tick de 1 segundo, reloj de 100 ms, sondeos de 100/160/180 ms, varios bucles de mando, WebGL y Web Animations API.

### P2 — Otros hallazgos

- Barras integradas mediante DOM y persistencia.
- Gatillo y Cámara mantienen snapshots parciales.
- Comprar todo puede alcanzar 2,880 intentos por ejecución.
- Los autoclics se procesan individualmente; el límite actual de 20/s sigue siendo seguro.
- Las definiciones de mejoras están distribuidas.
- `number` es suficiente hoy; no introducir BigNumber todavía.

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

## 9. Escenarios de medición

- **A — Partida nueva:** P0, 30 segundos de clics y navegación con mando.
- **B — Reactor cargado:** esfera llena, evoluciones, Sobrecarga, PRISMA, Gatillo y Autoclicker.
- **C — Comprar todo:** energía alta, tres estrategias y duración.
- **D — Cámara Cromática:** P5/DEV, 60 segundos, navegación y continuidad del reactor.
- **E — Sesión prolongada:** 30–60 minutos, cambios repetidos y revisión de memoria/listeners.

## 10. Orden recomendado para continuar

### Fase inmediata — Validar `Dev-Gamepad-Zone-Navigation`

1. En GitHub Desktop, cambiar a `Dev-Gamepad-Zone-Navigation` y hacer Pull.
2. Ejecutar:

```powershell
npm run lint
npm run build
npm run dev
```

3. Probar con DualSense:
   - L1 entra al Núcleo y R1 a Evoluciones;
   - cruceta y joystick no cruzan de una zona a otra;
   - navegación vertical y horizontal funciona dentro de cada zona;
   - sliders siguen respondiendo a izquierda/derecha;
   - Cuadrado activa únicamente controles de la zona enfocada;
   - Círculo no cambia al Núcleo desde Evoluciones;
   - abrir/cerrar el panel conserva la zona;
   - Triángulo y L2+Cuadrado no cambian el foco de zona;
   - L1+R1 no abre la Cámara ni produce un cambio de zona;
   - la Cámara sigue cerrando con Círculo y navegando internamente una vez abierta.
4. Reportar cualquier salto de foco o control inaccesible.
5. Comparar la rama con `main`.
6. Integrar solo después de aprobación explícita de Arturo.

### Trabajo estructural posterior

Después de cerrar esta rama y completar perfiles:

- fuente de snapshots en memoria;
- retirar sondeos de `localStorage` en barras, Cámara y Gatillo;
- unificar bucles del mando por etapas;
- coordinador de persistencia;
- preparación para Esmeralda.

## 11. Optimizaciones que deben esperar

No implementar todavía: ECS, Typed Arrays para niveles, `Map` indiscriminado, min-heap, Web Workers para el tick normal, IndexedDB, números enormes sin definir escala, memoización indiscriminada, reescritura completa del reducer ni cambios simultáneos de arquitectura y balance.

## 12. Validaciones realizadas y pendientes

### Realizadas previamente

- `npm run lint` antes del parche de selección por actividad: 0 errores y 3 advertencias no bloqueantes.
- `npm run build` antes de ese parche: compilación correcta.
- Línea base del auditor: 28 archivos y 8,852 líneas.
- Diagnóstico y validación física del BUG-001.
- Integración autorizada de la auditoría a `main` mediante el PR #1.

### Pendientes de la rama actual

- `npm run lint`.
- `npm run build`.
- Prueba física completa del confinamiento por zonas.
- Verificar que L1/R1 sean la única vía de cambio con el mando.
- Verificar que L1+R1 no abra la Cámara.
- Revisar navegación del panel del mando y conservación de la zona.
- Revisar Cámara abierta por UI/DEV.
- Comparación final contra `main`.
- Autorización explícita antes de integrar.

### Pendientes generales de rendimiento

- Repetir el auditor desde la versión estable correspondiente.
- Chrome Performance.
- React Profiler.
- Benchmarks de duración.
- Sesión prolongada de 30–60 minutos.

## 13. Prompt recomendado para el siguiente chat

> Continúa el proyecto privado `xArtXtrAx/incremental-game-A`. La rama estable es `main`, pero el trabajo activo está en `Dev-Gamepad-Zone-Navigation`, creada desde `main` en `ef0dcf2cbd81457b346809e2046edb4a354016c6`. Lee primero `HISTORIAL_GPT.MD`, `PERFORMANCE_AUDIT.md` y `GAMEPAD_DEVICE_SELECTION.md`. No integres ni elimines ramas sin autorización explícita. La rama actual cambia únicamente la navegación del mando: cruceta y joystick quedan confinados a la zona activa; L1 selecciona Núcleo y R1 Evoluciones y son la única vía de cambio de zona mediante el mando; Círculo ya no regresa automáticamente al Núcleo; Cuadrado no puede activar las pestañas principales; abrir/cerrar el panel y usar atajos globales conserva la zona; L1+R1 ya no abre la Cámara Cromática ni cambia de zona. La Cámara conserva navegación interna cuando se abre por UI o DEV. Primero actualiza la rama local, ejecuta `npm run lint`, `npm run build` y `npm run dev`, y realiza la matriz física descrita en la sección 10. Mantén gameplay, economía, fórmulas, guardado y visuales sin cambios. Existe el repositorio transversal `xArtXtrAx/bugs-universales-corregidos`; el BUG-001 de selección del gamepad por actividad real ya está validado. Trabaja de forma directa, evita comprobaciones redundantes y usa GitHub Desktop para el flujo local normal.
