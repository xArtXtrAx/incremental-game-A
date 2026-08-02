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

## X dedicado al núcleo

- X siempre pulsa la esfera sin depender del control que tenga el foco.
- X no activa compras, pestañas, estrategias ni controles del panel.
- Mientras L2 está presionado, X no pulsa la esfera y queda reservado para combinaciones presentes o futuras.
- X tampoco pulsa el núcleo por detrás de la Cámara Cromática.

## Cuadrado como selector general

- Cuadrado activa el elemento que tenga el foco.
- Permite comprar una mejora individual, seleccionar pestañas o estrategias y activar botones, radios y casillas.
- Si no existe un foco compatible, Cuadrado no ejecuta ninguna acción.
- Cuadrado no usa la esfera como acción alternativa; esa función queda reservada para X.
- L2 + Cuadrado conserva prioridad y ejecuta `Comprar todo lo posible`.

## L2 como modificador

- Mantener L2 + Triángulo recorre `Equilibrado`, `Juego activo` y `Automático`.
- Mantener L2 + Cuadrado ejecuta `Comprar todo lo posible`.
- L2 por sí solo no ejecuta ninguna acción.
- Las combinaciones se disparan una sola vez por pulsación del botón acompañante.
- Triángulo sin L2 conserva el atajo anterior de compra global.
- Las combinaciones quedan suspendidas mientras la Cámara Cromática está abierta.

## Compatibilidad

- DualSense / PlayStation: X, Cuadrado, L2 y Triángulo.
- Xbox: A, X, LT y Y.
- R2/RT continúa reservado para el Gatillo de pulso.
- No se modifican economía, compras, guardado ni progresión.

## Validación

- `GamepadController.tsx` y `gamepad.ts` pasaron una comprobación TypeScript aislada con DOM, `strictNullChecks`, `noUnusedLocals` y `noUnusedParameters`.
- El repositorio no tiene CI configurado; `npm run lint`, `npm run build` y la prueba física con DualSense quedan pendientes en el entorno local.
