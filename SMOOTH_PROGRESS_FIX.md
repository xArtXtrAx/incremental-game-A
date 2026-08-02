# Corrección de interpolación de barras

La primera versión de suavizado mantenía un `style={{ transform: ... }}` controlado por React en el elemento de relleno. Cada render volvía a escribir inmediatamente el valor objetivo y anulaba las posiciones intermedias calculadas por `requestAnimationFrame`.

La solución definitiva deja al reloj visual como única autoridad sobre `transform` y separa tres comportamientos:

- Las barras normales interpolan linealmente entre actualizaciones con una duración ligeramente mayor que el intervalo observado. La siguiente actualización comienza antes de que termine la anterior, evitando pausas o pequeños tirones.
- Autoclicker y Refracción avanzan continuamente mediante su velocidad real, independientemente de la frecuencia con la que se guarde el estado.
- Sobrecarga y PRISMA usan directamente la hora absoluta de finalización para producir un descenso continuo.

Los procesos cíclicos nunca retroceden al recibir un valor menor. Autoclicker y Refracción cruzan naturalmente `100% → 0%`; Cavitación y carga de Sobrecarga completan primero el tramo restante, permanecen brevemente en 100%, reinician en cero y continúan hasta el nuevo valor.

La transición CSS anterior fue retirada para evitar una segunda interpolación encima del reloj visual. La preferencia de movimiento reducido solo desactiva adornos pulsantes; no elimina el movimiento funcional de la barra.
