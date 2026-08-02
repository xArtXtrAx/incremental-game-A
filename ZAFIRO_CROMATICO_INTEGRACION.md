# Integración del Zafiro principal en la Cámara Cromática

## Rama

`Dev-Camara-Cromatica`

## Cambio visual

La figura simplificada del Zafiro dentro de la Cámara fue reemplazada por el componente real `SapphireGem` usado en la ventana principal.

La instancia cromática conserva:

- geometría WebGL facetada;
- giro vertical sobre su propio eje;
- flotación suave;
- pulso luminoso;
- halo;
- anillo orbital interno;
- chispa blanca/cian;
- estela de partículas;
- respaldo SVG y órbita CSS si WebGL no está disponible.

El Zafiro solamente se monta en la Cámara cuando `prestigeCount >= 5`. En la inspección DEV de P0–P4, el Nexo permanece inerte y no aparece ningún Zafiro ni reflejo.

## Órbita alrededor del Nexo

`ChromaticSapphireOrbit.tsx` añade una segunda escala de movimiento alrededor del Nexo Prismático:

- duración: 15 segundos por vuelta;
- trayectoria elíptica;
- cambio de tamaño según profundidad;
- opacidad ligeramente menor al pasar por detrás;
- orden de capas dinámico:
  - detrás del Nexo cuando la profundidad es negativa;
  - delante del Nexo cuando la profundidad es positiva.

El giro propio, la partícula y la estela pertenecen al componente original y continúan activos durante la órbita grande.

## Iluminación del Nexo

La posición orbital se convierte cada cuadro en variables CSS:

- `--chromatic-sapphire-light-x`;
- `--chromatic-sapphire-light-y`;
- `--chromatic-sapphire-light-strength`;
- `--chromatic-sapphire-frontness`;
- `--chromatic-sapphire-light-angle`.

Estas variables alimentan `nexus-sapphire-reflection`, una capa recortada por la geometría del Nexo que produce:

- punto especular móvil;
- reflejo azul/cian sobre las caras;
- haces diagonales muy tenues;
- halo interior;
- mayor intensidad cuando el Zafiro pasa por delante;
- menor intensidad cuando pasa por detrás.

La reflexión no reemplaza el estado gris del Nexo: solamente lo ilumina de forma localizada. La faceta azul permanente continúa siendo la única frecuencia despierta.

## Archivos

- `src/ChromaticSapphireOrbit.tsx`: movimiento orbital grande y variables de iluminación.
- `src/ChromaticSapphireOrbit.css`: escala del Zafiro, halo externo y reflejo sobre el Nexo.
- `src/ChromaticChamberSystem.tsx`: monta el Zafiro real y la capa de reflexión.
- `src/SapphireGem.tsx`: componente original reutilizado sin duplicación.

## Movimiento reducido

Con `prefers-reduced-motion: reduce`:

- la órbita grande queda detenida en una posición diagonal legible;
- el reflejo queda fijo en la posición correspondiente;
- el componente original aplica sus propias reducciones de animación.

## Prueba visual recomendada

1. Establecer `Cristalizaciones = 5` desde el panel DEV.
2. Abrir la Cámara Cromática.
3. Confirmar que el Zafiro tiene la misma geometría que el de la ventana principal.
4. Observar el giro vertical del cristal durante la vuelta grande.
5. Confirmar la chispa y estela alrededor del propio Zafiro.
6. Verificar que el Zafiro pase visualmente por detrás y delante del Nexo.
7. Observar que el brillo azul recorra las caras del Nexo siguiendo la órbita.
8. Confirmar que el Nexo siga siendo mayormente gris.
9. Cambiar a P4 y abrir por el acceso DEV: no debe aparecer Zafiro ni reflejo.
10. Probar una ventana estrecha y movimiento reducido.

## Validación pendiente en el equipo local

```powershell
npm run lint
npm run build
npm run dev
```
