# COMPARADOR DE EXPERIMENTOS A/B

> Fase 5.6 del Centro de Control DEV para ejecutar dos balances sobre exactamente el mismo escenario sin alterar la partida normal ni el runtime visible.

## 1. Alcance de la primera entrega

La implementación añade:

- selección de un escenario base o snapshot personalizado;
- Perfil A y Perfil B, incluyendo siempre el balance oficial;
- duración máxima configurable;
- clics manuales deterministas por segundo;
- compras automáticas opcionales;
- cristalización automática opcional;
- condiciones de parada por duración, núcleo lleno, primera cristalización o evolución objetivo;
- métricas lado a lado;
- hitos de compra por evolución;
- estimación de retorno por compra;
- detección de tiempo sin decisiones;
- exportación JSON y CSV;
- acceso directo desde el Panel DEV y desde Herramientas del Centro de Control.

## 2. Aislamiento del balance

El comparador no aplica perfiles al runtime de la aplicación.

`runWithBalanceConfig()` instala un override transitorio únicamente durante una operación síncrona:

- no modifica `BalanceRuntimeSnapshot`;
- no incrementa la revisión;
- no emite listeners;
- no escribe `localStorage`;
- admite overrides anidados;
- restaura el override anterior mediante `finally`, incluso si la simulación falla.

El juego visible continúa usando el balance que estaba activo antes de iniciar el experimento.

## 3. Fuente autoritativa

Cada recorrido reutiliza:

- `gameReducer()` para clics, ticks, compras y cristalizaciones;
- `getDeveloperSimulationMetrics()` para producción y estado del núcleo;
- las funciones autoritativas de costos, desbloqueos, Sobrecarga, Refracción y Zafiro;
- `materializeDeveloperScenarioState()` para conservar la duración restante de efectos temporales.

No existen fórmulas paralelas de gameplay.

## 4. Secuencia determinista

Ambos perfiles reciben:

1. el mismo estado materializado;
2. la misma marca de inicio;
3. la misma cantidad de clics manuales por segundo;
4. la misma política de compra;
5. la misma condición de parada;
6. el mismo límite temporal y de acciones.

En cada segundo:

1. se ejecutan los clics manuales configurados;
2. se ejecuta un `tick`;
3. se compran evoluciones, si la política automática está activa;
4. se comprueba la condición de parada;
5. se cristaliza cuando corresponde.

## 5. Política de compra

La primera entrega usa una estrategia segura y reproducible:

- evalúa todas las compras disponibles mediante `gameReducer()`;
- descarta acciones bloqueadas o no financiables;
- selecciona la compra válida de menor costo;
- resuelve empates con un orden estable;
- repite hasta agotar el presupuesto o alcanzar el límite de compras.

El orden estable es:

1. Potencia de clic.
2. Generador.
3. Resonancia.
4. Presión.
5. Cavitación.
6. Autoclicker.
7. Gatillo de pulso.
8. Sobrecarga.
9. Refracción.

Esta política no pretende representar todavía una estrategia óptima. Su propósito es crear una línea base determinista para comparar curvas.

## 6. Límites de seguridad

```text
Duración máxima por recorrido: 7,200 segundos
Clics manuales máximos:        20 por segundo
Acciones máximas:              250,000 por recorrido
Compras registradas máximas:   2,000
```

Además, el máximo real de compras respeta `engineLimits.maximumBulkPurchaseIterations` del perfil evaluado.

## 7. Métricas

El reporte muestra:

- tiempo ejecutado;
- tiempo al núcleo lleno;
- tiempo a la primera cristalización;
- energía final;
- producción efectiva estimada;
- cantidad de compras;
- tiempo total sin decisiones;
- mayor espera entre decisiones;
- cristalizaciones finales;
- primer acceso a cada evolución;
- nivel final de cada evolución;
- retorno promedio estimado de cada evolución.

### Producción efectiva estimada

Combina:

- producción automática de energía;
- potencia de clic;
- clics manuales configurados;
- tasa actual del Autoclicker.

Se utiliza para estimar el tiempo de recuperación de una compra. Es una métrica comparativa, no una predicción exacta de cada recompensa futura de Cavitación o Refracción.

## 8. Tiempo sin decisiones

Un segundo cuenta como tiempo sin decisiones cuando:

- no se ejecutó ninguna compra;
- no quedó ninguna evolución financiable y desbloqueada al final de ese segundo.

Se registran:

- total acumulado;
- intervalo consecutivo más largo.

## 9. Persistencia

El comparador solo lee:

```text
incremental-game-a:balance-dev-profiles:v2
incremental-game-a:developer-scenarios:v1
```

Nunca escribe ni modifica:

```text
incremental-game-a:save:v1
incremental-game-a:balance-dev-profiles:v2
incremental-game-a:developer-scenarios:v1
```

Las exportaciones se generan como descargas locales JSON o CSV.

## 10. Pruebas añadidas

### Vitest unitario

- override visible solo dentro de la operación;
- ausencia de eventos y revisiones;
- restauración anidada;
- restauración después de errores;
- rechazo de balances inválidos;
- determinismo entre balances idénticos;
- comparación de capacidades distintas;
- parada por evolución objetivo;
- normalización de límites;
- rechazo de escenarios incompletos.

### Vitest de integración

- comparación real de curvas con `gameReducer()`;
- runtime visible sin cambios;
- escenario de entrada sin mutaciones;
- repetibilidad exacta;
- materialización idéntica de efectos temporales.

### Playwright

- creación de un perfil experimental y comparación contra Oficial;
- verificación de tiempos distintos al núcleo;
- guardado normal intacto;
- runtime oficial intacto;
- acceso desde Herramientas;
- exportación reproducible JSON y CSV.

Comando dedicado:

```bash
npm run test:comparative
```

El Quality Gate completo mantiene lint, todas las pruebas Vitest, build y todos los recorridos Playwright.

## 11. Limitaciones deliberadas

- La estrategia de compra es la más barata disponible, no un optimizador global.
- La estimación de retorno no anticipa exactamente eventos discretos futuros.
- No hay todavía gráficas temporales.
- No se ejecutan lotes ni barridos paramétricos.
- No se almacenan reportes dentro del navegador.

## 12. Próxima ampliación lógica

Después de validar esta fase:

1. series temporales por segundo o intervalo configurable;
2. gráficas de energía, producción, compras y espera;
3. políticas de compra alternativas;
4. lotes de escenarios y perfiles;
5. ranking de perfiles;
6. detección automática de cuellos de botella;
7. plantillas matemáticas seguras de Fase 6.
