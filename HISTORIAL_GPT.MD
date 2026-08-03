# HISTORIAL_GPT — Incremental Game A

> Bitácora compartida entre Arturo y GPT.  
> **Regla para nuevos chats:** leer primero este archivo, `PLAN_MAESTRO.md`, `MODELO_MATEMATICO.md`, `BALANCE_LABORATORY.md`, `PERFORMANCE_AUDIT.md` y `GAMEPAD_DEVICE_SELECTION.md`; después comprobar la rama activa antes de modificar el proyecto.

## 1. Estado actual del repositorio

- Repositorio: `xArtXtrAx/incremental-game-A`.
- Rama activa y estable: `main`.
- Commit de integración del código antes de esta actualización documental: `852de786ded06e7e2ac1fbf16378dd7498489e39`.
- No hay pull requests abiertos.
- Las ramas DEV integradas se conservan como respaldos históricos y no deben eliminarse sin autorización explícita.
- Entorno: React 19 + TypeScript 6 + Vite 8 + Motion.
- Guardado principal: `incremental-game-a:save:v1`.
- Ajustes de mando: `incremental-game-a:gamepad:v1`.
- Reserva del Gatillo: `incremental-game-a:pulse-trigger:v1`.
- Perfil experimental de balance: `incremental-game-a:balance-dev:v1`.
- Última actualización: **3 de agosto de 2026, 16:14 CDMX**.

### Integraciones realizadas

| PR | Rama | Merge commit | Alcance |
|---|---|---|---|
| #1 | `Dev-Performance-Audit` | `8a6d628613d9dec47873a7a653e984a781ec2a04` | Auditoría de rendimiento y selección robusta del gamepad activo |
| #2 | `Dev-Gamepad-Zone-Navigation` | `e42908277ee45a9c59dfd885943e89e115d75c85` | Navegación confinada, foco visible, modalidad de entrada, hápticos y barras cíclicas |
| #3 | `Dev-Sapphire-Orbit-Particles` | `438d93e1011d1ebeb1ddef66162c35867b00ba4c` | Una partícula orbital por nivel del Zafiro, con distribución equidistante |
| #4 | `Dev-Balance-Laboratory` | `90975a3e49e5100f851865c17d7ac89cd393b136` | Configuración matemática central y primera ventana del Laboratorio de Balance |
| #5 | `Dev-Balance-Laboratory-Phase-2` | `734aadd83357e47a33b93f35efd271281d2cd63a` | Editor seguro de borradores, comparación Oficial/Borrador y diagnósticos en tiempo real |
| #6 | `Dev-Balance-Laboratory-Phase-3` | `852de786ded06e7e2ac1fbf16378dd7498489e39` | Aplicación reversible a sesión, normalización conservadora y restauración oficial |

Después del PR #2 también se añadieron:

- `b60ab8b483d73a72cd28f109206a2044a165a43d` — crea `PLAN_MAESTRO.md`;
- `17422ef2437f3b93c8e11ef7052f64cfdb7d865a` — crea `MODELO_MATEMATICO.md`;
- `96a9e07a73142fee22bfcf0d3e83b252c8fcf5cc` — enlaza y divide las responsabilidades de ambos documentos;
- `28df10e6def27ddb7ac622ebe37162e036ceed6a` — actualiza esta bitácora con los documentos maestros.

### Repositorio transversal de estabilidad

- Repositorio: [`xArtXtrAx/bugs-universales-corregidos`](https://github.com/xArtXtrAx/bugs-universales-corregidos).
- `BUG-001 — El primer gamepad conectado puede no ser el que recibe las entradas`: **validado físicamente**.
- `BUG-002 — El foco del gamepad puede quedar invisible después de usar el mouse`: causa raíz confirmada y corrección integrada; su actualización formal a validado físicamente sigue pendiente.

## 2. Documentación rectora

### `PLAN_MAESTRO.md`

Define la visión completa, la secuencia cromática y el estado de cada expansión:

```text
Reactor básico
  ↓
Cristalización / Prestigio
  ↓
Zafiro
  ↓
Esmeralda
  ↓
Gema amarilla
  ↓
Gema naranja
  ↓
Gema roja
  ↓
Nexo Prismático completo
```

- Zafiro está integrado provisionalmente hasta nivel 5.
- Esmeralda es la siguiente etapa de contenido que debe diseñarse antes de programarse.
- Amarilla, Naranja, Roja, culminación del Nexo y posible postjuego permanecen proyectados.

### `MODELO_MATEMATICO.md`

- Documenta costos, redondeos, producción, Presión, Cavitación, Autoclicker, Sobrecarga, PRISMA, Gatillo y Zafiro.
- Distingue fórmulas **Integradas**, **Provisionales**, **Propuestas** y **Pendientes**.
- El código de `main` sigue siendo la autoridad final.
- Las fórmulas futuras deben aprobarse y registrarse aquí antes de implementarse.

### `BALANCE_LABORATORY.md`

- Describe la arquitectura, invariantes y política de seguridad del Laboratorio de Balance.
- El Laboratorio ya permite editar borradores, comparar curvas, aplicar parámetros migrados a la sesión y restaurar el balance oficial.
- La configuración experimental no se carga automáticamente ni se mezcla con el guardado normal.
- Capacidad de esfera, bono de Presión y requisitos de desbloqueo continúan como **solo simulación** hasta migrar todos sus consumidores visuales y de control.

### División de responsabilidades

```text
PLAN_MAESTRO.md       → hacia dónde va el juego
MODELO_MATEMATICO.md  → cómo se comporta matemáticamente
BALANCE_LABORATORY.md → cómo se inspecciona y modifica el balance de forma segura
HISTORIAL_GPT.MD      → qué se hizo, integró y validó
PERFORMANCE_AUDIT.md  → riesgos y presupuestos de rendimiento
```

## 3. Forma de trabajo obligatoria

- Trabajar de forma directa y evitar microcomprobaciones redundantes.
- Usar GitHub Desktop para el flujo local normal.
- Crear ramas para cambios visuales, estructurales, mecánicos o de balance importantes.
- Antes de integrar, comparar con `main`, explicar el alcance y esperar autorización explícita de Arturo.
- Nunca integrar a `main` ni eliminar ramas sin autorización explícita.
- Conservar ramas remotas como respaldo salvo instrucción contraria.
- Evitar `force push`, resets agresivos, ZIP, manifiestos y hashes salvo necesidad técnica clara.
- No afirmar que se ejecutaron `lint`, `build`, benchmarks o pruebas físicas cuando no se ejecutaron realmente.
- Mantener gameplay, fórmulas y visuales idénticos durante refactorizaciones de infraestructura salvo aprobación específica.
- Una expansión cromática debe pasar por idea, documento de diseño, fórmulas, simulación, rama, implementación, pruebas e integración.
- No se encontró `WORKFLOW_RULES.md`; esta bitácora es la referencia operativa vigente.

## 4. Estado jugable actual en `main`

### Interfaz y sistemas

- Resumen superior compacto.
- Núcleo fijo a la izquierda en escritorio.
- Evoluciones en panel desplazable con pestañas Producción, Núcleo y Avanzadas.
- Tarjetas expandibles y Comprar todo estratégico.
- Navegación móvil entre Núcleo y Evoluciones.
- Panel DEV responsivo.
- Laboratorio de Balance accesible desde el Panel DEV.
- Guía visual por regiones para mouse y mando.
- Cámara Cromática con acceso visual y modo DEV.
- Gatillo de pulso, Autoclicker, Presión, Cavitación, Sobrecarga, PRISMA y Prestigio conectados al reducer autoritativo.

### Evoluciones actuales

1. Amplificador de pulso.
2. Microgenerador.
3. Reactor de resonancia.
4. Condensador de presión.
5. Cámara de cavitación.
6. Válvula de sobrecarga.
7. Módulo de pulsación autónoma.
8. Matriz de refracción.
9. Acelerador de pulso del Gatillo, nivel máximo 6.

### Gatillo de pulso

- 10 clics directos generan 1 segundo de reserva.
- Reserva máxima: 10 segundos.
- Cadencia oficial vigente: `min(9, 6 + 0.5 × nivel)` pulsos/s.
- Se activa con R2/RT, botón visual, teclado o clic derecho en el área jugable.
- El clic izquierdo puede usarse simultáneamente.
- Gatillo y Autoclicker no recargan la reserva.
- La reserva se guarda separada del estado principal.

### Prestigio y Zafiro

- La esfera se llena oficialmente a 5,000 clics.
- La cristalización requiere confirmación.
- Multiplicadores: P0 ×1.00, P1 ×1.50, P2 ×1.85, P3 ×2.20, P4 ×2.60 y P5 ×3.05.
- Después de P5 se usa provisionalmente +0.50 por prestigio.
- La diferencia entre el límite visual P5 y el crecimiento matemático posterior está documentada como provisional.
- El Zafiro usa geometría WebGL e iluminación orbital.
- La cantidad de partículas orbitales coincide con el nivel visual del Zafiro, limitada a cinco:
  - nivel 1: una partícula;
  - nivel 2: dos partículas a 180°;
  - nivel 3: tres partículas a 120°;
  - nivel 4: cuatro partículas a 90°;
  - nivel 5 o superior: cinco partículas a 72°.
- Cada partícula conserva estela propia, profundidad frontal/trasera y respaldo CSS.

### Cámara Cromática

- Nexo Prismático con Zafiro, Esmeralda, Amarilla, Naranja y Roja.
- En P5 se activa la primera órbita azul y Esmeralda queda señalada como siguiente frecuencia.
- Las cuatro gemas posteriores aún no tienen economía ni bonificaciones definitivas.
- El reactor continúa funcionando mientras la Cámara está abierta.

## 5. Laboratorio de Balance integrado

### Arquitectura

- `src/balanceConfig.ts`: contrato `BalanceConfig`, valores oficiales congelados y límites absolutos.
- `src/balanceValidation.ts`: estructura exacta, números finitos, rangos y relaciones.
- `src/balanceRuntime.ts`: fuente oficial, sesión o perfil almacenado.
- `src/balanceDraft.ts`: rutas editables, clonación y restauración de borradores.
- `src/balanceSimulation.ts`: simulaciones puras y diagnósticos.
- `src/balanceParity.ts`: matriz de resultados conocidos anteriores a la centralización.
- `src/balanceStateNormalization.ts`: normalización conservadora de la partida al cambiar de perfil.
- `src/balanceNormalizationParity.ts`: comprobaciones puras de la normalización.
- `src/balanceSessionPolicy.ts`: lista autoritativa de parámetros aplicables y bloqueados.
- `src/balanceSessionBridge.ts`: puente controlado entre el Laboratorio y `App`.
- `src/BalanceLaboratorySystem.tsx`: editor, comparación, diagnóstico y controles de sesión.
- `BALANCE_LABORATORY.md`: arquitectura, invariantes, estado y fases siguientes.

### Sistemas migrados a la configuración central

- fórmulas autoritativas de `game.ts`;
- Refracción;
- Gatillo de pulso;
- Comprar todo;
- límite de Comprar todo conservado en 320 iteraciones;
- costos y crecimiento de las nueve evoluciones;
- tasas del Autoclicker;
- multiplicadores de Zafiro.

### Editor y previsualización

La ventana permite:

- editar costos base y crecimiento de las nueve mejoras;
- editar capacidad de esfera, Presión y desbloqueos como simulación;
- editar tasa base, crecimiento y límite del Autoclicker;
- editar Zafiro P1–P5 y su incremento posterior;
- comparar Oficial/Borrador en tiempo real;
- ver diferencias porcentuales y muestras de niveles;
- restaurar un campo o todo el borrador;
- validar rangos, secuencias y relaciones;
- detectar inflación, estancamiento, costos no finitos y desbloqueos tardíos;
- revisar la última normalización realizada.

### Aplicación reversible a sesión

Se pueden aplicar actualmente:

- costos base y crecimiento;
- parámetros del Autoclicker;
- multiplicadores P1–P5 del Zafiro;
- incremento provisional posterior a P5.

Al aplicar:

- la configuración cambia únicamente en memoria;
- energía, clics, prestigio y niveles comprados se conservan;
- cargas parciales se recortan solamente si quedan fuera del nuevo límite;
- Sobrecarga y PRISMA activos se cancelan para evitar duraciones o multiplicadores híbridos;
- cada ajuste queda registrado en el diagnóstico;
- cualquier error de validación rechaza toda la operación;
- **Restaurar sesión oficial** revierte inmediatamente las fórmulas;
- recargar la página vuelve al balance oficial.

### Parámetros todavía de solo simulación

- capacidad de la esfera;
- bono de Presión por tramo;
- desbloqueo de Presión;
- desbloqueo de Cavitación;
- desbloqueo del Autoclicker;
- prestigio requerido para Refracción.

Modificar alguno de estos campos bloquea `Aplicar a sesión`. La restricción existe tanto en la interfaz como en `balanceSessionPolicy.ts`, por lo que una llamada interna tampoco puede omitirla.

### Persistencia y seguridad

- La partida normal y los perfiles DEV usan claves independientes.
- Un perfil experimental no se escribe dentro del guardado principal.
- El perfil DEV no se carga automáticamente al iniciar.
- Todavía no hay controles de interfaz para guardar, nombrar, cargar o borrar perfiles persistentes.
- No se permiten expresiones JavaScript libres.
- No se usa `eval()` ni `new Function()`.
- Los límites absolutos del motor permanecen visibles y no editables.

## 6. Controles DualSense / Gamepad integrados

### Reactor

- X/A: pulsa la esfera.
- X/A no pulsa la esfera mientras L2/LT está sostenido.
- Cuadrado/X de Xbox: activa el control enfocado.
- R2/RT: Gatillo de pulso.
- L2 + Triángulo / LT + Y: cambia estrategia de Comprar todo.
- L2 + Cuadrado / LT + X: Comprar todo lo posible.
- Triángulo/Y sin L2 conserva el atajo anterior de compra global.
- Options/Menu: abre o cierra el panel del mando.
- L1/LB selecciona y enfoca exclusivamente el Núcleo.
- R1/RB selecciona y enfoca exclusivamente Evoluciones.
- **L1 y R1 son la única vía de cambio entre las dos zonas mediante el mando.**
- Cruceta y joystick navegan solamente entre controles de la zona activa.
- Las pestañas principales no pueden activarse con Cuadrado para cambiar indirectamente de zona.
- Círculo/B no regresa automáticamente al Núcleo desde el reactor.
- Abrir y cerrar el panel conserva la zona activa.
- L1+R1 simultáneos no cambian de zona y no abren la Cámara.
- La navegación del reactor se suspende mientras la Cámara está abierta.

### Cámara Cromática

- El atajo L1+R1 para entrar fue retirado temporalmente.
- La Cámara se abre mediante su control visual o herramientas DEV.
- Dentro de la Cámara, L1/R1 y cruceta izquierda/derecha recorren gemas.
- Cruceta arriba enfoca regresar y cruceta abajo vuelve a la gema seleccionada.
- X/A activa el control sin pulsar el núcleo por detrás.
- Círculo/B cierra la Cámara.

## 7. Correcciones y estabilidad

### Navegación confinada y recuperación de foco

- `GamepadController` limita la búsqueda espacial al Núcleo, Evoluciones o panel según el contexto.
- Un panel colapsado no puede convertirse en una raíz de navegación sin destinos.
- Si el foco se pierde, se recupera dentro de la última zona activa.
- L1/R1 actualizan explícitamente la zona activa.

### Barra del Autoclicker y ciclos lentos

- Se corrigió el caso de `0.2 clic/s` donde la barra parecía retroceder desde 100% hasta 20%.
- `UpgradeProgressBar` completa la trayectoria `100% → 0% → nuevo valor` incluso si un render interrumpe el wrap.

### Modalidad mouse/gamepad y hápticos

- El juego registra modalidad activa `mouse` o `gamepad`.
- Movimiento, clic o rueda del mouse suspenden temporalmente las vibraciones.
- Entrada real del mando reactiva el modo gamepad.
- El interruptor manual de vibración permanece como control maestro.

### Foco invisible después de usar el mouse

- El foco DOM podía moverse sin que Chrome mostrara `:focus-visible`.
- `GamepadFocus.css` dibuja explícitamente el contorno en modo gamepad.
- El contorno desaparece al volver al mouse.
- Este caso está documentado como BUG-002.

### Selección robusta del dispositivo

- El juego no supone que el primer objeto de `navigator.getGamepads()` sea el mando activo.
- `src/gamepad.ts` detecta actividad real y conserva estable el índice activo.
- Un DualSense neutral no bloquea al dispositivo virtual que recibe las entradas.
- Está documentado en `GAMEPAD_DEVICE_SELECTION.md` y BUG-001.

## 8. Arquitectura y archivos relevantes

- `src/game.ts`: estado, reducer, costos, configuración activa, migración y guardado.
- `src/App.tsx`: estado autoritativo, tick, efectos y aplicación de perfiles de sesión.
- `src/refraction.ts`: Matriz y PRISMA.
- `src/pulseTrigger.ts`: fórmulas y estado auxiliar del Gatillo.
- `src/bulkPurchase.ts`: simulación estratégica y límite de iteraciones.
- `src/BalanceLaboratorySystem.tsx`: editor y controles del Laboratorio.
- `src/balanceConfig.ts`: valores oficiales y límites.
- `src/balanceDraft.ts`: modelo editable de borrador.
- `src/balanceValidation.ts`: validación de perfiles.
- `src/balanceRuntime.ts`: configuración activa y perfiles DEV.
- `src/balanceSimulation.ts`: tablas y diagnósticos.
- `src/balanceParity.ts`: paridad numérica oficial.
- `src/balanceStateNormalization.ts`: transición segura del estado.
- `src/balanceNormalizationParity.ts`: paridad de normalización.
- `src/balanceSessionPolicy.ts`: alcance permitido por fase.
- `src/balanceSessionBridge.ts`: solicitudes atómicas entre UI y partida.
- `src/SapphireGem.tsx`: gema, fallback y conexión del nivel con la órbita.
- `src/SapphireOrbit3D.tsx`: partículas y estelas WebGL.
- `src/SapphireOrbit.css`: respaldo orbital CSS.
- `src/UpgradesPanelCompact.tsx`: panel y tarjetas.
- `src/UpgradeProgressBar.tsx`: animación nativa y reinicios cíclicos.
- `src/UpgradeProgressSystem.tsx`: portales y snapshots de barras.
- `src/gamepad.ts`: ajustes, selección por actividad y modalidad de entrada.
- `src/GamepadController.tsx`: navegación por zonas y hotkeys.
- `src/GamepadFocus.css`: foco explícito para modo gamepad.
- `src/ChromaticGamepadBridge.tsx`: navegación de la Cámara.
- `src/GamepadEventHaptics.tsx`: vibraciones sensibles a modalidad.
- `src/PulseTriggerSystem.tsx`: entradas y portal del Gatillo.
- `src/ChromaticChamberSystem.tsx`: acceso, Cámara e inspector.

## 9. Hallazgos de rendimiento que siguen vigentes

### P1 — `localStorage` como bus interno

`UpgradeProgressSystem`, `PulseTriggerSystem` y `ChromaticChamberSystem` releen y deserializan el guardado periódicamente. La recomendación es una fuente de snapshots en memoria y reservar `localStorage` para persistencia.

### P1 — Sondeo duplicado del mando

Existen bucles independientes en `GamepadController`, `PulseTriggerSystem` y `ChromaticGamepadBridge`. Conviene un servicio único de entrada, migrado por etapas y con prueba física completa.

### P1 — Guardado completo por cada cambio

`App` ejecuta `saveGameState(game)` con cada cambio principal. La recomendación es un coordinador `dirty`, debounce y guardados inmediatos solo en eventos críticos.

### P1/P2 — Relojes independientes

Conviven tick de 1 segundo, reloj de 100 ms, sondeos auxiliares, varios bucles de mando, WebGL y Web Animations API.

## 10. Validaciones realizadas y pendientes

### Realizadas

- Diagnóstico físico y validación de BUG-001.
- Diagnóstico del foco invisible: botones 12–15 correctos, ejes neutrales y cambio real de `document.activeElement`.
- Comprobación aislada de TypeScript estricto para seguimiento de modalidad.
- Integraciones autorizadas mediante PR #1, #2, #3, #4, #5 y #6.
- GitHub confirmó que todos estos PR eran fusionables contra su `main` correspondiente.
- Arturo reportó que las partículas orbitales funcionan correctamente en su entorno local.
- Arturo validó el editor de borradores del Laboratorio:
  - edición de costos y crecimiento;
  - comparación Oficial/Borrador;
  - errores por campos vacíos o secuencias inválidas;
  - restauración individual y global.
- Arturo validó la aplicación reversible a sesión:
  - cambio visible de costos;
  - cambio visible del Autoclicker;
  - cambio visible de Zafiro;
  - restauración inmediata del balance oficial;
  - cancelación y registro de Sobrecarga o PRISMA activos;
  - bloqueo de capacidad de esfera y parámetros aún no migrados;
  - regreso al balance oficial al recargar;
  - conservación del progreso normal.
- No quedan PR abiertos después de las integraciones.

### No afirmado / pendiente

- No hay GitHub Actions asociados a los commits de estas ramas.
- No se registró explícitamente en la conversación la salida textual de `npm run lint`.
- No se registró explícitamente en la conversación la salida textual de `npm run build`.
- Actualizar formalmente BUG-002 a validado físicamente cuando se complete su matriz específica.
- Repetir auditoría de rendimiento y una sesión prolongada cuando corresponda.

## 11. Orden recomendado para continuar

### Paso inmediato después de la fusión

1. En GitHub Desktop, cambiar a `main`.
2. Ejecutar **Fetch origin** y **Pull origin**.
3. Realizar una comprobación breve de humo del Laboratorio integrado:
   - abrir y cerrar;
   - aplicar un costo experimental;
   - restaurar la sesión oficial;
   - recargar y confirmar `official`.

No es necesario repetir toda la matriz manual ya validada salvo que aparezca una diferencia en `main`.

### Siguiente fase estructural — cobertura completa del Laboratorio

Crear una rama nueva, por ejemplo:

```text
Dev-Balance-Laboratory-Phase-4
```

Objetivo: eliminar la diferencia entre **parámetros aplicables** y **parámetros de solo simulación**.

Trabajo recomendado:

1. migrar a consultas dinámicas todos los consumidores de capacidad de esfera;
2. migrar textos, requisitos y estados visuales de Presión, Cavitación y Autoclicker;
3. migrar el prestigio requerido por Refracción en paneles y herramientas DEV;
4. eliminar de componentes las constantes históricas usadas como valores visuales;
5. ampliar la normalización para cambios de capacidad, desbloqueos y Presión;
6. mostrar antes de aplicar si la esfera pasa a llena o deja de estar llena;
7. definir qué ocurre con mejoras ya compradas cuando su desbloqueo se vuelve más alto;
8. habilitar la aplicación de Núcleo y desbloqueos únicamente cuando toda la UI comparta la misma fuente;
9. extender las comprobaciones de paridad y repetir prueba local.

La política recomendada es **no quitar niveles comprados** aunque un nuevo requisito quede por encima del progreso actual; el requisito solo impediría nuevas compras hasta volver a cumplirlo. Esta decisión debe confirmarse antes de programarse.

### Fase posterior — perfiles DEV persistentes

Cuando todos los parámetros sean aplicables de forma segura:

- guardar un perfil con nombre;
- cargarlo manualmente;
- reemplazarlo o eliminarlo;
- mostrar fecha y versión del esquema;
- exportar/importar JSON validado;
- mantener desactivada la carga automática por defecto;
- disponer siempre de **Restaurar balance oficial**.

### Siguiente etapa de contenido — Esmeralda

Después de cerrar la cobertura completa del Laboratorio, diseñar Esmeralda usando las herramientas de simulación:

1. identidad mecánica;
2. relación con Zafiro 5;
3. condición de activación;
4. recurso persistente, si aplica;
5. fórmula de obtención;
6. cinco niveles y costos;
7. beneficio visible;
8. interacción con cristalización;
9. desbloqueo de Amarilla;
10. migración del guardado y herramientas DEV.

Las decisiones aprobadas deberán incorporarse primero a `PLAN_MAESTRO.md` y `MODELO_MATEMATICO.md`.

### Trabajo estructural posterior

- fuente de snapshots en memoria;
- reducción de sondeos de `localStorage`;
- servicio unificado de entrada por etapas;
- coordinador de persistencia y migraciones;
- perfiles reproducibles de rendimiento.

No combinar varias refactorizaciones estructurales con la primera implementación de Esmeralda salvo necesidad técnica clara.

## 12. Optimizaciones que deben esperar

No implementar todavía: ECS, Typed Arrays para niveles, min-heap, Web Workers para el tick normal, IndexedDB, BigNumber sin definir escala, memoización indiscriminada, reescritura completa del reducer ni cambios simultáneos de arquitectura y balance.

## 13. Prompt recomendado para el siguiente chat

> Continúa el proyecto privado `xArtXtrAx/incremental-game-A`. La rama activa y estable es `main`. El estado integrado incluye PR #1 de rendimiento y selección robusta del gamepad (`8a6d628...`), PR #2 de navegación confinada y foco (`e429082...`), PR #3 de partículas orbitales del Zafiro (`438d93e...`), PR #4 de la base del Laboratorio (`90975a3...`), PR #5 del editor de borradores (`734aadd...`) y PR #6 de aplicación reversible y normalización (`852de78...`). Lee primero `HISTORIAL_GPT.MD`, `PLAN_MAESTRO.md`, `MODELO_MATEMATICO.md`, `BALANCE_LABORATORY.md`, `PERFORMANCE_AUDIT.md` y `GAMEPAD_DEVICE_SELECTION.md`. No integres ni elimines ramas sin autorización explícita. El Laboratorio permite editar y aplicar a sesión costos, Autoclicker y Zafiro; conserva progreso, registra normalizaciones, restaura valores oficiales y vuelve a `official` al recargar. Capacidad de esfera, Presión y desbloqueos siguen como solo simulación mediante una política central. Arturo validó localmente todas las pruebas funcionales de las fases 2 y 3. La siguiente fase recomendada es migrar todos los consumidores restantes y habilitar esos parámetros sin discrepancias visuales ni lógicas; después vendrían perfiles DEV persistentes y luego el diseño matemático de Esmeralda. No hay resultados textuales registrados de `npm run lint` ni `npm run build`. BUG-001 está validado; BUG-002 tiene corrección integrada y actualización formal pendiente. Trabaja de forma directa, evita comprobaciones redundantes y usa GitHub Desktop para el flujo local normal.