# Selector cromático DEV

## Rama

`Dev-Chromatic-Theme-Preview`, creada desde `Dev-Pulse-Trigger-Mouse`.

`main` permanece intacta.

## Objetivo

Permitir comparar desde ahora las cinco identidades cromáticas de la interfaz sin implementar todavía la progresión, las mecánicas ni el guardado de Esmeralda, Amarilla, Naranja o Roja.

## Selector

El Panel de desarrollador incorpora una sección compacta denominada `Selector cromático` con cinco vistas:

- Zafiro;
- Esmeralda;
- Amarilla;
- Naranja;
- Roja.

La selección:

- solo responde al mouse;
- cambia inmediatamente la ventana principal y el fondo ambiental;
- conserva transparencias, sombras, neón y estructura visual existentes;
- no modifica `prestigeCount`;
- no desbloquea gemas;
- no cambia la gema activa de la partida;
- no añade campos al guardado;
- no usa `localStorage`;
- vuelve a Zafiro al recargar o desmontar la aplicación.

## Implementación visual

Esta primera etapa es un laboratorio, no el sistema cromático definitivo.

La ventana principal y el panel del mando usan una transformación cromática GPU por tema:

- rotación de matiz;
- saturación;
- brillo.

El fondo ambiental usa colores RGB propios para cada vista. El Panel DEV permanece azul y neutro para conservar una referencia estable y legible durante las comparaciones.

Cuando una paleta quede aprobada, sus colores podrán migrarse gradualmente a variables CSS semánticas y uniforms WebGL sin esperar a que estén definidas las mecánicas de la gema.

## Protección de entrada

El Panel DEV queda reservado para mouse:

- un foco que no proviene de un clic izquierdo reciente se rechaza;
- los clics sintéticos con `detail === 0`, incluidos los generados por X/A mediante `button.click()`, se bloquean en captura;
- los botones de tema usan `pointerup` y exigen `pointerType === 'mouse'` y botón izquierdo;
- se añade `data-gamepad-ignore="true"` como marca explícita para futuras capas de navegación.

Esto impide cambiar temas, valores o abrir la Cámara desde el joystick, incluso si un control del panel había quedado enfocado previamente con el mouse.

## Archivos

- `src/chromaticThemePreview.ts`: definiciones, evento y aplicación temporal del tema.
- `src/DeveloperChromaticThemePreview.css`: paletas simuladas, fondo y diseño del selector.
- `src/DeveloperPanel.tsx`: interfaz, estado de sesión y protección mouse-only.

## Prueba recomendada

1. Abrir `Dev-Chromatic-Theme-Preview`.
2. Ejecutar `npm run lint`, `npm run build` y `npm run dev`.
3. Elegir cada muestra con clic izquierdo.
4. Confirmar que cambia la ventana principal y no el Panel DEV.
5. Comparar el núcleo, líquido, partículas, tarjetas, Gatillo y bordes de región.
6. Confirmar que la Cámara Cromática no cambia su identidad arcoíris.
7. Recargar y comprobar que vuelve a Zafiro.
8. Seleccionar un control DEV con mouse, tomar el DualSense y pulsar X/A; el control DEV no debe activarse.
9. Intentar navegar hacia el Panel DEV con stick o cruceta; cualquier foco recibido debe rechazarse.
10. Confirmar que L1/R1, R2, clic derecho, Comprar todo y demás controles siguen funcionando.

## Límite conocido

La transformación cromática también recolorea temporalmente estados que en el sistema definitivo deberán conservar significado propio, como peligro, confirmación o advertencia. Esto es aceptable para comparar la identidad global; la versión de producción separará colores cromáticos de colores semánticos.
