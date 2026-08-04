# LABORATORIO DE BALANCE — Arquitectura y estado

> Documento técnico del sistema de inspección, simulación, aplicación y persistencia controlada del balance.
>
> El objetivo es experimentar con la economía sin duplicar fórmulas, introducir estados imposibles ni mezclar perfiles DEV con el guardado normal.

## 1. Estado actual

### Integrado en `main`

- PR #4: contrato tipado, configuración oficial, runtime reversible, validación y primera ventana.
- PR #5: editor de borradores, comparación Oficial/Borrador, restauración y diagnósticos.
- PR #6: aplicación reversible a sesión, normalización y restauración oficial.
- PR #7: Fase 4 completa, previsualización, capacidad y Presión dinámicas, desbloqueos autoritativos e infraestructura permanente de pruebas.

Merge de Fase 4:

```text
89b78582699858d0d27acc07dd7971699b6411e1
```

### En desarrollo — `Dev-Balance-Laboratory-Phase-5`

- colección versionada de perfiles DEV;
- migración conservadora del perfil heredado;
- guardado y listado de múltiples perfiles;
- carga manual;
- reemplazo con confirmación;
- eliminación con confirmación y cancelación;
- exportación e importación JSON;
- rechazo de estructuras corruptas, valores fuera de límites y versiones incompatibles;
- restauración oficial siempre disponible;
- carga automática desactivada;
- separación estricta del guardado principal.

## 2. Fuente de verdad

```text
DEFAULT_BALANCE_CONFIG
          │
          ▼
Balance Runtime
          │
          ├── game.ts
          ├── balanceUnlockPolicy.ts
          ├── refraction.ts
          ├── pulseTrigger.ts
          ├── bulkPurchase.ts
          ├── UpgradesPanelCompact.tsx
          ├── GameCore.tsx
          ├── DeveloperPanel.tsx
          ├── simulación DEV
          └── editor del Laboratorio
```

El reducer conserva la autoridad del gameplay. Los perfiles almacenan únicamente configuraciones validadas y nunca sustituyen el estado de la partida.

## 3. Persistencia separada

Partida normal:

```text
incremental-game-a:save:v1
```

Perfil heredado de una sola configuración:

```text
incremental-game-a:balance-dev:v1
```

Colección nueva de Fase 5:

```text
incremental-game-a:balance-dev-profiles:v2
```

### Decisión de migración

La clave heredada no se sobreescribe ni se elimina.

Cuando la colección nueva todavía no existe:

1. se intenta leer el perfil heredado;
2. se valida completamente;
3. se copia como primer perfil de la colección v2;
4. se conserva la clave v1 como respaldo;
5. si el perfil heredado es inválido, no se crea una colección vacía ni se destruye información.

Si la colección v2 ya existe pero está corrupta, las operaciones de escritura se rechazan para impedir una pérdida accidental.

## 4. Modelo de perfiles

Cada perfil contiene:

```text
id
name
createdAt
updatedAt
config
```

La colección contiene:

```text
storageVersion: 2
profiles: BalanceDevProfile[]
```

Las configuraciones usan el mismo `BalanceConfig` y pasan por `validateBalanceConfig()` antes de guardarse, reemplazarse, importarse o cargarse.

## 5. Flujo de uso

```text
Editar borrador en Laboratorio
          │
          ▼
Aplicar a sesión
          │
          ▼
Abrir Perfiles DEV
          │
          ├── Guardar perfil nuevo
          ├── Reemplazar perfil existente
          ├── Exportar JSON
          └── Restaurar balance oficial
```

La carga de un perfil es siempre manual:

```text
Perfil guardado
      │
      ▼
Cargar
      │
      ▼
Normalización de GameState
      │
      ▼
Aplicación a la sesión actual
```

Recargar la página reconstruye el runtime con `DEFAULT_BALANCE_CONFIG`.

## 6. Importación y exportación

La exportación incluye versiones explícitas:

```text
exportVersion
configSchemaVersion
exportedAt
profile.name
profile.config
```

La importación rechaza:

- JSON malformado;
- versión de exportación incompatible;
- versión de `BalanceConfig` incompatible;
- nombre vacío o demasiado largo;
- estructura incompleta;
- números no finitos;
- valores fuera de límites;
- relaciones matemáticas inválidas;
- nombres duplicados que implicarían sobrescritura silenciosa.

## 7. Política de normalización y desbloqueos

Se conservan siempre:

- energía;
- clics acumulados;
- niveles comprados;
- prestigio;
- conteo histórico de descargas;
- último valor de recompensa registrado.

Se ajustan únicamente cargas o progresos parciales incompatibles. Sobrecarga y PRISMA activos se cancelan al cambiar de perfil para evitar duraciones híbridas.

> Elevar un requisito experimental nunca elimina niveles comprados ni detiene el sistema existente. Solo bloquea compras nuevas hasta volver a cumplir el requisito.

Refracción comprada continúa funcionando. Sobrecarga conserva su nivel, pero no carga mientras la esfera esté incompleta porque esa condición pertenece a su mecánica.

## 8. Invariantes de seguridad

1. Una configuración se aplica completa o no se aplica.
2. Todo valor debe ser finito y permanecer dentro de límites absolutos.
3. No se admiten expresiones JavaScript libres.
4. No se usa `eval()` ni `new Function()`.
5. Restaurar valores oficiales siempre está disponible.
6. La partida normal nunca contiene perfiles DEV.
7. Guardar, reemplazar o importar no aplica automáticamente un perfil.
8. Recargar nunca carga un perfil DEV.
9. Las operaciones devuelven clones para evitar mutaciones accidentales.
10. Un nombre existente no se sobrescribe mediante Guardar o Importar.
11. Reemplazar y Eliminar requieren una acción explícita separada.
12. Una colección corrupta no se reemplaza silenciosamente.
13. La migración heredada conserva la fuente original.

## 9. Pruebas de Fase 5

### Unitarias

`tests/unit/balanceProfiles.test.ts` cubre:

- guardado;
- listado;
- lectura manual;
- reemplazo;
- borrado;
- duplicados;
- exportación;
- importación válida;
- JSON malformado;
- límites;
- versiones incompatibles;
- clones e inmutabilidad;
- migración heredada;
- colecciones corruptas;
- protección del guardado normal.

### Integración

`tests/integration/balanceProfiles.integration.test.ts` cubre:

- ausencia de carga automática;
- carga manual al runtime;
- restauración oficial;
- reemplazo sin alterar la sesión activa;
- importación inactiva hasta carga manual;
- rechazo sin alterar el runtime;
- migración heredada inactiva.

### Playwright

`tests/e2e/balance-phase5.spec.ts` cubre:

- persistencia entre recargas sin autocarga;
- carga manual y restauración oficial;
- reemplazo confirmado;
- cancelación y confirmación de eliminación;
- descarga de exportación;
- reimportación válida;
- rechazo visible de JSON malformado, límites y versiones incompatibles.

Comando focalizado:

```powershell
npm run test:phase5
```

Control total:

```powershell
npm run test:all
```

## 10. Fase 6 — Plantillas matemáticas seguras

Después de cerrar Fase 5 se evaluarán plantillas declarativas para curvas:

- exponenciales;
- lineales;
- potencia;
- raíz;
- logarítmicas;
- rendimientos decrecientes.

No se permitirán expresiones JavaScript arbitrarias, `eval()` ni `new Function()`.

## 11. Etapa de contenido — Esmeralda

Después de cerrar los perfiles y la infraestructura esencial del Laboratorio, Esmeralda debe diseñarse antes de programarse, definiendo identidad, relación con Zafiro 5, recurso, fórmula, cinco niveles, beneficio visible, interacción con cristalización, desbloqueo de Amarilla, migración y pruebas desde el diseño.

## 12. Regla de integración

`Dev-Balance-Laboratory-Phase-5` no debe integrarse hasta que:

- `npm ci` pase;
- lint pase;
- Vitest pase;
- build de producción pase;
- Playwright Chromium pase;
- la colección v2 migre sin destruir v1;
- ningún perfil se cargue automáticamente;
- el guardado normal permanezca intacto;
- la restauración oficial funcione;
- la rama se compare contra `main`;
- Arturo autorice expresamente el merge.
