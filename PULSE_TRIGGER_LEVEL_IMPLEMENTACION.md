# Gatillo de pulso escalable — Dev-Pulse-Trigger-Level

## Estado

Implementación experimental creada desde el `main` aprobado. `main` permanece intacta hasta la validación visual y de balance.

## Posición

La tarjeta del Gatillo se ordena inmediatamente debajo de la esfera y antes del estado del núcleo. Esto reduce el recorrido del mouse entre los clics directos y la descarga mantenida.

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

## Comprar todo

El Acelerador de pulso participa en las tres estrategias:

- Juego activo: prioridad alta.
- Equilibrado: prioridad moderada.
- Automático: prioridad muy baja.

Su utilidad se calcula como pulsos adicionales obtenidos por los clics manuales estimados. No se trata como producción gratuita ni aumenta el valor del Autoclicker.

## Prueba recomendada

1. Cambiar a `Dev-Pulse-Trigger-Level` y hacer Pull.
2. Ejecutar `npm run lint`, `npm run build` y `npm run dev`.
3. Confirmar que la tarjeta aparece inmediatamente debajo de la esfera.
4. Con 6,000 de energía, comprar nivel 1 y comprobar `6.0 → 6.5 pulsos/s`.
5. Cargar 2 segundos de reserva y verificar aproximadamente 13 pulsos a nivel 1.
6. Repetir compras hasta nivel 6 y confirmar el tope de 9.0 pulsos/s.
7. Confirmar que no se puede comprar nivel 7.
8. Probar la descarga con mouse y R2/RT.
9. Confirmar que Gatillo y Autoclicker no recargan la reserva.
10. Comparar las vistas previas de Comprar todo en los tres perfiles.
11. Recargar la página y comprobar que el nivel se conserva.
12. Cristalizar y confirmar que nivel y reserva regresan a cero.

## Validación remota

- No se añadieron dependencias.
- La curva y los topes se expresan mediante funciones puras.
- El reducer es la única capa que compra niveles y descuenta energía.
- El planificador deja de considerar el Gatillo al alcanzar nivel 6.
- No se modificaron las fórmulas de energía por clic, generadores, Cavitación, Sobrecarga ni Refracción.

La ejecución de `npm run lint`, `npm run build` y la prueba visual física quedan pendientes en el checkout local con las dependencias reales del proyecto.
