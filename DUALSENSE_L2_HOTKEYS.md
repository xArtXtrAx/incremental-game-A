# Navegación con DualSense y capa L2

## Rama

`Dev-DualSense-L2-Hotkeys`, creada desde el `main` estable.

## Navegación y cambio de sección

- L1 cambia inmediatamente a la sección del Núcleo.
- R1 cambia inmediatamente a la sección de Evoluciones.
- La cruceta ya no cambia de sección directamente.
- Las cuatro direcciones de la cruceta recorren los controles enfocables del juego.
- El stick conserva navegación en las cuatro direcciones y ajuste de controles deslizantes.
- La navegación direccional mantiene el intervalo controlado de repetición para evitar desplazamientos accidentales demasiado rápidos.

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

- DualSense / PlayStation: X, Cuadrado, L1, R1, L2 y Triángulo.
- Xbox: A, X, LB, RB, LT y Y.
- R2/RT continúa reservado para el Gatillo de pulso.
- No se modifican economía, compras, guardado ni progresión.

## Validación

- El cambio de la cruceta se limita al enrutamiento de navegación en `GamepadController.tsx`.
- El repositorio no tiene CI configurado; `npm run lint`, `npm run build` y la prueba física con DualSense quedan pendientes en el entorno local.
