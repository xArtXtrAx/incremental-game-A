# HISTORIAL_GPT — Incremental Game A

> Bitácora compartida entre Arturo y GPT.  
> **Regla para nuevos chats:** leer este archivo y comprobar la rama activa antes de modificar el proyecto.

## 1. Estado del repositorio

- Repositorio: `xArtXtrAx/incremental-game-A`.
- Rama estable: `main`.
- Rama aprobada para integración: `Dev-Pulse-Trigger-Level`.
- Ramas históricas: `Dev-Prestigio-Test`, `Dev-Orbita-Zafiro-Test`, `Dev-Matriz-Refraccion-Test` y `Dev-Gamepad-Test`.
- Entorno: React + TypeScript + Vite + Motion.
- Guardado principal: `incremental-game-a:save:v1`.
- Ajustes de mando: `incremental-game-a:gamepad:v1`.
- Reserva del Gatillo: `incremental-game-a:pulse-trigger:v1`.
- Última actualización: **2 de agosto de 2026**.

Arturo aprobó visualmente y funcionalmente el soporte de mando, la vibración, el Gatillo de pulso, la guía neón de regiones y el Acelerador de pulso escalable. `Dev-Pulse-Trigger-Level` debe integrarse a `main` mediante fast-forward limpio antes de comenzar la progresión de gemas de la Cámara Cromática.

## 2. Forma de trabajo

- Trabajar de forma directa y evitar microcomprobaciones redundantes.
- Usar GitHub Desktop para el flujo local normal.
- Crear ramas para cambios visuales, estructurales o mecánicos importantes.
- Integrar a `main` solamente después de la validación de Arturo.
- Evitar ZIP, manifiestos y hashes salvo necesidad técnica o petición expresa.
- Agrupar pruebas y registrar aquí las decisiones relevantes.
- No afirmar que se ejecutó `npm run build`, `lint` o pruebas físicas cuando el entorno remoto no dispone del checkout y dependencias reales.

## 3. Interfaz estable

- Resumen superior compacto.
- Núcleo fijo a la izquierda en escritorio.
- Evoluciones en panel desplazable con pestañas Producción, Núcleo y Avanzadas.
- Tarjetas expandibles.
- Navegación móvil entre Núcleo y Evoluciones.
- Panel de desarrollador a la derecha en pantallas amplias y debajo en pantallas estrechas.
- Selección de texto deshabilitada globalmente salvo en campos editables.
- Flecha normal sobre textos, mano sobre controles y cursor de texto solo en campos editables.
- Un listener global de `selectstart` evita selecciones iniciadas desde el fondo exterior.
- Guía visual por regiones:
  - L1 ilumina Núcleo.
  - R1 ilumina Evoluciones.
  - El mouse ilumina temporalmente la región bajo el cursor.
  - Al salir, reaparece la última selección del mando.
  - La última entrada tiene prioridad.
  - El borde es un neón azul tenue, no bloquea clics y respeta movimiento reducido.

## 4. Evoluciones y sistemas del núcleo

### Evolución 01 — Amplificador de pulso

- +1 de energía base por nivel y clic.
- Costo inicial: 10.
- Crecimiento: ×1.7.

### Evolución 02 — Microgenerador

- Produce energía automáticamente.
- Costo inicial: 25.
- Crecimiento: ×1.8.

### Evolución 03 — Reactor de resonancia

- Multiplicador: `nivel + 1`.
- Costo inicial: 120.
- Crecimiento: ×2.2.

### Evolución 04 — Condensador de presión

- Cada nivel concede +2% global por cada tramo completo del 10% de llenado.
- Requisito inicial: 100 clics.
- Costo inicial: 500.
- Crecimiento: ×2.4.

### Evolución 05 — Cámara de cavitación

- Nivel 1: descarga cada 25 clics y recompensa equivalente a 5 segundos de producción.
- Los niveles reducen el ciclo y aumentan los segundos recompensados.
- Requiere 500 clics y un microgenerador antes del primer prestigio.
- Costo inicial: 2,000.
- Crecimiento: ×2.6.

### Evolución 06 — Válvula de sobrecarga

- Los clics posteriores al llenado cargan una fase temporal.
- Nivel 1: 100 clics, multiplicador ×2 y duración 15 segundos.
- Afecta clics, producción y cavitación.
- Requiere esfera llena y cavitación nivel 1 antes del primer prestigio.
- Costo inicial: 10,000.
- Crecimiento: ×3.

### Evolución 07 — Módulo de pulsación autónoma

- Genera clics reales del núcleo.
- Llena la esfera y carga presión, cavitación y sobrecarga.
- Progresión: `0.20 × 1.6^(nivel - 1)` clic/s.
- Límite técnico: 20 clic/s.
- Requiere 500 clics y un microgenerador antes del primer prestigio.
- Costo inicial: 5,000.
- Crecimiento: ×2.8.

### Evolución 08 — Matriz de refracción

- Requiere prestigio 1 y un microgenerador.
- Costo inicial: 25,000.
- Crecimiento: ×3.15.
- Facetas requeridas: P1=6, P2=8, P3=10, P4+=12.
- Carga: `1 + 0.15 × (nivel − 1)` facetas por vuelta.
- Usa la misma duración orbital 20→3 segundos del zafiro.
- Recompensa: producción base × `(8 + 3 × nivel)` segundos.
- Multiplicador PRISMA: `1.20 + 0.05 × nivel`.
- Duración PRISMA: `4 + nivel` segundos.
- Nivel 1: 1 faceta/vuelta, 11 segundos de producción, ×1.25 durante 5 segundos.
- PRISMA se combina multiplicativamente con sobrecarga y afecta clics, producción y cavitación.
- Las descargas posteriores extienden la duración activa.
- Al cristalizar se reinician nivel, progreso, facetas y bonificación.

### Acelerador de pulso — mejora del Gatillo

- `pulseTriggerLevel` forma parte del estado principal.
- Nivel inicial: 0.
- Nivel máximo: 6.
- Cadencia:

```text
pulsos/s = min(9, 6 + 0.5 × nivel)
```

- Costo:

```text
costo = ceil(6000 × 2.25^nivel)
```

| Nivel | Cadencia | Costo siguiente |
|---:|---:|---:|
| 0 | 6.0/s | 6,000 |
| 1 | 6.5/s | 13,500 |
| 2 | 7.0/s | 30,375 |
| 3 | 7.5/s | 68,344 |
| 4 | 8.0/s | 153,774 |
| 5 | 8.5/s | 345,991 |
| 6 | 9.0/s | Máximo |

- Partidas anteriores reciben nivel 0.
- Valores inválidos se limitan a nivel 6.
- Cristalizar y reiniciar devuelven el nivel a 0.
- Participa en Comprar todo:
  - prioridad alta en Juego activo;
  - moderada en Equilibrado;
  - muy baja en Automático.

## 5. Gatillo de pulso

- La tarjeta aparece inmediatamente debajo de la esfera y antes del estado del núcleo.
- 10 clics directos generan 1 segundo de reserva.
- Reserva máxima: 10 segundos.
- El Gatillo consume la reserva a la cadencia determinada por `pulseTriggerLevel`.
- Se activa manteniendo:
  - el botón visual con mouse;
  - R2/RT;
  - Espacio o Enter cuando el botón tiene foco.
- Los pulsos del Gatillo no recargan su propia reserva.
- El Autoclicker tampoco recarga la reserva.
- X/A sobre el núcleo sí cuenta como clic directo.
- Usa el mismo botón real del núcleo, por lo que mantiene energía, presión, cavitación, sobrecarga, partículas y demás reglas.
- Se detiene al soltar, agotar la reserva, ocultar la pestaña, perder foco o desconectar/desactivar el mando.
- La reserva temporal se guarda separada del estado principal y se reinicia al cristalizar o borrar progreso.
- Vibración:
  - pulso ligero por disparo;
  - doble toque al ganar un segundo;
  - golpe corto al agotar la reserva.

## 6. Prestigio del zafiro

- El núcleo se llena a 5,000 clics.
- El prestigio se confirma con `CRISTALIZAR`; nunca ocurre automáticamente.
- La gema se ensambla, sale del núcleo y se instala en el soporte permanente.

Multiplicadores:

- P0: ×1.00.
- P1: ×1.50.
- P2: ×1.85.
- P3: ×2.20.
- P4: ×2.60.
- P5: ×3.05.
- Posteriores: +0.50 por cristalización mientras se define la progresión cromática.

Al cristalizar se reinician energía, clics, evoluciones temporales, Acelerador del Gatillo y cargas. Se conservan prestigio, zafiro, multiplicador y planos descubiertos.

## 7. Zafiro, órbita e iluminación

- Zafiro WebGL con geometría real, caras triangulares, normales y shaders.
- P1: 6 sectores; P2: 8; P3: 10; P4+: 12.
- Órbita elíptica WebGL separada en capa trasera y delantera transparentes.
- Chispa cian con núcleo blanco y estela de doce partículas.
- La chispa funciona como fuente de luz dinámica sobre las facetas.
- Duración de órbita y pulso:

```text
duración = 3 + 17 × (1 − clics / 5000)^1.6
```

- Núcleo vacío: 20 segundos por vuelta.
- Núcleo lleno: 3 segundos por vuelta.
- La fase se conserva al cambiar la velocidad.
- SVG y órbita CSS permanecen como respaldo si WebGL falla.
- La Matriz muestra indicadores alrededor del zafiro y genera halo, haces y mensaje de descarga prismática.

## 8. Soporte Gamepad / DualSense

La capa de mando acciona los controles reales del DOM y no duplica las fórmulas del reducer.

Controles estándar:

- X/A: activar control enfocado o pulsar el núcleo.
- R2/RT: Gatillo de pulso con reserva.
- Cuadrado/X: cambiar estrategia de Comprar todo.
- Triángulo/Y: Comprar todo posible.
- L1/LB: Núcleo.
- R1/RB: Evoluciones.
- Círculo/B: volver al Núcleo.
- Options/Menu: abrir o cerrar panel de mando.
- Cruceta/stick: navegación espacial y ajuste de deslizadores.

Protecciones y rendimiento:

- Gamepad API estándar.
- Detección por flancos para acciones discretas.
- `requestAnimationFrame` solamente para sondeo del mando.
- No se escribe estado React en cada cuadro.
- Primer mando conectado como principal.
- Pausa funcional con pestaña oculta.
- Funciona simultáneamente con mouse y teclado.
- Sin WebHID por ahora; no hay gatillos adaptativos, barra de luz, altavoz, touchpad avanzado ni giroscopio propietarios.

Vibraciones contextuales opcionales:

- navegación;
- clic normal;
- Gatillo;
- Cavitación;
- Sobrecarga;
- Descarga prismática;
- cristalización del zafiro;
- Comprar todo.

La ausencia o fallo del actuador háptico nunca bloquea acciones.

## 9. Comprar todo estratégico

Perfiles:

- `Equilibrado`: clics, producción, presión y apertura de sistemas.
- `Juego activo`: Amplificador, Gatillo, Presión, Cavitación y Sobrecarga.
- `Automático`: Microgenerador, Resonancia, Autoclicker y Refracción; Gatillo con prioridad mínima.

Funcionamiento:

1. Simula compras mediante el reducer real.
2. Descarta compras bloqueadas o inasequibles.
3. Calcula utilidad según perfil.
4. Divide ganancia entre costo.
5. Aplica pesos, bonos de apertura y penalización de concentración.
6. Compra virtualmente la mejor opción.
7. Recalcula hasta que no haya compras posibles.
8. Al confirmar, recalcula sobre el estado autoritativo y aplica una sola actualización.

Máximo técnico: 320 compras por pulsación.

## 10. Arquitectura relevante

- `src/game.ts`: estado, migración, compras, reducer y multiplicadores.
- `src/refraction.ts`: Matriz de refracción.
- `src/bulkPurchase.ts`: perfiles y planificación de Comprar todo.
- `src/App.tsx`: ciclo principal y aplicación de acciones.
- `src/GameCore.tsx`: núcleo, estados y eventos visuales.
- `src/SapphireGem3D.tsx`: gema WebGL.
- `src/SapphireOrbit3D.tsx`: órbita y chispa WebGL.
- `src/gamepad.ts`: ajustes y detección de mandos.
- `src/GamepadController.tsx`: navegación y acciones discretas.
- `src/GamepadEventHaptics.tsx`: vibraciones contextuales.
- `src/pulseTrigger.ts`: reserva, fórmulas, nivel y protocolo del Gatillo.
- `src/PulseTriggerSystem.tsx`: interfaz, mouse, teclado, R2 y descargas.
- `src/PulseTriggerSystem.css` y `src/PulseTriggerLevel.css`: diseño del Gatillo.
- `src/RegionFocusGuide.tsx`: guía visual mouse/mando.
- `src/RegionFocusGuide.css`: borde neón de regiones.

## 11. Validaciones y límites conocidos

- No se añadieron dependencias.
- Guardados anteriores reciben campos nuevos en cero.
- Estados temporales vencidos no se restauran.
- Autoclics múltiples se procesan secuencialmente.
- Gatillo y Autoclicker no autorrecargan la reserva.
- El nivel 6 bloquea compras adicionales del Acelerador.
- Arturo validó físicamente DualSense, vibraciones, Gatillo y guía visual.
- Arturo validó visualmente la posición y presentación del Gatillo escalable.
- GitHub no tiene CI configurado para estos commits.

Comprobación local recomendada antes de publicar versiones:

```powershell
npm run lint
npm run build
npm run dev
```

## 12. Próxima expansión — Cámara Cromática

Decisión conceptual aprobada para iniciar en una rama nueva después de integrar `Dev-Pulse-Trigger-Level`:

- Nueva vista completa denominada **Cámara Cromática**.
- Gema central denominada provisionalmente **Nexo Prismático**.
- La gema central comienza gris, apagada e inerte.
- Requiere cinco gemas orbitando a nivel 5:
  - Zafiro;
  - Esmeralda;
  - Amarilla;
  - Naranja;
  - Roja.
- Al llegar el Zafiro a nivel 5:
  - se desbloquea la Cámara Cromática;
  - el Zafiro comienza a orbitar el Nexo;
  - se activa el primer sector azul;
  - se anticipa la Esmeralda como siguiente progresión.
- Antes del desbloqueo, el acceso debe estar visible pero apagado y mostrar `Zafiro X/5`.
- La primera implementación debe centrarse en:
  - acceso bloqueado/desbloqueado;
  - transición de vista;
  - gema central inerte;
  - cinco posiciones orbitales;
  - Zafiro orbitando a P5;
  - regreso seguro a la pantalla principal;
  - navegación con mouse, teclado y mando.
- Las mecánicas y bonificaciones de Esmeralda, Amarilla, Naranja y Roja se definirán posteriormente.

## 13. Inicio recomendado para otro chat

> Continúa `xArtXtrAx/incremental-game-A`. Lee `HISTORIAL_GPT.MD`. La rama estable incorpora soporte Gamepad, Gatillo de pulso, Acelerador escalable y guía de regiones. La siguiente rama activa debe dedicarse a la Cámara Cromática y al Nexo Prismático. No integrar cambios visuales nuevos a `main` hasta la aprobación de Arturo.
