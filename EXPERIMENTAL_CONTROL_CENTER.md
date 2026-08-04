# CENTRO DE CONTROL EXPERIMENTAL DEV

> Consola para diseñar, reproducir y comparar experimentos sobre la progresión sin contaminar la partida normal.

## 1. Estado de la primera entrega

Implementado en la rama:

```text
Dev-Experimental-Control-Center
```

Presentado en el PR #9 como borrador. No debe integrarse sin autorización explícita de Arturo.

La primera entrega incluye:

- shell unificado con pestañas;
- lectura del estado completo del juego;
- siete escenarios base;
- snapshots personalizados persistentes;
- previsualización campo por campo;
- sesión experimental aislada;
- captura y restauración de una línea base;
- pausa del reloj principal;
- avance determinista por pasos;
- métricas iniciales;
- acceso a Laboratorio de Balance, Perfiles DEV y Cámara Cromática.

## 2. Fuente de verdad

El Centro DEV no implementa fórmulas paralelas.

- Los pasos temporales reutilizan `gameReducer()`.
- Las métricas reutilizan las consultas autoritativas de `game.ts` y `refraction.ts`.
- La capacidad del núcleo se obtiene del balance activo.
- El estado experimental conserva exactamente la forma de `GameState`.

La simulación de N segundos ejecuta N acciones `tick`, una por segundo. El resultado debe coincidir con ejecutar manualmente la misma secuencia de ticks.

## 3. Persistencia separada

Partida normal:

```text
incremental-game-a:save:v1
```

Perfiles de balance:

```text
incremental-game-a:balance-dev-profiles:v2
```

Escenarios experimentales:

```text
incremental-game-a:developer-scenarios:v1
```

Ninguna de estas claves sustituye a otra.

Los escenarios personalizados guardan:

```text
id
name
description
kind
createdAt
updatedAt
capturedAt
state
```

La colección es versionada. Si está corrupta, las escrituras se rechazan en lugar de sobrescribirla silenciosamente.

## 4. Escenarios incluidos

Los escenarios base se generan con la capacidad activa del núcleo:

1. Partida nueva.
2. Mitad del primer ciclo.
3. Núcleo casi lleno.
4. Antes de cristalizar.
5. Ciclo P1.
6. Ciclo P3.
7. Ciclo P5.

Los escenarios base no se escriben en `localStorage`. Se reconstruyen desde código para adaptarse al balance activo.

Los snapshots personalizados sí se almacenan en la colección DEV versionada.

## 5. Aplicación aislada

Al aplicar un escenario:

1. se valida la estructura completa de `GameState`;
2. se captura una sola línea base de la sesión normal;
3. se materializan los tiempos restantes de Sobrecarga y Refracción contra el reloj actual;
4. se reemplaza el estado visible;
5. se pausa el reloj principal;
6. se marca la sesión como experimental;
7. se suspenden las escrituras automáticas de la partida normal.

Aplicar escenarios adicionales durante la misma sesión experimental no reemplaza la línea base original.

## 6. Restauración

`Restaurar sesión original`:

- recupera la línea base capturada;
- conserva el tiempo restante de efectos temporales;
- vuelve al reloj real;
- desactiva el aislamiento;
- reanuda los ticks automáticos;
- escribe nuevamente la sesión original en el guardado normal.

La restauración no aplica un escenario base ni restablece la partida a cero: devuelve exactamente la sesión que existía antes del primer experimento.

## 7. Pausa y avance determinista

El reloj puede pausarse sin cargar un escenario.

Mientras está pausado:

- el intervalo principal de `App` no ejecuta ticks;
- el reloj visual permanece congelado;
- los clics manuales usan la misma marca temporal congelada;
- se pueden ejecutar pasos de 1, 10, 60, 300, 900 o 3,600 segundos.

Límite por operación:

```text
3,600 segundos
```

El límite evita bloquear la interfaz con secuencias excesivamente largas. Las pruebas mayores pueden dividirse en varias operaciones.

## 8. Métricas iniciales

La primera entrega calcula:

- energía por segundo;
- energía por minuto;
- potencia por clic;
- clics automáticos por segundo;
- porcentaje de llenado del núcleo;
- clics restantes;
- tiempo estimado al núcleo lleno usando la tasa automática actual;
- multiplicador temporal activo;
- multiplicador de Zafiro.

El tiempo al núcleo se declara indeterminado cuando todavía no existe producción automática de clics.

## 9. Navegación y compatibilidad

La consola ofrece pestañas:

- Estado;
- Escenarios;
- Simulación;
- Métricas;
- Herramientas.

La pestaña Herramientas abre:

- Laboratorio de Balance;
- Perfiles DEV;
- Cámara Cromática.

Durante esta primera entrega se conservan temporalmente los accesos anteriores del Panel DEV para mantener compatibilidad con los flujos y pruebas existentes. Una fase posterior podrá retirarlos cuando la navegación unificada tenga paridad completa.

## 10. Seguridad

- Ningún escenario se carga automáticamente.
- La colección de escenarios nunca reemplaza la partida normal.
- Las estructuras corruptas bloquean escrituras.
- Los nombres duplicados se rechazan.
- Las lecturas devuelven clones.
- Los números deben ser finitos y no negativos.
- Los niveles y tiempos tienen límites superiores.
- Los progresos fraccionarios permanecen entre 0 y menos de 1.
- No se usa `eval()`.
- No se usa `new Function()`.
- No se aceptan expresiones JavaScript arbitrarias.

## 11. Cobertura automatizada añadida

Vitest:

- ocho pruebas unitarias de escenarios;
- cinco pruebas de integración de simulación y métricas.

Playwright:

- aislamiento, avance y restauración;
- snapshots persistentes separados de la partida;
- métricas y acceso a herramientas existentes.

Comando dedicado:

```bash
npm run test:control-center
```

El Quality Gate completo continúa ejecutando lint, todas las pruebas Vitest, build y todos los recorridos Playwright.

## 12. Próximas ampliaciones

Después de validar esta primera entrega:

1. comparación simultánea de dos perfiles sobre el mismo escenario;
2. objetivos y hitos configurables;
3. tiempo a cada evolución;
4. retorno de inversión por mejora;
5. detección de periodos sin decisiones útiles;
6. exportación de resultados experimentales;
7. series temporales y gráficas;
8. lotes de simulaciones;
9. plantillas matemáticas seguras de Fase 6.
