# HISTORIAL_GPT — Incremental Game A

> Bitácora compartida entre Arturo y GPT.  
> **Regla para nuevos chats:** leer este archivo y comprobar la rama activa antes de modificar el proyecto.

## 1. Estado del repositorio

- Repositorio: `xArtXtrAx/incremental-game-A`.
- Rama estable: `main`.
- No hay una rama funcional pendiente de integración.
- Últimas ramas aprobadas e integradas:
  - `Dev-Camara-Cromatica`;
  - `Dev-Smooth-Progress-Bars`;
  - `Dev-DualSense-L2-Hotkeys`.
- Ramas históricas adicionales: `Dev-Prestigio-Test`, `Dev-Orbita-Zafiro-Test`, `Dev-Matriz-Refraccion-Test`, `Dev-Gamepad-Test` y `Dev-Pulse-Trigger-Level`.
- Entorno: React + TypeScript + Vite + Motion.
- Guardado principal: `incremental-game-a:save:v1`.
- Ajustes de mando: `incremental-game-a:gamepad:v1`.
- Reserva del Gatillo: `incremental-game-a:pulse-trigger:v1`.
- Última actualización: **2 de agosto de 2026**.

Arturo aprobó visualmente y funcionalmente la Cámara Cromática, el Nexo Prismático, el acceso normal y DEV, el control de cristalizaciones, el Zafiro WebGL orbital, las barras de progreso fluidas y el esquema final de controles DualSense. Todo está integrado en `main`.

## 2. Forma de trabajo

- Trabajar de forma directa y evitar microcomprobaciones redundantes.
- Usar GitHub Desktop para el flujo local normal.
- Crear ramas para cambios visuales, estructurales o mecánicos importantes.
- Integrar a `main` solamente después de la validación de Arturo.
- Antes de integrar, comparar la rama con `main`, reportar alcance y esperar autorización explícita.
- Conservar las ramas remotas como respaldo salvo autorización expresa para eliminarlas.
- Evitar reescrituras destructivas del historial remoto salvo necesidad técnica clara y autorización.
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
- Acceso superior a la Cámara Cromática:
  - visible desde P0;
  - bloqueado hasta Zafiro P5;
  - muestra progreso `Zafiro X/5`;
  - se activa como entrada de metaprogresión en P5.

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
  - Espacio o Enter cuando el botón tiene foco;
  - botón derecho del mouse dentro del área jugable.
- El clic izquierdo puede seguir utilizándose mientras el botón derecho mantiene activo el Gatillo.
- El menú contextual se bloquea solamente dentro del área del juego.
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
- La Cámara Cromática reutiliza exactamente el mismo componente `SapphireGem`:
  - misma geometría WebGL;
  - mismo giro vertical;
  - misma flotación, halo, chispa y estela;
  - respaldo SVG/CSS idéntico.
- Dentro de la Cámara, el Zafiro completo realiza una órbita exterior de 15 segundos alrededor del Nexo.
- Cambia de profundidad para pasar íntegramente por detrás y por delante del Nexo.
- Su posición alimenta un reflejo azul móvil sobre las facetas grises; el reflejo es más intenso al pasar por delante y nunca sustituye el estado real de las facetas.

## 8. Barras de progreso

- Existe un componente universal de barras para niveles, requisitos y sistemas internos.
- Las tarjetas de mejoras muestran progreso hacia el siguiente nivel o requisito cuando corresponde.
- Hay barras internas para Presión, Cavitación, Autoclicker, Sobrecarga y Refracción.
- Conservan segmentación, tonos de estado, etiquetas accesibles y conteos activos.
- La animación usa la Web Animations API nativa del navegador.
- Cada actualización comienza desde la posición visual real de la barra, aunque la animación anterior siga en curso.
- Se evita la doble interpolación: el reloj visual nativo controla el movimiento y CSS no vuelve a suavizarlo.
- Las barras cíclicas siempre avanzan hacia la derecha:

```text
70% → 100% → reinicio inmediato en 0% → 10%
```

- Los ciclos nunca retroceden de 70% a 10% hacia la izquierda.
- Una reducción hacia la izquierda solo se permite cuando el recurso realmente disminuye.
- Arturo validó visualmente que las barras se ven continuas, fluidas y sin congelamientos.

## 9. Soporte Gamepad / DualSense

La capa de mando acciona controles reales del DOM y no duplica fórmulas del reducer.

### Controles en el reactor

- X/A: pulsa siempre la esfera, sin depender del elemento enfocado.
- X/A queda reservado y no pulsa la esfera mientras L2/LT está presionado.
- Cuadrado/X de Xbox: selector general; activa el control enfocado.
  - compra una mejora individual;
  - selecciona pestañas y menús;
  - activa botones, radios y casillas;
  - si no hay un foco compatible, no ejecuta una acción alternativa.
- R2/RT: Gatillo de pulso con reserva.
- L2 + Triángulo / LT + Y: cambia entre `Equilibrado`, `Juego activo` y `Automático`.
- L2 + Cuadrado / LT + X: ejecuta `Comprar todo lo posible`.
- Triángulo/Y sin L2 conserva el atajo anterior de compra global.
- L1/LB: cambia inmediatamente a Núcleo.
- R1/RB: cambia inmediatamente a Evoluciones.
- L1 + R1 / LB + RB: abre la Cámara Cromática cuando está desbloqueada.
- La cruceta ya no cambia directamente de ventana.
- Cruceta y stick navegan espacialmente por los controles enfocables.
- Las cuatro direcciones de la cruceta están disponibles para navegar.
- Izquierda/derecha ajustan controles deslizantes cuando uno tiene el foco.
- Círculo/B: vuelve al Núcleo o cierra la Cámara según el contexto.
- Options/Menu: abre o cierra el panel del mando.

### Prioridad de hotkeys

- L2/LT funciona como modificador.
- La combinación tiene prioridad sobre la acción normal del botón acompañante.
- Las combinaciones se ejecutan una sola vez por pulsación; no repiten mientras el botón permanece sostenido.
- L2 por sí solo no ejecuta ninguna acción.
- Las combinaciones del reactor quedan suspendidas mientras la Cámara Cromática está abierta.

### Dentro de la Cámara Cromática

La Cámara conserva su puente específico de navegación:

- L1/R1 o cruceta izquierda/derecha recorren gemas.
- Cruceta arriba enfoca regresar.
- Cruceta abajo vuelve a la gema seleccionada.
- X/A activa el control enfocado de la Cámara y no pulsa el núcleo por detrás del overlay.
- Círculo/B regresa al reactor.

### Protecciones y rendimiento

- Gamepad API estándar.
- Detección por flancos para acciones discretas.
- `requestAnimationFrame` solamente para sondeo del mando y animaciones visuales.
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

## 10. Comprar todo estratégico

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

## 11. Cámara Cromática y Nexo Prismático

- Vista completa de metaprogresión montada sobre el reactor sin desmontarlo.
- El reactor sigue produciendo, guardando y ejecutando temporizadores mientras la Cámara está abierta.
- El Nexo Prismático comienza gris, apagado e incompleto.
- Requiere cinco gemas a nivel 5:
  - Zafiro;
  - Esmeralda;
  - Amarilla;
  - Naranja;
  - Roja.
- El Zafiro usa `prestigeCount` como progreso real entre 0 y 5.
- En P0–P4:
  - acceso normal bloqueado;
  - Nexo inerte;
  - faceta azul apagada;
  - Zafiro sin orbitar;
  - Esmeralda sellada.
- En P5:
  - se habilita el acceso normal;
  - el Zafiro orbita el Nexo;
  - se activa la primera faceta azul;
  - se contabiliza 1/5 órbitas completas;
  - la Esmeralda aparece como siguiente frecuencia.
- Las otras cuatro gemas todavía no tienen economía, compras ni bonificaciones.
- El inspector lateral muestra nombre, nivel, progreso, estado y descripción de la gema seleccionada.
- La vista respeta `prefers-reduced-motion` y es responsiva.

### Acceso y previsualización DEV

- El panel de desarrollador contiene `Cámara Cromática — ABRIR`.
- Puede abrir una inspección incluso en P0–P4.
- Se identifica como `Vista DEV · Estado real`.
- Nunca concede P5 ni modifica desbloqueos.
- Permanece abierta si el progreso se reinicia para mostrar inmediatamente el estado posterior.
- La previsualización cromática permite mostrar temporalmente:
  - Zafiro;
  - Esmeralda;
  - Amarilla;
  - Naranja;
  - Roja.
- La previsualización es únicamente visual y dura durante la sesión.
- No modifica guardado, prestigio, desbloqueos ni economía.
- Recargar devuelve la vista al Zafiro real.

### Control de cristalizaciones

El panel DEV permite editar atómicamente:

- Energía acumulada.
- Clics del núcleo.
- Cristalizaciones (`prestigeCount`).

Reglas de cristalizaciones:

- solamente enteros no negativos;
- bloquea letras, signos, espacios, comas, decimales y notación científica;
- máximo 1,000,000,000;
- actualiza el multiplicador, indicador P#, planos, Cámara y guardado;
- no ejecuta la animación ni el reinicio de una cristalización real.

Consistencia de refracción al reducir prestigio:

- P0 elimina nivel, progreso, facetas, PRISMA y recompensas de refracción.
- Bajar entre P4, P3, P2 y P1 limita las facetas cargadas al nuevo máximo.

## 12. Arquitectura relevante

- `src/game.ts`: estado, migración, compras, reducer y multiplicadores.
- `src/refraction.ts`: Matriz de refracción.
- `src/bulkPurchase.ts`: perfiles y planificación de Comprar todo.
- `src/App.tsx`: ciclo principal, acciones y aplicación atómica de valores DEV.
- `src/GameCore.tsx`: núcleo, estados y eventos visuales.
- `src/UpgradeProgressBar.tsx`: barras universales, animación nativa y reinicio de ciclos.
- `src/UpgradeProgressBar.css`: apariencia, segmentación y tonos de barras.
- `src/SapphireGem.tsx`: componente compartido del Zafiro.
- `src/SapphireGem3D.tsx`: geometría y shader de la gema.
- `src/SapphireOrbit3D.tsx`: órbita interna, chispa y estela WebGL.
- `src/SapphireOrbitState.ts`: fase y posiciones orbitales compartidas.
- `src/gamepad.ts`: ajustes, etiquetas y detección de mandos.
- `src/GamepadController.tsx`: navegación, selección, hotkeys y acciones discretas.
- `src/GamepadEventHaptics.tsx`: vibraciones contextuales.
- `src/pulseTrigger.ts`: reserva, fórmulas, nivel y protocolo del Gatillo.
- `src/PulseTriggerSystem.tsx`: interfaz, mouse, teclado, R2 y descargas.
- `src/PulseTriggerSystem.css` y `src/PulseTriggerLevel.css`: diseño del Gatillo.
- `src/RegionFocusGuide.tsx`: guía visual mouse/mando.
- `src/RegionFocusGuide.css`: borde neón de regiones.
- `src/chromatic.ts`: protocolo, gemas y modos de apertura cromática.
- `src/ChromaticChamberSystem.tsx`: acceso, escena, estados e inspector.
- `src/ChromaticGamepadBridge.tsx`: navegación del mando dentro de la Cámara.
- `src/ChromaticSapphireOrbit.tsx`: órbita exterior del Zafiro y posición de iluminación.
- `src/ChromaticSapphireOrbit.css`: profundidad, escala y reflejo sobre el Nexo.
- `src/DeveloperPanel.tsx`: acceso cromático, previsualización y campos DEV.
- `SMOOTH_PROGRESS_FIX.md`: decisiones técnicas de las barras fluidas.
- `DUALSENSE_L2_HOTKEYS.md`: mapa y decisiones de controles DualSense.

## 13. Validaciones y límites conocidos

- No se añadieron dependencias para las barras ni los hotkeys.
- Guardados anteriores reciben campos nuevos en cero.
- Estados temporales vencidos no se restauran.
- Autoclics múltiples se procesan secuencialmente.
- Gatillo y Autoclicker no autorrecargan la reserva.
- El nivel 6 bloquea compras adicionales del Acelerador.
- La Cámara no añade claves ni campos nuevos al guardado.
- P0–P4 no montan Zafiro ni reflejo cromático.
- El Zafiro cromático pasó comprobación TypeScript estricta aislada.
- El componente de barras pasó comprobaciones TypeScript aisladas durante el desarrollo.
- Las barras fueron validadas visualmente después de corregir una versión que quedaba invisible y otra que se congelaba.
- La solución final usa animaciones nativas enlazadas desde la posición visual actual.
- Arturo validó físicamente DualSense, vibraciones, Gatillo, hotkeys, selector con Cuadrado y navegación libre con cruceta.
- Arturo validó visualmente el Gatillo escalable, la Cámara Cromática, el Zafiro orbital, el reflejo dinámico y las barras fluidas.
- GitHub no tiene CI configurado para estos commits.
- No se ejecutó el `build` completo en el entorno remoto por falta de checkout/dependencias accesibles.

Comprobación local recomendada antes de publicar versiones:

```powershell
npm run lint
npm run build
npm run dev
```

## 14. Próxima expansión

El reactor, la Cámara Cromática, las barras y el mando están estables según las pruebas actuales. El siguiente desarrollo debe comenzar en una rama nueva creada desde `main`.

Opciones naturales:

- diseñar la economía y los cinco niveles de la Esmeralda;
- definir qué sistemas existentes transforma la frecuencia verde;
- diseñar la transición Zafiro P5 → desbloqueo de Esmeralda;
- añadir sonido ambiental y señales acústicas;
- continuar el pulido del Nexo sin activar prematuramente otras facetas;
- seguir refinando navegación y accesibilidad del mando conforme crezca la interfaz.

Regla de diseño vigente:

> Cada gema nueva debe transformar mecánicas existentes y no limitarse a añadir otra moneda o porcentaje aislado.

## 15. Inicio recomendado para otro chat

> Continúa el proyecto `xArtXtrAx/incremental-game-A`. Lee primero `HISTORIAL_GPT.MD`, revisa `WORKFLOW_RULES.md` si existe y comprueba la rama activa antes de escribir. La rama estable `main` incorpora Gamepad/DualSense, Gatillo de pulso escalable, Matriz de refracción, Cámara Cromática y Nexo Prismático, acceso y previsualización DEV, edición de cristalizaciones, Zafiro WebGL orbital, barras de progreso fluidas mediante Web Animations API y el esquema final de controles: X pulsa la esfera, Cuadrado selecciona el foco, L2+Triángulo cambia estrategia, L2+Cuadrado compra todo, L1/R1 cambia de ventana y la cruceta navega libremente. Crea una rama nueva antes de cualquier expansión importante. No integres cambios nuevos a `main` sin aprobación explícita de Arturo.
