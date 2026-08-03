# Auditoría de rendimiento y escalabilidad

## Estado

- Rama: `Dev-Performance-Audit`.
- Base: `main` después de integrar barras fluidas y controles DualSense.
- Alcance de esta fase: diagnóstico, inventario reproducible y planificación.
- No se modifica gameplay, balance, guardado ni presentación visual.
- No se añadieron dependencias.

## 1. Conclusión ejecutiva

El juego no presenta actualmente una crisis de rendimiento. La escala vigente —ocho evoluciones, un prestigio principal, Cámara Cromática, WebGL, Gatillo y barras— sigue siendo manejable para el navegador.

El riesgo real está en el crecimiento: varios sistemas auxiliares se sincronizan leyendo `localStorage`, distintos módulos sondean el mismo mando por separado y algunas operaciones escalan linealmente con clics, compras o sistemas añadidos.

La estrategia recomendada es:

1. medir antes de refactorizar;
2. eliminar trabajo duplicado y canales indirectos de comunicación;
3. definir umbrales para cambios algorítmicos;
4. conservar claridad y exactitud del reducer;
5. posponer estructuras complejas hasta que una métrica las justifique.

## 2. Auditor estático reproducible

Se añadió:

```text
scripts/performance-audit.mjs
```

Comandos:

```powershell
npm run audit:performance
npm run audit:performance:json
```

El auditor recorre `src/**/*.ts` y `src/**/*.tsx` y reporta:

- cantidad de archivos, líneas y bytes;
- archivos más grandes;
- usos de `setInterval`;
- bucles `requestAnimationFrame`;
- lecturas y escrituras de `localStorage`;
- deserializaciones y serializaciones JSON;
- `MutationObserver` sobre todo el documento;
- consultas `querySelectorAll`;
- cantidad aproximada de efectos y estados React;
- combinaciones que requieren revisión humana.

Para conservar una captura local sin añadirla al repositorio:

```powershell
npm run audit:performance:json > "$env:TEMP\incremental-game-a-performance.json"
```

El inventario estático no sustituye Chrome Performance, React Profiler ni mediciones de duración. Su función es detectar crecimiento estructural entre expansiones.

## 3. Fortalezas actuales

- El reducer sigue siendo la fuente autoritativa de gameplay.
- Los controles del mando accionan controles reales y no duplican fórmulas.
- Las barras delegan la interpolación al navegador mediante Web Animations API.
- Comprar todo aplica un único estado final visible.
- La cadencia automática está limitada actualmente a 20 clics/s.
- Los efectos visuales temporales están separados del estado persistente.
- El estado guardado es pequeño y su migración ya sanea valores.
- La Cámara Cromática no desmonta el reactor ni detiene su simulación.
- No hay dependencias pesadas para estado global, gráficos o cálculos numéricos.

## 4. Hallazgos prioritarios

### P1 — `localStorage` funciona como bus interno

Tres sistemas auxiliares consultan y deserializan el guardado repetidamente:

- `UpgradeProgressSystem`: cada 100 ms;
- `PulseTriggerSystem`: cada 160 ms;
- `ChromaticChamberSystem`: cada 180 ms.

Esto implica trabajo duplicado y hace depender la sincronización visual de un medio diseñado para persistencia, no para comunicación entre componentes.

#### Recomendación

Crear un almacén ligero en memoria con:

- último `GameState` confirmado;
- suscripción por cambios;
- selectores por subsistema;
- `localStorage` reservado exclusivamente para persistencia.

Primera migración propuesta:

1. barras de progreso;
2. Cámara Cromática;
3. Gatillo de pulso.

La migración debe conservar `localStorage` como respaldo al recargar y no introducir otra fuente autoritativa de gameplay.

### P1 — Sondeo duplicado del mando

Actualmente existen bucles independientes con `requestAnimationFrame` en:

- `GamepadController`;
- `PulseTriggerSystem` para R2/RT;
- `ChromaticGamepadBridge`.

Además, más de un módulo relee periódicamente los ajustes del mando desde almacenamiento.

#### Recomendación

Crear un servicio único de entrada que produzca por cuadro:

- mando activo;
- botones presionados;
- flancos `justPressed` y `justReleased`;
- ejes con zona muerta;
- estado de conexión y visibilidad;
- ajustes actuales.

Los consumidores se suscribirían a eventos semánticos como:

```text
primaryPressed
leftTriggerHeld
rightTriggerChanged
navigate(direction)
chromaticComboPressed
```

No se recomienda implementarlo simultáneamente con la migración del estado del juego. Debe ser una fase separada para facilitar pruebas físicas.

### P1 — Guardado completo después de cada estado

`App` guarda el estado completo cada vez que cambia `game`. Hoy el objeto es pequeño, pero los clics manuales, el Gatillo y futuras automatizaciones pueden aumentar mucho la frecuencia de serialización y escritura síncrona.

#### Recomendación

Introducir posteriormente un coordinador de guardado:

- marca `dirty`;
- debounce inicial de 250–500 ms;
- guardado inmediato para cristalización, reset y cambios críticos;
- flush al ocultar la pestaña y antes de descargar;
- métrica de tamaño y duración;
- migraciones versionadas separadas de la simulación.

No debe aplicarse hasta medir que la escritura es significativa y definir claramente los eventos críticos.

### P2 — Comprar todo escala por simulación repetida

El planificador permite hasta 320 compras. En cada ronda evalúa nueve candidatos mediante el reducer y calcula utilidad antes y después.

Complejidad aproximada actual:

```text
O(compras máximas × mejoras candidatas × costo de utilidad)
```

En el peor caso vigente son hasta 2,880 intentos de compra por ejecución, además de miles de cálculos derivados.

#### Recomendación

Mantener el algoritmo actual mientras la medición permanezca dentro del presupuesto. Cuando lo exceda:

1. instrumentar duración por estrategia y estado;
2. cachear partes invariantes de utilidad;
3. separar definición de mejora, costo, requisitos y aplicación;
4. calcular niveles comprables por bloques para costos geométricos;
5. usar búsqueda binaria o fórmulas cerradas solamente donde preserven exactamente el resultado;
6. considerar Web Worker solo si el planificador bloquea la interfaz incluso después de optimizar el algoritmo.

### P2 — Autoclics procesados individualmente

El tick convierte el progreso acumulado en clics enteros y ejecuta cada clic por separado. Es correcto y sencillo, y el límite actual de 20 clics/s lo mantiene seguro.

#### Recomendación

No optimizar todavía. Diseñar una función de lote exacta únicamente cuando una gema o mejora pueda superar de forma sostenida el presupuesto del tick.

Un lote futuro debe conservar exactamente:

- energía por clic;
- aumento de `manualClicks`;
- tramos de presión;
- múltiples descargas de cavitación;
- carga y activación de sobrecarga;
- interacción con PRISMA y multiplicadores temporales;
- eventos visuales agregados sin crear miles de partículas.

### P2 — Observadores y portales descubiertos por el DOM

Barras, Gatillo y Cámara localizan hosts con consultas al DOM y observan mutaciones en todo `document.body`.

#### Recomendación

A mediano plazo, reemplazar el descubrimiento implícito por hosts explícitos:

- componentes `PortalHost` con identificadores estables;
- contexto o registro de referencias;
- barras renderizadas directamente dentro de `Card` cuando se haga la próxima refactorización de evoluciones.

No es urgente mientras la cantidad de nodos sea pequeña, pero evitará que cada nueva pantalla aumente el costo de observación global.

### P2 — Cálculos derivados concentrados en componentes grandes

`App` y `UpgradesPanelCompact` recalculan múltiples costos, multiplicadores, recompensas y estados derivados en cada render.

Los cálculos actuales son baratos. El riesgo es que las próximas gemas añadan decenas de derivaciones y hagan que cualquier cambio de energía reconstruya una gran parte de la interfaz.

#### Recomendación

Cuando comience Esmeralda:

- crear selectores puros por dominio;
- construir view models de tarjetas;
- separar estado persistente de estado visual;
- dividir paneles por categoría;
- aplicar memoización después de medir renders, no por costumbre;
- mantener definiciones estáticas fuera de componentes.

### P2 — Definiciones de mejoras distribuidas

Costos, acciones, nombres, categorías, estrategias y tarjetas están repartidos entre `game.ts`, `bulkPurchase.ts`, paneles y barras.

#### Recomendación

Antes de aumentar mucho el número de evoluciones, crear un registro tipado que centralice metadatos estables:

```text
id
acción de compra
nivel
costo
requisitos
categoría
nombre y descripción
tipo de progreso
participación en Comprar todo
```

El reducer debe conservar la validación autoritativa. El registro no debe convertir la lógica económica en datos opacos difíciles de probar.

## 5. Presupuestos iniciales

Estos umbrales son objetivos de desarrollo, no garantías universales:

| Operación | Objetivo | Señal de intervención |
|---|---:|---:|
| Tick de 1 segundo | promedio < 1 ms | máximo repetido > 4 ms |
| Comprar todo normal | < 16 ms | repetido > 25 ms |
| Comprar todo extremo | < 50 ms | > 100 ms o bloqueo visible |
| Serializar y guardar | < 2 ms | repetido > 5 ms |
| Tamaño del guardado | < 20 KB | > 100 KB |
| Commit React normal | < 8 ms | repetido > 16 ms |
| Cuadro visual | p95 < 20 ms | tirones repetidos > 33 ms |
| Memoria tras 30 min | estable | crecimiento continuo sin recuperación |

Los valores deben medirse en la PC principal y, posteriormente, en un equipo de gama media.

## 6. Escenarios de medición

### Escenario A — Partida nueva

- P0.
- Sin mejoras.
- 30 segundos de clics manuales.
- Abrir y cerrar tarjetas.
- Cambiar categorías con mando.

### Escenario B — Reactor cargado

- Esfera llena.
- Todas las evoluciones actuales activas.
- Sobrecarga y PRISMA funcionando.
- Gatillo y clic manual simultáneos.
- Autoclicker en su límite actual.

### Escenario C — Comprar todo

- Energía alta configurada desde DEV.
- Ejecutar las tres estrategias.
- Medir duración, compras evaluadas y estado final.

### Escenario D — Cámara Cromática

- Abrir en P5 y en modo DEV.
- Mantenerla abierta 60 segundos.
- Navegar con mando y mouse.
- Confirmar que el reactor continúa sin tirones.

### Escenario E — Sesión prolongada

- 30–60 minutos.
- Cambiar repetidamente entre reactor y Cámara.
- Activar efectos temporales.
- Revisar memoria, timers, listeners y nodos desconectados.

## 7. Orden recomendado de trabajo

### Fase A — Línea base

Estado: iniciada en esta rama.

- auditor estático reproducible;
- inventario de puntos calientes;
- presupuestos;
- escenarios de medición;
- ejecutar `lint`, `build` y auditor en local;
- registrar una captura de Chrome Performance y React Profiler.

### Fase B — Comunicación interna

- almacén en memoria para snapshots del juego;
- eliminar sondeos de `localStorage` en barras, Gatillo y Cámara;
- conservar persistencia y migraciones existentes;
- comparar métricas antes/después.

### Fase C — Entrada del mando

- un solo bucle de sondeo;
- servicio de botones, ejes y flancos;
- migración gradual de reactor, Gatillo y Cámara;
- prueba física completa con DualSense.

### Fase D — Persistencia

- coordinador `dirty` + debounce + flush;
- tamaño y duración del guardado;
- pruebas de reset, cristalización, cierre de pestaña y migración.

### Fase E — Preparación para Esmeralda

- registro tipado de evoluciones;
- selectores y view models;
- división de paneles grandes;
- pruebas del reducer y planificador;
- nueva medición antes de integrar la economía verde.

## 8. Optimizaciones que deben esperar

No se justifican todavía:

- ECS;
- convertir niveles a Typed Arrays;
- reemplazar objetos por `Map` indiscriminadamente;
- cola de prioridad para los pocos temporizadores actuales;
- Web Workers para el tick normal;
- IndexedDB para un guardado pequeño;
- biblioteca de números enormes antes de definir la escala;
- microoptimizar fórmulas aritméticas simples;
- eliminar legibilidad por reducir asignaciones pequeñas.

## 9. Estrategia numérica

Antes de extender muchas gemas debe decidirse si el juego mantendrá números contenidos o adoptará progresión exponencial extrema.

Mientras `Number` conserve precisión suficiente para las decisiones del jugador, se recomienda mantenerlo. Si la visión futura exige exponentes por encima de `1e308` o comparaciones donde se pierdan diferencias relevantes, debe introducirse primero una interfaz numérica central y después una representación de mantisa/exponente o biblioteca especializada.

La decisión debe ocurrir antes de que muchas capas usen directamente operadores aritméticos sobre el estado.

## 10. Criterio de éxito de esta auditoría

La auditoría estará completa cuando tengamos:

- salida real de `npm run audit:performance`;
- `npm run lint` y `npm run build` aprobados localmente;
- duración observada del tick;
- duración de las tres estrategias de Comprar todo;
- frecuencia y costo del guardado;
- perfil de commits React;
- captura de una sesión cargada y otra dentro de la Cámara;
- decisión explícita sobre cuál será la primera refactorización estructural.

La recomendación actual, sujeta a las mediciones, es comenzar por el almacén en memoria que retire a `localStorage` de la comunicación interna.
