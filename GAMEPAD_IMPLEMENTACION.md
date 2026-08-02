# Soporte de controles — Dev-Gamepad-Test

## Estado

Implementación experimental basada en la Gamepad API estándar. `main` permanece sin cambios hasta la validación física y visual de Arturo.

No se añadieron dependencias ni campos al guardado principal. Los ajustes del mando usan la clave independiente:

```text
incremental-game-a:gamepad:v1
```

## Controles

### DualSense / PlayStation

- `X`: activar el control enfocado; si no hay uno, pulsar el núcleo.
- `R2` mantenido: pulsación continua configurable entre 2 y 12 clics/s.
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

## Arquitectura

- `src/gamepad.ts`: ajustes, persistencia, detección de familia y mapeo estándar.
- `src/GamepadController.tsx`: sondeo, flancos de botones, navegación espacial, acciones y vibración de interacción.
- `src/GamepadEventHaptics.tsx`: patrones opcionales para eventos del juego.
- `src/GamepadController.css`: panel, estados de conexión, controles y accesibilidad.
- `src/main.tsx`: monta las capas de mando como componentes hermanos de `App`.

El lector acciona los mismos botones del DOM que usa el mouse. No replica fórmulas ni modifica directamente el reducer; por ello las compras, clics y cristalización continúan pasando por la lógica existente.

## Rendimiento y seguridad

- Sondeo mediante `requestAnimationFrame`.
- No actualiza React en cada cuadro; solo ante conexión, desconexión o cambios de ajustes.
- Las acciones se pausan cuando la pestaña está oculta.
- Las pulsaciones discretas se detectan por transición presionado/no presionado.
- La navegación tiene repetición limitada a 190 ms.
- El mando principal es el primer gamepad conectado.
- La ausencia de vibración no afecta ninguna acción.
- Configuración saneada al cargar: intensidad 0–100%, R2 2–12 clics/s y zona muerta 25–90%.

## Vibración

Se intenta primero `vibrationActuator.playEffect('dual-rumble', ...)` y después el respaldo `pulse(...)`. La disponibilidad depende del navegador, sistema operativo, conexión y control.

Patrones actuales:

- Navegación: pulso muy ligero.
- Pulsación normal: pulso corto.
- Comprar todo: golpe medio.
- Cavitación: golpe único medio.
- Sobrecarga: golpe fuerte y réplica.
- Descarga prismática: dos golpes crecientes.
- Ascenso del zafiro: secuencia ascendente de tres pasos.

Los patrones contextuales observan la aparición de los mensajes visuales que el juego ya genera. No agregan campos ni eventos al estado principal.

Esta rama no usa todavía WebHID ni reportes propietarios del DualSense. Por tanto, no controla gatillos adaptativos, barra de luz, altavoz, giroscopio ni hápticos avanzados específicos de PlayStation. Añadirlos requiere una fase separada y pruebas físicas por USB/Bluetooth; no se implementan a ciegas porque los reportes son específicos del dispositivo y no forman parte del mapeo estándar.

## Prueba local recomendada

1. Cambiar a `Dev-Gamepad-Test` y hacer Pull.
2. Ejecutar:

```powershell
npm run lint
npm run build
npm run dev
```

3. Abrir el juego en Chrome o Edge.
4. Conectar el DualSense por Bluetooth o USB.
5. Pulsar cualquier botón para que el navegador lo exponga.
6. Confirmar que el indicador cambia a `Control conectado`.
7. Probar X, R2, Cuadrado, Triángulo, L1/R1, cruceta/stick y Options.
8. Abrir el panel con Options y ajustar interruptores/deslizadores solo con el mando.
9. Activar Cavitación, Sobrecarga, PRISMA y cristalización para probar los patrones hápticos.
10. Probar desconexión y reconexión.
11. Comprobar que mouse, teclado, guardado y las mecánicas siguen funcionando igual.

## Validación realizada

- Rama creada exactamente desde el `main` aprobado.
- Utilidades de Gamepad/DOM comprobadas con TypeScript estricto y bibliotecas ES2023 + DOM.
- Sin dependencias nuevas.
- Guardado del mando separado de la partida.
- El diff no modifica `game.ts`, fórmulas, costos ni el reducer.

## Validación pendiente

La implementación necesita prueba física con el DualSense del equipo de Arturo. En la integración remota no se ejecutaron `npm run lint`, `npm run build` ni `npm run dev` con las dependencias reales de su PC, porque el entorno remoto no dispone del checkout privado ni de los tipos React del proyecto.
