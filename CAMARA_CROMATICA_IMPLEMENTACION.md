# Cámara Cromática — primera implementación

## Rama

`Dev-Camara-Cromatica`, creada desde el `main` estable en el commit:

```text
50d4df0d493cb4f7cf22cf6e53c33bb977278555
```

`main` no contiene todavía esta expansión.

## Alcance de esta primera etapa

La implementación introduce una vista completa de metaprogresión sin modificar todavía las fórmulas ni añadir niveles para Esmeralda, Amarilla, Naranja o Roja.

### Acceso normal

- El botón `Cámara Cromática` está visible desde el inicio.
- Antes de Zafiro nivel 5 permanece deshabilitado y muestra `Zafiro X/5`.
- Al alcanzar prestigio/Zafiro 5 se activa y anuncia `Primera órbita disponible`.
- La Cámara también puede abrirse con `L1 + R1` o `LB + RB` cuando está desbloqueada.
- El desbloqueo se deriva de `game.prestigeCount`; no añade un segundo contador ni altera el guardado.

### Acceso de desarrollador

- El panel de desarrollador incorpora el botón `Cámara Cromática`.
- Este botón abre una vista de inspección incluso con Zafiro P0–P4.
- La vista se identifica con la etiqueta `Vista DEV · Estado real`.
- No concede P5, no activa gemas, no cambia el prestigio y no escribe datos nuevos.
- La escena refleja el estado auténtico:
  - P0–P4: cero órbitas completas, Nexo inerte, faceta azul apagada y Zafiro sin orbitar.
  - P5 o superior: primera órbita completa, faceta azul activa y Zafiro en movimiento.
- Si la partida se reinicia durante una inspección DEV, la Cámara permanece abierta y actualiza el estado mostrado a P0.
- Al cerrar, el foco regresa al control desde el que se abrió la escena.

### Escena

- Vista de pantalla completa sobre el reactor.
- El reactor permanece montado debajo, por lo que continúa su producción, temporizadores y guardado.
- La interfaz inferior queda invisible y sin interacción mientras la Cámara está abierta.
- El Nexo Prismático aparece grande, gris e incompleto.
- El primer sector azul solamente se ilumina cuando el Zafiro completa nivel 5.
- El Zafiro solamente orbita cuando completa nivel 5.
- Se muestran cinco frecuencias:
  - Zafiro: progreso real entre nivel 0 y 5.
  - Esmeralda: próxima gema después de completar Zafiro.
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

- `L1 + R1` / `LB + RB`: abrir la Cámara cuando esté desbloqueada.
- `L1/R1`, `LB/RB` o cruceta izquierda/derecha: recorrer gemas.
- Cruceta arriba: enfocar regresar.
- Cruceta abajo: volver a la gema seleccionada.
- `X/A`: activar el control enfocado, incluido el acceso del panel DEV.
- `Círculo/B`: volver al reactor.

El puente cromático trabaja sobre la Gamepad API existente y no modifica el reducer.

## Arquitectura

- `src/chromatic.ts`: nombres, requisitos y eventos de apertura normal/DEV y cierre.
- `src/ChromaticChamberSystem.tsx`: lectura de prestigio, botón de acceso, modo DEV, escena e inspector.
- `src/ChromaticChamberSystem.css`: Nexo, facetas, órbitas, gemas y diseño responsivo.
- `src/ChromaticDeveloperPreview.css`: etiqueta DEV y apariencia inerte previa a P5.
- `src/ChromaticChamberGuard.css`: aísla visualmente el reactor durante la escena.
- `src/DeveloperPanel.tsx`: botón de inspección cromática.
- `src/DeveloperChromaticAccess.css`: diseño del acceso dentro del panel.
- `src/ChromaticGamepadBridge.tsx`: combinación de entrada y navegación orbital.
- `src/main.tsx`: monta las capas cromáticas y carga los estilos adicionales.

La Cámara lee el prestigio desde `incremental-game-a:save:v1`. No añade claves de almacenamiento ni campos nuevos.

## Protecciones

- Una solicitud normal de apertura se rechaza si el Zafiro es menor a 5.
- La solicitud DEV solo omite la puerta visual; nunca modifica el estado del juego.
- Si la partida se reinicia dentro de una apertura normal, la escena se cierra automáticamente.
- Si se reinicia dentro de una inspección DEV, la escena se mantiene para mostrar el estado real posterior al reinicio.
- Cambiar de vista no pausa la producción ni reinicia temporizadores.
- La escena no intercepta el guardado principal.
- Las otras cuatro gemas son solamente representación y anticipación; no conceden bonificaciones ni aceptan compras.
- Se respeta `prefers-reduced-motion`.
- La distribución se adapta a escritorio, tableta y móvil.

## Validación realizada

- `main` y `Dev-Pulse-Trigger-Level` quedaron idénticas antes de crear esta rama.
- La nueva rama parte exactamente del commit estable aprobado.
- Se comprobó lógicamente:
  - P4 mantiene bloqueado el acceso normal;
  - el acceso DEV abre en P0–P4;
  - P5 activa el acceso normal;
  - prestigios superiores continúan mostrando Zafiro 5/5;
  - una apertura mediante control se rechaza estando bloqueada;
  - P0–P4 no muestran faceta azul ni Zafiro orbital;
  - P5 muestra una órbita completa y el primer sector enlazado;
  - reiniciar por debajo de P5 cierra la escena normal;
  - reiniciar en modo DEV conserva la escena y actualiza el estado;
  - no se escribe ningún dato nuevo en la partida;
  - el recorrido orbital envuelve de Roja a Zafiro y viceversa.

## Validación local pendiente

```powershell
npm run lint
npm run build
npm run dev
```

Prueba visual recomendada:

1. Con Zafiro P0, abrir desde el panel DEV.
2. Confirmar `0 / 5`, Nexo inerte, faceta azul apagada y Zafiro sin orbitar.
3. Probar P1–P4 y confirmar el progreso real del Zafiro.
4. Cerrar y confirmar que el foco regrese al botón DEV.
5. Alcanzar P5 y confirmar que el acceso normal se active.
6. Entrar por mouse y por `L1 + R1`.
7. Revisar el Nexo con el sector azul encendido.
8. Confirmar la órbita continua del Zafiro.
9. Recorrer las cinco gemas con mouse, L1/R1 y cruceta.
10. Dejar la Cámara abierta varios segundos y confirmar que la energía del reactor siguió creciendo.
11. Reiniciar dentro de la vista DEV y confirmar que cambie inmediatamente a P0 sin cerrarse.
12. Probar escritorio y una ventana estrecha.
