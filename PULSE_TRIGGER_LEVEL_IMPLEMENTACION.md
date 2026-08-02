# Gatillo de pulso escalable

## Estado

El sistema escalable ya forma parte de `main`. La rama `Dev-Pulse-Trigger-Mouse` prueba una mejora de control: trasladar la descarga del mouse al botón derecho para dejar el botón izquierdo libre sobre el núcleo.

## Posición

La tarjeta del Gatillo se ordena inmediatamente debajo de la esfera y antes del estado del núcleo. Esto reduce el recorrido visual entre los clics directos y la información de la descarga.

## Escalado

La carga y la reserva no cambian:

- 10 clics directos generan 1 segundo de reserva.
- Reserva máxima: 10 segundos.
- Los clics del Gatillo y del Autoclicker no recargan la reserva.

Solo escala la cadencia:

```text
pulsos/s = min(9, 6 + 0.5 × nivel)
```

| Nivel | Pulsos/s | Costo del siguiente nivel |
|---:|---:|---:|
| 0 | 6.0 | 6,000 |
| 1 | 6.5 | 13,500 |
| 2 | 7.0 | 30,375 |
| 3 | 7.5 | 68,344 |
| 4 | 8.0 | 153,774 |
| 5 | 8.5 | 345,991 |
| 6 | 9.0 | Nivel máximo |

La curva de costo es:

```text
costo = ceil(6000 × 2.25^nivel)
```

## Estado y guardado

- `pulseTriggerLevel` forma parte de `GameState`.
- Partidas anteriores reciben nivel 0 mediante saneamiento.
- Valores alterados se limitan al máximo de nivel 6.
- Cristalizar y reiniciar devuelven el nivel a 0.
- La reserva temporal continúa guardándose en su clave independiente y también se reinicia al cristalizar.

## Interfaz

La tarjeta muestra:

- nivel actual;
- pulsos por segundo actuales;
- reserva disponible;
- progreso hacia el siguiente segundo;
- cadencia actual y siguiente;
- costo de la mejora;
- estado de nivel máximo.

La compra usa un evento de interfaz que termina en la acción `buy-pulse-trigger` del reducer. La energía nunca se modifica directamente desde el componente visual.

## Control con mouse

En `Dev-Pulse-Trigger-Mouse`:

- Mantener el botón derecho dentro de `.game-panel` activa el Gatillo.
- Soltar el botón derecho detiene la descarga.
- El menú contextual se bloquea únicamente dentro del panel jugable mientras el botón derecho está asignado al Gatillo.
- El Panel DEV y los campos editables conservan el clic derecho normal.
- El botón izquierdo queda completamente libre para pulsar la esfera mientras el Gatillo descarga.
- Se usan eventos `mousedown` y `mouseup`, porque reconocen cada botón del mouse de forma independiente y permiten mantener derecho mientras se pulsa repetidamente con izquierdo.
- El clic izquierdo sobre el botón visual ya no activa el Gatillo.
- Toque y stylus continúan pudiendo mantener pulsado el botón visual.
- Espacio/Enter y R2/RT conservan el comportamiento existente.
- Al perder foco, ocultar la pestaña, agotar la reserva o reiniciar, todas las fuentes se detienen de forma segura.

## Comprar todo

El Acelerador de pulso participa en las tres estrategias:

- Juego activo: prioridad alta.
- Equilibrado: prioridad moderada.
- Automático: prioridad muy baja.

Su utilidad se calcula como pulsos adicionales obtenidos por los clics manuales estimados. No se trata como producción gratuita ni aumenta el valor del Autoclicker.

## Prueba recomendada

1. Cambiar a `Dev-Pulse-Trigger-Mouse` y hacer Pull.
2. Ejecutar `npm run lint`, `npm run build` y `npm run dev`.
3. Cargar al menos un segundo de reserva.
4. Mantener clic derecho sobre el núcleo o cualquier zona del panel principal.
5. Confirmar que el menú contextual no aparezca y que comience la descarga.
6. Sin soltar el derecho, pulsar repetidamente la esfera con el izquierdo.
7. Confirmar que los clics izquierdos produzcan energía y carguen la siguiente reserva.
8. Confirmar que los pulsos automáticos del Gatillo no recarguen su propia reserva.
9. Soltar solamente el derecho y confirmar que la descarga se detenga inmediatamente.
10. Hacer clic izquierdo sobre el botón visual y confirmar que no active el Gatillo.
11. Probar Espacio/Enter sobre el botón y R2/RT con control.
12. Hacer clic derecho dentro de un campo del Panel DEV y confirmar que el menú contextual siga disponible.
13. Agotar la reserva manteniendo derecho y confirmar que sea necesario soltar y volver a presionar para reactivar.
14. Cambiar de pestaña o perder foco y confirmar que el Gatillo se detenga.

## Validación remota

- No se añadieron dependencias.
- La curva y los topes se expresan mediante funciones puras.
- El reducer es la única capa que compra niveles y descuenta energía.
- El planificador deja de considerar el Gatillo al alcanzar nivel 6.
- No se modificaron las fórmulas de energía por clic, generadores, Cavitación, Sobrecarga ni Refracción.
- El componente modificado pasó una comprobación TypeScript aislada con `strictNullChecks`, `noUnusedLocals` y `noUnusedParameters`.

La ejecución de `npm run lint`, `npm run build` y la prueba física con mouse quedan pendientes en el checkout local con las dependencias reales del proyecto.
