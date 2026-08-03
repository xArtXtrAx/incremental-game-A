# LABORATORIO DE BALANCE — Arquitectura y estado

> Documento técnico del sistema integrado en `main` y de la rama activa
> `Dev-Balance-Laboratory-Phase-2`.
>
> El objetivo es permitir inspección, simulación y edición controlada de parámetros matemáticos sin duplicar fórmulas, crear estados inválidos ni corromper el guardado normal.

## 1. Estado actual

### Base integrada en `main`

- contrato tipado `BalanceConfig`;
- configuración oficial congelada `DEFAULT_BALANCE_CONFIG`;
- clave de almacenamiento DEV separada;
- validación de estructura, números finitos, rangos y relaciones;
- runtime reversible con fuente oficial, sesión o perfil almacenado;
- simulador puro de costos, Autoclicker y Zafiro;
- matriz de paridad del balance anterior;
- fórmulas autoritativas centralizadas en:
  - `src/game.ts`;
  - `src/refraction.ts`;
  - `src/pulseTrigger.ts`;
  - `src/bulkPurchase.ts`;
- límite real de Comprar todo centralizado en 320 iteraciones;
- ventana inicial de inspección dentro del Panel de Desarrollador.

### Fase 2 implementada en la rama actual

- modelo independiente `src/balanceDraft.ts`;
- borrador completo clonado desde los valores oficiales;
- edición controlada de:
  - costos base y factores de crecimiento;
  - capacidad de esfera y bono de Presión;
  - requisitos de desbloqueo;
  - tasa inicial, crecimiento y límite del Autoclicker;
  - multiplicadores P1–P5 del Zafiro;
  - incremento provisional posterior a P5;
- validación inmediata mientras se escribe;
- comparación Oficial/Borrador;
- tablas recalculadas para costos, Autoclicker y Zafiro;
- restauración individual de cada campo;
- restauración completa del borrador oficial;
- contador de cambios, errores y advertencias;
- límites del motor visibles pero no editables;
- botón de aplicación presente pero deshabilitado hasta la fase de normalización.

La interfaz de esta fase es **editable**, pero el borrador sigue siendo únicamente una previsualización en memoria.

## 2. Flujo vigente

```text
DEFAULT_BALANCE_CONFIG
          │
          ├── gameplay oficial
          │     ├── game.ts
          │     ├── refraction.ts
          │     ├── pulseTrigger.ts
          │     └── bulkPurchase.ts
          │
          └── clon de borrador DEV
                ├── edición controlada
                ├── validación inmediata
                ├── comparación
                └── simulación pura
```

La edición no llama todavía a `applySessionBalanceConfig()`.

## 3. Guardados separados

Partida normal:

```text
incremental-game-a:save:v1
```

Perfil experimental:

```text
incremental-game-a:balance-dev:v1
```

En la Fase 2 el borrador no se guarda automáticamente. Cerrar el Laboratorio lo descarta.

## 4. Invariantes de seguridad

1. Una configuración se aplica completa o no se aplica.
2. Todo valor debe ser finito y permanecer dentro de límites absolutos.
3. Los límites operativos del motor no son editables desde el panel.
4. El Autoclicker no puede superar el máximo seguro de operaciones por tick.
5. Comprar todo no puede superar el máximo configurado de iteraciones.
6. Los multiplicadores P0–P5 deben conservar una secuencia estrictamente creciente.
7. La duración orbital mínima no puede superar la máxima.
8. Los umbrales mínimos no pueden superar sus umbrales base.
9. El perfil DEV no se carga automáticamente.
10. No se admiten expresiones JavaScript libres.
11. No se usa `eval()` ni `new Function()`.
12. Restaurar valores oficiales debe permanecer siempre disponible.

## 5. Auditoría de consumidores

### Ya consumen la configuración activa

- cálculos autoritativos de `src/game.ts`;
- costos y mecánicas de Refracción;
- costos, tasa, reserva y carga del Gatillo;
- simulación de Comprar todo;
- simulaciones del Laboratorio.

### Conservan constantes oficiales por compatibilidad visual

Se detectaron referencias históricas en componentes que todavía muestran requisitos o límites oficiales, principalmente:

- `src/App.tsx`;
- `src/GameCore.tsx`;
- `src/UpgradesPanelCompact.tsx`;
- `src/PulseTriggerSystem.tsx`.

Esto no crea discrepancias durante la Fase 2 porque el borrador no se aplica. Antes de habilitar la aplicación a sesión, esos consumidores deberán leer consultas dinámicas y reaccionar a una revisión nueva del runtime.

## 6. Paridad oficial

`src/balanceParity.ts` conserva comprobaciones conocidas de la versión anterior a la centralización:

- costos de todas las evoluciones;
- llenado de esfera y Presión;
- Zafiro P5 y P6;
- tasas del Autoclicker;
- Sobrecarga y Cavitación;
- Refracción;
- Gatillo de pulso.

La paridad detecta cambios numéricos accidentales, pero no sustituye `lint`, `build` ni pruebas físicas.

## 7. Bloqueos actuales

Permanecen deshabilitados:

- aplicar el borrador a la sesión;
- guardar o cargar perfiles desde la interfaz;
- carga automática de perfiles;
- modificación del guardado normal;
- edición de límites absolutos del motor;
- cambio de familia matemática;
- ejecución de expresiones personalizadas.

## 8. Requisitos para la Fase 3

Antes de habilitar `Aplicar a sesión`:

- migrar los consumidores visuales restantes a consultas dinámicas;
- crear `normalizeGameStateForBalance()`;
- definir la política para Sobrecarga y Refracción activas;
- normalizar cargas de Cavitación, Autoclicker y Gatillo;
- coordinar el rerender de todos los portales después de aplicar;
- suspender controles del reactor mientras el modal esté abierto;
- mostrar una lista previa de ajustes sobre la partida activa;
- implementar rollback a valores oficiales;
- ejecutar la matriz de paridad;
- ejecutar `npm run lint`;
- ejecutar `npm run build`;
- completar pruebas físicas de mouse, teclado y gamepad.

## 9. Fases siguientes

### Fase 3 — Normalización y aplicación reversible

- previsualizar el impacto sobre la partida activa;
- aplicar a esta sesión;
- restaurar valores oficiales;
- cancelar o normalizar estados incompatibles;
- no persistir el perfil automáticamente.

### Fase 4 — Perfiles DEV

- nombrar y guardar perfiles;
- cargar perfiles manualmente;
- importar y exportar JSON validado;
- mantener el guardado normal aislado.

### Fase 5 — Plantillas matemáticas

Evaluar curvas exponenciales, lineales, potencia, raíz, logarítmicas y rendimientos decrecientes mediante plantillas seguras. No aceptar código arbitrario.

## 10. Regla de integración

Esta rama no debe integrarse a `main` hasta que:

- `lint` y `build` pasen;
- el editor sea usable en escritorio y móvil;
- modificar y restaurar campos no altere el gameplay;
- cerrar y recargar mantenga el balance oficial;
- la comparación y los errores coincidan con los valores introducidos;
- Arturo autorice expresamente la integración.
