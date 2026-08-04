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

Estado comprobado el **3 de agosto de 2026, 23:59 CDMX**:

- Repositorio privado: `xArtXtrAx/incremental-game-A`.
- Rama estable: `main`.
- HEAD de `main`: `b189ec18f99855a11be80964839a4d1c54b87b9d`.
- Ese HEAD es una actualización exclusivamente documental de esta bitácora.
- Último merge funcional en `main`: `89b78582699858d0d27acc07dd7971699b6411e1`.
- Integración funcional más reciente: **PR #7 — Automatiza la Fase 4 y establece la política de pruebas**.
- Rama integrada: `Dev-Balance-Laboratory-Phase-4`.
- La rama de Fase 4 conserva 0 commits exclusivos frente a `main`; se mantiene como respaldo y no debe eliminarse sin autorización.
- PR abierto: **#8 — Fase 5: perfiles DEV persistentes del Laboratorio**.
- Estado del PR #8: **borrador, abierto, no fusionado**.
- Rama de desarrollo activa: `Dev-Balance-Laboratory-Phase-5`.
- Base de Fase 5: `b189ec18f99855a11be80964839a4d1c54b87b9d`.
- Último commit funcional validado de Fase 5: `f13d7e5833910bb616b18c9eb889910fef9abc8e`.
- La rama estaba 13 commits adelante y 0 detrás de `main` antes de esta actualización documental final.
- Entorno: React 19 + TypeScript 6 + Vite 8 + Motion.
- Guardado principal: `incremental-game-a:save:v1`.
- Ajustes de mando: `incremental-game-a:gamepad:v1`.
- Reserva del Gatillo: `incremental-game-a:pulse-trigger:v1`.
- Perfil experimental heredado: `incremental-game-a:balance-dev:v1`.
- Colección versionada de perfiles: `incremental-game-a:balance-dev-profiles:v2`.

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

### Cobertura integrada de Fase 4

```text
41 pruebas Vitest
4 pruebas Playwright
45 comprobaciones automatizadas
```

Quality Gate confirmado antes del merge:

```text
npm ci                     APROBADO
Lint                       APROBADO
Vitest                     41/41
Build de producción        APROBADO
Playwright Chromium         4/4
```

## 4. Fase 5 implementada en rama DEV

La Fase 5 está implementada en `Dev-Balance-Laboratory-Phase-5` y permanece fuera de `main`.

### Diseño adoptado

La persistencia usa una colección nueva y versionada:

```text
incremental-game-a:balance-dev-profiles:v2
```

La clave anterior se conserva como fuente heredada y respaldo:

```text
incremental-game-a:balance-dev:v1
```

Reglas de migración:

1. Si la colección v2 no existe, se intenta validar el perfil v1.
2. Un perfil v1 válido se copia a v2.
3. La clave v1 nunca se borra ni se sobrescribe durante la migración.
4. Un perfil v1 corrupto se conserva sin crear una colección vacía.
5. Una colección v2 corrupta bloquea escrituras para impedir pérdida accidental.
6. Los perfiles nunca se cargan automáticamente.
7. La partida normal `incremental-game-a:save:v1` permanece separada e intacta.

### Funcionalidad implementada

- Asignar nombre a un perfil.
- Guardar múltiples perfiles DEV.
- Listar perfiles guardados.
- Cargar un perfil manualmente en la sesión.
- Reemplazar un perfil con confirmación.
- Eliminar un perfil con confirmación.
- Cancelar una eliminación sin modificar datos.
- Exportar un perfil como JSON versionado.
- Importar JSON validado.
- Rechazar JSON malformado.
- Rechazar valores fuera de límites.
- Rechazar versiones incompatibles.
- Impedir sobrescritura silenciosa de nombres duplicados.
- Devolver clones para evitar mutaciones accidentales.
- Restaurar siempre el balance oficial.
- Mantener la carga automática desactivada después de recargar.

### Interfaz

Se añadió un acceso `Perfiles DEV` al Panel de Desarrollador.

El Laboratorio conserva la edición y aplicación del borrador. El gestor de perfiles persiste el balance activo y permite cargarlo manualmente después.

### Archivos principales

- `src/balanceProfiles.ts`
- `src/BalanceProfileSystem.tsx`
- `src/BalanceProfileSystem.css`
- `tests/unit/balanceProfiles.test.ts`
- `tests/integration/balanceProfiles.integration.test.ts`
- `tests/e2e/balance-phase5.spec.ts`

No se modificaron reducer, fórmulas, costos ni mecánicas de gameplay durante Fase 5.

## 5. Pruebas de Fase 5

### Nuevas pruebas

Vitest:

- 18 pruebas unitarias de persistencia, validación, migración, corrupción e inmutabilidad.
- 7 pruebas de integración con runtime, carga manual y restauración oficial.

Playwright:

- 4 recorridos de Fase 5:
  - persistencia entre recargas sin carga automática, carga manual y restauración;
  - reemplazo, cancelación y eliminación confirmada;
  - exportación, descarga e importación válida;
  - rechazo visible de JSON malformado, límites y versiones incompatibles.

### Cobertura total de la rama

```text
66 pruebas Vitest
8 pruebas Playwright
74 comprobaciones automatizadas
```

### Quality Gate definitivo de código

Ejecución **Quality Gate #40**, run `30882312175`, sobre el commit funcional `f13d7e5833910bb616b18c9eb889910fef9abc8e`:

```text
npm ci                     APROBADO
Lint                       APROBADO — 0 errores
Vitest                     66/66
Build de producción        APROBADO
Playwright Chromium         8/8
```

Lint conserva únicamente tres advertencias históricas de Fast Refresh. La advertencia nueva de dependencias de Hooks detectada durante el desarrollo fue corregida.

Dos ejecuciones anteriores detectaron contratos imprecisos en selectores y texto de las pruebas E2E. Se corrigieron y la tercera ronda completa terminó verde. No se ocultaron ni ignoraron fallos.

## 6. Forma de trabajo obligatoria

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

## 7. Estado jugable integrado en `main`

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

## 9. Arquitectura relevante

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
- `src/balanceProfiles.ts`
- `src/BalanceProfileSystem.tsx`

### Pruebas

- `vitest.config.ts`
- `playwright.config.ts`
- `.github/workflows/quality-gate.yml`
- `tests/unit/`
- `tests/integration/`
- `tests/e2e/`

## 10. Riesgos de rendimiento vigentes

- `localStorage` todavía funciona parcialmente como bus interno.
- Existen varios bucles de sondeo del gamepad.
- El estado completo se guarda con cada cambio principal.
- Conviven varios relojes, WebGL y Web Animations API.

Estas refactorizaciones deben realizarse en ramas separadas y no se mezclaron con Fase 5.

## 11. Estado de pendientes

### Completado

- Corregir la bitácora posterior al merge de Fase 4 en `main`.
- Crear `Dev-Balance-Laboratory-Phase-5` desde el `main` actualizado.
- Diseñar la estructura versionada y la migración conservadora.
- Implementar perfiles persistentes sin carga automática.
- Añadir pruebas unitarias, de integración y Playwright proporcionales al riesgo.
- Ejecutar `npm ci`, lint, Vitest, build y Playwright en GitHub Actions.
- Obtener Quality Gate verde con 66/66 Vitest y 8/8 Playwright.
- Comparar la rama contra `main`.
- Abrir PR #8 en borrador.

### Pendiente actual

1. Confirmar el Quality Gate de esta actualización documental final.
2. Repetir la comparación definitiva contra `main`.
3. Realizar una validación manual breve de apariencia y experiencia del gestor de perfiles.
4. Mantener PR #8 en borrador hasta completar la revisión.
5. Resumir el estado final y esperar autorización explícita de Arturo antes de integrar.

## 12. Después de Fase 5

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

## 13. Prompt recomendado para continuidad

> Continúa el proyecto privado `xArtXtrAx/incremental-game-A`. Lee los documentos rectores y confirma siempre el estado real del repositorio. `main` contiene Fase 4 y la infraestructura de pruebas mediante PR #7; su último merge funcional es `89b78582699858d0d27acc07dd7971699b6411e1`. Fase 5 está implementada en `Dev-Balance-Laboratory-Phase-5` y presentada en el PR #8, que permanece en borrador y no debe integrarse sin autorización explícita. La Fase 5 añade una colección versionada `balance-dev-profiles:v2`, migración conservadora desde `balance-dev:v1`, carga manual, reemplazo y eliminación confirmados, importación/exportación JSON, rechazo de datos incompatibles y separación del guardado normal. El último Quality Gate funcional confirmado pasó `npm ci`, lint, 66/66 Vitest, build y 8/8 Playwright. Antes de cualquier merge, vuelve a comprobar CI, comparación contra `main`, estado del PR y autorización de Arturo.