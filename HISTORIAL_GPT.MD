# HISTORIAL_GPT — Incremental Game A

> Bitácora compartida entre Arturo y GPT.
>
> **Regla para nuevos chats:** leer primero este archivo, `TESTING_POLICY.md`, `PLAN_MAESTRO.md`, `MODELO_MATEMATICO.md`, `BALANCE_LABORATORY.md`, `EXPERIMENTAL_CONTROL_CENTER.md`, `COMPARATIVE_EXPERIMENT_RUNNER.md`, `MATHEMATICAL_TEMPLATES.md`, `DEVELOPER_PANEL_WORKSPACE.md`, `PRESTIGE_CYCLE_OBSERVATORY.md`, `PRESTIGE_PROGRESSION_LABORATORY.md`, `PERFORMANCE_AUDIT.md` y `GAMEPAD_DEVICE_SELECTION.md`; después comprobar el estado real del repositorio antes de modificarlo.

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

Estado comprobado el **7 de agosto de 2026, después del merge del PR #14**:

- Repositorio: `xArtXtrAx/incremental-game-A`.
- Rama estable: `main`.
- Último merge funcional: `558ba2f22bd742b47b05e99af023625248cbad3e`.
- Integración funcional más reciente: **PR #14 — Laboratorio de Progresión de Prestigio pre-Esmeralda**.
- Estado del PR #14: **fusionado**.
- Rama integrada: `Dev-Prestige-Progression-Laboratory`.
- HEAD validado de la rama: `30b07869656fa8f2ae37dcc2095e8493f5737173`.
- Quality Gate validado: **#264**, run `31152816481`, completamente en verde.
- La rama integrada se conserva como respaldo y no debe eliminarse sin autorización explícita de Arturo.
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
| #11 | `Dev-Balance-Mathematical-Templates` | `1449d2284d3fdcfec46fdc7c0ed80b28ab88cce1` | Plantillas matemáticas seguras, transferencia al Laboratorio y comparación A/B transitoria |
| #12 | `Dev-Developer-Panel-Viewport` | `6e88c5f481cc030f76bc963db495265d030b1e3c` | Panel DEV acoplado, no bloqueante, responsive y con anchura configurable |
| #13 | `Dev-Prestige-Cycle-Observatory` | `82c139b7039fd2f31021c11d636ffeb0f8f96577` | Monitor de prestigio en vivo, simulación multiciclo, recuperación post-reset y métricas de Zafiro |
| #14 | `Dev-Prestige-Progression-Laboratory` | `558ba2f22bd742b47b05e99af023625248cbad3e` | Contrafactuales de Zafiro, curvas post-P5, estrategias de compra, rutas y lotes experimentales |

## 2. Estado jugable integrado en `main`

### Sistemas principales

- Núcleo incremental con energía, clics y producción.
- Nueve evoluciones, categorías y Comprar todo.
- Presión, Cavitación, Sobrecarga, Autoclicker, PRISMA y Gatillo de pulso.
- Cristalización, prestigio y Zafiro.
- Cámara Cromática y Nexo Prismático.
- Panel DEV acoplado, no bloqueante y redimensionable.
- Laboratorio de Balance y perfiles DEV persistentes.
- Centro de Control Experimental DEV.
- Comparador de Experimentos A/B.
- Plantillas Matemáticas Seguras.
- Observatorio de Ciclos y Prestigio.
- Laboratorio de Progresión de Prestigio.
- Navegación por mouse, teclado y gamepad.

### Prestigio y Zafiro oficiales

- Capacidad oficial: 5,000 clics.
- Multiplicadores: P0 ×1.00, P1 ×1.50, P2 ×1.85, P3 ×2.20, P4 ×2.60 y P5 ×3.05.
- Después de P5: +0.50 provisional por prestigio.
- Una a cinco partículas orbitales equidistantes según el nivel visual.

Estos valores siguen siendo **provisionales** mientras se estudia la transición a Esmeralda.

## 3. Arquitectura experimental integrada

### Laboratorio de Balance

- `DEFAULT_BALANCE_CONFIG` y `BalanceConfig` concentran los parámetros experimentables.
- El reducer conserva la autoridad del gameplay.
- Los perfiles DEV permanecen separados del guardado normal.
- La carga de perfiles es manual.
- Las colecciones corruptas bloquean escrituras para evitar pérdida accidental.
- Un requisito experimental elevado no elimina niveles ya comprados; solo bloquea compras nuevas hasta volver a cumplirlo.

Persistencia:

```text
Partida normal:                 incremental-game-a:save:v1
Perfil heredado:                incremental-game-a:balance-dev:v1
Perfiles DEV:                   incremental-game-a:balance-dev-profiles:v2
Escenarios experimentales:      incremental-game-a:developer-scenarios:v1
Anchura visual del Panel DEV:    incremental-game-a:developer-panel-width:v1
```

### Centro de Control Experimental

- Estado completo del juego.
- Escenarios base y snapshots personalizados.
- Sesión experimental aislada.
- Pausa y avance determinista.
- Métricas de producción y núcleo.
- Restauración exacta de la sesión original.
- Ninguna fórmula paralela al reducer.

### Comparador A/B

`runWithBalanceConfig()` instala un override transitorio y síncrono:

- no modifica el snapshot visible;
- no incrementa revisiones;
- no emite listeners;
- no escribe `localStorage`;
- admite overrides anidados;
- restaura siempre el balance anterior mediante `finally`.

### Plantillas Matemáticas Seguras

Familias disponibles:

- lineal;
- exponencial;
- potencia;
- raíz;
- logarítmica;
- rendimientos decrecientes.

No se usa `eval()`, `new Function()` ni expresiones JavaScript arbitrarias.

## 4. Observatorio de Ciclos y Prestigio

Documentación técnica:

```text
PRESTIGE_CYCLE_OBSERVATORY.md
```

### Monitor en vivo

- ciclo actual y siguiente;
- duración;
- multiplicador de Zafiro;
- ritmo observado de clics;
- clics restantes y estimación al núcleo;
- producción pasiva y potencia por clic;
- aporte directo estimado de Zafiro;
- historial únicamente en memoria.

### Simulación multiciclo

- hasta 10 ciclos;
- hasta 6 horas simuladas;
- hasta 500,000 acciones por perfil;
- mismo escenario, reloj, clics y política de compra para ambos candidatos;
- `gameReducer()` y `runWithBalanceConfig()` como autoridades;
- duración, energía generada/gastada, compras, tiempos sin decisiones e hitos;
- checkpoints de recuperación a 10, 30 y 60 segundos;
- exportaciones JSON/CSV;
- aislamiento total de la partida normal.

### Escenario `Inicio de ciclo P5`

Representa exactamente el estado posterior al reset:

```text
Prestigio: P5
Energía: 0
Núcleo: vacío
Evoluciones: reiniciadas
```

El Observatorio original usa la compra válida más barata como línea base reproducible. No pretende ser un optimizador global.

## 5. Laboratorio de Progresión de Prestigio integrado — PR #14

Documentación técnica:

```text
PRESTIGE_PROGRESSION_LABORATORY.md
```

Objetivo: experimentar con la progresión posterior a P5 antes de definir Esmeralda, sin añadir todavía recursos verdes ni gameplay oficial nuevo.

### 5.1 Contrafactual de Zafiro

Políticas disponibles:

1. **Oficial** — usa la curva vigente.
2. **Neutralizado ×1.00** — estima el recorrido sin aporte de Zafiro.
3. **Congelado en P5** — conserva ×3.05 y elimina crecimiento posterior.
4. **Incremento post-P5 configurable** — prueba incrementos alternativos.

La neutralización ×1 no se guarda como `BalanceConfig` inválido ni relaja `validateBalanceConfig()`. Se aplica únicamente dentro de la copia aislada de la corrida para estudiar el contrafactual.

### 5.2 Explorador de curvas post-P5

Barrido inicial integrado:

```text
+0.00
+0.10
+0.20
+0.30
+0.50
+0.70
```

Métricas principales:

- duración media;
- último ciclo;
- duración individual de cada ciclo;
- relación entre último y primer ciclo;
- detección de aceleración excesiva.

### 5.3 Estrategias de compra deterministas

- **Más barata** — línea base equivalente al Observatorio.
- **Producción** — prioriza generación y resonancia.
- **Manual** — favorece potencia de clic y sistemas ligados a interacción.
- **Automática** — favorece Autoclicker y producción autónoma.
- **ROI** — compara recuperación estimada de las compras disponibles.

Ninguna estrategia ejecuta compras fuera del reducer. Cada compra debe ser aceptada por `gameReducer()`.

### 5.4 Analizador de ruta

Registra:

- ciclo y segundo de cada compra;
- evolución comprada;
- costo real;
- nivel resultante;
- energía gastada por sistema;
- evolución dominante;
- sistemas nunca comprados;
- tiempo total sin decisiones;
- mayor intervalo sin decisiones.

Esto permite distinguir un ciclo simplemente corto de un ciclo que además conserva decisiones útiles.

### 5.5 Batch Experiment Runner

Combina sistemáticamente:

- políticas de Zafiro;
- estrategias de compra;
- tasas de clic manual.

La interfaz inicial ejecuta 60 combinaciones predeterminadas. El motor impone un máximo de seguridad de 240 corridas por lote.

### Aislamiento

El Laboratorio de Progresión:

- reutiliza `gameReducer()` para clics, ticks, compras y cristalización;
- reutiliza `runWithBalanceConfig()` para balances transitorios válidos;
- no escribe partida, perfiles ni escenarios;
- no modifica permanentemente el runtime visible;
- restaura el contexto experimental después de cada corrida;
- permanece confinado al workspace derecho del Panel DEV.

## 6. Quality Gate del PR #14

Ejecución **Quality Gate #264**, run `31152816481`, sobre el HEAD validado `30b07869656fa8f2ae37dcc2095e8493f5737173`:

```text
Install locked dependencies   APROBADO
Lint                          APROBADO
Vitest unit + integration     APROBADO
Build de producción           APROBADO
Playwright Chromium           APROBADO
```

La integración también comprueba:

- paridad con el Observatorio en modo Oficial + estrategia de compra equivalente;
- restauración del runtime visible después de contrafactuales;
- apertura del laboratorio dentro del Panel DEV;
- ejecución de un contrafactual desde navegador;
- preservación del guardado normal.

El merge autorizado por Arturo se realizó mediante PR #14 y produjo:

```text
558ba2f22bd742b47b05e99af023625248cbad3e
```

Comando dedicado:

```bash
npm run test:prestige-progression
```

## 7. Panel DEV y compatibilidad

El Panel DEV continúa con el contrato integrado en PR #12:

- no modal;
- juego visible y operable mientras una herramienta está abierta;
- anchura configurable entre 400 y 760 px con límites dinámicos;
- altura sincronizada con la superficie del juego;
- scroll interno;
- modo apilado en 1,280 px o menos;
- herramientas avanzadas confinadas a la columna derecha;
- foco protegido frente a deriva del gamepad dentro del workspace.

El nuevo Laboratorio de Progresión aparece como acceso `P↗` y usa cinco pestañas:

```text
Contrafactual
Curvas
Estrategias
Ruta
Lotes
```

## 8. Controles DualSense / Gamepad integrados

- X/A pulsa la esfera.
- R2/RT activa el Gatillo.
- L1/LB selecciona Núcleo y R1/RB Evoluciones.
- Cruceta y joystick permanecen confinados en la zona activa.
- El juego detecta el dispositivo realmente activo, no simplemente el primero enumerado.
- El foco del gamepad se dibuja explícitamente después de usar el mouse.
- Las vibraciones se suspenden al entrar en modalidad mouse.
- El Panel DEV mantiene el control flotante separado incluso al cambiar su anchura.
- BUG-001 está validado físicamente.
- BUG-002 conserva corrección integrada y validación formal pendiente.

Regla transversal: la enumeración indica disponibilidad, no intención del usuario. El mando principal debe inferirse por actividad real.

## 9. Arquitectura relevante

### Juego

- `src/game.ts`
- `src/App.tsx`
- `src/DeveloperPanel.tsx`
- `src/refraction.ts`
- `src/pulseTrigger.ts`
- `src/bulkPurchase.ts`

### Balance y perfiles

- `src/balanceConfig.ts`
- `src/balanceValidation.ts`
- `src/balanceRuntime.ts`
- `src/balanceStateNormalization.ts`
- `src/balanceUnlockPolicy.ts`
- `src/balanceSessionBridge.ts`
- `src/BalanceLaboratorySystem.tsx`
- `src/balanceProfiles.ts`
- `src/BalanceProfileSystem.tsx`

### Centro DEV

- `src/DeveloperControlCenterSystem.tsx`
- `src/developerExperimentBridge.ts`
- `src/developerScenarios.ts`
- `src/developerSimulation.ts`

### Comparador y plantillas

- `src/comparativeExperiment.ts`
- `src/ComparativeExperimentSystem.tsx`
- `src/mathematicalTemplates.ts`
- `src/mathematicalTemplateTransfer.ts`
- `src/MathematicalTemplateSystem.tsx`

### Observatorio

- `src/prestigeCycleLive.ts`
- `src/prestigeCycleObservatory.ts`
- `src/prestigeCycleScenarios.ts`
- `src/PrestigeCycleObservatorySystem.tsx`

### Laboratorio de Progresión

- `PRESTIGE_PROGRESSION_LABORATORY.md`
- `src/prestigeProgressionLaboratory.ts`
- `src/PrestigeProgressionLaboratorySystem.tsx`
- `src/PrestigeProgressionLaboratorySystem.css`
- `tests/unit/prestigeProgressionLaboratory.test.ts`
- `tests/integration/prestigeProgressionLaboratory.integration.test.ts`
- `tests/e2e/prestige-progression-laboratory.spec.ts`

## 10. Forma de trabajo obligatoria

- Crear ramas nuevas para cambios importantes; no reutilizar ramas integradas.
- Diseñar las pruebas junto con cada funcionalidad.
- No eliminar ramas.
- No hacer `force push` ni resets agresivos.
- No integrar a `main` sin autorización explícita de Arturo.
- Antes de integrar: confirmar CI en verde, comparar contra `main`, resumir cambios y esperar permiso.
- Mantener gameplay, fórmulas y visuales idénticos durante cambios exclusivamente documentales o de infraestructura salvo aprobación específica.
- No mezclar refactorizaciones de rendimiento con balance o contenido cromático salvo necesidad explícita.

## 11. Riesgos y advertencias vigentes

- `localStorage` todavía funciona parcialmente como bus interno.
- Existen varios bucles de sondeo del gamepad.
- El estado completo se guarda con cada cambio principal.
- Conviven varios relojes, WebGL y Web Animations API.
- Conviene evaluar lazy loading o code splitting de herramientas DEV en una rama independiente.
- No mezclar optimización del bundle con diseño o implementación de Esmeralda.
- Los nuevos experimentos son deterministas; percentiles y múltiples semillas no tienen utilidad hasta introducir aleatoriedad real.

## 12. Siguiente paso recomendado — Campaña experimental pre-Esmeralda

**No implementar Esmeralda todavía.** Primero utilizar el Observatorio y el Laboratorio de Progresión para responder con evidencia qué debe ocurrir después de P5.

### Campaña inicial recomendada

1. Ejecutar la línea base **Oficial** desde `Inicio de ciclo P5`.
2. Comparar **Oficial vs Congelado en P5**.
3. Comparar **Oficial vs Neutralizado ×1.00** para medir dependencia estructural de Zafiro.
4. Barrer incrementos post-P5 de +0.00 a +0.70.
5. Repetir con las cinco estrategias de compra.
6. Revisar rutas de compra y tiempo sin decisiones.
7. Ejecutar lotes con varias tasas de clic manual.
8. Identificar una zona de progresión que no produzca runaway ni ciclos muertos.
9. Usar esos resultados para decidir la identidad mecánica de Esmeralda.

### Preguntas que deben quedar respondidas antes de diseñar fórmulas verdes

1. ¿Zafiro debe quedar fijado definitivamente en P5?
2. ¿Debe existir crecimiento de Zafiro después de P5 o debe transferirse a Esmeralda?
3. ¿Qué parte de la aceleración post-P5 depende realmente de Zafiro?
4. ¿La progresión funciona con estilos manual, automático y equilibrado?
5. ¿Qué compras dominan los ciclos P5+?
6. ¿Dónde aparecen intervalos largos sin decisiones?
7. ¿Cuál es la duración objetivo razonable de P5→P6, P6→P7 y P7→P8?
8. ¿Esmeralda debe premiar duración, eficiencia, recuperación, automatización, conservación o alguna combinación de ellas?

Después de cerrar estas preguntas, crear una rama nueva para el diseño formal de Esmeralda y actualizar `PLAN_MAESTRO.md` y `MODELO_MATEMATICO.md` antes de programar gameplay de producción.

## 13. Prompt de continuidad para un nuevo chat

```text
Quiero continuar el desarrollo del repositorio xArtXtrAx/incremental-game-A.

Antes de modificarlo:
1. Lee HISTORIAL_GPT.MD, TESTING_POLICY.md, PLAN_MAESTRO.md, MODELO_MATEMATICO.md, BALANCE_LABORATORY.md, EXPERIMENTAL_CONTROL_CENTER.md, COMPARATIVE_EXPERIMENT_RUNNER.md, MATHEMATICAL_TEMPLATES.md, DEVELOPER_PANEL_WORKSPACE.md, PRESTIGE_CYCLE_OBSERVATORY.md, PRESTIGE_PROGRESSION_LABORATORY.md, PERFORMANCE_AUDIT.md y GAMEPAD_DEVICE_SELECTION.md.
2. Comprueba el estado real de main, ramas, PRs y CI.
3. No reutilices ramas ya integradas.
4. No elimines ramas.
5. No hagas merge sin mi autorización explícita.
6. Diseña pruebas automatizadas junto con cada cambio.

Estado conocido al 7 de agosto de 2026:
- PR #14 Laboratorio de Progresión de Prestigio está integrado.
- Último merge funcional: 558ba2f22bd742b47b05e99af023625248cbad3e.
- HEAD validado de la rama integrada: 30b07869656fa8f2ae37dcc2095e8493f5737173.
- Quality Gate #264, run 31152816481, terminó completamente en verde.
- Main incluye Observatorio de Prestigio y Laboratorio de Progresión con contrafactuales de Zafiro, exploración de curvas, estrategias de compra, análisis de rutas y lotes experimentales.
- La rama Dev-Prestige-Progression-Laboratory se conserva como respaldo.

Siguiente trabajo recomendado:
Ejecutar una campaña experimental pre-Esmeralda desde Inicio de ciclo P5. Comparar Oficial, Zafiro congelado y Zafiro neutralizado; barrer incrementos post-P5; repetir con estrategias de compra y tasas de clic; analizar rutas y tiempos sin decisiones. No programar Esmeralda hasta tener evidencia suficiente para decidir su identidad y la transición desde Zafiro.
```
