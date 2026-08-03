# HISTORIAL_GPT — Incremental Game A

> Bitácora compartida entre Arturo y GPT.  
> **Regla para nuevos chats:** leer primero este archivo, `PLAN_MAESTRO.md`, `MODELO_MATEMATICO.md`, `PERFORMANCE_AUDIT.md` y `GAMEPAD_DEVICE_SELECTION.md`; después comprobar la rama activa antes de modificar el proyecto.

## 1. Estado actual del repositorio

- Repositorio: `xArtXtrAx/incremental-game-A`.
- Rama activa y estable: `main`.
- Commit de integración del código vigente: `e42908277ee45a9c59dfd885943e89e115d75c85`.
- PR integrado: **#2 — Integra navegación confinada y foco visible del gamepad**.
- Rama integrada: `Dev-Gamepad-Zone-Navigation`.
- La rama se conserva como respaldo histórico; no debe eliminarse sin autorización explícita.
- La integración incorporó 12 commits y 8 archivos afectados.
- Alcance del PR #2: navegación y foco del gamepad, modalidad mouse/gamepad, hápticos y animación visual de barras cíclicas.
- No se modificaron economía, balance, fórmulas de gameplay ni formato de guardado en el PR #2.
- `Dev-Performance-Audit` ya había sido integrada mediante el PR #1 y también se conserva como respaldo histórico.
- Después del PR #2 se incorporaron tres commits exclusivamente documentales:
  - `b60ab8b483d73a72cd28f109206a2044a165a43d` — añade `PLAN_MAESTRO.md`;
  - `17422ef2437f3b93c8e11ef7052f64cfdb7d865a` — añade `MODELO_MATEMATICO.md`;
  - `96a9e07a73142fee22bfcf0d3e83b252c8fcf5cc` — enlaza ambos documentos y formaliza su división.
- Estado de `main` verificado hasta `96a9e07a73142fee22bfcf0d3e83b252c8fcf5cc` antes de esta actualización de bitácora.
- No hay PR abiertos ni ramas recientes con cambios pendientes de integrar.
- Entorno: React 19 + TypeScript 6 + Vite 8 + Motion.
- Guardado principal: `incremental-game-a:save:v1`.
- Ajustes de mando: `incremental-game-a:gamepad:v1`.
- Reserva del Gatillo: `incremental-game-a:pulse-trigger:v1`.
- Última actualización: **3 de agosto de 2026, 02:24 CDMX**.

### Repositorio transversal de estabilidad

- Repositorio: [`xArtXtrAx/bugs-universales-corregidos`](https://github.com/xArtXtrAx/bugs-universales-corregidos).
- Cada bug crítico, difícil de detectar o reutilizable debe documentarse allí con síntoma, causa raíz, antipatrón, solución general, riesgos y matriz de pruebas.
- `BUG-001 — El primer gamepad conectado puede no ser el que recibe las entradas`: **validado físicamente en el incidente original**.
- `BUG-002 — El foco del gamepad puede quedar invisible después de usar el mouse`: **causa raíz confirmada, corrección implementada y validación visual final pendiente**.

## 2. Documentación rectora

### `PLAN_MAESTRO.md`

- Define la visión completa y la secuencia de expansiones.
- Distingue contenido integrado, provisional, siguiente etapa, proyectado y opcional.
- Establece el recorrido general:

```text
Reactor básico
  ↓
Cristalización / Prestigio
  ↓
Zafiro
  ↓
Esmeralda
  ↓
Gema amarilla
  ↓
Gema naranja
  ↓
Gema roja
  ↓
Nexo Prismático completo
```

- Zafiro está integrado provisionalmente hasta nivel 5.
- Esmeralda es la siguiente etapa que debe diseñarse antes de programarse.
- Amarilla, Naranja, Roja, culminación del Nexo y posible postjuego permanecen proyectados sin mecánicas definitivas.
- El plan no congela fórmulas que todavía estén en discusión.

### `MODELO_MATEMATICO.md`

- Reúne las fórmulas que gobiernan economía, producción, progresión y sistemas avanzados.
- Distingue fórmulas **Integradas**, **Provisionales**, **Propuestas** y **Pendientes**.
- Documenta costos, redondeos, producción, Presión, Cavitación, Autoclicker, Sobrecarga, PRISMA, Gatillo, Zafiro y dependencias entre multiplicadores.
- Señala el archivo y la función de implementación de cada fórmula relevante.
- El código de `main` sigue siendo la autoridad final.
- Las fórmulas futuras de Esmeralda deberán aprobarse y documentarse aquí antes de implementarse.

### División de responsabilidades

```text
PLAN_MAESTRO.md       → hacia dónde va el juego
MODELO_MATEMATICO.md  → cómo se comporta matemáticamente
HISTORIAL_GPT.MD      → qué se hizo, integró y validó
PERFORMANCE_AUDIT.md  → riesgos y presupuestos de rendimiento
```

## 3. Forma de trabajo obligatoria

- Trabajar de forma directa y evitar microcomprobaciones redundantes.
- Usar GitHub Desktop para el flujo local normal.
- Crear ramas para cambios visuales, estructurales, mecánicos o de balance importantes.
- Antes de integrar, comparar la rama con `main`, explicar el alcance y esperar autorización explícita de Arturo.
- Nunca integrar a `main` ni eliminar ramas sin autorización explícita.
- Conservar ramas remotas como respaldo salvo instrucción contraria.
- Evitar `force push`, resets agresivos, ZIP, manifiestos y hashes salvo necesidad técnica clara.
- Agrupar validaciones; no repetir `git status` u otras comprobaciones equivalentes sin motivo.
- No afirmar que se ejecutaron lint, build, benchmarks o pruebas físicas cuando no se ejecutaron realmente.
- Mantener gameplay, fórmulas y visuales idénticos durante refactorizaciones de infraestructura salvo aprobación específica.
- Una expansión cromática debe pasar por idea, documento de diseño, fórmulas, simulación, rama de desarrollo, implementación, pruebas e integración.
- No se encontró `WORKFLOW_RULES.md`; esta bitácora es la referencia operativa vigente.

## 4. Estado jugable actual en `main`

### Interfaz y sistemas

- Resumen superior compacto.
- Núcleo fijo a la izquierda en escritorio.
- Evoluciones en panel desplazable con pestañas Producción, Núcleo y Avanzadas.
- Tarjetas expandibles y Comprar todo estratégico.
- Navegación móvil entre Núcleo y Evoluciones.
- Panel DEV responsivo.
- Guía visual por regiones para mouse y mando.
- Cámara Cromática con acceso visual y modo DEV.
- Gatillo de pulso, Autoclicker, Presión, Cavitación, Sobrecarga, PRISMA y Prestigio conectados al reducer autoritativo.

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

### Gatillo de pulso

- 10 clics directos generan 1 segundo de reserva.
- Reserva máxima: 10 segundos.
- Cadencia: `min(9, 6 + 0.5 × nivel)` pulsos/s.
- Se activa con R2/RT, botón visual, teclado o clic derecho en el área jugable.
- El clic izquierdo puede usarse simultáneamente.
- Gatillo y Autoclicker no recargan la reserva.
- La reserva se guarda separada del estado principal.

### Prestigio y Zafiro

- La esfera se llena a 5,000 clics.
- La cristalización siempre requiere confirmación.
- Multiplicadores actuales: P0 ×1.00, P1 ×1.50, P2 ×1.85, P3 ×2.20, P4 ×2.60 y P5 ×3.05.
- Después de P5 se usa temporalmente +0.50 por prestigio mientras se diseña la progresión cromática.
- Visualmente Zafiro está planteado hasta nivel 5, pero el crecimiento posterior aún existe en la fórmula vigente; esta diferencia está documentada como **provisional**.
- El Zafiro usa geometría WebGL, iluminación orbital, chispa y estela.

### Cámara Cromática

- Nexo Prismático con Zafiro, Esmeralda, Amarilla, Naranja y Roja.
- En P5 se activa la primera órbita azul y la Esmeralda queda señalada como siguiente frecuencia.
- Las cuatro gemas posteriores aún no tienen economía ni bonificaciones definitivas.
- El reactor continúa funcionando mientras la Cámara está abierta.

## 5. Controles DualSense / Gamepad integrados

### Reactor

- X/A: pulsa la esfera.
- X/A no pulsa la esfera mientras L2/LT está sostenido.
- Cuadrado/X de Xbox: activa el control enfocado.
- R2/RT: Gatillo de pulso.
- L2 + Triángulo / LT + Y: cambia estrategia de Comprar todo.
- L2 + Cuadrado / LT + X: Comprar todo lo posible.
- Triángulo/Y sin L2 conserva el atajo anterior de compra global.
- Options/Menu: abre o cierra el panel del mando.
- L1/LB selecciona y enfoca exclusivamente el Núcleo.
- R1/RB selecciona y enfoca exclusivamente Evoluciones.
- **L1 y R1 son la única vía de cambio entre las dos zonas mediante el mando.**
- Cruceta y joystick navegan solamente entre controles de la zona activa.
- Las pestañas principales no pueden activarse con Cuadrado para cambiar indirectamente de zona.
- Círculo/B ya no regresa automáticamente al Núcleo desde el reactor.
- Abrir y cerrar el panel del mando conserva la zona activa.
- Los atajos globales no arrastran el foco a Evoluciones cuando el jugador estaba en el Núcleo.
- L1+R1 simultáneos no cambian de zona y ya no abren la Cámara Cromática.
- La navegación del reactor se suspende mientras la Cámara está abierta.

### Cámara Cromática

- El atajo L1+R1 para entrar fue retirado temporalmente.
- La Cámara se abre mediante su control visual o herramientas DEV.
- Una vez abierta, L1/R1 y cruceta izquierda/derecha recorren gemas.
- Cruceta arriba enfoca regresar y cruceta abajo vuelve a la gema seleccionada.
- X/A activa el control de la Cámara sin pulsar el núcleo por detrás.
- Círculo/B cierra la Cámara.

## 6. Correcciones incorporadas en el PR #2

### Navegación confinada y recuperación de foco

- `GamepadController` limita la búsqueda espacial al Núcleo, Evoluciones o panel del mando según el contexto.
- Un panel colapsado no puede convertirse en una raíz de navegación sin destinos.
- Si el foco se pierde o un control desaparece durante un render, la navegación se recupera dentro de la última zona activa.
- L1/R1 actualizan explícitamente la zona activa.

### Barra del Autoclicker y ciclos lentos

- Se corrigió el caso de `0.2 clic/s` donde la barra parecía retroceder desde 100% hasta 20%.
- La causa era la superposición entre el reinicio cíclico y la siguiente actualización de estado.
- `UpgradeProgressBar` conserva el estado de un wrap interrumpido y completa la trayectoria `100% → 0% → nuevo valor`.
- La validación visual final de este caso en `main` sigue pendiente.

### Modalidad mouse/gamepad y hápticos

- El juego registra una modalidad activa `mouse` o `gamepad`.
- Movimiento intencional, clic o rueda del mouse suspenden temporalmente las vibraciones.
- Una entrada real de botones, gatillos, cruceta o stick reactiva el modo gamepad.
- El ajuste manual de vibración permanece como interruptor maestro y no se sobrescribe.
- Los patrones hápticos programados vuelven a comprobar la modalidad antes de cada paso.

### Foco invisible después de usar el mouse

- Chrome puede mover `document.activeElement` mediante `element.focus()` sin activar visualmente `:focus-visible` después de usar el mouse.
- El diagnóstico confirmó que la cruceta seguía llegando como botones 12–15 y que el foco DOM cambiaba correctamente.
- `GamepadFocus.css` dibuja explícitamente el foco cuando `data-incremental-input-mode="gamepad"`.
- El contorno cubre Núcleo, Evoluciones, estrategias, Comprar todo, pestañas, sliders, controles móviles y panel del mando.
- Al volver al mouse desaparece el contorno específico del gamepad.
- Este caso se publicó como BUG-002 en el repositorio universal.

## 7. Selección robusta del dispositivo

- El juego no supone que el primer objeto de `navigator.getGamepads()` sea el mando activo.
- `src/gamepad.ts` detecta actividad real en botones, gatillos y ejes.
- Conserva estable el índice activo mientras siga conectado.
- Un DualSense neutral no bloquea al dispositivo Xbox virtual que recibe las entradas.
- Arturo validó físicamente la condición original; está documentada en `GAMEPAD_DEVICE_SELECTION.md` y BUG-001.

## 8. Arquitectura y archivos relevantes

- `src/game.ts`: estado, reducer, costos, migración y guardado.
- `src/App.tsx`: estado autoritativo, tick y efectos.
- `src/refraction.ts`: Matriz y PRISMA.
- `src/bulkPurchase.ts`: simulación estratégica.
- `src/UpgradesPanelCompact.tsx`: panel y tarjetas.
- `src/UpgradeProgressBar.tsx`: animación nativa y reinicios cíclicos.
- `src/UpgradeProgressSystem.tsx`: portales y snapshots de barras.
- `src/gamepad.ts`: ajustes, selección por actividad y modalidad de entrada.
- `src/GamepadController.tsx`: navegación por zonas y hotkeys del reactor.
- `src/GamepadFocus.css`: foco explícito para modo gamepad.
- `src/ChromaticGamepadBridge.tsx`: navegación específica de la Cámara.
- `src/GamepadEventHaptics.tsx`: vibraciones contextuales sensibles a modalidad.
- `src/PulseTriggerSystem.tsx`: entradas y portal del Gatillo.
- `src/ChromaticChamberSystem.tsx`: acceso, Cámara e inspector.
- `PLAN_MAESTRO.md`: mapa de progresión y expansiones.
- `MODELO_MATEMATICO.md`: fórmulas, curvas, límites y balance.
- `PERFORMANCE_AUDIT.md`: línea base y recomendaciones.
- `GAMEPAD_DEVICE_SELECTION.md`: BUG-001 y regla de selección por actividad.

## 9. Hallazgos de rendimiento que siguen vigentes

### P1 — `localStorage` se usa como bus interno

`UpgradeProgressSystem`, `PulseTriggerSystem` y `ChromaticChamberSystem` releen y deserializan el guardado cada 100, 160 y 180 ms. La recomendación futura es una fuente de snapshots en memoria y reservar `localStorage` para persistencia.

### P1 — Sondeo duplicado del mando

Existen bucles independientes en `GamepadController`, `PulseTriggerSystem` y `ChromaticGamepadBridge`. Conviene un servicio único de entrada, pero debe migrarse por etapas y con prueba física completa.

### P1 — Guardado completo por cada cambio

`App` ejecuta `saveGameState(game)` con cada cambio del estado principal. La recomendación futura es coordinador `dirty`, debounce y guardados inmediatos solo en eventos críticos.

### P1/P2 — Relojes independientes

Conviven tick de 1 segundo, reloj de 100 ms, sondeos de 100/160/180 ms, varios bucles de mando, WebGL y Web Animations API.

## 10. Validaciones realizadas y pendientes

### Realizadas

- Diagnóstico físico y validación del BUG-001.
- Diagnóstico de Chrome del foco invisible: botones 12–15 correctos, ejes neutrales y cambio real de `document.activeElement`.
- Confirmación de que la Cámara Cromática usa un controlador independiente y recibe la cruceta.
- Comprobación aislada de TypeScript estricto para el seguimiento de modalidad de entrada.
- Comparación final de `Dev-Gamepad-Zone-Navigation` contra `main`: 12 commits adelante, 0 atrás.
- Integración autorizada por Arturo mediante el PR #2.
- Verificación posterior de que todos los cambios recientes están en `main` y que no existen PR abiertos.
- Creación y enlace de `PLAN_MAESTRO.md` y `MODELO_MATEMATICO.md`.

### Pendientes después de la integración

- Ejecutar `npm run lint` sobre el `main` actual.
- Ejecutar `npm run build` sobre el `main` actual.
- Confirmar visualmente que el contorno reaparece al pasar de mouse a cruceta y desaparece al volver al mouse.
- Probar confinamiento completo de cruceta y joystick en Núcleo y Evoluciones.
- Confirmar que L1/R1 sean la única vía de cambio de zona.
- Confirmar que L1+R1 no abra la Cámara.
- Probar abrir/cerrar el panel y conservar la zona.
- Observar varios ciclos completos del Autoclicker a `0.2 clic/s`.
- Revisar Cámara abierta por UI/DEV y cierre con Círculo.
- Repetir auditoría de rendimiento y una sesión prolongada cuando corresponda.

Los commits recientes de documentación Markdown no requirieron `lint` ni `build` por sí mismos, pero las validaciones del código integrado en el PR #2 continúan pendientes.

## 11. Orden recomendado para continuar

### Paso inmediato de estabilidad

1. En GitHub Desktop, cambiar a `main` y hacer **Fetch/Pull origin**.
2. Ejecutar:

```powershell
npm run lint
npm run build
npm run dev
```

3. Completar la matriz física pendiente de la sección 10.
4. Si todo pasa, actualizar BUG-002 a **validado físicamente** en `bugs-universales-corregidos`.

### Siguiente etapa de contenido — Esmeralda

Antes de crear una rama de implementación, discutir y registrar:

1. identidad mecánica propia de Esmeralda;
2. relación con Zafiro nivel 5;
3. condición de activación;
4. recurso persistente, si aplica;
5. fórmula de obtención;
6. cinco niveles y costos;
7. beneficio visible dentro del reactor;
8. interacción con cristalización;
9. condición de desbloqueo de la gema amarilla;
10. migración del guardado y herramientas DEV.

Las decisiones aprobadas deberán incorporarse primero a `PLAN_MAESTRO.md` y `MODELO_MATEMATICO.md`. Después se podrá crear una rama específica de Esmeralda.

### Trabajo estructural posterior

- fuente de snapshots en memoria;
- reducción de sondeos de `localStorage`;
- servicio unificado de entrada por etapas;
- coordinador de persistencia y migraciones;
- perfiles reproducibles de rendimiento.

No combinar varias refactorizaciones estructurales con la primera implementación de Esmeralda salvo necesidad técnica clara.

## 12. Optimizaciones que deben esperar

No implementar todavía: ECS, Typed Arrays para niveles, min-heap, Web Workers para el tick normal, IndexedDB, BigNumber sin definir escala, memoización indiscriminada, reescritura completa del reducer ni cambios simultáneos de arquitectura y balance.

## 13. Prompt recomendado para el siguiente chat

> Continúa el proyecto privado `xArtXtrAx/incremental-game-A`. La rama activa y estable es `main`. El código vigente del PR #2 fue integrado en `e42908277ee45a9c59dfd885943e89e115d75c85`; después se añadieron `PLAN_MAESTRO.md` en `b60ab8b483d73a72cd28f109206a2044a165a43d`, `MODELO_MATEMATICO.md` en `17422ef2437f3b93c8e11ef7052f64cfdb7d865a` y su enlace cruzado en `96a9e07a73142fee22bfcf0d3e83b252c8fcf5cc`. Lee primero `HISTORIAL_GPT.MD`, `PLAN_MAESTRO.md`, `MODELO_MATEMATICO.md`, `PERFORMANCE_AUDIT.md` y `GAMEPAD_DEVICE_SELECTION.md`. No integres ni elimines ramas sin autorización explícita. Ya están integrados: confinamiento de cruceta/stick por zona; L1/R1 como única vía de cambio; retiro de L1+R1 para abrir la Cámara; recuperación de foco; corrección de barras cíclicas lentas; suspensión háptica con mouse; y foco explícito en modo gamepad. No se modificaron economía, balance ni guardado en el PR #2. Antes de una nueva implementación, siguen pendientes `npm run lint`, `npm run build`, `npm run dev` y la matriz física. La siguiente etapa de contenido es Esmeralda: primero discutir identidad, relación con Zafiro 5, recurso, fórmulas, cinco niveles, persistencia y desbloqueo de Amarilla; después actualizar los documentos maestros y crear una rama específica. BUG-001 está validado; BUG-002 tiene causa confirmada y corrección implementada, pero su validación visual final está pendiente. Trabaja de forma directa, evita comprobaciones redundantes y usa GitHub Desktop para el flujo local normal.
