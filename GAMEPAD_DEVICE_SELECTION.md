# Selección robusta del mando activo

> **Regla crítica y transversal para este proyecto y para futuros videojuegos:** nunca asumir que el primer mando enumerado por el navegador es el mando que realmente está entregando las entradas.

## Estado

- Rama de implementación: `Dev-Performance-Audit`.
- Descubrimiento: 2 de agosto de 2026.
- Validación física del incidente original: **aprobada el 2 de agosto de 2026**.
- Severidad de diseño: **crítica**.
- Alcance del parche: selección del dispositivo de entrada; no modifica gameplay, balance, guardado ni mapa de controles.
- Resultado confirmado por Arturo: después de actualizar la rama y repetir las pruebas, el control volvió a funcionar correctamente bajo la condición que había revelado el fallo.

## Incidente que reveló el problema

Después de un cierre inesperado de Chrome, el juego volvió a mostrar el DualSense como conectado, pero ningún botón, gatillo o stick respondía.

La inspección directa de `navigator.getGamepads()` confirmó dos dispositivos enumerados:

1. `DualSense Wireless Controller`, conectado pero completamente neutral;
2. `Controller (XBOX 360 For Windows)`, dispositivo virtual que sí recibía las pulsaciones reales.

El juego utilizaba `getFirstConnectedGamepad()` y tomaba el primer objeto conectado. La enumeración cambió después del cierre inesperado y el juego quedó fijado al dispositivo neutral.

El bug apareció por suerte. En sesiones normales, el orden estable de los dispositivos había ocultado la suposición incorrecta. Sin el cierre inesperado, probablemente habría llegado a producción sin detectarse.

## Causa raíz

La presencia de un dispositivo no garantiza que ese objeto sea la fuente activa de entrada.

En Windows y otros sistemas pueden coexistir:

- un mando físico;
- uno o varios mandos virtuales;
- capas de compatibilidad XInput;
- controladores que ocultan o redirigen el dispositivo físico;
- dispositivos reconectados con índices diferentes;
- mandos conectados pero sin reportes de botones o ejes.

Por lo tanto, estas equivalencias son falsas:

```text
primer mando conectado = mando principal
mando con nombre conocido = mando que recibe entradas
índice más bajo = dispositivo correcto
```

## Regla obligatoria de diseño

Todo videojuego con Gamepad API debe:

1. enumerar todos los mandos conectados;
2. detectar actividad intencional en botones, gatillos o ejes;
3. adoptar como principal el mando que produzca actividad real;
4. conservar ese índice mientras el dispositivo siga conectado;
5. cambiar únicamente cuando otro mando activo reciba una entrada clara o el actual desaparezca;
6. no elegir por marca, nombre, tipo físico, índice ni orden de conexión;
7. tolerar simultáneamente dispositivos físicos y virtuales;
8. volver a validar la selección después de reinicios, cierres inesperados y reconexiones.

## Implementación actual

`src/gamepad.ts` conserva temporalmente el nombre histórico `getFirstConnectedGamepad()` para no romper los consumidores existentes, pero su comportamiento cambió:

- reúne todos los mandos conectados;
- conserva el índice activo previamente seleccionado;
- detecta botones mediante el mismo umbral del juego;
- considera actividad de ejes solamente a partir de `0.65` para evitar cambios por deriva leve;
- si el mando seleccionado está neutral y otro tiene actividad, cambia al activo;
- si no hay actividad, mantiene la selección estable;
- si no existe selección previa, usa el primer dispositivo únicamente como candidato provisional;
- al desconectarse todos los mandos, borra la selección.

El parche beneficia automáticamente a los consumidores actuales:

- `GamepadController`;
- `PulseTriggerSystem`;
- `ChromaticGamepadBridge`.

## Validación física realizada

Arturo actualizó `Dev-Performance-Audit`, ejecutó el juego y repitió las pruebas con la condición problemática presente: el DualSense físico seguía enumerado junto con el dispositivo virtual que recibía las entradas.

Resultado:

- el juego dejó de quedar fijado al dispositivo neutral;
- la entrada activa volvió a ser reconocida;
- el control volvió a operar dentro del juego;
- no fue necesario retirar el dispositivo virtual ni elegir manualmente un índice;
- la causa raíz y la estrategia de corrección quedaron confirmadas en hardware real.

Esta validación cierra el incidente original. La matriz amplia incluida abajo se conserva como prueba de regresión obligatoria para futuras refactorizaciones, sistemas multijugador y otros videojuegos.

## Consideración futura: entrada y hápticos

Un dispositivo virtual puede recibir los botones mientras el mando físico ofrece mejores capacidades hápticas. A largo plazo, el servicio unificado de mando debe considerar por separado:

- dispositivo activo de entrada;
- dispositivo disponible para vibración;
- familia visual usada para etiquetas;
- identidad lógica que se conserva durante reconexiones.

No se implementa esa separación en este parche para mantener el cambio pequeño y verificable.

## Matriz mínima de pruebas para todos los futuros juegos

Antes de considerar estable cualquier integración de mando, probar:

- un solo mando físico;
- mando conectado antes de abrir el navegador;
- mando conectado después de cargar el juego;
- desconexión y reconexión;
- reinicio normal del navegador;
- cierre inesperado y restauración de sesión;
- dos mandos físicos;
- mando físico junto con uno virtual;
- dispositivo neutral enumerado antes del activo;
- cambio voluntario entre dos mandos mediante actividad;
- gatillos analógicos;
- sticks con deriva leve;
- pestaña oculta y recuperación de foco;
- Cámara u overlays que tengan su propio consumidor de entrada;
- vibración después de cambiar el dispositivo activo.

## Criterio de validación de este parche

La corrección del incidente original quedó aprobada al confirmar que:

- el juego responde usando el objeto virtual activo aunque el DualSense neutral aparezca primero;
- la entrada del control vuelve a accionar el juego;
- el dispositivo neutral deja de bloquear al dispositivo que recibe las pulsaciones;
- no se altera ninguna fórmula ni estado de gameplay.

Para futuras modificaciones del sistema de entrada deberán repetirse además:

- X pulsa el núcleo;
- Cuadrado activa el foco;
- L1/R1 y la cruceta navegan;
- R2 activa el Gatillo;
- las combinaciones con L2 funcionan;
- la Cámara Cromática conserva sus controles;
- desconectar el dispositivo activo permite adoptar otro;
- lint y build siguen pasando.

## Lección reusable

La enumeración indica disponibilidad, no intención del usuario. La fuente principal de entrada debe inferirse por actividad real y conservarse de forma estable.

Esta regla debe tratarse como parte de la arquitectura base de controles, no como una corrección específica del DualSense.
