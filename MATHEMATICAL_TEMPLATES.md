# PLANTILLAS MATEMÁTICAS SEGURAS

> Fase 6 del Laboratorio de Balance para construir variantes declarativas, explicables, serializables y comparables sin ejecutar código introducido por el usuario.

## 1. Alcance

La herramienta genera series finitas que se convierten en un `BalanceConfig` completo y validado.

Destinos iniciales:

1. costos base de las nueve evoluciones;
2. factores de crecimiento de costos;
3. multiplicadores de Zafiro P1–P5.

La implementación no cambia la forma autoritativa de las fórmulas internas del gameplay. Las series generadas alimentan campos que `BalanceConfig` ya representa exactamente.

## 2. Familias matemáticas

### Lineal

```text
y = intercepto + pendiente × x
```

### Exponencial

```text
y = inicial × crecimiento^x
```

### Potencia

```text
y = desplazamiento + escala × x^exponente
```

### Raíz

```text
y = desplazamiento + escala × x^(1/grado)
```

### Logarítmica

```text
y = desplazamiento + escala × log_base(x + traslado)
```

### Rendimientos decrecientes

```text
y = mínimo + (máximo − mínimo) × x / (semisaturación + x)
```

Cuando `x = semisaturación`, la curva alcanza exactamente la mitad del recorrido entre mínimo y máximo.

## 3. Seguridad

Está prohibido y no se implementa:

- `eval()`;
- `new Function()`;
- expresiones JavaScript arbitrarias;
- funciones suministradas por el usuario;
- aplicación automática a la sesión;
- modificación del balance oficial;
- escritura en el guardado normal.

Cada especificación pasa por esta ruta:

```text
validación de especificación y dominio
                ↓
evaluación finita y determinista
                ↓
conversión a BalanceConfig
                ↓
validateBalanceConfig()
```

Una serie no se considera utilizable si cualquiera de sus valores produce:

- `NaN`;
- `Infinity`;
- un dominio matemáticamente inválido;
- un parámetro fuera de límites;
- un valor fuera del rango del destino;
- una relación rechazada por `balanceValidation`.

## 4. Dominio y muestras

El usuario configura el inicio y el paso del dominio. La cantidad de muestras depende del destino y no puede crecer sin límite:

```text
Costos base:       9
Crecimientos:      9
Zafiro P1–P5:      5
Máximo del motor: 32
```

Esto evita evaluaciones abiertas o recorridos excesivos.

## 5. Redondeo

Opciones explícitas:

- sin redondeo;
- entero más cercano;
- redondeo hacia arriba;
- decimales fijos, hasta ocho posiciones.

El redondeo forma parte de la especificación exportada y, por tanto, de la reproducibilidad.

## 6. Conversión a BalanceConfig

La herramienta clona un balance base, escribe únicamente los campos del destino y llama a `validateBalanceConfig()`.

No existen fórmulas paralelas de gameplay. El reducer, las compras, los desbloqueos, la simulación y el Comparador A/B continúan consumiendo `BalanceConfig` por las rutas autoritativas existentes.

## 7. Transferencia transitoria en memoria

`mathematicalTemplateTransfer.ts` mantiene como máximo un candidato matemático validado. El candidato contiene:

```text
id transitorio
nombre
origen template
destino matemático
fecha de creación
especificación congelada
BalanceConfig congelado
```

La transferencia:

- existe únicamente en memoria;
- no usa `localStorage`;
- no escribe en la partida normal;
- no cambia el runtime visible;
- clona y congela los datos para evitar mutaciones cruzadas;
- se elimina explícitamente al usarla o descartarla;
- desaparece al recargar la página.

## 8. Envío al Laboratorio de Balance

El botón **Enviar al Laboratorio** publica el candidato validado y abre el Laboratorio.

El Laboratorio muestra una transferencia pendiente con dos decisiones explícitas:

- **Usar en borrador:** reemplaza solamente el borrador editable del Laboratorio;
- **Descartar:** elimina la transferencia y conserva el borrador existente.

Recibir o usar una transferencia no equivale a **Aplicar a sesión**. El runtime continúa en `official` hasta que el usuario pulse por separado el botón autoritativo del Laboratorio.

## 9. Comparación A/B sin guardar

El botón **Comparar sin guardar** publica el candidato y abre el Comparador A/B.

El candidato aparece con origen `template`, se selecciona como Perfil B y puede ejecutarse mediante `runWithBalanceConfig()` y `gameReducer()` bajo las mismas condiciones deterministas que los perfiles persistentes.

Este flujo:

- no crea un perfil DEV;
- no modifica la colección de perfiles;
- no aplica el balance a la sesión;
- permite descartar el candidato desde el Comparador.

## 10. Perfiles DEV

El borrador también puede guardarse como perfil DEV después de una confirmación explícita.

Guardar:

- valida nuevamente el `BalanceConfig`;
- escribe solo en la colección de perfiles DEV;
- no carga el perfil;
- no modifica el runtime;
- no modifica la partida normal.

Este flujo persistente es independiente de la transferencia transitoria.

## 11. Importación y exportación

Extensión sugerida:

```text
.math-template.json
```

La exportación incluye:

```text
exportVersion
specificationVersion
balanceConfigSchemaVersion
exportedAt
specification
```

La importación rechaza JSON malformado, versiones incompatibles, tipos desconocidos, parámetros inválidos y dominios inválidos. Una importación válida se vuelve a evaluar; no confía en valores precalculados contenidos en el archivo.

## 12. Archivos

```text
src/mathematicalTemplates.ts
src/mathematicalTemplateTransfer.ts
src/MathematicalTemplateSystem.tsx
src/MathematicalTemplateSystem.css
src/BalanceLaboratorySystem.tsx
src/DeveloperComparativeExperimentSystem.tsx
src/comparativeExperiment.ts

tests/unit/mathematicalTemplates.test.ts
tests/unit/mathematicalTemplateTransfer.test.ts
tests/integration/mathematicalTemplates.integration.test.ts
tests/e2e/mathematical-templates.spec.ts
```

## 13. Cobertura automatizada

### Unitarias

- seis familias matemáticas;
- determinismo y redondeos;
- parámetros y dominios inválidos;
- prevención de `NaN` e infinitos;
- límites de exponentes, bases y grados;
- conversión a cada destino;
- serialización y versiones incompatibles;
- publicación, clonación, congelamiento, notificación y descarte de transferencias;
- rechazo de candidatos incompatibles sin sustituir el snapshot anterior.

### Integración

- balance oficial inmutable;
- perfil DEV guardado pero no aplicado;
- override transitorio sin cambio de revisión;
- comparación A/B reproducible;
- runtime visible intacto.

### Playwright

- creación y previsualización;
- exportación e importación;
- confirmación de guardado;
- navegación estable con DualSense y deriva simulada;
- envío al borrador del Laboratorio sin aplicación automática;
- comparación transitoria sin crear un perfil DEV;
- guardado normal y runtime oficial intactos.

Comando dedicado:

```bash
npm run test:templates
```

## 14. Limitación deliberada

Esta fase no sustituye todavía `CostCurveConfig` por una unión de fórmulas de gameplay. Hacerlo requeriría una migración de esquema, perfiles y todas las funciones consumidoras.

La herramienta permite estudiar curvas diferentes y convertirlas en configuraciones representables por el contrato vigente con un riesgo mucho menor.

## 15. Ampliaciones posteriores

Después de validar esta base:

1. mensajes de error con valor generado, rango permitido y muestra exacta;
2. destinos adicionales representables por `BalanceConfig`;
3. composiciones seguras por tramos;
4. gráficas de previsualización;
5. posible evolución tipada de `CostCurveConfig`, en una fase independiente y con migración formal.
