# LABORATORIO DE BALANCE — Arquitectura y estado

> Documento técnico del sistema de inspección, simulación y edición controlada del balance.
>
> El objetivo es experimentar con la economía sin duplicar fórmulas, introducir estados imposibles ni mezclar el perfil DEV con el guardado normal.

## 1. Estado actual

### Integrado en `main` mediante PR #4

- contrato tipado `BalanceConfig`;
- configuración oficial congelada `DEFAULT_BALANCE_CONFIG`;
- validación de estructura, números finitos, rangos y relaciones;
- runtime reversible con fuente `official`, `session` o `stored-profile`;
- guardado DEV separado de la partida;
- simulador puro de costos, Autoclicker y Zafiro;
- matriz de paridad del balance anterior;
- migración inicial de fórmulas autoritativas en `game.ts`, Refracción, Gatillo y Comprar todo;
- ventana de inspección dentro del Panel de Desarrollador.

### Integrado en `main` mediante PR #5

- editor de borradores en memoria;
- campos controlados para costos, núcleo, desbloqueos, Autoclicker y Zafiro;
- comparación Oficial/Borrador;
- restauración individual y global;
- detección de inflación, estancamiento, desbloqueos tardíos y límites finitos;
- comprobaciones de clonación, modificación y restauración del borrador.

### Implementado en `Dev-Balance-Laboratory-Phase-3`

- aplicación de configuraciones válidas únicamente a la sesión;
- restauración inmediata del balance oficial;
- normalización conservadora de la partida;
- reporte de los ajustes realizados durante la transición;
- cancelación de efectos temporales para evitar duraciones híbridas;
- separación estricta entre parámetros aplicables y parámetros todavía limitados a simulación.

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
          └── editor del Laboratorio
```

Las constantes históricas continúan exportándose temporalmente para compatibilidad. Ninguna fórmula nueva debe depender de ellas.

## 3. Guardados separados

Partida normal:

```text
incremental-game-a:save:v1
```

Perfil experimental:

```text
incremental-game-a:balance-dev:v1
```

La Fase 3 **no guarda automáticamente** el perfil aplicado. Recargar la página reconstruye el runtime con `DEFAULT_BALANCE_CONFIG`.

## 4. Aplicación atómica de sesión

El Laboratorio envía una solicitud síncrona a `App`:

```text
Borrador validado
      │
      ▼
Normalización pura de GameState
      │
      ▼
Aplicación completa al runtime
      │
      ▼
Reemplazo del estado normalizado
```

Si la validación falla, ni el runtime ni la partida cambian.

La restauración oficial utiliza el mismo proceso en sentido inverso.

## 5. Política de normalización

Se conservan:

- energía;
- clics acumulados;
- niveles comprados;
- prestigio;
- conteo histórico de descargas;
- último valor de recompensa registrado.

Se ajustan únicamente cuando es necesario:

- nivel del Gatillo, si excede su máximo;
- carga parcial de Cavitación;
- progreso fraccionario del Autoclicker;
- carga parcial de Sobrecarga;
- progreso orbital de Refracción;
- facetas cargadas.

Se cancelan al cambiar de perfil:

- Sobrecarga activa;
- PRISMA activo.

Esto evita conservar efectos temporales calculados con una configuración anterior.

## 6. Parámetros aplicables en Fase 3

### Aplicables a sesión

- costos base de las nueve evoluciones;
- crecimiento de las nueve curvas de costo;
- tasa inicial del Autoclicker;
- crecimiento del Autoclicker;
- tasa máxima del Autoclicker;
- multiplicadores P1–P5 del Zafiro;
- incremento provisional posterior a P5.

### Solo simulación

- capacidad de la esfera;
- bono de Presión por tramo;
- desbloqueo de Presión;
- desbloqueo de Cavitación;
- desbloqueo del Autoclicker;
- desbloqueo de Refracción.

Estos campos bloquean el botón de aplicación hasta migrar todos sus textos, barras y controles visuales restantes.

## 7. Invariantes de seguridad

1. Una configuración se aplica completa o no se aplica.
2. Todo valor debe ser finito y permanecer dentro de límites absolutos.
3. Los límites del motor no son editables.
4. El Autoclicker no puede superar el máximo de operaciones por tick.
5. Comprar todo conserva su límite de iteraciones.
6. Zafiro mantiene una secuencia estrictamente creciente.
7. No se admiten expresiones JavaScript libres.
8. No se usa `eval()` ni `new Function()`.
9. El perfil de sesión no se guarda automáticamente.
10. Restaurar valores oficiales siempre está disponible.
11. La partida normal no contiene una copia del perfil DEV.

## 8. Validación requerida de la Fase 3

### Automatizada/local

```powershell
npm run lint
npm run build
```

### Prueba funcional

1. modificar el costo base de una mejora;
2. aplicar a sesión y confirmar que el costo del juego cambia;
3. restaurar la sesión oficial y confirmar el valor original;
4. modificar el Autoclicker y observar la tasa en el reactor;
5. modificar Zafiro y comprobar el multiplicador mostrado;
6. activar Sobrecarga o PRISMA y aplicar un perfil;
7. confirmar que el efecto temporal se cancela y queda reportado;
8. intentar aplicar con un campo inválido;
9. intentar aplicar después de modificar capacidad o desbloqueos;
10. recargar y confirmar que vuelve el balance oficial.

## 9. Fases siguientes

### Fase 4 — Migración visual completa

- sustituir consumidores de `SPHERE_CLICK_CAPACITY` por consultas dinámicas;
- migrar requisitos visuales de desbloqueo;
- migrar textos del Panel DEV;
- habilitar aplicación de Núcleo y desbloqueos.

### Fase 5 — Perfiles persistentes

- asignar nombre;
- guardar perfil DEV;
- cargarlo manualmente;
- eliminarlo;
- exportar e importar JSON validado;
- mantener desactivada la carga automática por defecto.

### Fase 6 — Plantillas matemáticas

Evaluar curvas exponenciales, lineales, potencia, raíz, logarítmicas y rendimientos decrecientes mediante plantillas seguras.

## 10. Regla de integración

`Dev-Balance-Laboratory-Phase-3` no debe integrarse hasta que:

- `lint` y `build` pasen;
- aplicación y restauración funcionen en la misma sesión;
- el guardado normal permanezca intacto;
- recargar restaure el balance oficial;
- la normalización se compruebe con efectos temporales activos;
- Arturo autorice expresamente la integración.
