# PLANTILLAS MATEMÁTICAS SEGURAS

> Fase 6 del Laboratorio de Balance para construir variantes declarativas, explicables, serializables y comparables sin ejecutar código introducido por el usuario.

## 1. Alcance de la primera entrega

La herramienta genera series finitas que se convierten en un `BalanceConfig` completo y validado.

Destinos iniciales:

1. costos base de las nueve evoluciones;
2. factores de crecimiento de costos;
3. multiplicadores de Zafiro P1–P5.

La primera entrega no cambia la forma autoritativa de las fórmulas internas del gameplay. Las series generadas alimentan campos que `BalanceConfig` ya representa exactamente.

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

Cada especificación usa una unión discriminada de TypeScript y pasa por dos etapas:

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

El usuario configura:

```text
inicio
paso
```

La cantidad de muestras depende del destino y no puede crecer sin límite:

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

## 7. Perfiles DEV y comparación A/B

El borrador puede guardarse como perfil DEV únicamente después de una confirmación explícita.

Guardar:

- valida nuevamente el `BalanceConfig`;
- escribe solo en la colección de perfiles DEV;
- no carga el perfil;
- no modifica el runtime;
- no modifica la partida normal.

Después de guardarlo, la herramienta permite abrir el Comparador A/B. El perfil se selecciona allí como cualquier otro perfil persistente y se ejecuta mediante `runWithBalanceConfig()` y `gameReducer()`.

## 8. Importación y exportación

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

La importación rechaza:

- JSON malformado;
- versión de exportación incompatible;
- versión de especificación incompatible;
- versión distinta de `BalanceConfig`;
- tipos de plantilla desconocidos;
- parámetros o dominios inválidos.

Una importación válida se vuelve a evaluar; no confía en valores precalculados contenidos en el archivo.

## 9. Archivos

```text
src/mathematicalTemplates.ts
src/MathematicalTemplateSystem.tsx
src/MathematicalTemplateSystem.css

tests/unit/mathematicalTemplates.test.ts
tests/integration/mathematicalTemplates.integration.test.ts
tests/e2e/mathematical-templates.spec.ts
```

## 10. Cobertura automatizada

### Unitarias

- seis familias matemáticas;
- determinismo;
- redondeos;
- parámetros inválidos;
- dominios inválidos;
- prevención de `NaN` e infinitos;
- límites de exponentes, bases y grados;
- conversión a cada destino;
- rechazo final por `balanceValidation`;
- serialización y versiones incompatibles.

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
- apertura del Comparador A/B;
- ejecución comparativa;
- guardado normal y runtime oficial intactos.

Comando dedicado:

```bash
npm run test:templates
```

## 11. Limitación deliberada

Esta fase no sustituye todavía `CostCurveConfig` por una unión de fórmulas de gameplay. Hacerlo requeriría una migración de esquema, perfiles y todas las funciones consumidoras.

La primera entrega permite estudiar curvas diferentes y convertirlas en configuraciones representables por el contrato vigente con un riesgo mucho menor.

## 12. Ampliaciones posteriores

Después de validar esta base:

1. envío transitorio directo al borrador del Laboratorio de Balance;
2. candidato matemático transitorio para A/B sin guardarlo como perfil;
3. destinos adicionales representables por `BalanceConfig`;
4. composiciones seguras por tramos;
5. gráficas de previsualización;
6. posible evolución tipada de `CostCurveConfig`, en una fase independiente y con migración formal.
