# Corrección de interpolación de barras

La primera versión de suavizado mantenía un `style={{ transform: ... }}` controlado por React en el elemento de relleno. Cada render volvía a escribir inmediatamente el valor objetivo y anulaba las posiciones intermedias.

Una segunda versión intentó mantener un reloj manual con `requestAnimationFrame`, pero en la ejecución real podía dejar el relleno congelado aunque la pista y la etiqueta siguieran actualizándose.

La solución vigente usa la Web Animations API del navegador:

- Cada actualización comienza desde la posición visual exacta que tiene la barra en ese instante.
- La duración es ligeramente mayor que el intervalo observado entre actualizaciones, de modo que el siguiente trayecto enlaza antes de que aparezca una pausa.
- Si llega un valor nuevo mientras la barra todavía se mueve, la animación anterior se cancela visualmente y la nueva continúa desde ese punto, sin regresar al último valor guardado.
- Las barras normales pueden avanzar o retroceder cuando el recurso realmente cambia.
- Autoclicker, Cavitación, carga de Sobrecarga y Refracción se consideran ciclos. Cuando reciben un valor menor, recorren `posición actual → 100% → 0% → nuevo valor`, en lugar de retroceder hacia la izquierda.
- El salto de 100% a 0% ocupa una fracción casi instantánea de la línea temporal y el resto del recorrido conserva velocidad lineal.

El relleno mantiene un valor inicial visible en `transform`, y la animación nativa es la única autoridad durante cada transición. No se utiliza una transición CSS adicional ni un bucle permanente de JavaScript.
