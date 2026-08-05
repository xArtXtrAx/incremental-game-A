# OBSERVATORIO DE CICLOS Y PRESTIGIO

> Instrumentación DEV para medir la duración de varios prestigios consecutivos y reunir evidencia antes de diseñar Esmeralda.

## 1. Objetivo

El Observatorio responde preguntas que el Comparador A/B original no conserva:

- cuánto dura cada ciclo, no solamente la primera cristalización;
- cómo cambia el tiempo entre P5, P6, P7 y ciclos posteriores;
- cuánto tarda el jugador en recuperar producción después del reinicio;
- cuánta energía se genera y se gasta dentro de cada ciclo;
- cuánto del incremento instantáneo procede del multiplicador de Zafiro;
- qué balance produce ciclos más rápidos bajo condiciones idénticas.

No introduce todavía recursos, niveles ni fórmulas de Esmeralda.

## 2. Modos

### 2.1 En vivo

El sistema lee la sesión mediante `developerExperimentBridge` una vez por segundo.

Muestra:

- prestigio actual y siguiente;
- tiempo del ciclo actual;
- multiplicador vigente de Zafiro;
- ritmo observado de clics durante una ventana reciente;
- clics restantes;
- tiempo estimado al núcleo usando el ritmo observado;
- producción pasiva y potencia por clic;
- aporte directo estimado de Zafiro;
- historial y promedio de ciclos observados.

La observación continúa mientras la herramienta está cerrada porque el sistema permanece montado dentro de la aplicación.

El historial vive solamente en memoria:

- no se añade a `GameState`;
- no se escribe en el guardado normal;
- no usa una nueva clave de `localStorage`;
- puede reiniciarse manualmente;
- se descarta al recargar la página.

Cuando detecta que un escenario, reset o normalización redujo el progreso sin aumentar el prestigio, abre una línea base nueva para no mezclar sesiones incompatibles.

## 3. Simulación multiciclo

Dos candidatos reciben:

1. el mismo escenario;
2. la misma marca temporal;
3. la misma tasa de clics manuales;
4. la misma política automática de compra;
5. el mismo objetivo de ciclos;
6. el mismo límite temporal y de acciones.

Cada segundo reutiliza:

- `gameReducer()` para clics, ticks, compras y cristalización;
- `getDeveloperSimulationMetrics()` para producción y estado del núcleo;
- `materializeDeveloperScenarioState()` para tiempos temporales;
- `runWithBalanceConfig()` para aislar el balance evaluado.

No se aplican perfiles al runtime visible y no se escribe la partida.

## 4. Límites

```text
Duración máxima por perfil: 21,600 s / 6 h
Ciclos objetivo máximos:    10
Clics manuales máximos:     20/s
Acciones máximas:           500,000
Compras registradas:        4,000 por ciclo
```

Los límites evitan recorridos sin control dentro del hilo principal del navegador.

## 5. Registro por ciclo

Cada cristalización completa produce:

```text
índice del ciclo
prestigio inicial y final
inicio, final y duración
multiplicador de Zafiro actual y siguiente
energía generada
energía gastada
aporte directo estimado de Zafiro
cantidad de compras
tiempo sin decisiones
mayor intervalo sin decisiones
primer Generador
primer Autoclicker
primera evolución avanzada
niveles finales
checkpoints a 10, 30 y 60 segundos
```

Los checkpoints conservan:

- energía;
- clics del núcleo;
- producción pasiva;
- producción efectiva con clics configurados;
- nivel del Generador;
- nivel del Autoclicker.

## 6. Energía generada y gastada

La energía generada suma únicamente aumentos positivos observados después de acciones autoritativas:

- clics;
- Cavitación;
- ticks;
- producción automática;
- descargas de Refracción.

La energía gastada suma los costos reales de compras aceptadas por el reducer.

La reducción de energía causada por cristalizar no se registra como gasto.

## 7. Aporte directo de Zafiro

Para una ganancia positiva `G` ocurrida con multiplicador de Zafiro `S`:

```text
AporteDirecto = G × (1 − 1 / S)
```

Esto expresa la parte de esa ganancia instantánea atribuible al factor multiplicativo de Zafiro, manteniendo fijo el estado y la ruta de compras ya alcanzada.

### Limitación importante

No es un contrafactual completo.

Un recorrido real sin Zafiro podría:

- comprar evoluciones en momentos distintos;
- alcanzar menos recompensas de Cavitación o Refracción;
- tardar más en desbloquear sistemas;
- completar menos prestigios.

Por ello, la interfaz usa los términos:

```text
aporte directo estimado
contribución multiplicativa instantánea
```

y no afirma que sea toda la energía causal producida por Zafiro.

Un contrafactual completo requerirá un override experimental específico de Zafiro o dos balances cuya política de Zafiro sea formalmente válida.

## 8. Política de compra

La primera entrega mantiene una línea base determinista:

1. prueba las compras mediante `gameReducer()`;
2. descarta compras bloqueadas o no financiables;
3. elige la opción válida de menor costo;
4. resuelve empates con un orden estable;
5. repite hasta agotar presupuesto o límites.

Esta política no pretende ser óptima. Sirve para comparar balances con una estrategia idéntica y reproducible.

## 9. Presentación

El Panel DEV incorpora un acceso `P→P` con dos pestañas:

- **En vivo**;
- **Simulación multiciclo**.

Los resultados simulados incluyen:

- resumen A/B;
- tabla de métricas;
- cronología por ciclo;
- producción efectiva a 10, 30 y 60 segundos;
- gráfica de barras de duración relativa;
- exportación JSON y CSV.

La herramienta permanece confinada al workspace derecho y no bloquea el juego.

## 10. Archivos

```text
src/prestigeCycleObservatory.ts
src/prestigeCycleLive.ts
src/PrestigeCycleObservatorySystem.tsx
src/PrestigeCycleObservatorySystem.css

tests/unit/prestigeCycleLive.test.ts
tests/unit/prestigeCycleObservatory.test.ts
tests/integration/prestigeCycleObservatory.integration.test.ts
tests/e2e/prestige-cycle-observatory.spec.ts
```

Comando dedicado:

```bash
npm run test:prestige-observatory
```

## 11. Uso para diseñar Esmeralda

Experimentos recomendados:

### Base P5

```text
Escenario: Ciclo P5
Clics manuales: 0/s
Compras automáticas: sí
Ciclos objetivo: 3–5
```

Mide la aceleración pasiva pura de los ciclos posteriores.

### Juego activo

```text
Escenario: Ciclo P5
Clics manuales: 2–5/s
Compras automáticas: sí
Ciclos objetivo: 3–5
```

Mide cuánto cambia la progresión con participación constante.

### Curvas alternativas

Compara perfiles DEV que cambien:

- multiplicadores P1–P5;
- incremento posterior a P5;
- costos y crecimientos;
- capacidad del núcleo;
- Autoclicker y sistemas avanzados.

Los resultados permitirán decidir con evidencia si:

1. Zafiro queda fijado en P5;
2. el crecimiento posterior alimenta Esmeralda;
3. Esmeralda responde a duración, eficiencia o producción pasiva;
4. se necesita un contrafactual completo de Zafiro antes de aprobar fórmulas.

## 12. Ampliaciones posteriores

- override experimental `Zafiro configurado / neutralizado / limitado a P5`;
- políticas de compra alternativas;
- lotes de perfiles y escenarios;
- percentiles de múltiples semillas cuando exista aleatoriedad;
- almacenamiento opcional de reportes separado de la partida;
- series temporales con resolución configurable.

Estas ampliaciones deben justificarse con experimentos reales; no son requisito para iniciar la medición de ciclos.
