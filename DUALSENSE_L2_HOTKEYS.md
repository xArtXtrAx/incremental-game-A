# Navegación inmediata y capa L2

## Rama

`Dev-DualSense-L2-Hotkeys`, creada desde el `main` estable.

## Cruceta horizontal

- Cruceta izquierda cambia inmediatamente a la sección del Núcleo.
- Cruceta derecha cambia inmediatamente a la sección de Evoluciones.
- Estas acciones usan detección `justPressed`, por lo que no dependen del intervalo de repetición de 190 ms.
- L1/R1 conservan el mismo comportamiento inmediato.
- La cruceta arriba/abajo mantiene la navegación direccional repetible.
- El stick conserva navegación en las cuatro direcciones y ajuste de controles deslizantes.

## L2 como modificador

- Mantener L2 + Triángulo recorre `Equilibrado`, `Juego activo` y `Automático`.
- Mantener L2 + Cuadrado ejecuta `Comprar todo lo posible`.
- L2 por sí solo no ejecuta ninguna acción.
- Las combinaciones se disparan una sola vez por pulsación del botón acompañante.
- Los atajos anteriores sin L2 se conservan por compatibilidad.
- Las combinaciones quedan suspendidas mientras la Cámara Cromática está abierta.

## Compatibilidad

- DualSense / PlayStation: L2, Triángulo y Cuadrado.
- Xbox: LT, Y y X.
- R2/RT continúa reservado para el Gatillo de pulso.
- No se modifican economía, compras, guardado ni progresión.

## Validación

- `GamepadController.tsx` y `gamepad.ts` pasaron una comprobación TypeScript aislada con DOM, `strictNullChecks`, `noUnusedLocals` y `noUnusedParameters`.
- El repositorio no tiene CI configurado; `npm run lint`, `npm run build` y la prueba física con DualSense quedan pendientes en el entorno local.
