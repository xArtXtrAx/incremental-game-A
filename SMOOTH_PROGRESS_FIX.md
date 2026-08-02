# Corrección de interpolación de barras

La primera versión de suavizado mantenía un `style={{ transform: ... }}` controlado por React en el elemento de relleno. Cada render volvía a escribir inmediatamente el valor objetivo y anulaba las posiciones intermedias calculadas por `requestAnimationFrame`.

La corrección elimina ese estilo controlado, inicializa el relleno mediante `useLayoutEffect` antes del pintado y deja al animador como única autoridad sobre `transform`.

Las barras discretas recorren cada cambio durante 920 ms con una curva suave. Autoclicker y Refracción conservan su reloj continuo; Sobrecarga y PRISMA continúan usando el tiempo absoluto de finalización. La preferencia de movimiento reducido solo afecta adornos visuales en CSS, no la interpolación funcional de la barra.
