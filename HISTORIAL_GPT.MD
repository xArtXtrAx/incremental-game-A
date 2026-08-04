# HISTORIAL_GPT — Incremental Game A

> Bitácora compartida entre Arturo y GPT.  
> **Regla para nuevos chats:** leer primero este archivo, `TESTING_POLICY.md`, `PLAN_MAESTRO.md`, `MODELO_MATEMATICO.md`, `BALANCE_LABORATORY.md`, `PERFORMANCE_AUDIT.md` y `GAMEPAD_DEVICE_SELECTION.md`; después comprobar la rama activa antes de modificar el proyecto.

## 0. PRIORIDAD CENTRAL — Automatización de pruebas

La automatización de pruebas es una política obligatoria del proyecto y debe considerarse desde el diseño de cada funcionalidad, no añadirse únicamente al final.

### Regla operativa

- Todo cambio funcional importante debe incluir pruebas automatizadas proporcionales a su riesgo.
- No se debe entregar a Arturo una matriz manual extensa cuando el comportamiento pueda verificarse razonablemente con Vitest, Playwright o GitHub Actions.
- La validación manual de Arturo debe reservarse para apariencia, experiencia de uso, WebGL, rendimiento perceptible, almacenamiento real del navegador, DualSense, vibración y diferencias particulares de hardware o sistema operativo.
- Cada bug automatizable debe producir una prueba permanente que impida su reaparición silenciosa.
- Nunca afirmar que una prueba pasó si no se ejecutó realmente.

### Escala recomendada

| Tipo de cambio | Unitarias | Integración | E2E | Manual |
|---|---:|---:|---:|---:|
| Corrección pequeña y aislada | 3–6 | 0–2 | 0–1 | humo breve si aplica |
| Función importante | 12–20 | 4–8 | 1–3 | revisión visual breve |
| Sistema crítico | 20–40+ | 6–12+ | 2–5+ | matriz física focalizada |

Sistemas críticos actuales: guardado y migraciones, cristalización y prestigio, Laboratorio de Balance, Comprar todo, producción, gamepad y nuevas gemas.

La política completa, comandos y criterios se encuentran en `TESTING_POLICY.md`.

## 1. Estado actual del repositorio

- Repositorio: `xArtXtrAx/incremental-game-A`.
- Rama estable: `main`.
- HEAD estable conocido de `main`: `1a7b327c7061e42a34a7cb9f248d39a881a4d5ee`.
- Rama de desarrollo activa: `Dev-Balance-Laboratory-Phase-4`.
- La rama de Fase 4 no está integrada y no tiene PR abierto todavía.
- Las ramas DEV integradas se conservan como respaldos históricos y no deben eliminarse sin autorización explícita.
- Entorno: React 19 + TypeScript 6 + Vite 8 + Motion.
- Guardado principal: `incremental-game-a:save:v1`.
- Ajustes de mando: `incremental-game-a:gamepad:v1`.
- Reserva del Gatillo: `incremental-game-a:pulse-trigger:v1`.
- Perfil experimental de balance: `incremental-game-a:balance-dev:v1`.
- Última actualización: **3 de agosto de 2026, 22:45 CDMX**.

### Integraciones realizadas

| PR | Rama | Merge commit | Alcance |
|---|---|---|---|
| #1 | `Dev-Performance-Audit` | `8a6d628613d9dec47873a7a653e984a781ec2a04` | Auditoría de rendimiento y selección robusta del gamepad activo |
| #2 | `Dev-Gamepad-Zone-Navigation` | `e42908277ee45a9c59dfd885943e89e115d75c85` | Navegación confinada, foco visible, modalidad de entrada, hápticos y barras cíclicas |
| #3 | `Dev-Sapphire-Orbit-Particles` | `438d93e1011d1ebeb1ddef66162c35867b00ba4c` | Una partícula orbital por nivel del Zafiro, con distribución equidistante |
| #4 | `Dev-Balance-Laboratory` | `90975a3e49e5100f851865c17d7ac89cd393b136` | Configuración matemática central y primera ventana del Laboratorio de Balance |
| #5 | `Dev-Balance-Laboratory-Phase-2` | `734aadd83357e47a33b93f35efd271281d2cd63a` | Editor seguro de borradores, comparación Oficial/Borrador y diagnósticos |
| #6 | `Dev-Balance-Laboratory-Phase-3` | `852de786ded06e7e2ac1fbf16378dd7498489e39` | Aplicación reversible a sesión, normalización y restauración oficial |

## 2. Infraestructura de pruebas automatizadas

### Estado implementado en `Dev-Balance-Laboratory-Phase-4`

- `vitest.config.ts`: ejecución en Node de pruebas unitarias e integración.
- `playwright.config.ts`: Chromium aislado, servidor Vite, trazas, capturas y video al fallar.
- `.github/workflows/quality-gate.yml`: lint, Vitest, build y Playwright en ramas DEV, PR y `main`.
- `TESTING_POLICY.md`: política rectora de pruebas.
- `.gitignore`: excluye reportes, trazas y cobertura locales.

### Comandos añadidos

```powershell
npm run test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:phase4
npm run test:all
```

### Cobertura creada para Fase 4

Vitest:

- `tests/unit/balanceUnlockPolicy.test.ts`: 20 casos sobre requisitos, planos, aumentos experimentales y Refracción.
- `tests/unit/balanceStateNormalization.test.ts`: 12 casos sobre transición de esfera, Presión, cargas, efectos y conservación de niveles.
- `tests/integration/balancePhase4.integration.test.ts`: 9 casos sobre runtime, reducer, Autoclicker, Comprar todo, Refracción y restauración.

Playwright:

- `tests/e2e/balance-phase4.spec.ts`: 4 recorridos completos:
  1. esfera incompleta → completa → incompleta → recarga oficial;
  2. cambio de Presión en resumen, clic y producción;
  3. Autoclicker comprado continúa activo mientras su siguiente compra queda bloqueada;
  4. Refracción comprada continúa avanzando mientras su siguiente compra queda bloqueada.

Total escrito hasta ahora:

```text
41 pruebas Vitest
4 pruebas Playwright
```

### Estado de ejecución

- Las pruebas están escritas, pero aún **no se afirma que pasen**.
- No hay resultados de GitHub Actions todavía porque la infraestructura acaba de añadirse y no existe PR de esta rama.
- `package.json` ya contiene Vitest y Playwright.
- `package-lock.json` todavía debe regenerarse con `npm install` y posteriormente incorporarse al repositorio.
- Antes de integrar, deben ejecutarse y corregirse lint, Vitest, build y Playwright.

## 3. Documentación rectora

### `TESTING_POLICY.md`

Define:

- qué debe automatizarse;
- cantidades orientativas;
- cobertura conceptual mínima;
- obligación de crear regresiones permanentes;
- responsabilidades de GitHub Actions;
- qué validación manual sigue siendo valiosa.

### `PLAN_MAESTRO.md`

Define la visión y secuencia cromática:

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

### `MODELO_MATEMATICO.md`

- Documenta costos, producción, Presión, Cavitación, Autoclicker, Sobrecarga, PRISMA, Gatillo y Zafiro.
- Distingue fórmulas Integradas, Provisionales, Propuestas y Pendientes.
- El código de `main` sigue siendo la autoridad final.

### `BALANCE_LABORATORY.md`

- Describe la arquitectura e invariantes del Laboratorio.
- Registra las fases #4, #5 y #6.
- La Fase 4 está implementada en rama y pendiente de validación automatizada e integración.

### División de responsabilidades

```text
TESTING_POLICY.md     → cómo se valida cada cambio
PLAN_MAESTRO.md       → hacia dónde va el juego
MODELO_MATEMATICO.md  → cómo se comporta matemáticamente
BALANCE_LABORATORY.md → cómo se inspecciona y modifica el balance
HISTORIAL_GPT.MD      → qué se hizo, integró y validó
PERFORMANCE_AUDIT.md  → riesgos y presupuestos de rendimiento
```

## 4. Forma de trabajo obligatoria

- Trabajar de forma directa y evitar microcomprobaciones redundantes.
- Usar GitHub Desktop para el flujo local normal.
- Crear ramas para cambios visuales, estructurales, mecánicos o de balance importantes.
- Diseñar las pruebas junto con la funcionalidad.
- Antes de integrar, comparar con `main`, explicar el alcance y esperar autorización explícita de Arturo.
- Nunca integrar a `main` ni eliminar ramas sin autorización explícita.
- Conservar ramas remotas como respaldo salvo instrucción contraria.
- Evitar `force push`, resets agresivos, ZIP, manifiestos y hashes salvo necesidad técnica clara.
- No afirmar que se ejecutaron lint, build, benchmarks o pruebas cuando no se ejecutaron realmente.
- Mantener gameplay, fórmulas y visuales idénticos durante refactorizaciones de infraestructura salvo aprobación específica.
- Una expansión cromática debe pasar por idea, documento, fórmulas, simulación, pruebas, rama, implementación e integración.

## 5. Estado jugable integrado en `main`

### Sistemas principales

- Núcleo incremental con energía, clics y producción.
- Nueve evoluciones, Comprar todo y categorías.
- Presión, Cavitación, Sobrecarga, Autoclicker, PRISMA y Gatillo de pulso.
- Cristalización, prestigio y Zafiro.
- Cámara Cromática.
- Panel DEV.
- Laboratorio de Balance con editor, simulación y aplicación reversible de costos, Autoclicker y Zafiro.
- Navegación por mouse, teclado y gamepad.

### Prestigio y Zafiro oficiales

- Capacidad: 5,000 clics.
- Multiplicadores: P0 ×1.00, P1 ×1.50, P2 ×1.85, P3 ×2.20, P4 ×2.60 y P5 ×3.05.
- Después de P5: +0.50 provisional por prestigio.
- Una a cinco partículas orbitales equidistantes según el nivel visual.

## 6. Laboratorio de Balance — Fase 4 en desarrollo

### Objetivo

Eliminar la diferencia entre parámetros aplicables y parámetros de solo simulación.

### Implementado

- Capacidad de esfera dinámica en lógica y visuales.
- Bono de Presión dinámico.
- Desbloqueos dinámicos de Presión, Cavitación, Autoclicker, Sobrecarga y Refracción.
- Política autoritativa compartida por reducer, tarjetas, Comprar todo y previsualización.
- Previsualización del impacto antes de aplicar.
- Reporte de esfera completa/incompleta, Presión y disponibilidad de compras.
- Conservación de niveles comprados.
- Los sistemas comprados continúan funcionando aunque un requisito experimental se eleve.
- Refracción comprada sigue avanzando; únicamente se bloquea la compra siguiente.
- El Panel DEV ya no elimina la Matriz al reducir el prestigio.
- Matriz interna de normalización ampliada.

### Política acordada

> Elevar un requisito experimental nunca elimina niveles comprados ni detiene el sistema existente. Solo bloquea compras nuevas hasta volver a cumplir el requisito.

Sobrecarga conserva su nivel, pero no puede cargar mientras la esfera esté incompleta porque esa condición forma parte de su mecánica.

### Validación manual realizada

Arturo completó la primera comprobación visual de Fase 4:

```text
3,000 clics
Capacidad experimental: 2,000
Resultado observado: NÚCLEO LLENO
```

Esta prueba manual es favorable, pero el resto de la matriz se trasladó a Vitest y Playwright para evitar trabajo repetitivo.

## 7. Controles DualSense / Gamepad integrados

- X/A pulsa la esfera.
- R2/RT activa el Gatillo.
- L1/LB selecciona Núcleo y R1/RB Evoluciones.
- Cruceta y joystick permanecen confinados en la zona activa.
- El juego detecta el dispositivo realmente activo.
- El foco del gamepad se dibuja explícitamente después de usar el mouse.
- Vibraciones se suspenden al entrar en modalidad mouse.
- BUG-001 está validado físicamente.
- BUG-002 tiene corrección integrada y validación formal pendiente.

## 8. Arquitectura relevante

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

## 9. Riesgos de rendimiento vigentes

- `localStorage` todavía funciona parcialmente como bus interno.
- Existen varios bucles de sondeo del gamepad.
- El estado completo se guarda con cada cambio principal.
- Conviven varios relojes, WebGL y Web Animations API.

No mezclar estas refactorizaciones con la primera implementación de Esmeralda salvo necesidad técnica clara.

## 10. Validaciones realizadas y pendientes

### Realizadas

- BUG-001 validado físicamente.
- Partículas orbitales validadas localmente por Arturo.
- Fases 2 y 3 del Laboratorio validadas localmente por Arturo.
- Fase 4: transición visual a Núcleo lleno validada por Arturo.
- Revisión estática de la rama y comparación contra `main`.
- 41 pruebas Vitest y 4 pruebas Playwright escritas.

### Pendientes obligatorios

1. Regenerar dependencias y `package-lock.json`.
2. Ejecutar `npm run lint`.
3. Ejecutar `npm run test`.
4. Ejecutar `npm run build`.
5. Instalar Chromium de Playwright.
6. Ejecutar `npm run test:e2e`.
7. Corregir cualquier fallo real.
8. Confirmar GitHub Actions en verde.
9. Realizar una revisión visual humana breve.
10. Abrir PR e integrar solo con autorización explícita.

## 11. Orden recomendado para continuar

### Inmediato — estabilizar la suite

```powershell
npm install
npx playwright install chromium
npm run test:all
```

Después:

- incorporar el `package-lock.json` regenerado;
- corregir pruebas o implementación según los resultados;
- reducir selectores E2E frágiles si aparece inestabilidad;
- abrir PR cuando la suite esté verde;
- pedir a Arturo únicamente una comprobación visual breve.

### Fase 5 — perfiles DEV persistentes

Después de integrar Fase 4:

- nombrar y guardar perfiles;
- cargarlos manualmente;
- reemplazarlos o eliminarlos;
- exportar/importar JSON validado;
- mantener desactivada la carga automática;
- restaurar siempre el balance oficial.

### Etapa de contenido — Esmeralda

Después de cerrar la infraestructura esencial del Laboratorio:

1. identidad mecánica;
2. relación con Zafiro 5;
3. condición de activación;
4. recurso persistente;
5. fórmula de obtención;
6. niveles y costos;
7. beneficio visible;
8. interacción con cristalización;
9. desbloqueo de Amarilla;
10. pruebas automatizadas desde el diseño.

## 12. Optimizaciones que deben esperar

No implementar todavía: ECS, Typed Arrays para niveles, min-heap, Web Workers para el tick normal, IndexedDB, BigNumber sin definir escala, memoización indiscriminada ni reescritura completa del reducer.

## 13. Prompt recomendado para el siguiente chat

> Continúa el proyecto privado `xArtXtrAx/incremental-game-A`. Lee primero `HISTORIAL_GPT.MD` y `TESTING_POLICY.md`, después los demás documentos rectores. La rama estable es `main` en `1a7b327...`; la rama activa de desarrollo es `Dev-Balance-Laboratory-Phase-4` y no debe integrarse sin autorización explícita. La Fase 4 habilita capacidad de esfera, Presión y desbloqueos dinámicos, conserva niveles comprados y añade previsualización. Arturo validó visualmente el caso 3,000 clics con capacidad 2,000 mostrando NÚCLEO LLENO. Se creó infraestructura Vitest + Playwright + GitHub Actions con 41 pruebas Vitest y 4 E2E, pero todavía no se afirma que pasen: falta ejecutar dependencias, lint, test, build y Playwright, corregir fallos y confirmar CI. La automatización es prioridad central; no pedir a Arturo matrices manuales extensas cuando puedan automatizarse. No elimines ramas, no hagas merge sin permiso y registra cada bug con una prueba permanente.
