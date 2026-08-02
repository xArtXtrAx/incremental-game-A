# Cámara Cromática — primera implementación

## Rama

`Dev-Camara-Cromatica`, creada desde el `main` estable en el commit:

```text
50d4df0d493cb4f7cf22cf6e53c33bb977278555
```

`main` no contiene todavía esta expansión.

## Alcance de esta primera etapa

La implementación introduce una vista completa de metaprogresión sin modificar todavía las fórmulas ni añadir niveles para Esmeralda, Amarilla, Naranja o Roja.

### Acceso

- El botón `Cámara Cromática` está visible desde el inicio.
- Antes de Zafiro nivel 5 permanece deshabilitado y muestra `Zafiro X/5`.
- Al alcanzar prestigio/Zafiro 5 se activa y anuncia `Primera órbita disponible`.
- La Cámara también puede abrirse con `L1 + R1` o `LB + RB` cuando está desbloqueada.
- El desbloqueo se deriva de `game.prestigeCount`; no añade un segundo contador ni altera el guardado.

### Escena

- Vista de pantalla completa sobre el reactor.
- El reactor permanece montado debajo, por lo que continúa su producción, temporizadores y guardado.
- La interfaz inferior queda invisible y sin interacción mientras la Cámara está abierta.
- El Nexo Prismático aparece grande, gris e incompleto.
- El primer sector azul está iluminado porque el Zafiro completó nivel 5.
- El Zafiro se mueve alrededor del Nexo en una órbita continua.
- Se muestran cinco frecuencias:
  - Zafiro: nivel 5, órbita completa.
  - Esmeralda: próxima gema; mecánica pendiente.
  - Amarilla: bloqueada.
  - Naranja: bloqueada.
  - Roja: bloqueada.
- Un inspector lateral muestra nombre, nivel, estado y descripción de la frecuencia seleccionada.

### Navegación

Mouse y teclado:

- Clic en una gema para inspeccionarla.
- Botón `Volver al reactor` o tecla `Escape` para cerrar.
- El foco inicial se coloca en el botón de regreso.

Control:

- `L1 + R1` / `LB + RB`: abrir la Cámara.
- `L1/R1`, `LB/RB` o cruceta izquierda/derecha: recorrer gemas.
- Cruceta arriba: enfocar regresar.
- Cruceta abajo: volver a la gema seleccionada.
- `X/A`: activar el control enfocado.
- `Círculo/B`: volver al reactor.

El puente cromático trabaja sobre la Gamepad API existente y no modifica el reducer.

## Arquitectura

- `src/chromatic.ts`: nombres, requisitos y eventos de apertura/cierre.
- `src/ChromaticChamberSystem.tsx`: lectura de prestigio, botón de acceso, escena e inspector.
- `src/ChromaticChamberSystem.css`: Nexo, facetas, órbitas, gemas y diseño responsivo.
- `src/ChromaticChamberGuard.css`: aísla visualmente el reactor durante la escena.
- `src/ChromaticGamepadBridge.tsx`: combinación de entrada y navegación orbital.
- `src/main.tsx`: monta las capas cromáticas como hermanas de `App`.

La Cámara lee el prestigio desde `incremental-game-a:save:v1`. No añade claves de almacenamiento ni campos nuevos.

## Protecciones

- Una solicitud de apertura se rechaza si el Zafiro es menor a 5.
- Si la partida se reinicia mientras la Cámara está abierta, se cierra automáticamente.
- Cambiar de vista no pausa la producción ni reinicia temporizadores.
- La escena no intercepta el guardado principal.
- Las otras cuatro gemas son solamente representación y anticipación; no conceden bonificaciones ni aceptan compras.
- Se respeta `prefers-reduced-motion`.
- La distribución se adapta a escritorio, tableta y móvil.

## Validación realizada

- `main` y `Dev-Pulse-Trigger-Level` quedaron idénticas antes de crear esta rama.
- La nueva rama parte exactamente del commit estable aprobado.
- Comprobación TypeScript estricta aislada aprobada para:
  - `chromatic.ts`;
  - `ChromaticChamberSystem.tsx`;
  - `ChromaticGamepadBridge.tsx`.
- Se comprobó lógicamente:
  - P4 mantiene acceso bloqueado;
  - P5 activa el acceso;
  - prestigios superiores continúan mostrando Zafiro 5/5;
  - una apertura mediante control se rechaza estando bloqueada;
  - reiniciar por debajo de P5 cierra la escena;
  - no se escribe ningún dato nuevo en la partida;
  - el recorrido orbital envuelve de Roja a Zafiro y viceversa.

## Validación local pendiente

```powershell
npm run lint
npm run build
npm run dev
```

Prueba visual recomendada:

1. Confirmar que con Zafiro P0–P4 el botón esté visible pero bloqueado.
2. Alcanzar P5 y confirmar que el botón se active.
3. Entrar por mouse y por `L1 + R1`.
4. Revisar el Nexo gris con el sector azul encendido.
5. Confirmar la órbita continua del Zafiro.
6. Recorrer las cinco gemas con mouse, L1/R1 y cruceta.
7. Volver con Escape, botón y Círculo/B.
8. Dejar la Cámara abierta varios segundos y confirmar que la energía del reactor siguió creciendo.
9. Reiniciar la partida y confirmar que la Cámara se cierre y vuelva a bloquearse.
10. Probar escritorio y una ventana estrecha.
