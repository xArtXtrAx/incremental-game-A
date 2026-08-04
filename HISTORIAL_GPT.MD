# HISTORIAL_GPT — Incremental Game A

> Bitácora compartida entre Arturo y GPT.
>
> **Regla para nuevos chats:** leer primero este archivo, `TESTING_POLICY.md`, `PLAN_MAESTRO.md`, `MODELO_MATEMATICO.md`, `BALANCE_LABORATORY.md`, `PERFORMANCE_AUDIT.md` y `GAMEPAD_DEVICE_SELECTION.md`; después comprobar el estado real del repositorio antes de modificarlo.

## 0. PRIORIDAD CENTRAL — Automatización de pruebas

La automatización de pruebas es una política obligatoria del proyecto y debe diseñarse junto con cada funcionalidad.

### Regla operativa

- Todo cambio funcional importante debe incluir pruebas automatizadas proporcionales a su riesgo.
- No se debe entregar a Arturo una matriz manual extensa cuando el comportamiento pueda verificarse razonablemente mediante Vitest, Playwright o GitHub Actions.
- La validación manual de Arturo se reserva principalmente para apariencia, experiencia de uso, WebGL, rendimiento perceptible, DualSense, vibración y diferencias específicas de Windows, Chrome, GPU o pantalla.
- Cada bug automatizable debe producir una prueba de regresión permanente.
- Nunca afirmar que lint, build o pruebas pasaron si no fueron ejecutados realmente.

La política completa, los comandos y los criterios se encuentran en `TESTING_POLICY.md`.

## 1. Estado real del repositorio

Estado comprobado el **3 de agosto de 2026, 23:36 CDMX**:

- Repositorio privado: `xArtXtrAx/incremental-game-A`.
- Rama estable: `main`.
- Último merge funcional comprobado en `main`: `89b78582699858d0d27acc07dd7971699b6411e1`.
- Integración más reciente: **PR #7 — Automatiza la Fase 4 y establece la política de pruebas**.
- Estado del PR #7: **fusionado**.
- Rama integrada: `Dev-Balance-Laboratory-Phase-4`.
- La rama de Fase 4 conserva **0 commits exclusivos** frente a `main` y está detrás únicamente por el merge commit.
- No hay pull requests abiertos.
- Las ramas DEV integradas se conservan como respaldos históricos y no deben eliminarse sin autorización explícita de Arturo.
- Entorno: React 19 + TypeScript 6 + Vite 8 + Motion.
- Guardado principal: `incremental-game-a:save:v1`.
- Ajustes de mando: `incremental-game-a:gamepad:v1`.
- Reserva del Gatillo: `incremental-game-a:pulse-trigger:v1`.
- Perfil experimental histórico: `incremental-game-a:balance-dev:v1`.

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

## 2. Fase 4 integrada

La Fase 4 del Laboratorio de Balance ya forma parte de `main`.

### Implementación integrada

- Capacidad de esfera dinámica en lógica y visuales.
- Bono de Presión dinámico.
- Desbloqueos dinámicos de Presión, Cavitación, Autoclicker, Sobrecarga y Refracción.
- Política autoritativa compartida por reducer, tarjetas, Comprar todo y previsualización.
- Previsualización del impacto antes de aplicar un perfil.
- Transición segura entre esfera completa e incompleta.
- Conservación de niveles comprados.
- Continuidad de sistemas comprados aunque se eleve un requisito experimental.
- Bloqueo únicamente de compras nuevas.
- Continuidad de Refracción comprada.
- Normalización y restauración oficial.
- Aplicación de todos los parámetros editables actuales a la sesión.

### Política acordada

> Elevar un requisito experimental nunca elimina niveles comprados ni detiene el sistema existente. Solo bloquea compras nuevas hasta volver a cumplir el requisito.

Sobrecarga conserva su nivel, pero no puede cargar mientras la esfera esté incompleta porque esa condición forma parte de su mecánica.

### Validación visual realizada

Arturo confirmó:

```text
3,000 clics
Capacidad experimental: 2,000
Resultado observado: NÚCLEO LLENO
```

## 3. Infraestructura de pruebas integrada

Componentes integrados mediante PR #7:

- Vitest.
- Playwright.
- GitHub Actions.
- `TESTING_POLICY.md`.
- `TESTING_SETUP.md`.
- `package-lock.json` actualizado.
- instalación reproducible mediante `npm ci`.
- reportes, capturas, video y trazas al fallar.

### Cobertura confirmada de Fase 4

Vitest:

- 20 pruebas unitarias de desbloqueos.
- 12 pruebas unitarias de normalización.
- 9 pruebas de integración.

Playwright:

- 4 recorridos completos en Chromium.

Total:

```text
41 pruebas Vitest
4 pruebas Playwright
45 comprobaciones automatizadas
```

### Último resultado confirmado en GitHub Actions

La ejecución **Quality Gate #20** sobre el último commit de la rama de Fase 4, `6f6384c10e7597fd1a4e2f1dfb405a2f6476bd6e`, terminó correctamente antes del merge:

```text
npm ci                     APROBADO
Lint                       APROBADO
Vitest                     41/41
Build de producción        APROBADO
Playwright Chromium         4/4
```

El merge commit `89b78582699858d0d27acc07dd7971699b6411e1` integra exactamente esa cabeza aprobada mediante PR #7.

## 4. Forma de trabajo obligatoria

- Trabajar de forma directa y evitar microcomprobaciones redundantes.
- Usar GitHub Desktop para el flujo local normal.
- Crear ramas nuevas para cambios importantes; no reutilizar ramas ya integradas.
- Diseñar las pruebas junto con cada funcionalidad.
- Agrupar validaciones.
- No mezclar refactorizaciones de rendimiento con fases de funcionalidad del Laboratorio.
- No hacer `force push` ni resets agresivos.
- No preparar ZIP, hashes o manifiestos salvo necesidad técnica clara.
- No eliminar ramas.
- No integrar a `main` sin autorización explícita de Arturo.
- Antes de integrar: confirmar CI en verde, comparar contra `main`, resumir cambios y esperar permiso.
- Mantener gameplay, fórmulas y visuales idénticos durante cambios exclusivamente documentales o de infraestructura salvo aprobación específica.

## 5. Estado jugable integrado en `main`

### Sistemas principales

- Núcleo incremental con energía, clics y producción.
- Nueve evoluciones, Comprar todo y categorías.
- Presión, Cavitación, Sobrecarga, Autoclicker, PRISMA y Gatillo de pulso.
- Cristalización, prestigio y Zafiro.
- Cámara Cromática.
- Panel DEV.
- Laboratorio de Balance con editor, simulación, previsualización, aplicación reversible y restauración oficial.
- Navegación por mouse, teclado y gamepad.

### Prestigio y Zafiro oficiales

- Capacidad: 5,000 clics.
- Multiplicadores: P0 ×1.00, P1 ×1.50, P2 ×1.85, P3 ×2.20, P4 ×2.60 y P5 ×3.05.
- Después de P5: +0.50 provisional por prestigio.
- Una a cinco partículas orbitales equidistantes según el nivel visual.

## 6. Controles DualSense / Gamepad integrados

- X/A pulsa la esfera.
- R2/RT activa el Gatillo.
- L1/LB selecciona Núcleo y R1/RB Evoluciones.
- Cruceta y joystick permanecen confinados en la zona activa.
- El juego detecta el dispositivo realmente activo.
- El foco del gamepad se dibuja explícitamente después de usar el mouse.
- Las vibraciones se suspenden al entrar en modalidad mouse.
- BUG-001 está validado físicamente.
- BUG-002 tiene corrección integrada y validación formal pendiente.

## 7. Arquitectura relevante

### Juego

- `src/game.ts`: estado, reducer, costos, guardado y consultas de balance.
- `src/App.tsx`: estado autoritativo, ticks, efectos y transiciones.
- `src/refraction.ts`: Matriz y PRISMA.
- `src/pulseTrigger.ts`: Gatillo de pulso.
- `src/bulkPurchase.ts`: Comprar todo.

### Laboratorio

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

### Pruebas

- `vitest.config.ts`
- `playwright.config.ts`
- `.github/workflows/quality-gate.yml`
- `tests/unit/`
- `tests/integration/`
- `tests/e2e/`

## 8. Riesgos de rendimiento vigentes

- `localStorage` todavía funciona parcialmente como bus interno.
- Existen varios bucles de sondeo del gamepad.
- El estado completo se guarda con cada cambio principal.
- Conviven varios relojes, WebGL y Web Animations API.

Estas refactorizaciones deben realizarse en ramas separadas y no mezclarse con la Fase 5.

## 9. Siguiente paso técnico — Fase 5

Crear una rama nueva desde el `main` actualizado:

```text
Dev-Balance-Laboratory-Phase-5
```

Objetivo: perfiles DEV persistentes del Laboratorio de Balance.

La Fase 5 debe permitir:

- asignar nombre a un perfil;
- guardar perfiles DEV;
- listar perfiles guardados;
- cargar un perfil manualmente;
- reemplazar un perfil existente;
- eliminarlo con confirmación;
- exportarlo como JSON;
- importar JSON validado;
- rechazar perfiles corruptos o incompatibles;
- mantener la carga automática desactivada;
- mantener siempre disponible la restauración oficial;
- conservar los perfiles separados de la partida normal;
- evitar modificar el esquema del guardado principal salvo necesidad demostrada.

Antes de implementar se debe inspeccionar el uso real de:

```text
incremental-game-a:balance-dev:v1
```

No se deben destruir perfiles existentes silenciosamente. La persistencia debe usar una estructura versionada y una migración explícita cuando corresponda.

## 10. Pruebas mínimas de Fase 5

Como sistema crítico, debe cubrir al menos:

- guardar un perfil válido;
- recuperar una lista de perfiles;
- cargarlo manualmente;
- reemplazarlo;
- eliminarlo;
- cancelar una eliminación;
- exportar JSON;
- importar JSON válido;
- rechazar JSON malformado;
- rechazar valores fuera de límites;
- rechazar versiones incompatibles;
- conservar el balance oficial;
- no cargar perfiles automáticamente al reiniciar;
- mantener separada la partida normal;
- restaurar el perfil oficial;
- evitar mutaciones de objetos almacenados;
- migrar una estructura anterior, cuando corresponda;
- impedir pérdida accidental de perfiles.

GitHub Actions debe ejecutar:

```text
npm ci
lint
Vitest
build
Playwright
```

## 11. Después de Fase 5

### Fase 6 — Plantillas matemáticas seguras

Evaluar curvas:

- exponenciales;
- lineales;
- potencia;
- raíz;
- logarítmicas;
- rendimientos decrecientes.

No se permiten expresiones JavaScript arbitrarias, `eval()` ni `new Function()`.

### Expansión de contenido — Esmeralda

Esmeralda debe diseñarse antes de programarse, definiendo:

1. identidad mecánica;
2. relación con Zafiro 5;
3. condición de activación;
4. recurso persistente;
5. fórmula de obtención;
6. cinco niveles y costos;
7. beneficio visible;
8. interacción con cristalización;
9. desbloqueo de la gema amarilla;
10. migración del guardado;
11. pruebas automatizadas desde el diseño.

La dirección temática de regeneración, reciclaje, conservación o renacimiento sigue siendo una hipótesis no aprobada.

## 12. Estado de pendientes

### Completado

- Confirmar CI definitivo de Fase 4.
- Comparar Fase 4 contra `main`.
- Actualizar el PR #7.
- Obtener autorización de integración.
- Fusionar PR #7.
- Integrar Vitest, Playwright, GitHub Actions y la política de pruebas.
- Actualizar esta bitácora después del merge.

### Pendiente actual

1. Crear `Dev-Balance-Laboratory-Phase-5` desde el `main` actualizado.
2. Diseñar la estructura versionada y la migración de perfiles DEV.
3. Implementar perfiles persistentes sin carga automática.
4. Añadir pruebas unitarias, de integración y Playwright proporcionales al riesgo.
5. Confirmar CI en verde.
6. Comparar la rama contra `main`.
7. Resumir cambios y esperar autorización explícita antes de integrar.

## 13. Prompt recomendado para continuidad

> Continúa el proyecto privado `xArtXtrAx/incremental-game-A`. Lee los documentos rectores y confirma siempre el estado real del repositorio. La última integración funcional es el PR #7 mediante merge `89b78582699858d0d27acc07dd7971699b6411e1`; Fase 4 y la infraestructura permanente de pruebas ya están integradas. No hay PR abiertos. La rama `Dev-Balance-Laboratory-Phase-4` se conserva como respaldo y no tiene commits exclusivos pendientes. La siguiente tarea es Fase 5 en una rama nueva: perfiles DEV persistentes, versionados, importables/exportables, separados de la partida normal y sin carga automática. Diseña las pruebas junto con la funcionalidad. No elimines ramas ni integres a `main` sin autorización explícita de Arturo.