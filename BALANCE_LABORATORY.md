# LABORATORIO DE BALANCE — Arquitectura y estado

> Documento técnico de la rama `Dev-Balance-Laboratory`.
>
> El objetivo es permitir inspección, simulación y futura edición de parámetros matemáticos sin introducir fórmulas duplicadas, estados inválidos ni corrupción del guardado normal.

## 1. Estado actual

### Implementado

- contrato tipado `BalanceConfig`;
- configuración oficial congelada `DEFAULT_BALANCE_CONFIG`;
- clave de almacenamiento DEV separada;
- validación de estructura, números finitos, rangos y relaciones;
- runtime reversible con fuente oficial, sesión o perfil almacenado;
- simulador puro de costos, Autoclicker y Zafiro;
- matriz de paridad del balance anterior;
- migración de fórmulas autoritativas en:
  - `src/game.ts`;
  - `src/refraction.ts`;
  - `src/pulseTrigger.ts`;
  - `src/bulkPurchase.ts`;
- límite real de Comprar todo centralizado en 320 iteraciones;
- primera ventana del Laboratorio dentro del Panel de Desarrollador;
- selector interactivo de curvas y diagnósticos.

### Bloqueado deliberadamente

- edición de valores;
- aplicación de perfiles a la sesión;
- carga automática del perfil almacenado;
- modificación del guardado normal;
- importación o ejecución de expresiones libres;
- uso de `eval()` o `new Function()`.

La ventana actual es de **solo lectura**.

## 2. Fuente de verdad

```text
DEFAULT_BALANCE_CONFIG
          │
          ▼
Balance Runtime
          │
          ├── game.ts
          ├── refraction.ts
          ├── pulseTrigger.ts
          ├── bulkPurchase.ts
          ├── simulación DEV
          └── futura interfaz editable
```

Las constantes exportadas históricas se conservan temporalmente como valores oficiales para compatibilidad. No deben utilizarse para implementar nuevas fórmulas dinámicas.

## 3. Guardados separados

Partida normal:

```text
incremental-game-a:save:v1
```

Perfil experimental:

```text
incremental-game-a:balance-dev:v1
```

Un perfil DEV inválido nunca debe modificar ni invalidar la partida normal.

## 4. Invariantes de seguridad

1. Una configuración se aplica completa o no se aplica.
2. Todo valor debe ser finito y estar dentro de límites absolutos.
3. El Autoclicker no puede superar el límite de operaciones por tick.
4. Comprar todo no puede superar el máximo de iteraciones configurado.
5. Las secuencias de Zafiro y facetas deben mantener un orden creciente.
6. La duración orbital mínima no puede superar la máxima.
7. Los umbrales mínimos no pueden superar sus umbrales base.
8. El código oficial sigue siendo la autoridad final.
9. No se admiten fórmulas JavaScript libres.
10. El perfil DEV no se carga automáticamente.
11. Restaurar valores oficiales siempre debe estar disponible antes de habilitar edición.

## 5. Paridad oficial

`src/balanceParity.ts` comprueba resultados conocidos de la versión anterior a la centralización, incluyendo:

- costos de todas las evoluciones;
- llenado de esfera y Presión;
- Zafiro P5 y P6;
- tasas del Autoclicker;
- umbral, duración y multiplicador de Sobrecarga;
- umbral y duración de Cavitación;
- facetas, carga, multiplicador, duración, recompensa y órbita de Refracción;
- tasa y costo del Gatillo de pulso.

Estas comprobaciones detectan cambios numéricos accidentales, pero no sustituyen `lint`, `build` ni pruebas físicas.

## 6. Requisitos antes de habilitar edición

- migrar todos los consumidores de `SPHERE_CLICK_CAPACITY` a una consulta dinámica;
- migrar indicadores y textos de requisitos en la interfaz;
- migrar límites y visuales del Gatillo;
- crear `normalizeGameStateForBalance()`;
- definir política para efectos temporales activos al cambiar parámetros;
- forzar rerender coordinado después de aplicar una configuración;
- suspender controles del reactor mientras la ventana esté abierta;
- añadir botones de previsualizar, aplicar sesión, guardar perfil y restaurar;
- ejecutar la matriz de paridad oficial;
- ejecutar `npm run lint`;
- ejecutar `npm run build`;
- completar pruebas físicas de mouse, teclado y gamepad.

## 7. Fases siguientes

### Fase 2 — Auditoría de consumidores

Localizar y migrar cualquier constante matemática todavía usada directamente por componentes, sistemas derivados o herramientas DEV.

### Fase 3 — Normalización y previsualización

Crear una simulación del impacto sobre la partida activa sin modificarla.

### Fase 4 — Edición de parámetros

Habilitar campos controlados, validación inmediata y comparación oficial/borrador.

### Fase 5 — Aplicación reversible

Aplicar a sesión, restaurar valores oficiales y guardar perfiles DEV separados.

### Fase 6 — Plantillas matemáticas

Evaluar curvas exponenciales, lineales, potencia, raíz, logarítmicas y rendimientos decrecientes mediante plantillas seguras. No aceptar código arbitrario.

## 8. Regla de integración

Esta rama no debe integrarse a `main` hasta que:

- el perfil oficial mantenga paridad completa;
- `lint` y `build` pasen;
- la ventana DEV sea usable y no interfiera con el juego;
- se compruebe que recargar sin perfil DEV conserva el comportamiento de `main`;
- Arturo autorice expresamente la integración.
