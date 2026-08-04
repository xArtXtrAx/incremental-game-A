# HISTORIAL_GPT — Incremental Game A

> Bitácora compartida entre Arturo y GPT.
>
> **Regla para nuevos chats:** leer primero este archivo, `TESTING_POLICY.md`, `PLAN_MAESTRO.md`, `MODELO_MATEMATICO.md`, `BALANCE_LABORATORY.md`, `EXPERIMENTAL_CONTROL_CENTER.md`, `PERFORMANCE_AUDIT.md` y `GAMEPAD_DEVICE_SELECTION.md`; después comprobar el estado real del repositorio antes de modificarlo.

## 0. PRIORIDAD CENTRAL — Automatización de pruebas

La automatización es obligatoria y debe diseñarse junto con cada funcionalidad.

- Todo cambio funcional importante debe incluir pruebas proporcionales a su riesgo.
- Cada bug automatizable debe producir una prueba de regresión permanente.
- Vitest cubre lógica y contratos deterministas.
- Playwright cubre recorridos integrados de navegador.
- GitHub Actions ejecuta el Quality Gate completo.
- La validación manual de Arturo se reserva principalmente para apariencia, experiencia de uso, WebGL, rendimiento perceptible, DualSense, vibración y diferencias específicas de Windows, Chrome, GPU o pantalla.
- Nunca afirmar que lint, build o pruebas pasaron si no fueron ejecutados realmente.

La política completa está en `TESTING_POLICY.md`.

## 1. Estado real del repositorio

Estado comprobado el **4 de agosto de 2026, después del merge del PR #9**:

- Repositorio privado: `xArtXtrAx/incremental-game-A`.
- Rama estable: `main`.
- Último merge funcional: `046b8b3532e92b3f6dbb7000c7c5abe62c7253fa`.
- Integración funcional más reciente: **PR #9 — Centro de Control Experimental DEV**.
- Estado del PR #9: **fusionado**.
- Rama integrada: `Dev-Experimental-Control-Center`.
- HEAD validado de la rama: `20dbd56de4c368a63847d842ba375b6f97c4d7bb`.
- La rama conserva **0 commits exclusivos** frente a `main` y está detrás únicamente por el merge commit.
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

La primera entrega del Centro DEV forma parte de `main` mediante el PR #9.

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

Colección nueva y versionada:

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

### Métricas iniciales

- energía por segundo;
- energía por minuto;
- potencia por clic;
- clics automáticos por segundo;
- porcentaje de llenado del núcleo;
- clics restantes;
- tiempo estimado al núcleo lleno con la tasa automática actual;
- multiplicador temporal activo;
- multiplicador de Zafiro.

## 5. Persistencia separada

| Sistema | Clave |
|---|---|
| Partida normal | `incremental-game-a:save:v1` |
| Ajustes de mando | `incremental-game-a:gamepad:v1` |
| Reserva del Gatillo | `incremental-game-a:pulse-trigger:v1` |
| Perfil de balance heredado | `incremental-game-a:balance-dev:v1` |
| Perfiles de balance | `incremental-game-a:balance-dev-profiles:v2` |
| Escenarios experimentales | `incremental-game-a:developer-scenarios:v1` |

Ninguna colección sustituye a otra.

## 6. Infraestructura y resultados de pruebas

Componentes integrados:

- Vitest.
- Playwright.
- GitHub Actions.
- `TESTING_POLICY.md`.
- `TESTING_SETUP.md`.
- instalación reproducible mediante `npm ci`.
- reportes, capturas, video y trazas al fallar.

### Cobertura total integrada después del PR #9

```text
79 pruebas Vitest
11 pruebas Playwright
90 comprobaciones automatizadas
```

### Quality Gate final del Centro DEV

Ejecución **Quality Gate #71**, run `30885651811`, sobre el HEAD validado `20dbd56de4c368a63847d842ba375b6f97c4d7bb`:

```text
npm ci                     APROBADO
Lint                       APROBADO — 0 errores
Vitest                     79/79
Build de producción        APROBADO
Playwright Chromium         11/11
```

Playwright terminó con `11 passed (1.0m)`.

Lint conserva únicamente tres advertencias históricas de Fast Refresh. La advertencia nueva de React Hooks detectada durante el desarrollo fue corregida.

La primera ejecución E2E del Centro DEV encontró dos contratos imprecisos:

- un selector ambiguo del indicador de sesión;
- el bloqueo deliberado de clics sintéticos al lanzar una herramienta heredada.

Se añadió una prueba precisa y un puente restringido al Centro DEV. Las ejecuciones posteriores completas terminaron verdes. No se ocultaron ni ignoraron fallos.

Comando dedicado:

```bash
npm run test:control-center
```

## 7. Arquitectura relevante

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

- `src/DeveloperControlCenterSystem.tsx`: interfaz y navegación de la consola.
- `src/DeveloperControlCenterSystem.css`: diseño de la consola.
- `src/developerExperimentBridge.ts`: contrato entre la consola y `App`.
- `src/developerScenarios.ts`: escenarios, snapshots, validación y persistencia.
- `src/developerSimulation.ts`: avance determinista y métricas.
- `src/DeveloperToolLaunchBridge.tsx`: apertura restringida de herramientas existentes.
- `src/DeveloperControlCompatibility.css`: compatibilidad temporal con accesos antiguos.

### Pruebas

- `vitest.config.ts`
- `playwright.config.ts`
- `.github/workflows/quality-gate.yml`
- `tests/unit/`
- `tests/integration/`
- `tests/e2e/`

## 8. Controles DualSense / Gamepad integrados

- X/A pulsa la esfera.
- R2/RT activa el Gatillo.
- L1/LB selecciona Núcleo y R1/RB Evoluciones.
- Cruceta y joystick permanecen confinados en la zona activa.
- El juego detecta el dispositivo realmente activo.
- El foco del gamepad se dibuja explícitamente después de usar el mouse.
- Las vibraciones se suspenden al entrar en modalidad mouse.
- BUG-001 está validado físicamente.
- BUG-002 tiene corrección integrada y validación formal pendiente.

## 9. Forma de trabajo obligatoria

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

## 10. Riesgos de rendimiento vigentes

- `localStorage` todavía funciona parcialmente como bus interno.
- Existen varios bucles de sondeo del gamepad.
- El estado completo se guarda con cada cambio principal.
- Conviven varios relojes, WebGL y Web Animations API.
- El bundle de producción ya rebasa ligeramente la advertencia de 500 kB minificados.

Estas refactorizaciones deben realizarse en ramas específicas y no mezclarse accidentalmente con trabajo de balance.

## 11. Siguiente paso recomendado — Comparador de Experimentos A/B

La mejor evolución inmediata es convertir el Centro DEV de una consola de observación individual en una herramienta de **comparación reproducible entre dos perfiles de balance**.

Nombre provisional:

```text
Fase 5.6 — Comparative Experiment Runner
```

Rama sugerida:

```text
Dev-Comparative-Experiment-Runner
```

### Objetivo

Ejecutar el mismo escenario y el mismo horizonte temporal con dos configuraciones de balance distintas, sin modificar la partida normal, y responder con datos:

- ¿qué perfil llena antes el núcleo?;
- ¿qué perfil llega antes a la primera cristalización?;
- ¿cuál ofrece mejores decisiones de compra?;
- ¿dónde aparecen cuellos de botella?;
- ¿qué evolución ofrece mejor retorno?;
- ¿cuánto tiempo permanece el jugador sin una decisión útil?;
- ¿qué perfil produce una curva más fluida?

### Primera entrega recomendada

1. Seleccionar escenario inicial común.
2. Seleccionar Perfil A y Perfil B, incluyendo el balance oficial.
3. Elegir horizonte temporal o condición de parada.
4. Ejecutar ambos experimentos de manera determinista y fuera del estado visible del juego.
5. Mostrar resultados lado a lado.
6. Mostrar diferencias absolutas y porcentuales.
7. Registrar hitos:
   - núcleo lleno;
   - primera cristalización;
   - tiempo a cada evolución;
   - energía acumulada;
   - clics acumulados;
   - periodos sin compra viable.
8. Exportar un reporte JSON y CSV.

### Reglas de seguridad

- La simulación debe usar las funciones autoritativas del juego.
- Ningún perfil debe cargarse automáticamente en la partida visible.
- Las corridas deben ser reproducibles con el mismo escenario, perfil y semilla temporal.
- El guardado normal no debe modificarse.
- El tamaño de los lotes debe tener límites explícitos.
- Las comparaciones deben producir pruebas unitarias, de integración y E2E desde el diseño.

### Cobertura mínima propuesta

- igualdad exacta al comparar un perfil consigo mismo;
- resultados deterministas en ejecuciones repetidas;
- aislamiento total del guardado normal;
- aplicación independiente de Perfil A y Perfil B;
- condiciones de parada correctas;
- exportación consistente;
- recorrido Playwright completo del comparador.

Esta fase convertiría el Laboratorio y el Centro DEV en una herramienta realmente útil para decidir el balance antes de formalizar nuevas fórmulas.

## 12. Después del comparador — Fase 6 matemática

Una vez disponible la comparación A/B, conviene incorporar plantillas matemáticas seguras:

- exponencial;
- lineal;
- potencia;
- raíz;
- logarítmica;
- rendimientos decrecientes.

Cada plantilla deberá ejecutarse contra los mismos escenarios reproducibles y compararse con el balance oficial. Después podrá iniciarse el diseño formal de **Esmeralda** sobre evidencia medible en lugar de ajustes aislados.

## 13. Prompt de continuidad para un nuevo chat

```text
Quiero continuar el desarrollo del repositorio privado xArtXtrAx/incremental-game-A.

Antes de modificarlo:
1. Lee HISTORIAL_GPT.MD, TESTING_POLICY.md, PLAN_MAESTRO.md, MODELO_MATEMATICO.md, BALANCE_LABORATORY.md, EXPERIMENTAL_CONTROL_CENTER.md, PERFORMANCE_AUDIT.md y GAMEPAD_DEVICE_SELECTION.md.
2. Comprueba el estado real de main, ramas, PRs y CI.
3. No reutilices ramas ya integradas.
4. No hagas merge sin mi autorización explícita.
5. Diseña pruebas automatizadas junto con cada cambio.

Estado conocido al 4 de agosto de 2026:
- PR #9 Centro de Control Experimental DEV está integrado.
- Último merge funcional: 046b8b3532e92b3f6dbb7000c7c5abe62c7253fa.
- Main incluye Laboratorio de Balance, perfiles DEV persistentes, escenarios reproducibles, sesión experimental aislada, pausa y avance determinista, métricas y navegación DEV unificada.
- Cobertura integrada: 79 Vitest + 11 Playwright = 90 comprobaciones.
- No hay PRs abiertos.

Siguiente paso recomendado:
Fase 5.6 — Comparative Experiment Runner, en una rama nueva Dev-Comparative-Experiment-Runner.

Primero verifica estos datos contra GitHub y después explícame el plan concreto antes de implementar.
```
