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

Estado comprobado el **4 de agosto de 2026, después del merge del PR #8**:

- Repositorio privado: `xArtXtrAx/incremental-game-A`.
- Rama estable: `main`.
- Último merge funcional en `main`: `b376f1310f2081749fc1d18991955c2c51a8148f`.
- Integración funcional más reciente: **PR #8 — Fase 5: perfiles DEV persistentes del Laboratorio**.
- Estado del PR #8: **fusionado**.
- Rama integrada: `Dev-Balance-Laboratory-Phase-5`.
- La rama de Fase 5 conserva **0 commits exclusivos** frente a `main` y está detrás únicamente por el propio merge commit.
- La rama DEV se conserva como respaldo y no debe eliminarse sin autorización explícita de Arturo.
- No hay pull requests abiertos.
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
| #8 | `Dev-Balance-Laboratory-Phase-5` | `b376f1310f2081749fc1d18991955c2c51a8148f` | Perfiles DEV persistentes, versionados, migrables, importables y exportables |

## 2. Laboratorio de Balance integrado

### Fase 4

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

## 3. Fase 5 integrada — Perfiles DEV persistentes

La Fase 5 forma parte de `main` mediante el PR #8.

### Persistencia

Colección nueva y versionada:

```text
incremental-game-a:balance-dev-profiles:v2
```

Fuente heredada y respaldo:

```text
incremental-game-a:balance-dev:v1
```

Partida normal, siempre separada:

```text
incremental-game-a:save:v1
```

### Reglas de migración y seguridad

1. Si la colección v2 no existe, se intenta validar el perfil v1.
2. Un perfil v1 válido se copia a v2.
3. La clave v1 nunca se borra ni se sobrescribe durante la migración.
4. Un perfil v1 corrupto se conserva sin crear una colección vacía.
5. Una colección v2 corrupta bloquea escrituras para impedir pérdida accidental.
6. Los perfiles nunca se cargan automáticamente.
7. La partida normal permanece separada e intacta.
8. Las lecturas devuelven clones para impedir mutaciones accidentales.

### Funcionalidad integrada

- Asignar nombre a un perfil.
- Guardar múltiples perfiles DEV.
- Listar perfiles guardados.
- Cargar manualmente un perfil en la sesión.
- Reemplazar un perfil con confirmación.
- Eliminar un perfil con confirmación.
- Cancelar una eliminación sin modificar datos.
- Exportar un perfil como JSON versionado.
- Importar JSON validado.
- Rechazar JSON malformado.
- Rechazar valores fuera de límites.
- Rechazar versiones incompatibles.
- Impedir sobrescrituras silenciosas por nombre duplicado.
- Restaurar siempre el balance oficial.
- Mantener la carga automática desactivada después de recargar.

### Interfaz integrada

El Panel de Desarrollador ahora ofrece accesos separados a:

- selector cromático temporal;
- Cámara Cromática;
- edición directa de energía, clics y cristalizaciones;
- Laboratorio de Balance;
- Perfiles DEV.

El Laboratorio edita, compara, diagnostica y aplica borradores a la sesión. El gestor de perfiles persiste configuraciones y exige carga manual.

No se modificaron reducer, fórmulas, costos ni mecánicas de gameplay durante Fase 5.

## 4. Infraestructura de pruebas

Componentes integrados:

- Vitest.
- Playwright.
- GitHub Actions.
- `TESTING_POLICY.md`.
- `TESTING_SETUP.md`.
- instalación reproducible mediante `npm ci`.
- reportes, capturas, video y trazas al fallar.

### Cobertura total integrada

```text
66 pruebas Vitest
8 pruebas Playwright
74 comprobaciones automatizadas
```

### Quality Gate final de Fase 5

Ejecución **Quality Gate #42**, run `30882566951`, sobre el HEAD validado `fc65d0c7883f1a66f5a756238bb208015e31dd3e`:

```text
npm ci                     APROBADO
Lint                       APROBADO — 0 errores
Vitest                     66/66
Build de producción        APROBADO
Playwright Chromium         8/8
```

Lint conserva únicamente tres advertencias históricas de Fast Refresh. La advertencia nueva de Hooks detectada durante el desarrollo fue corregida.

Dos ejecuciones anteriores detectaron contratos imprecisos en selectores y texto de las pruebas E2E. Se corrigieron y las ejecuciones finales completas terminaron verdes. No se ocultaron ni ignoraron fallos.

## 5. Forma de trabajo obligatoria

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

## 6. Estado jugable integrado en `main`

### Sistemas principales

- Núcleo incremental con energía, clics y producción.
- Nueve evoluciones, Comprar todo y categorías.
- Presión, Cavitación, Sobrecarga, Autoclicker, PRISMA y Gatillo de pulso.
- Cristalización, prestigio y Zafiro.
- Cámara Cromática.
- Panel DEV.
- Laboratorio de Balance con editor, simulación, previsualización, aplicación reversible y restauración oficial.
- Perfiles DEV persistentes y separados de la partida normal.
- Navegación por mouse, teclado y gamepad.

### Prestigio y Zafiro oficiales

- Capacidad: 5,000 clics.
- Multiplicadores: P0 ×1.00, P1 ×1.50, P2 ×1.85, P3 ×2.20, P4 ×2.60 y P5 ×3.05.
- Después de P5: +0.50 provisional por prestigio.
- Una a cinco partículas orbitales equidistantes según el nivel visual.

## 7. Controles DualSense / Gamepad integrados

- X/A pulsa la esfera.
- R2/RT activa el Gatillo.
- L1/LB selecciona Núcleo y R1/RB Evoluciones.
- Cruceta y joystick permanecen confinados en la zona activa.
- El juego detecta el dispositivo realmente activo.
- El foco del gamepad se dibuja explícitamente después de usar el mouse.
- Las vibraciones se suspenden al entrar en modalidad mouse.
- BUG-001 está validado físicamente.
- BUG-002 tiene corrección integrada y validación formal pendiente.

## 8. Arquitectura relevante

### Juego

- `src/game.ts`: estado, reducer, costos, guardado y consultas de balance.
- `src/App.tsx`: estado autoritativo, ticks, efectos y transiciones.
- `src/DeveloperPanel.tsx`: controles directos de estado y accesos DEV.
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

## 9. Riesgos de rendimiento vigentes

- `localStorage` todavía funciona parcialmente como bus interno.
- Existen varios bucles de sondeo del gamepad.
- El estado completo se guarda con cada cambio principal.
- Conviven varios relojes, WebGL y Web Animations API.

Estas refactorizaciones deben realizarse en ramas separadas y no se mezclaron con Fase 5.

## 10. Siguiente paso recomendado — Centro de Control Experimental DEV

Antes de añadir más campos aislados al Panel de Desarrollador, conviene convertirlo en una consola unificada para diseñar, ejecutar y comparar experimentos reproducibles.

Nombre provisional de la rama:

```text
Dev-Experimental-Control-Center
```

### Objetivo

Tener control completo de la experiencia sin contaminar la partida normal y poder responder con datos preguntas como:

- ¿cuánto tarda un jugador en comprar cada evolución?;
- ¿dónde aparece un cuello de botella?;
- ¿qué mejora ofrece el mejor retorno por segundo?;
- ¿cuánto tarda en llenarse el núcleo?;
- ¿cuánto tarda en llegar la primera cristalización?;
- ¿qué perfil produce una progresión más fluida?;
- ¿qué cambia entre dos perfiles bajo exactamente el mismo escenario inicial?

### Diseño recomendado

Un único Panel DEV con navegación interna:

1. **Estado** — energía, clics, cristalizaciones, niveles comprados, cargas y efectos activos.
2. **Balance** — acceso integrado al Laboratorio de Balance.
3. **Perfiles** — guardar, cargar, importar, exportar y comparar perfiles.
4. **Escenarios** — estados experimentales reproducibles separados de la partida normal.
5. **Simulación** — avanzar tiempo de forma determinista, pausar, ejecutar pasos y acelerar pruebas.
6. **Métricas** — tiempos, producción, retorno de inversión y cuellos de botella.
7. **Visual** — selector cromático y Cámara Cromática.
8. **Diagnóstico** — eventos, normalizaciones, advertencias y diferencias contra el balance oficial.

### Primera entrega recomendada

La primera rama no debe intentar construir todo a la vez. Debe establecer:

- shell unificado del Panel DEV con pestañas;
- estado DEV centralizado en vez de accesos agregados mediante portales independientes;
- escenarios nombrados y versionados, separados del guardado normal;
- escenarios base: partida nueva, mitad del primer ciclo, núcleo casi lleno, antes de cristalizar, P1, P3 y P5;
- captura y restauración de snapshots experimentales;
- vista previa de cambios antes de aplicar un escenario;
- pausa del reloj del juego y avance determinista por pasos;
- métricas iniciales: energía por segundo, clics por segundo, tiempo estimado al siguiente objetivo y tiempo estimado al núcleo lleno;
- pruebas unitarias, integración y Playwright desde el diseño.

### Política de seguridad

- Ningún escenario DEV se carga automáticamente.
- Ningún experimento modifica el guardado normal salvo una acción explícita y confirmada.
- La restauración oficial debe permanecer siempre visible.
- Los escenarios y resultados deben tener claves versionadas propias.
- No usar `eval()`, `new Function()` ni expresiones JavaScript arbitrarias.
- La simulación debe reutilizar las funciones autoritativas del juego y ser determinista.

## 11. Etapa posterior — Fase 6: Plantillas matemáticas seguras

Una vez que el Centro de Control pueda ejecutar y comparar escenarios, Fase 6 podrá añadir plantillas seguras para curvas:

- exponenciales;
- lineales;
- potencia;
- raíz;
- logarítmicas;
- rendimientos decrecientes.

Las plantillas deben alimentar el mismo Laboratorio y ejecutarse contra escenarios reproducibles. No se permiten expresiones JavaScript arbitrarias, `eval()` ni `new Function()`.

## 12. Expansión de contenido — Esmeralda

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

## 13. Estado de pendientes

### Completado

- Integrar Fase 4 y la infraestructura de pruebas.
- Implementar Fase 5 en una rama nueva.
- Diseñar migración conservadora desde `balance-dev:v1`.
- Añadir perfiles múltiples, carga manual e importación/exportación validada.
- Añadir pruebas unitarias, integración y Playwright.
- Obtener Quality Gate verde con 66/66 Vitest y 8/8 Playwright.
- Comparar Fase 5 contra `main`.
- Obtener autorización explícita de Arturo.
- Fusionar PR #8.
- Confirmar que la rama no conserva commits exclusivos.
- Actualizar esta bitácora después del merge.

### Pendiente actual

1. Diseñar el alcance formal del Centro de Control Experimental DEV.
2. Crear una rama nueva desde el `main` actualizado.
3. Unificar la navegación del Panel DEV sin cambiar gameplay.
4. Añadir escenarios experimentales y snapshots separados de la partida normal.
5. Añadir pausa, avance determinista y métricas iniciales.
6. Automatizar todos los escenarios razonablemente comprobables.
7. Mantener Fase 6 como la siguiente ampliación matemática sobre esta infraestructura.

## 14. Prompt recomendado para continuidad

> Continúa el proyecto privado `xArtXtrAx/incremental-game-A`. Lee los documentos rectores y confirma siempre el estado real del repositorio. La última integración funcional es el PR #8 mediante el merge `b376f1310f2081749fc1d18991955c2c51a8148f`. Fase 5 ya forma parte de `main` y añade perfiles DEV persistentes en `incremental-game-a:balance-dev-profiles:v2`, con migración conservadora desde `balance-dev:v1`, carga manual, reemplazo y eliminación confirmados, importación/exportación JSON, rechazo de datos incompatibles y separación del guardado normal. La cobertura integrada es 66 pruebas Vitest y 8 recorridos Playwright; Quality Gate #42 terminó verde. La siguiente mejora recomendada es un Centro de Control Experimental DEV unificado con escenarios reproducibles, snapshots, pausa, avance determinista y métricas de progresión. No elimines ramas, no mezcles refactorizaciones de rendimiento y no integres a `main` sin autorización explícita de Arturo.
