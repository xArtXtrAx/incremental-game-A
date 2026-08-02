# Soporte de controles — Dev-Gamepad-Test

## Estado

Implementación experimental basada en la Gamepad API estándar. `main` permanece sin cambios hasta la validación física y visual de Arturo.

No se añadieron dependencias ni campos al guardado principal. Las capas de control usan claves independientes:

```text
incremental-game-a:gamepad:v1
incremental-game-a:pulse-trigger:v1
```

## Controles

### DualSense / PlayStation

- `X`: activar el control enfocado; si no hay uno, pulsar el núcleo.
- `R2` mantenido: usar el Gatillo de pulso mientras exista reserva.
- `Cuadrado`: cambiar la estrategia de Comprar todo.
- `Triángulo`: Comprar todo posible.
- `L1`: ir al Núcleo.
- `R1`: ir a Evoluciones.
- `Círculo`: volver al Núcleo.
- `Options`: abrir o cerrar el panel del mando.
- Cruceta o stick izquierdo: navegar por controles visibles.
- `X` sobre interruptores: activar o desactivar.
- Izquierda/derecha sobre un deslizador: modificar su valor.

Los nombres cambian automáticamente a `A/B/X/Y`, `LB/RB`, `RT` y `Menu` cuando se detecta un control Xbox.

## Gatillo de pulso

La pulsación continua gratuita fue retirada. Mouse y control comparten ahora una herramienta con recurso propio:

- 10 clics directos sobre el núcleo generan 1 segundo de reserva.
- El Gatillo produce 6 pulsaciones por segundo.
- La reserva máxima es de 10 segundos.
- El botón visual se activa manteniendo presionado el mouse, Espacio/Enter o `R2/RT`.
- Las pulsaciones del Gatillo no recargan su propia reserva.
- El Autoclicker no recarga la reserva porque no genera eventos DOM sobre el botón.
- `X/A` sobre el núcleo sí cuenta como clic directo y carga la reserva.
- Las pulsaciones usan el mismo botón real del núcleo, por lo que conservan energía, Cavitación, Sobrecarga, animaciones y reglas existentes.
- La reserva y el progreso parcial se conservan al recargar la página.
- La reserva se reinicia al cristalizar o borrar el progreso.

El Gatillo se detiene al soltar la entrada, agotarse la reserva, ocultarse la pestaña, perder el foco o desconectarse/desactivarse el control. Si la reserva llega a cero mientras `R2` sigue presionado, es necesario soltar y volver a presionar para iniciar otra descarga.

## Arquitectura

- `src/gamepad.ts`: ajustes, persistencia, detección de familia y mapeo estándar.
- `src/GamepadController.tsx`: sondeo, flancos de botones, navegación espacial y acciones discretas.
- `src/pulseTrigger.ts`: constantes, persistencia, protocolo de entradas y reglas puras de carga/consumo.
- `src/PulseTriggerSystem.tsx`: botón visual, reserva, mouse/teclado, lectura de `R2/RT` y pulsaciones compartidas.
- `src/PulseTriggerSystem.css`: presentación, barras de reserva/carga y estados activo/listo.
- `src/GamepadEventHaptics.tsx`: patrones opcionales para eventos del juego y del Gatillo.
- `src/GamepadController.css`: panel, estados de conexión, controles y accesibilidad.
- `src/main.tsx`: monta las capas como componentes hermanos de `App`.

El soporte acciona los mismos botones del DOM que usa el mouse. No replica fórmulas ni modifica directamente el reducer; las compras, clics y cristalización continúan pasando por la lógica existente.

## Rendimiento y seguridad

- Sondeo mediante `requestAnimationFrame`.
- No actualiza React en cada cuadro salvo mientras cambia la reserva visible.
- Las acciones se pausan cuando la pestaña está oculta.
- Las pulsaciones discretas se detectan por transición presionado/no presionado.
- La navegación tiene repetición limitada a 190 ms.
- El mando principal es el primer gamepad conectado.
- La ausencia de vibración no afecta ninguna acción.
- Configuración saneada al cargar: intensidad 0–100% y zona muerta 25–90%.
- El antiguo ajuste de velocidad de R2 queda ignorado y se guarda desactivado para evitar que reaparezca mediante una configuración anterior.
- El Gatillo marca internamente sus clics antes de pulsar el núcleo; el listener de carga consume esa marca y evita la autorrecarga.

## Vibración

Se intenta primero `vibrationActuator.playEffect('dual-rumble', ...)` y después el respaldo `pulse(...)`. La disponibilidad depende del navegador, sistema operativo, conexión y control.

Patrones actuales:

- Navegación: pulso muy ligero.
- Pulsación normal: pulso corto.
- Cada pulso del Gatillo: vibración ligera.
- Segundo nuevo de reserva: doble toque ascendente.
- Reserva agotada: golpe corto de cierre.
- Comprar todo: golpe medio.
- Cavitación: golpe único medio.
- Sobrecarga: golpe fuerte y réplica.
- Descarga prismática: dos golpes crecientes.
- Ascenso del zafiro: secuencia ascendente de tres pasos.

Esta rama no usa todavía WebHID ni reportes propietarios del DualSense. Por tanto, no controla gatillos adaptativos, barra de luz, altavoz, giroscopio ni hápticos avanzados específicos de PlayStation.

## Prueba local recomendada

1. Cambiar a `Dev-Gamepad-Test` y hacer Pull.
2. Ejecutar:

```powershell
npm run lint
npm run build
npm run dev
```

3. Abrir el juego en Chrome o Edge.
4. Conectar el DualSense por Bluetooth o USB y pulsar cualquier botón.
5. Realizar 10 clics directos y confirmar que la reserva cambia a `1.0 s`.
6. Mantener el botón visual y confirmar seis pulsaciones antes de quedar en `0.0 s`.
7. Repetir usando `R2` y confirmar el mismo comportamiento.
8. Comprobar que mantener `R2` sin reserva no genera clics.
9. Comprar Autoclicker y confirmar que sus clics no aumentan `Siguiente segundo`.
10. Confirmar que las pulsaciones del Gatillo tampoco aumentan su propia carga.
11. Probar Cavitación, Sobrecarga, PRISMA y cristalización durante una descarga.
12. Confirmar que cristalizar y borrar progreso reinician la reserva.
13. Probar desconexión, reconexión y cambio de pestaña durante una descarga.

## Validación realizada

- Rama creada exactamente desde el `main` aprobado.
- Módulos de Gamepad, Gatillo y hápticos comprobados con TypeScript estricto usando ES2023 + DOM y declaraciones React equivalentes.
- Pruebas puras aprobadas:
  - 9 clics dejan progreso `9/10`.
  - El clic 10 genera exactamente 1,000 ms.
  - Seis pulsaciones consumen exactamente ese segundo.
  - Una séptima pulsación es rechazada.
  - La carga parcial no cambia durante la descarga.
  - La reserva máxima no admite acumulación oculta.
  - El marcador de clic sintético se consume una sola vez.
- Sin dependencias nuevas.
- El diff no modifica `game.ts`, fórmulas, costos ni el reducer.

## Validación pendiente

La implementación necesita la prueba visual y física final en el equipo de Arturo. En la integración remota no se ejecutaron `npm run lint`, `npm run build` ni `npm run dev` con las dependencias reales del checkout privado.
