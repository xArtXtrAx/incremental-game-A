# HISTORIAL_GPT — Incremental Game A

> Bitácora compartida entre Arturo y GPT.
>
> **Regla para nuevos chats:** leer primero este archivo, `TESTING_POLICY.md`, `PLAN_MAESTRO.md`, `MODELO_MATEMATICO.md`, `BALANCE_LABORATORY.md`, `EXPERIMENTAL_CONTROL_CENTER.md`, `COMPARATIVE_EXPERIMENT_RUNNER.md`, `MATHEMATICAL_TEMPLATES.md`, `DEVELOPER_PANEL_WORKSPACE.md`, `PRESTIGE_CYCLE_OBSERVATORY.md`, `PERFORMANCE_AUDIT.md` y `GAMEPAD_DEVICE_SELECTION.md`; después comprobar el estado real del repositorio antes de modificarlo.

## 0. PRIORIDAD CENTRAL — Automatización de pruebas

La automatización es obligatoria y debe diseñarse junto con cada funcionalidad.

- Todo cambio funcional importante debe incluir pruebas proporcionales a su riesgo.
- Cada bug automatizable debe producir una prueba de regresión permanente.
- Vitest cubre lógica, transformaciones puras y contratos deterministas.
- Playwright cubre recorridos integrados de navegador.
- GitHub Actions ejecuta el Quality Gate completo.
- La validación manual de Arturo se reserva principalmente para apariencia, experiencia de uso, WebGL, rendimiento perceptible, DualSense, vibración y diferencias específicas de Windows, Chrome, GPU o pantalla.
- Nunca afirmar que lint, build o pruebas pasaron si no fueron ejecutados realmente.
- No entregar a Arturo matrices manuales extensas cuando el comportamiento pueda comprobarse razonablemente con automatización.

La política completa está en `TESTING_POLICY.md`.

## 1. Estado real del repositorio

Estado comprobado el **5 de agosto de 2026, después del merge del PR #13**:

- Repositorio: `xArtXtrAx/incremental-game-A`.
- Rama estable: `main`.
- Último merge funcional: `82c139b7039fd2f31021c11d636ffeb0f8f96577`.
- Integración funcional más reciente: **PR #13 — Observatorio de Ciclos y Prestigio**.
- Estado del PR #13: **fusionado**.
- Rama integrada: `Dev-Prestige-Cycle-Observatory`.
- HEAD validado de la rama: `e0a8c1b5d3ba9baddcd0f042807aa9e6d30b128c`.
- La rama se conserva como respaldo y no debe eliminarse sin autorización explícita de Arturo.
- No hay pull requests abiertos al cerrar la integración.
- Entorno: React 19 + TypeScript 6 + Vite 8 + Motion.

### Integraciones realizadas

| PR | Rama | Merge commit | Alcance |
|---|---|---|---|
| #1 | `Dev-Performance-Audit` | `8a6d628613d9dec47873a7a653e984a781ec2a04` | Auditoría de rendimiento y selección robusta del gamepad activo |
| #2 | `Dev-Gamepad-Zone-Navigation` | `e42908277ee45a9c59dfd885943e89e115d75c85` | Navegación confinada, foco visible, modalidad de entrada, hápticos y barras cíclicas |
| #3 | `Dev-Sapphire-Orbit-Particles` | `438d93e1011d1ebeb1ddef66162c35867b00ba4c` | Una partícula orbital por nivel del Zafiro, con distribución equidistante |
| #4 | `Dev-Balance-Laboratory` | `90975a3e49e5100f851865c17d7ac89cd393b136` | Configuración matemática central y primera ventana del Laboratorio de Balance |
| #5 | `Dev-Balance-Laboratory-Phase-2` | `734aadd83357e47a33b93f35efd271281d2cd63a` | Editor seguro de borradores, comparación Oficial/Borrador y diagnósticos |
| #6 | `Dev-Balance-Laboratory-Phase-3` | `852de786ded06e7e2ac1fbf16378dd7498489e39` | Aplicación reversible a sesión, normalización y restauración oficial |
| #7 | `Dev-Balance-Laboratory-Phase-4` | `89b78582699858d0d27acc07dd7971699b6411e1` | Fase 4 completa e infraestructura permanente de pruebas automatizadas |
| #8 | `Dev-Balance-Laboratory-Phase-5` | `b376f1310f2081749fc1d18991955c2c51a8148f` | Perfiles DEV persistentes, versionados, migrables, importables y exportables |
| #9 | `Dev-Experimental-Control-Center` | `046b8b3532e92b3f6dbb7000c7c5abe62c7253fa` | Escenarios reproducibles, sesión aislada, simulación determinista, métricas y navegación DEV unificada |
| #10 | `Dev-Comparative-Experiment-Runner` | `217d94c2daa03c137351b651f78e8c5812b9c296` | Comparador A/B determinista, métricas reproducibles y exportación JSON/CSV |
| #11 | `Dev-Balance-Mathematical-Templates` | `1449d2284d3fdcfec46fdc7c0ed80b28ab88cce1` | Plantillas matemáticas seguras, perfiles DEV, transferencia al Laboratorio y comparación A/B transitoria |
| #12 | `Dev-Developer-Panel-Viewport` | `6e88c5f481cc030f76bc963db495265d030b1e3c` | Panel DEV acoplado, no bloqueante, responsive y con anchura configurable |
| #13 | `Dev-Prestige-Cycle-Observatory` | `82c139b7039fd2f31021c11d636ffeb0f8f96577` | Monitor de prestigio en vivo, simulación multiciclo, recuperación post-reset y métricas de Zafiro |

## 2. Estado jugable integrado en `main`

### Sistemas principales

- Núcleo incremental con energía, clics y producción.
- Nueve evoluciones, categorías y Comprar todo.
- Presión, Cavitación, Sobrecarga, Autoclicker, PRISMA y Gatillo de pulso.
- Cristalización, prestigio y Zafiro.
- Cámara Cromática.
- Panel DEV acoplado, no bloqueante y redimensionable.
- Laboratorio de Balance.
- Perfiles DEV persistentes.
- Centro de Control Experimental DEV.
- Comparador de Experimentos A/B.
- Plantillas Matemáticas Seguras.
- Observatorio de Ciclos y Prestigio.
- Navegación por mouse, teclado y gamepad.

### Prestigio y Zafiro oficiales

- Capacidad oficial: 5,000 clics.
- Multiplicadores: P0 ×1.00, P1 ×1.50, P2 ×1.85, P3 ×2.20, P4 ×2.60 y P5 ×3.05.
- Después de P5: +0.50 provisional por prestigio.
- Una a cinco partículas orbitales equidistantes según el nivel visual.

## 3. Laboratorio de Balance integrado

### Fase 4

- Capacidad de esfera dinámica en lógica y visuales.
- Bono de Presión dinámico.
- Desbloqueos dinámicos de Presión, Cavitación, Autoclicker, Sobrecarga y Refracción.
- Política autoritativa compartida por reducer, tarjetas, Comprar todo y previsualización.
- Transición segura entre esfera completa e incompleta.
- Conservación de niveles comprados.
- Bloqueo únicamente de compras nuevas cuando aumenta un requisito experimental.
- Normalización de estado y restauración oficial.
- Aplicación reversible de parámetros a la sesión.

### Política acordada

> Elevar un requisito experimental nunca elimina niveles comprados ni detiene el sistema existente. Solo bloquea compras nuevas hasta volver a cumplir el requisito.

Sobrecarga conserva su nivel, pero no puede cargar mientras la esfera esté incompleta porque esa condición pertenece a su mecánica.

### Fase 5 — Perfiles DEV persistentes

Colección versionada:

```text
incremental-game-a:balance-dev-profiles:v2
```

Fuente heredada conservada:

```text
incremental-game-a:balance-dev:v1
```

Funcionalidad integrada:

- guardar múltiples perfiles nombrados;
- carga únicamente manual;
- reemplazo y eliminación con confirmación;
- importación y exportación JSON versionada;
- rechazo de JSON malformado, valores fuera de límites y versiones incompatibles;
- nombres duplicados rechazados;
- migración segura del perfil heredado;
- colecciones corruptas bloquean escrituras;
- restauración visible del balance oficial;
- separación estricta de la partida normal.

## 4. Fase 5.5 integrada — Centro de Control Experimental DEV

Documentación técnica:

```text
EXPERIMENTAL_CONTROL_CENTER.md
```

### Interfaz unificada

Pestañas integradas:

1. **Estado** — inspección completa de `GameState`.
2. **Escenarios** — escenarios base y snapshots personalizados.
3. **Simulación** — pausa, reanudación y avance temporal por pasos.
4. **Métricas** — producción, clic, Autoclicker, llenado y estimaciones.
5. **Herramientas** — Laboratorio de Balance, Perfiles DEV y Cámara Cromática.

### Escenarios base

Los escenarios se regeneran con la capacidad activa del núcleo:

1. Partida nueva.
2. Mitad del primer ciclo.
3. Núcleo casi lleno.
4. Antes de cristalizar.
5. Ciclo P1.
6. Ciclo P3.
7. Ciclo P5.

El Observatorio añade de forma aislada el escenario **Inicio de ciclo P5**, que representa el segundo posterior al reset con energía cero, núcleo vacío y evoluciones reiniciadas.

### Snapshots personalizados

Colección versionada:

```text
incremental-game-a:developer-scenarios:v1
```

Reglas:

- ningún escenario se carga automáticamente;
- los snapshots permanecen separados del guardado normal;
- los nombres duplicados se rechazan;
- las lecturas devuelven clones;
- una colección corrupta bloquea escrituras;
- la previsualización muestra diferencias campo por campo antes de aplicar.

### Sesión experimental aislada

Al aplicar un escenario:

1. se valida la estructura completa de `GameState`;
2. se captura una única línea base de la sesión normal;
3. se materializan los tiempos restantes de Sobrecarga y Refracción;
4. se reemplaza el estado visible;
5. se pausa el reloj principal;
6. se suspenden las escrituras automáticas de la partida normal.

`Restaurar sesión original` devuelve exactamente el estado previo al primer experimento, reanuda el reloj real y conserva el guardado normal.

### Simulación determinista

Pasos disponibles:

```text
1 s
10 s
60 s
300 s
900 s
3,600 s
```

- Cada segundo reutiliza `gameReducer()`.
- No existen fórmulas paralelas.
- El límite por operación es una hora.
- No se usa `eval()` ni `new Function()`.
- No se aceptan expresiones JavaScript arbitrarias.

## 5. Fase 5.6 integrada — Comparador de Experimentos A/B

Documentación técnica:

```text
COMPARATIVE_EXPERIMENT_RUNNER.md
```

### Objetivo cumplido

Comparar dos balances bajo exactamente el mismo escenario, marca temporal, política de clics, política de compras y condición de parada, sin modificar la partida normal ni el runtime visible.

### Flujo disponible

- seleccionar un escenario base o snapshot personalizado;
- seleccionar Balance Oficial o cualquier perfil DEV como candidato A y B;
- configurar duración y clics manuales por segundo;
- activar o desactivar compras automáticas;
- activar o desactivar cristalización automática;
- detener por duración, núcleo lleno, primera cristalización o evolución objetivo;
- mostrar resultados lado a lado;
- mostrar diferencias absolutas y porcentuales;
- exportar resultados JSON y CSV.

### Motor e aislamiento

`runWithBalanceConfig()` instala un override transitorio y síncrono:

- valida la configuración;
- no modifica `BalanceRuntimeSnapshot`;
- no incrementa la revisión;
- no emite listeners;
- no escribe `localStorage`;
- admite overrides anidados;
- restaura siempre el balance anterior mediante `finally`, incluso si la simulación falla.

Cada recorrido reutiliza `gameReducer()` para clics, ticks, compras y cristalizaciones. No existen fórmulas paralelas de gameplay.

### Política de compra determinista inicial

1. probar cada acción mediante `gameReducer()`;
2. descartar compras bloqueadas o no financiables;
3. elegir la compra válida de menor costo;
4. resolver empates con un orden estable;
5. repetir hasta agotar presupuesto o alcanzar límites.

Esta estrategia es una línea base reproducible, no un optimizador global.

## 6. Fase 6 integrada — Plantillas Matemáticas Seguras

Documentación técnica:

```text
MATHEMATICAL_TEMPLATES.md
```

### Alcance integrado

- familias lineal, exponencial, potencia, raíz, logarítmica y rendimientos decrecientes;
- parámetros, dominios, redondeos y límites validados;
- prevención de `NaN`, `Infinity` y desbordamientos;
- destinos para costos base, crecimiento de costos y Zafiro P1–P5;
- conversión obligatoria a un `BalanceConfig` aceptado por `validateBalanceConfig()`;
- previsualización Oficial/Borrador;
- importación y exportación JSON versionada;
- guardado opcional como perfil DEV con confirmación explícita;
- envío transitorio al borrador del Laboratorio sin aplicar la sesión;
- comparación A/B transitoria sin crear perfil DEV;
- transferencia únicamente en memoria, sin escribir la partida ni `localStorage`.

### Quality Gate final de Fase 6

Ejecución **Quality Gate #149**, run `30952073709`, sobre el HEAD validado `fe8230bb27179e7395e2ea8d49eaaed73759eab2`:

```text
npm ci                     APROBADO
Lint                       APROBADO — 0 errores
Vitest                     120/120
Build de producción        APROBADO
Playwright Chromium         17/17
```

El merge autorizado se realizó mediante PR #11 y produjo `1449d2284d3fdcfec46fdc7c0ed80b28ab88cce1`.

## 7. Panel DEV acoplado, no bloqueante y redimensionable

Documentación técnica:

```text
DEVELOPER_PANEL_WORKSPACE.md
```

### Contrato visual integrado

- altura sincronizada con la superficie principal del juego mediante `ResizeObserver`;
- scroll vertical interno y bloqueo de expansión horizontal;
- herramientas avanzadas confinadas al rectángulo derecho;
- juego visible, animado y operable mientras una herramienta está abierta;
- Cámara Cromática normal conservada a pantalla completa y vista DEV acoplada;
- superficies acopladas no modales con `aria-modal="false"`;
- foco protegido frente a deriva de DualSense dentro del workspace.

### Anchura configurable

```text
Compacto   440 px
Normal     33% del viewport, limitado a 400–640 px
Amplio     640 px
Rango      400–760 px
```

- arrastre desde el borde derecho;
- teclado con flechas, `Home` y `End`;
- máximo dinámico que reserva al menos 760 px para el juego;
- preferencia recuperada al volver a disponer de espacio;
- modo apilado automático en 1,280 px o menos;
- una sola variable CSS, `--developer-panel-width`, compartida por la cuadrícula y la posición del control flotante.

### Rendimiento y aislamiento

- las actualizaciones del arrastre se agrupan con `requestAnimationFrame`;
- `localStorage` se escribe al terminar el arrastre o seleccionar un preset;
- no se envían acciones al reducer;
- no se ejecutan simulaciones;
- no se modifica gameplay, balance ni guardado de partida.

## 8. Observatorio de Ciclos y Prestigio integrado

Documentación técnica:

```text
PRESTIGE_CYCLE_OBSERVATORY.md
```

### Monitor en vivo

- observa la sesión real mediante el puente experimental;
- muestra ciclo actual, prestigio, duración y multiplicador de Zafiro;
- calcula ritmo reciente de clics, clics restantes y estimación al núcleo;
- muestra producción pasiva, potencia por clic y aporte directo estimado de Zafiro;
- conserva el historial únicamente en memoria;
- continúa observando aunque la ventana esté cerrada;
- permite exportación JSON;
- no modifica la partida ni crea nuevas claves persistentes.

### Simulación multiciclo

- compara dos balances bajo un escenario idéntico;
- admite hasta 10 ciclos, 6 horas simuladas y 500,000 acciones por perfil;
- reutiliza `gameReducer()` y `runWithBalanceConfig()` como autoridades;
- usa una política determinista de compra más barata;
- registra duración, energía generada y gastada, compras y tiempos sin decisiones;
- registra primer Generador, Autoclicker y evolución avanzada;
- captura recuperación a 10, 30 y 60 segundos;
- produce cronología, gráfica relativa y exportaciones JSON/CSV;
- no modifica `GameState`, runtime visible, perfiles ni guardado normal.

### Escenario Inicio de ciclo P5

Representa exactamente el estado posterior al reset:

```text
Prestigio: P5
Energía: 0
Núcleo: vacío
Evoluciones: reiniciadas
```

El valor predeterminado de clics manuales es 2/s para permitir el bootstrap del primer Generador. Para experimentos de pasividad pura debe utilizarse un snapshot que ya tenga producción autónoma.

### Aporte directo de Zafiro

```text
AporteDirecto = Ganancia × (1 − 1 / MultiplicadorZafiro)
```

Esta métrica representa la contribución multiplicativa instantánea manteniendo fija la ruta de compras alcanzada. No debe presentarse como contrafactual causal completo.

### Incidencias cubiertas

- un escenario con núcleo lleno ahora cristaliza antes de comprar y perder mejoras en el reset;
- una regresión exige duración, gasto y compras iguales a cero para la cristalización inmediata;
- el escenario `Inicio de ciclo P5` evita confundir un estado avanzado con el comienzo real del ciclo;
- el recorrido E2E exige completar P5→P6 sin modificar el guardado normal.

## 9. Persistencia separada

| Sistema | Clave |
|---|---|
| Partida normal | `incremental-game-a:save:v1` |
| Ajustes de mando | `incremental-game-a:gamepad:v1` |
| Reserva del Gatillo | `incremental-game-a:pulse-trigger:v1` |
| Perfil de balance heredado | `incremental-game-a:balance-dev:v1` |
| Perfiles de balance | `incremental-game-a:balance-dev-profiles:v2` |
| Escenarios experimentales | `incremental-game-a:developer-scenarios:v1` |
| Anchura visual del Panel DEV | `incremental-game-a:developer-panel-width:v1` |

El Comparador y el Observatorio solo leen perfiles y escenarios. No escriben en estas colecciones ni en la partida normal. El historial del Observatorio se descarta al recargar.

## 10. Infraestructura y resultados de pruebas

Componentes integrados:

- Vitest.
- Playwright.
- GitHub Actions.
- `TESTING_POLICY.md`.
- `TESTING_SETUP.md`.
- instalación reproducible mediante `npm ci`.
- reportes, capturas, video y trazas al fallar.

### Cobertura total integrada después del PR #13

```text
151 pruebas Vitest
27 pruebas Playwright
178 comprobaciones automatizadas
```

### Quality Gate final del Observatorio

Ejecución **Quality Gate #248**, run `30979238920`, sobre el HEAD validado `e0a8c1b5d3ba9baddcd0f042807aa9e6d30b128c`:

```text
npm ci                     APROBADO
Lint                       APROBADO — 0 errores
Vitest                     151/151
Build de producción        APROBADO
Playwright Chromium         27/27
```

El merge autorizado se realizó mediante PR #13 y produjo `82c139b7039fd2f31021c11d636ffeb0f8f96577`.

### Quality Gate final del Panel DEV

Ejecución **Quality Gate #217**, run `30965419533`, sobre el HEAD validado `b276ed039f06a4dfe9e9ceca57adbbd7cf1f7492`:

```text
npm ci                     APROBADO
Lint                       APROBADO — 0 errores
Vitest                     129/129
Build de producción        APROBADO
Playwright Chromium         25/25
```

Lint conserva únicamente tres advertencias históricas de Fast Refresh. No se introdujeron advertencias nuevas.

No se ocultaron fallos ni se redujo cobertura para conseguir resultados verdes.

### Comandos oficiales

```bash
npm run test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:phase4
npm run test:phase5
npm run test:control-center
npm run test:comparative
npm run test:templates
npm run test:developer-panel
npm run test:prestige-observatory
npm run test:all
```

### Validación y autorización de Arturo

- Arturo validó visualmente en Windows el Panel DEV acoplado y su anchura configurable.
- Arturo aprobó el enfoque del Observatorio y autorizó explícitamente el merge del PR #13.
- Para recibir la integración local debe seleccionar `main` en GitHub Desktop y usar `Fetch origin` / `Pull origin`.

## 11. Arquitectura relevante

### Juego

- `src/game.ts`: estado, reducer, costos, guardado y consultas de balance.
- `src/App.tsx`: estado autoritativo, ticks, efectos, aislamiento y reloj experimental.
- `src/DeveloperPanel.tsx`: controles directos de estado y hosts visuales DEV.
- `src/refraction.ts`: Matriz y PRISMA.
- `src/pulseTrigger.ts`: Gatillo de pulso.
- `src/bulkPurchase.ts`: Comprar todo.

### Panel DEV acoplado

- `DEVELOPER_PANEL_WORKSPACE.md`
- `src/developerPanelWorkspace.ts`
- `src/DeveloperPanelWorkspace.css`
- `src/developerPanelWidth.ts`
- `src/DeveloperPanelWidthSystem.tsx`
- `src/DeveloperPanelWidthSystem.css`

### Laboratorio y perfiles

- `src/balanceConfig.ts`
- `src/balanceDraft.ts`
- `src/balanceValidation.ts`
- `src/balanceRuntime.ts`
- `src/balanceSimulation.ts`
- `src/balanceParity.ts`
- `src/balanceStateNormalization.ts`
- `src/balanceNormalizationParity.ts`
- `src/balanceUnlockPolicy.ts`
- `src/balanceSessionPolicy.ts`
- `src/balanceSessionBridge.ts`
- `src/BalanceLaboratorySystem.tsx`
- `src/balanceProfiles.ts`
- `src/BalanceProfileSystem.tsx`

### Centro de Control DEV

- `src/DeveloperControlCenterSystem.tsx`
- `src/DeveloperControlCenterSystem.css`
- `src/developerExperimentBridge.ts`
- `src/developerScenarios.ts`
- `src/developerSimulation.ts`
- `src/DeveloperToolLaunchBridge.tsx`
- `src/DeveloperControlCompatibility.css`

### Comparador A/B

- `src/balanceRuntime.ts`
- `src/comparativeExperiment.ts`
- `src/ComparativeExperimentSystem.tsx`
- `src/ComparativeExperimentSystem.css`

### Plantillas matemáticas

- `src/mathematicalTemplates.ts`
- `src/mathematicalTemplateTransfer.ts`
- `src/MathematicalTemplateSystem.tsx`
- `src/MathematicalTemplateSystem.css`

### Observatorio de Prestigio

- `PRESTIGE_CYCLE_OBSERVATORY.md`
- `src/prestigeCycleLive.ts`
- `src/prestigeCycleObservatory.ts`
- `src/prestigeCycleScenarios.ts`
- `src/PrestigeCycleObservatorySystem.tsx`
- `src/PrestigeCycleObservatorySystem.css`
- `tests/unit/prestigeCycleLive.test.ts`
- `tests/unit/prestigeCycleObservatory.test.ts`
- `tests/unit/prestigeCycleImmediateCrystallization.test.ts`
- `tests/unit/prestigeCycleScenarios.test.ts`
- `tests/integration/prestigeCycleObservatory.integration.test.ts`
- `tests/e2e/prestige-cycle-observatory.spec.ts`

### Pruebas

- `vitest.config.ts`
- `playwright.config.ts`
- `.github/workflows/quality-gate.yml`
- `tests/unit/`
- `tests/integration/`
- `tests/e2e/`

## 12. Controles DualSense / Gamepad integrados

- X/A pulsa la esfera.
- R2/RT activa el Gatillo.
- L1/LB selecciona Núcleo y R1/RB Evoluciones.
- Cruceta y joystick permanecen confinados en la zona activa.
- El juego detecta el dispositivo realmente activo.
- El foco del gamepad se dibuja explícitamente después de usar el mouse.
- Las vibraciones se suspenden al entrar en modalidad mouse.
- El Panel DEV mantiene el control flotante separado incluso al cambiar su anchura.
- BUG-001 está validado físicamente.
- BUG-002 tiene corrección integrada y validación formal pendiente.

## 13. Forma de trabajo obligatoria

- Trabajar de forma directa y evitar microcomprobaciones redundantes.
- Usar GitHub Desktop para el flujo local normal.
- Crear ramas nuevas para cambios importantes; no reutilizar ramas integradas.
- Diseñar las pruebas junto con cada funcionalidad.
- Agrupar validaciones.
- No mezclar refactorizaciones de rendimiento con fases funcionales salvo necesidad explícita.
- No hacer `force push` ni resets agresivos.
- No preparar ZIP, hashes o manifiestos salvo necesidad técnica clara.
- No eliminar ramas.
- No integrar a `main` sin autorización explícita de Arturo.
- Antes de integrar: confirmar CI en verde, comparar contra `main`, resumir cambios y esperar permiso.
- Mantener gameplay, fórmulas y visuales idénticos durante cambios exclusivamente documentales o de infraestructura salvo aprobación específica.

## 14. Riesgos y advertencias vigentes

- `localStorage` todavía funciona parcialmente como bus interno.
- Existen varios bucles de sondeo del gamepad.
- El estado completo se guarda con cada cambio principal.
- Conviven varios relojes, WebGL y Web Animations API.
- El bundle de producción del PR #13 mide aproximadamente 601.84 kB minificados y 177.29 kB gzip.
- Conviene aplicar lazy loading o code splitting a herramientas DEV en una rama independiente.
- GitHub Actions puede advertir que acciones internas orientadas a Node 20 se ejecutan con Node 24; no ha producido fallos del proyecto.

No mezclar la optimización del bundle con el diseño o implementación de Esmeralda. Deben permanecer como trabajos separados.

## 15. Siguiente paso recomendado — Diseño experimental de Esmeralda

Rama nueva propuesta:

```text
Dev-Emerald-Design
```

La siguiente entrega debe ser una fase de diseño y especificación, todavía sin programar gameplay oficial. El Observatorio permite ahora evaluar no solo fórmulas aisladas, sino su efecto a través de varios prestigios y durante la recuperación posterior a cada reset.

### Primera campaña experimental recomendada

1. ejecutar Oficial contra Oficial desde `Inicio de ciclo P5` para fijar la línea base;
2. crear un perfil con Zafiro congelado en ×3.05 después de P5;
3. crear uno o más perfiles que representen beneficios hipotéticos de Esmeralda;
4. simular P5→P6, P6→P7 y P7→P8 bajo condiciones idénticas;
5. comparar duración, recuperación a 10/30/60 s, energía, gasto y tiempos sin decisiones;
6. repetir con snapshots que ya tengan producción pasiva para medir rutas sin clics manuales;
7. conservar los resultados JSON/CSV como evidencia del diseño.

### Decisiones que deben cerrarse

1. identidad mecánica propia de Esmeralda;
2. relación con Zafiro nivel 5;
3. condición exacta de activación;
4. recurso o estado persistente nuevo;
5. fórmula de obtención;
6. cinco niveles, requisitos y costos;
7. beneficio visible dentro del reactor;
8. interacción con cristalización y prestigio total;
9. condición de órbita completa;
10. desbloqueo de la gema amarilla;
11. migración versionada del guardado;
12. métricas y escenarios de comparación;
13. pruebas unitarias, integración y E2E definidas desde el diseño;
14. presupuesto de rendimiento para la nueva etapa.

### Entregables de la fase de diseño

- `EMERALD_DESIGN.md` con identidad, bucles, estados y UX;
- actualización de `PLAN_MAESTRO.md`;
- actualización de `MODELO_MATEMATICO.md` con fórmulas propuestas claramente marcadas;
- perfiles y plantillas experimentales para comparar alternativas;
- matriz pequeña de escenarios A/B reproducibles;
- resultados exportados de la línea base y variantes;
- plan de migración y pruebas antes de crear código de producción.

La idea de regeneración, reciclaje, conservación o renacimiento continúa siendo una hipótesis. No debe tratarse como especificación aprobada hasta completar esta fase.

## 16. Prompt de continuidad para un nuevo chat

```text
Quiero continuar el desarrollo del repositorio xArtXtrAx/incremental-game-A.

Antes de modificarlo:
1. Lee HISTORIAL_GPT.MD, TESTING_POLICY.md, PLAN_MAESTRO.md, MODELO_MATEMATICO.md, BALANCE_LABORATORY.md, EXPERIMENTAL_CONTROL_CENTER.md, COMPARATIVE_EXPERIMENT_RUNNER.md, MATHEMATICAL_TEMPLATES.md, DEVELOPER_PANEL_WORKSPACE.md, PRESTIGE_CYCLE_OBSERVATORY.md, PERFORMANCE_AUDIT.md y GAMEPAD_DEVICE_SELECTION.md.
2. Comprueba el estado real de main, ramas, PRs y CI.
3. No reutilices ramas ya integradas.
4. No elimines ramas.
5. No hagas merge sin mi autorización explícita.
6. Diseña pruebas automatizadas junto con cada cambio.

Estado conocido al 5 de agosto de 2026:
- PR #13 Observatorio de Ciclos y Prestigio está integrado.
- Último merge funcional: 82c139b7039fd2f31021c11d636ffeb0f8f96577.
- Main incluye Laboratorio de Balance, perfiles DEV, Centro de Control Experimental, Comparador A/B, Plantillas Matemáticas Seguras, Panel DEV acoplado y Observatorio de Prestigio.
- Cobertura integrada validada: 151 Vitest + 27 Playwright = 178 comprobaciones.
- Quality Gate #248, run 30979238920, terminó completamente en verde sobre e0a8c1b5d3ba9baddcd0f042807aa9e6d30b128c.
- La rama Dev-Prestige-Cycle-Observatory se conserva como respaldo.

Siguiente trabajo recomendado:
Crear una rama nueva Dev-Emerald-Design y diseñar formalmente Esmeralda usando el Observatorio. Primero establecer una línea base Oficial contra Oficial desde Inicio de ciclo P5; después comparar Zafiro congelado en P5 y variantes hipotéticas de Esmeralda a través de varios prestigios. No mezclar esta fase con optimización del bundle.
```