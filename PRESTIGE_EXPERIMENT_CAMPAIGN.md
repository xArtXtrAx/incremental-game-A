# Campaña Experimental de Progresión — Pre-Esmeralda

## 1. Propósito

Esta campaña convierte el Laboratorio de Progresión de Prestigio en un protocolo reproducible para estudiar P5→P10 antes de definir la mecánica oficial de Esmeralda.

La campaña no busca encontrar «el número correcto» de una sola vez. Busca responder, en orden, cuatro preguntas:

1. ¿Qué patrón de progresión produce hoy el balance oficial entre P5 y P10?
2. ¿Cuánto de ese patrón depende del crecimiento post-P5 de Zafiro?
3. ¿Los ciclos son interesantes por dentro o solo cumplen una duración aceptable?
4. ¿Qué problema sistémico debería resolver Esmeralda sin limitarse a añadir otro multiplicador?

La regla principal es:

> No modificar dos familias de variables a la vez.

Si se estudia Zafiro, los costos permanecen fijos. Si se estudian estrategias, Zafiro permanece fijo. Si más adelante se estudian costos, las políticas de Zafiro y compra se fijan primero.

---

## 2. Herramientas autoritativas

La campaña utiliza exclusivamente herramientas DEV ya integradas:

- Observatorio de Ciclos y Prestigio.
- Laboratorio de Progresión de Prestigio.
- Contrafactual de Zafiro.
- Explorador de curvas post-P5.
- Comparador de estrategias de compra.
- Analizador de ruta.
- Batch Experiment Runner.
- Perfiles y escenarios DEV existentes.

Las simulaciones deben continuar reutilizando `gameReducer()` y los overrides transitorios ya validados. Ningún resultado de esta campaña debe escribir la partida normal.

---

## 3. Convenciones experimentales

### 3.1 Identificador

Cada experimento usa el formato:

```text
EXP-PRESTIGE-###
```

### 3.2 Registro mínimo obligatorio

Cada experimento debe registrar:

```text
ID:
Pregunta:
Hipótesis:
Escenario:
Control:
Variable independiente:
Variables fijas:
Corridas:
Resultados principales:
Interpretación:
Decisión:
Siguiente experimento:
```

### 3.3 Estado

Cada experimento se marca como:

- `PLANNED`
- `RUNNING`
- `COMPLETE`
- `REPEAT`
- `REJECTED`

### 3.4 Semáforo de interpretación

Cada configuración se evalúa en seis dimensiones:

| Dimensión | Pregunta |
|---|---|
| Velocidad | ¿Los ciclos aceleran demasiado, se estabilizan o se convierten en muro? |
| Recuperación | ¿Cuánto tarda el reactor en recuperar producción útil después del reset? |
| Decisiones | ¿Cuánto del ciclo contiene decisiones de compra relevantes? |
| Diversidad | ¿Cuántos sistemas participan realmente en la progresión? |
| Dependencia de Zafiro | ¿Cuánto cambia la trayectoria al congelar o neutralizar Zafiro? |
| Sensibilidad al estilo | ¿Cuánto cambia el resultado entre estrategias razonables? |

Clasificación:

```text
🟢 saludable
🟡 revisar
🔴 problema
```

El semáforo es una ayuda de lectura, no una sustitución de las métricas.

---

## 4. Métricas base

### 4.1 Métricas ya disponibles

Registrar como mínimo:

- duración P5→P6;
- duración P6→P7;
- duración P7→P8;
- duración P8→P9;
- duración P9→P10;
- duración media;
- relación último ciclo / primer ciclo;
- energía generada;
- energía gastada;
- compras por ciclo;
- tiempo sin decisiones;
- mayor intervalo sin decisiones;
- producción efectiva a 10, 30 y 60 segundos;
- primera compra de Generador;
- primera compra de Autoclicker;
- primera evolución avanzada;
- distribución de compras y gasto por sistema.

### 4.2 Indicadores derivados recomendados

#### Decision Density

```text
Decision Density = compras significativas / minutos de ciclo
```

No debe interpretarse como «más es siempre mejor». Su función es detectar ciclos casi vacíos.

#### Idle Decision Ratio

```text
Idle Decision Ratio = tiempo sin decisiones / duración del ciclo
```

Valores altos indican que una duración aparentemente correcta puede estar compuesta principalmente por espera.

#### Purchase Concentration

```text
Purchase Concentration = gasto de los 2 sistemas dominantes / gasto total
```

Ayuda a detectar rutas donde una o dos evoluciones invalidan prácticamente al resto.

#### Cycle Compression Ratio

```text
Cycle Compression Ratio = duración P9→P10 / duración P5→P6
```

Lectura inicial:

- cercano a `1.00`: ritmo estable;
- moderadamente menor: aceleración progresiva;
- muy menor: posible runaway;
- mayor que `1.00`: posible muro de progresión.

No se fija todavía un rango oficial saludable. Cualquier umbral utilizado durante la campaña se considera hipótesis provisional.

---

# RONDA 1 — Línea base oficial

## 5. Pregunta

> ¿Qué patrón de progresión produce hoy el juego entre P5 y P10 cuando no modificamos ningún parámetro?

No se intenta mejorar el juego en esta ronda.

## 6. Variables fijas

```text
Escenario: Inicio de ciclo P5
Zafiro: Oficial
Balance: Oficial
Objetivo: P10 / 5 ciclos completos
Costos: Oficiales
Desbloqueos: Oficiales
```

## 7. Matriz inicial

### EXP-PRESTIGE-001 — Línea base / Más barata

```text
Estado: PLANNED
Clics: 2/s
Estrategia: Más barata
Zafiro: Oficial
```

Hipótesis: sirve como continuidad directa con la política histórica del Observatorio.

### EXP-PRESTIGE-002 — Línea base / Producción

```text
Estado: PLANNED
Clics: 2/s
Estrategia: Producción
Zafiro: Oficial
```

Hipótesis: una estrategia orientada a crecimiento productivo mostrará una recuperación más consistente y será una buena candidata para los contrafactuales posteriores.

### EXP-PRESTIGE-003 — Línea base / Automática

```text
Estado: PLANNED
Clics: 2/s
Estrategia: Automática
Zafiro: Oficial
```

Hipótesis: permite medir cuánto depende la progresión de reconstruir sistemas automáticos temprano.

### EXP-PRESTIGE-004 — Línea base / ROI

```text
Estado: PLANNED
Clics: 2/s
Estrategia: ROI
Zafiro: Oficial
```

Hipótesis: permite comprobar si una estrategia de retorno económico produce una trayectoria materialmente distinta a las reglas simples.

## 8. Expansión condicionada de Ronda 1

Solo si las cuatro primeras corridas muestran diferencias relevantes, ampliar clics a:

```text
0/s
5/s
```

No ejecutar automáticamente toda la cuadrícula si 2/s ya ofrece señal suficiente.

## 9. Criterio de salida

Ronda 1 termina cuando podemos describir:

1. forma de la curva P5→P10;
2. estrategia más rápida y más lenta;
3. estrategia con menor y mayor tiempo sin decisiones;
4. sistemas dominantes;
5. sensibilidad inicial al estilo de compra.

---

# RONDA 2 — Contrafactual de Zafiro

## 10. Pregunta

> ¿El crecimiento post-P5 de Zafiro está resolviendo una ralentización real de la economía o está ocultando que la economía base deja de sostener los ciclos?

Esta es la pregunta principal de toda la campaña pre-Esmeralda.

## 11. Estrategia de control

Usar la estrategia que en Ronda 1 resulte más representativa y estable. Si no existe una diferencia clara, usar `Producción` como control inicial.

Variables fijas:

```text
Escenario: Inicio de ciclo P5
Clics: 2/s
Balance: Oficial
Costos: Oficiales
Objetivo: P10
Estrategia: Producción, salvo evidencia de Ronda 1
```

### EXP-PRESTIGE-005 — Zafiro oficial

```text
Estado: PLANNED
Política: Oficial
```

### EXP-PRESTIGE-006 — Zafiro congelado en P5

```text
Estado: PLANNED
Política: Congelado en P5 ×3.05
```

Pregunta específica: ¿la economía después de P5 sigue sosteniendo ciclos razonables sin incremento adicional de Zafiro?

### EXP-PRESTIGE-007 — Zafiro neutralizado

```text
Estado: PLANNED
Política: ×1.00 contrafactual
```

Pregunta específica: ¿qué parte de la trayectoria completa depende de Zafiro, no solo su contribución instantánea?

## 12. Interpretación

Comparar especialmente:

- `Cycle Compression Ratio`;
- recuperación a 10/30/60 s;
- cambio de ruta de compras;
- `Idle Decision Ratio`;
- sistemas que desaparecen o aparecen;
- diferencia de duración entre Oficial y Congelado;
- diferencia de duración entre Oficial y Neutralizado.

Si Congelado en P5 sigue una trayectoria saludable, el incremento +0.50 puede ser innecesario o excesivo.

Si Congelado genera un muro pero Oficial no, el incremento post-P5 está resolviendo un problema real.

Si Neutralizado cambia completamente las rutas de compra, el efecto de Zafiro debe tratarse como causal sobre la trayectoria y no como un simple bonus final de producción.

---

# RONDA 2B — Exploración de curva post-P5

## 13. Pregunta

> ¿Qué región de incremento post-P5 produce una aceleración útil sin runaway?

Ejecutar solo después de EXP-PRESTIGE-005/006/007.

Variables fijas iguales a la Ronda 2.

### EXP-PRESTIGE-008 — Explorador de curva

```text
Estado: PLANNED
Incrementos:
+0.10
+0.20
+0.30
+0.40
+0.50
+0.60
```

Esto representa seis recorridos dentro de un mismo experimento de barrido.

Para cada incremento registrar:

| Incremento | P5→P6 | P6→P7 | P7→P8 | P8→P9 | P9→P10 | Compression Ratio | Idle Ratio | Semáforo |
|---:|---:|---:|---:|---:|---:|---:|---:|---|
| +0.10 | | | | | | | | |
| +0.20 | | | | | | | | |
| +0.30 | | | | | | | | |
| +0.40 | | | | | | | | |
| +0.50 | | | | | | | | |
| +0.60 | | | | | | | | |

No seleccionar ganador únicamente por velocidad.

---

# RONDA 3 — Calidad interna del ciclo

## 14. Pregunta

> ¿Qué ocurre dentro de un ciclo aparentemente saludable?

Dos balances con la misma duración pueden ofrecer experiencias completamente distintas.

Usar el Analizador de Ruta sobre:

1. balance oficial;
2. Zafiro congelado en P5;
3. la curva post-P5 más interesante de EXP-PRESTIGE-008.

### EXP-PRESTIGE-009 — Ruta oficial

```text
Estado: PLANNED
Política: Oficial
```

### EXP-PRESTIGE-010 — Ruta congelada

```text
Estado: PLANNED
Política: Congelado en P5
```

### EXP-PRESTIGE-011 — Ruta alternativa

```text
Estado: BLOCKED por EXP-PRESTIGE-008
Política: incremento seleccionado experimentalmente
```

## 15. Métricas de calidad interna

Para cada recorrido registrar:

- compras por minuto;
- intervalos entre compras;
- mayor espera;
- tiempo total sin decisión;
- gasto por sistema;
- dos sistemas con mayor concentración de gasto;
- sistemas nunca comprados;
- momento de recuperación del Generador;
- momento de recuperación del Autoclicker;
- momento de primera evolución avanzada.

### Señales de problema

#### Ciclo vacío

Duración razonable, pero `Idle Decision Ratio` alto y baja densidad de decisiones.

#### Dominancia

Uno o dos sistemas absorben casi todo el gasto y el resto rara vez entra en la ruta.

#### Bootstrap frágil

La recuperación inicial depende de una secuencia muy específica o de clics manuales constantes.

#### Aceleración cosmética

Los ciclos se acortan por multiplicador, pero la estructura de decisiones permanece idéntica y cada vez más comprimida.

---

# RONDA 4 — Hueco mecánico para Esmeralda

## 16. Objetivo

No diseñar Esmeralda antes de identificar un problema recurrente con evidencia.

La decisión debe derivarse de patrones observados.

### Patrón A — Recuperación post-reset demasiado lenta

Candidato de identidad para Esmeralda:

```text
regeneración / reconstrucción / conservación de impulso
```

Posibles familias mecánicas a explorar después, todavía no aprobadas:

- conservar una fracción de producción;
- acelerar primeros niveles;
- recuperar sistemas previos con menor fricción.

### Patrón B — Ciclos demasiado rápidos y vacíos

No añadir otro multiplicador directo.

Explorar identidades como:

```text
eficiencia / conversión / decisiones laterales / almacenamiento
```

### Patrón C — Dominancia de uno o dos sistemas

Explorar mecánicas de:

```text
diversificación / sinergia / equilibrio entre subsistemas
```

### Patrón D — Brecha excesiva entre estilos

Decidir explícitamente si Esmeralda debe:

- reducir la brecha activo/pasivo;
- conservarla;
- o hacer de esa diferencia parte deliberada de su identidad.

### Patrón E — Zafiro post-P5 ya resuelve casi todo

Si el crecimiento post-P5 mantiene buena velocidad, recuperación y decisiones por sí solo, Esmeralda no debe limitarse a reemplazar `+0.50` por otro multiplicador equivalente.

---

# 17. Las 13 corridas iniciales

La campaña inicial deliberadamente pequeña es:

```text
Ronda 1
1. Más barata / Oficial / 2 clics/s
2. Producción / Oficial / 2 clics/s
3. Automática / Oficial / 2 clics/s
4. ROI / Oficial / 2 clics/s

Ronda 2
5. Producción / Oficial / 2 clics/s
6. Producción / Congelado P5 / 2 clics/s
7. Producción / Neutralizado / 2 clics/s

Ronda 2B
8. Producción / +0.10 / 2 clics/s
9. Producción / +0.20 / 2 clics/s
10. Producción / +0.30 / 2 clics/s
11. Producción / +0.40 / 2 clics/s
12. Producción / +0.50 / 2 clics/s
13. Producción / +0.60 / 2 clics/s
```

Nota: documentalmente el barrido completo se registra como `EXP-PRESTIGE-008`, aunque contiene seis recorridos individuales.

No ampliar la campaña hasta interpretar estas 13 corridas.

---

# 18. Tabla maestra de resultados

| Corrida | Estrategia | Zafiro | P5→P6 | P6→P7 | P7→P8 | P8→P9 | P9→P10 | Compresión | Idle Ratio | Dominancia | Estado |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| 1 | Más barata | Oficial | | | | | | | | | PLANNED |
| 2 | Producción | Oficial | | | | | | | | | PLANNED |
| 3 | Automática | Oficial | | | | | | | | | PLANNED |
| 4 | ROI | Oficial | | | | | | | | | PLANNED |
| 5 | Producción | Oficial | | | | | | | | | PLANNED |
| 6 | Producción | Congelado P5 | | | | | | | | | PLANNED |
| 7 | Producción | Neutralizado | | | | | | | | | PLANNED |
| 8 | Producción | +0.10 | | | | | | | | | PLANNED |
| 9 | Producción | +0.20 | | | | | | | | | PLANNED |
| 10 | Producción | +0.30 | | | | | | | | | PLANNED |
| 11 | Producción | +0.40 | | | | | | | | | PLANNED |
| 12 | Producción | +0.50 | | | | | | | | | PLANNED |
| 13 | Producción | +0.60 | | | | | | | | | PLANNED |

---

# 19. Plantilla de ficha individual

```markdown
## EXP-PRESTIGE-### — Nombre

Estado: PLANNED

### Pregunta

### Hipótesis

### Configuración

- Escenario:
- Balance:
- Estrategia:
- Clics/s:
- Política Zafiro:
- Ciclos objetivo:

### Variables fijas

### Resultados

| Métrica | Valor |
|---|---:|
| P5→P6 | |
| P6→P7 | |
| P7→P8 | |
| P8→P9 | |
| P9→P10 | |
| Compression Ratio | |
| Idle Decision Ratio | |
| Decision Density | |
| Purchase Concentration | |

### Semáforo

- Velocidad:
- Recuperación:
- Decisiones:
- Diversidad:
- Dependencia Zafiro:
- Sensibilidad al estilo:

### Interpretación

### Decisión

### Siguiente experimento
```

---

# 20. Reglas de decisión

1. No diseñar Esmeralda a partir de una sola corrida.
2. No elegir una curva únicamente porque sea la más rápida.
3. Distinguir velocidad de calidad interna del ciclo.
4. Repetir cualquier resultado sospechoso antes de convertirlo en decisión de diseño.
5. Mantener `Inicio de ciclo P5` como referencia común salvo que la pregunta requiera explícitamente un escenario pasivo distinto.
6. Si se cambia el escenario, documentar por qué.
7. Los resultados de estrategias deterministas describen políticas reproducibles, no jugadores humanos perfectos.
8. No introducir aleatoriedad o Monte Carlo mientras el juego continúe siendo determinista.
9. No modificar simultáneamente Zafiro y costos durante esta campaña inicial.
10. No programar gameplay oficial de Esmeralda hasta completar al menos Rondas 1, 2 y 3.

---

# 21. Condición para comenzar `EMERALD_DESIGN.md`

La fase formal de diseño de Esmeralda puede empezar cuando podamos responder con evidencia:

1. ¿P5→P10 acelera, se estabiliza o se frena con el balance oficial?
2. ¿Qué ocurre cuando Zafiro se congela en P5?
3. ¿Qué parte de la trayectoria desaparece al neutralizar Zafiro?
4. ¿Qué rango post-P5 evita runaway o muro?
5. ¿Cuánto tiempo de cada ciclo contiene decisiones reales?
6. ¿Qué sistemas dominan la ruta?
7. ¿Qué diferencias persisten entre estrategias razonables?
8. ¿Cuál es el problema recurrente que Esmeralda debe resolver?

Solo entonces se debe abrir una rama de diseño de Esmeralda y convertir el problema observado en una identidad mecánica.

---

# 22. Primera acción recomendada

Ejecutar `EXP-PRESTIGE-001` a `EXP-PRESTIGE-004` antes de tocar cualquier parámetro.

La primera interpretación debe responder únicamente:

> ¿Cómo se comporta hoy P5→P10 bajo cuatro estilos de compra razonables con 2 clics/s?

Después se elige el control de Ronda 2 y se ejecuta el contrafactual de Zafiro.
