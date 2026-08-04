# HISTORIAL_GPT — Incremental Game A

> Bitácora compartida entre Arturo y GPT.
>
> **Regla para nuevos chats:** leer primero este archivo, `TESTING_POLICY.md`, `PLAN_MAESTRO.md`, `MODELO_MATEMATICO.md`, `BALANCE_LABORATORY.md`, `EXPERIMENTAL_CONTROL_CENTER.md`, `COMPARATIVE_EXPERIMENT_RUNNER.md`, `PERFORMANCE_AUDIT.md` y `GAMEPAD_DEVICE_SELECTION.md`; después comprobar el estado real del repositorio antes de modificarlo.

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

Estado comprobado el **4 de agosto de 2026, después del merge del PR #10**:

- Repositorio privado: `xArtXtrAx/incremental-game-A`.
- Rama estable: `main`.
- Último merge funcional: `217d94c2daa03c137351b651f78e8c5812b9c296`.
- Integración funcional más reciente: **PR #10 — Fase 5.6: Comparador de Experimentos A/B**.
- Estado del PR #10: **fusionado**.
- Rama integrada: `Dev-Comparative-Experiment-Runner`.
- HEAD validado de la rama: `4a380dcf8e12c584195766275b69975d3707a7b0`.
- La rama se conserva como respaldo y no debe eliminarse sin autorización explícita de Arturo.
- No hay pull requests abiertos.
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

## 2. Estado jugable integrado en `main`

### Sistemas principales

- Núcleo incremental con energía, clics y producción.
- Nueve evoluciones, categorías y Comprar todo.
- Presión, Cavitación, Sobrecarga, Autoclicker, PRISMA y Gatillo de pulso.
- Cristalización, prestigio y Zafiro.
- Cámara Cromática.
- Panel DEV.
- Laboratorio de Balance.
- Perfiles DEV persistentes.
- Centro de Control Experimental DEV.
- Comparador de Experimentos A/B.
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

Los accesos anteriores del Panel DEV se conservan temporalmente para mantener compatibilidad mientras la navegación unificada obtiene paridad completa.

### Escenarios base

Los escenarios se regeneran con la capacidad activa del núcleo:

1. Partida nueva.
2. Mitad del primer ciclo.
3. Núcleo casi lleno.
4. Antes de cristalizar.
5. Ciclo P1.
6. Ciclo P3.
7. Ciclo P5.

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

Aplicar otros escenarios durante la misma sesión no sustituye la línea base original.

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

### Métricas disponibles

- tiempo ejecutado;
- tiempo al núcleo lleno;
- tiempo a la primera cristalización;
- energía final;
- producción efectiva estimada;
- compras y acciones ejecutadas;
- tiempo total sin decisiones;
- mayor intervalo sin decisiones;
- cristalizaciones finales;
- primer acceso y nivel final por evolución;
- retorno promedio estimado por evolución;
- delta absoluto, porcentual y ventaja A/B.

### Límites de seguridad

```text
Duración máxima:        7,200 segundos por recorrido
Clics manuales:         20 por segundo
Acciones máximas:       250,000 por recorrido
Compras registradas:    2,000 como máximo
```

El límite efectivo también respeta `engineLimits.maximumBulkPurchaseIterations` del perfil evaluado.

## 6. Persistencia separada

| Sistema | Clave |
|---|---|
| Partida normal | `incremental-game-a:save:v1` |
| Ajustes de mando | `incremental-game-a:gamepad:v1` |
| Reserva del Gatillo | `incremental-game-a:pulse-trigger:v1` |
| Perfil de balance heredado | `incremental-game-a:balance-dev:v1` |
| Perfiles de balance | `incremental-game-a:balance-dev-profiles:v2` |
| Escenarios experimentales | `incremental-game-a:developer-scenarios:v1` |

El comparador solo lee perfiles y escenarios. No escribe en estas colecciones ni en la partida normal.

## 7. Infraestructura y resultados de pruebas

Componentes integrados:

- Vitest.
- Playwright.
- GitHub Actions.
- `TESTING_POLICY.md`.
- `TESTING_SETUP.md`.
- instalación reproducible mediante `npm ci`.
- reportes, capturas, video y trazas al fallar.

### Cobertura total integrada después del PR #10

```text
92 pruebas Vitest
13 pruebas Playwright
105 comprobaciones automatizadas
```

### Quality Gate final del Comparador A/B

Ejecución **Quality Gate #96**, run `30890096807`, sobre el HEAD validado `4a380dcf8e12c584195766275b69975d3707a7b0`:

```text
npm ci                     APROBADO
Lint                       APROBADO — 0 errores
Vitest                     92/92
Build de producción        APROBADO
Playwright Chromium         13/13
```

Los jobs reales de instalación, lint, Vitest, build y Playwright concluyeron correctamente antes del merge.

Lint conserva únicamente tres advertencias históricas de Fast Refresh. No se introdujeron advertencias nuevas.

Incidencias detectadas y corregidas durante CI:

- métricas no alcanzadas representadas como `null`, no como cero;
- contrato de prueba que asumía incorrectamente qué perfil debía ganar;
- importación sin uso bloqueada por TypeScript;
- selector Playwright mal delimitado;
- interacción legítima entre compra automática y tiempo exacto al núcleo.

No se ocultaron fallos ni se redujo cobertura para conseguir el resultado verde.

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
npm run test:all
```

### Validación local de Arturo

Arturo ejecutó correctamente en Windows:

```text
npm ci                     APROBADO
npm run build              APROBADO
Vulnerabilidades npm       0
```

Ese build se realizó antes de recibir el merge del PR #10. Arturo estaba ejecutando después la suite local completa; su resultado final todavía no había sido reportado al actualizar esta bitácora.

Después de actualizar `main`, debe hacer `Pull origin` antes de considerar que su copia local contiene el Comparador A/B.

## 8. Arquitectura relevante

### Juego

- `src/game.ts`: estado, reducer, costos, guardado y consultas de balance.
- `src/App.tsx`: estado autoritativo, ticks, efectos, aislamiento y reloj experimental.
- `src/DeveloperPanel.tsx`: controles directos de estado y host visual DEV.
- `src/refraction.ts`: Matriz y PRISMA.
- `src/pulseTrigger.ts`: Gatillo de pulso.
- `src/bulkPurchase.ts`: Comprar todo.

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

- `src/balanceRuntime.ts`: override transitorio mediante `runWithBalanceConfig()`.
- `src/comparativeExperiment.ts`: motor determinista, políticas, métricas y exportación.
- `src/ComparativeExperimentSystem.tsx`: interfaz del comparador.
- `src/ComparativeExperimentSystem.css`: presentación responsive.

### Pruebas

- `vitest.config.ts`
- `playwright.config.ts`
- `.github/workflows/quality-gate.yml`
- `tests/unit/`
- `tests/integration/`
- `tests/e2e/`

## 9. Controles DualSense / Gamepad integrados

- X/A pulsa la esfera.
- R2/RT activa el Gatillo.
- L1/LB selecciona Núcleo y R1/RB Evoluciones.
- Cruceta y joystick permanecen confinados en la zona activa.
- El juego detecta el dispositivo realmente activo.
- El foco del gamepad se dibuja explícitamente después de usar el mouse.
- Las vibraciones se suspenden al entrar en modalidad mouse.
- BUG-001 está validado físicamente.
- BUG-002 tiene corrección integrada y validación formal pendiente.

## 10. Forma de trabajo obligatoria

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

## 11. Riesgos y advertencias vigentes

- `localStorage` todavía funciona parcialmente como bus interno.
- Existen varios bucles de sondeo del gamepad.
- El estado completo se guarda con cada cambio principal.
- Conviven varios relojes, WebGL y Web Animations API.
- El bundle de producción ya supera la advertencia de 500 kB minificados; el PR #10 reportó aproximadamente 539.68 kB.
- Conviene aplicar lazy loading o code splitting a herramientas DEV en una rama independiente.
- GitHub Actions puede advertir que acciones internas orientadas a Node 20 se ejecutan con Node 24; no ha producido fallos del proyecto.

No mezclar estas refactorizaciones con Fase 6 salvo necesidad técnica demostrada.

## 12. Siguiente paso recomendado — Fase 6 matemática

La infraestructura esencial del Laboratorio ya está cerrada:

```text
Fase 4   aplicación completa y segura
Fase 5   perfiles DEV persistentes
Fase 5.5 escenarios y simulación determinista
Fase 5.6 comparador de experimentos A/B
```

El siguiente paso funcional es:

```text
Fase 6 — Plantillas matemáticas seguras
```

Rama sugerida:

```text
Dev-Balance-Mathematical-Templates
```

### Objetivo

Permitir construir variantes de balance mediante plantillas tipadas y explicables, evaluarlas con los escenarios reproducibles y compararlas contra el balance oficial antes de modificar fórmulas reales.

### Plantillas iniciales previstas

- lineal;
- exponencial;
- potencia;
- raíz;
- logarítmica;
- rendimientos decrecientes.

### Reglas de seguridad

- no usar `eval()`;
- no usar `new Function()`;
- no aceptar JavaScript arbitrario;
- usar discriminated unions y parámetros validados;
- limitar dominio, rango, exponentes, bases y número de muestras;
- impedir `NaN`, infinitos y divisiones inválidas;
- no aplicar automáticamente una plantilla a la partida;
- generar siempre un `BalanceConfig` validado antes de simular;
- conservar restauración oficial;
- ejecutar comparaciones por medio del Comparador A/B autoritativo.

### Primera entrega recomendada

1. Definir un contrato tipado para plantillas y parámetros.
2. Implementar evaluadores puros y seguros.
3. Añadir previsualización tabular de valores.
4. Convertir una plantilla válida en un borrador de `BalanceConfig`.
5. Permitir enviarla al Laboratorio como borrador, nunca aplicarla automáticamente.
6. Permitir guardarla como perfil DEV mediante confirmación explícita.
7. Compararla con Oficial o con otro perfil mediante el Comparador A/B.
8. Añadir exportación/importación versionada de especificaciones matemáticas.
9. Documentar límites y ejemplos en un archivo rector nuevo.
10. Diseñar pruebas unitarias, integración y Playwright desde el inicio.

### Cobertura mínima

- cada tipo de plantilla con valores normales;
- límites inferiores, superiores e igualdad exacta;
- parámetros inválidos;
- dominios inválidos;
- prevención de `NaN` e infinitos;
- determinismo;
- serialización y deserialización;
- conversión a `BalanceConfig`;
- rechazo por `balanceValidation`;
- aislamiento del runtime y del guardado;
- comparación A/B reproducible;
- recorrido completo de creación, previsualización, guardado y comparación.

## 13. Después de Fase 6 — Esmeralda

Una vez disponibles las plantillas matemáticas y la comparación A/B, comenzar el diseño formal de **Esmeralda** sobre evidencia medible.

Antes de programarla deben definirse:

1. identidad mecánica;
2. relación con Zafiro 5;
3. condición de activación;
4. recurso persistente;
5. fórmula de obtención;
6. cinco niveles y costos;
7. beneficio visible dentro del reactor;
8. interacción con cristalización;
9. condición de órbita completa;
10. desbloqueo de la gema amarilla;
11. migración del guardado;
12. pruebas automatizadas desde el diseño.

La idea de regeneración, reciclaje, conservación o renacimiento continúa siendo una hipótesis, no una especificación aprobada.

## 14. Prompt de continuidad para un nuevo chat

```text
Quiero continuar el desarrollo del repositorio privado xArtXtrAx/incremental-game-A.

Antes de modificarlo:
1. Lee HISTORIAL_GPT.MD, TESTING_POLICY.md, PLAN_MAESTRO.md, MODELO_MATEMATICO.md, BALANCE_LABORATORY.md, EXPERIMENTAL_CONTROL_CENTER.md, COMPARATIVE_EXPERIMENT_RUNNER.md, PERFORMANCE_AUDIT.md y GAMEPAD_DEVICE_SELECTION.md.
2. Comprueba el estado real de main, ramas, PRs y CI.
3. No reutilices ramas ya integradas.
4. No elimines ramas.
5. No hagas merge sin mi autorización explícita.
6. Diseña pruebas automatizadas junto con cada cambio.

Estado conocido al 4 de agosto de 2026:
- PR #10 Comparador de Experimentos A/B está integrado.
- Último merge funcional: 217d94c2daa03c137351b651f78e8c5812b9c296.
- Main incluye Laboratorio de Balance, perfiles DEV persistentes, Centro de Control Experimental, escenarios reproducibles, sesión aislada, simulación determinista, métricas y comparación A/B.
- Cobertura integrada validada: 92 Vitest + 13 Playwright = 105 comprobaciones.
- Quality Gate #96, run 30890096807, terminó completamente en verde sobre el HEAD funcional 4a380dcf8e12c584195766275b69975d3707a7b0.
- No hay PRs abiertos.
- Arturo confirmó localmente npm ci y npm run build antes del merge del PR #10; estaba ejecutando la suite completa y aún no había reportado su resultado final.

Siguiente paso recomendado:
Fase 6 — Plantillas matemáticas seguras, en una rama nueva Dev-Balance-Mathematical-Templates.

Primero verifica estos datos contra GitHub. Después presenta un diseño concreto y seguro para Fase 6 antes de implementar. No mezcles code splitting, refactorizaciones de rendimiento ni Esmeralda con esta primera entrega salvo necesidad técnica clara.
```