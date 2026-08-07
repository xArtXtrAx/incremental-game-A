# LABORATORIO DE PROGRESIÓN DE PRESTIGIO

> Instrumentación DEV para experimentar con la progresión posterior a P5 antes de diseñar Esmeralda.

## 1. Estado

Implementado en la rama:

```text
Dev-Prestige-Progression-Laboratory
```

La herramienta complementa al Observatorio de Ciclos y Prestigio. El Observatorio conserva telemetría en vivo y comparación multiciclo A/B; este laboratorio añade experimentos contrafactuales y barridos sistemáticos.

No introduce Esmeralda, recursos nuevos ni cambios al guardado normal.

## 2. Principios de aislamiento

- `gameReducer()` sigue siendo la autoridad de clics, ticks, compras y cristalización.
- `runWithBalanceConfig()` instala balances válidos de forma transitoria y síncrona.
- Ningún experimento modifica el runtime visible.
- Ningún experimento escribe perfiles, escenarios o partida normal.
- No se usa `eval()`, `new Function()` ni fórmulas de gameplay paralelas.
- Los resultados viven en memoria y solo se guardan cuando el usuario exporta JSON.

## 3. Contrafactual de Zafiro

Políticas disponibles:

```text
Oficial
Neutralizado ×1.00
Congelado en P5
Incremento post-P5 configurable
```

### Neutralización

El contrato normal de `BalanceConfig` exige que los seis multiplicadores P0–P5 sean estrictamente crecientes. Por ello el laboratorio no fabrica un perfil inválido `[1, 1, 1, 1, 1, 1]`.

En una corrida neutralizada:

1. el reducer se ejecuta bajo un `BalanceConfig` válido;
2. se observa la ganancia producida por cada clic o tick autoritativo;
3. únicamente dentro de la copia aislada del estado, la ganancia se reescala por la razón entre el multiplicador contrafactual y el multiplicador válido del recorrido;
4. la energía ajustada alimenta las compras y ticks posteriores de la misma corrida;
5. no se modifica ninguna configuración persistente.

Esto permite estudiar una trayectoria efectiva ×1 sin debilitar el validador global ni guardar balances imposibles.

### Congelado en P5

Conserva P0–P5 y fija:

```text
postMaximumLevelIncrement = 0
```

Sirve para comprobar si P6, P7 y ciclos posteriores siguen funcionando cuando Zafiro deja de crecer después de ×3.05.

## 4. Explorador de curvas

Barrido inicial:

```text
+0.00
+0.10
+0.20
+0.30
+0.50
+0.70
```

Cada punto recibe el mismo:

- escenario;
- balance base;
- tiempo inicial;
- tasa manual de clics;
- política de compra;
- objetivo de ciclos;
- límite temporal.

Se reportan:

- ciclos completados;
- duración media;
- último ciclo;
- duraciones individuales;
- razón `último / primero` como lectura compacta de aceleración.

## 5. Estrategias de compra

Cinco políticas deterministas:

### Más barata

Selecciona la compra válida de menor costo y resuelve empates con orden estable.

### Producción

Prioriza:

```text
Generador → Resonancia → Autoclicker → Presión → Cavitación → Sobrecarga → Refracción → Gatillo → Clic
```

### Manual

Prioriza potencia y sistemas relacionados con participación activa.

### Automática

Prioriza Autoclicker, Generador, Resonancia y sistemas de producción autónoma.

### ROI

Para cada compra válida:

1. el reducer produce el estado posterior;
2. las métricas autoritativas calculan la producción efectiva antes y después;
3. se divide la ganancia estimada de producción entre el costo real de la compra;
4. gana el mayor cociente; los empates se resuelven de forma estable.

ROI es una heurística reproducible, no un optimizador global.

## 6. Analizador de ruta

Cada compra aceptada registra:

```text
ciclo
segundo dentro del ciclo
mejora
costo real
nivel resultante
```

El resumen calcula:

- cantidad de compras por evolución;
- energía gastada por evolución;
- evolución dominante por gasto;
- sistemas nunca comprados;
- primeras 40 compras de la cronología;
- tiempo total sin decisiones.

Esto permite distinguir un ciclo corto con decisiones frecuentes de otro ciclo corto dominado por esperas largas.

## 7. Batch Experiment Runner

El lote combina:

```text
escenarios × políticas de Zafiro × estrategias × tasas de clic
```

Límite duro:

```text
240 corridas por operación
```

La primera interfaz ejecuta, sobre el escenario seleccionado:

```text
4 políticas de Zafiro
× 5 estrategias
× 3 tasas de clic (0, 2, 5/s)
= 60 corridas
```

Las filas pueden ordenarse por ciclos completados y duración media para detectar rápidamente zonas interesantes antes de ejecutar análisis focalizados.

## 8. Interfaz

Acceso nuevo en el Panel DEV:

```text
P↗ Laboratorio de Progresión
```

Pestañas:

1. Contrafactual.
2. Curvas.
3. Estrategias.
4. Ruta.
5. Lotes.

La ventana se monta en `.developer-panel-workspace-host`, usa `aria-modal="false"` y conserva el juego visible y operable.

## 9. Archivos

```text
src/prestigeProgressionLaboratory.ts
src/PrestigeProgressionLaboratorySystem.tsx
src/PrestigeProgressionLaboratorySystem.css

tests/unit/prestigeProgressionLaboratory.test.ts
tests/e2e/prestige-progression-laboratory.spec.ts
```

Comando dedicado:

```bash
npm run test:prestige-progression
```

## 10. Preguntas que debe responder antes de Esmeralda

1. ¿P6+ sigue siendo jugable si Zafiro queda congelado en P5?
2. ¿Qué incremento post-P5 evita aceleración runaway sin volver planos los ciclos?
3. ¿El balance funciona con estilos manual, automático y orientado a ROI?
4. ¿Qué compras dominan cada ciclo y dónde aparecen esperas sin decisiones?
5. ¿Qué combinaciones de política, estrategia y actividad producen una zona de progresión estable?
6. ¿Esmeralda debe responder a duración, eficiencia, recuperación post-reset o producción pasiva?

No debe aprobarse una fórmula de Esmeralda solamente por el resultado de una estrategia o una tasa de clic.
