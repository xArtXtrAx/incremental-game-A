# POLÍTICA DE PRUEBAS — Incremental Game A

> Documento rector para cambios funcionales, correcciones y sistemas nuevos.
>
> La automatización de pruebas es una prioridad del proyecto. La validación manual de Arturo debe reservarse para aspectos que realmente dependan de percepción visual, hardware o del entorno físico.

## 1. Regla principal

Todo cambio funcional importante debe incluir pruebas automatizadas proporcionales a su riesgo antes de integrarse en `main`.

No se debe entregar a Arturo una matriz manual extensa cuando el comportamiento pueda comprobarse razonablemente mediante Vitest, Playwright o GitHub Actions.

## 2. Capas de prueba

### Pruebas unitarias — Vitest

Comprueban funciones y reglas puras de forma rápida y aislada:

- fórmulas;
- límites;
- normalización;
- desbloqueos;
- validación;
- conservación de progreso;
- transformaciones de estado;
- regresiones específicas.

### Pruebas de integración — Vitest

Comprueban que varios módulos colaboren correctamente:

- configuración activa → reducer;
- runtime → fórmulas;
- requisitos → compras individuales;
- requisitos → Comprar todo;
- normalización → restauración;
- guardado → migración;
- prestigio → metaprogresión.

### Pruebas end-to-end — Playwright

Comprueban el recorrido real en navegador:

- abrir herramientas;
- editar controles;
- aplicar configuraciones;
- observar cambios visibles;
- restaurar;
- recargar;
- comprobar persistencia o ausencia de persistencia;
- prevenir regresiones de interacción.

### Validación manual breve

Se reserva principalmente para:

- apariencia y legibilidad;
- animaciones WebGL;
- sensación de uso;
- rendimiento perceptible;
- DualSense y otros dispositivos físicos;
- vibración y hápticos;
- diferencias particulares de Windows, Chrome, GPU o pantalla;
- sesiones prolongadas cuando el comportamiento temporal sea relevante.

## 3. Cantidad orientativa por cambio

Las cifras no son cuotas rígidas. Deben cubrir el riesgo real y evitar pruebas redundantes.

| Tipo de cambio | Unitarias | Integración | E2E | Manual |
|---|---:|---:|---:|---:|
| Corrección pequeña y aislada | 3–6 | 0–2 | 0–1 | humo breve si aplica |
| Función importante | 12–20 | 4–8 | 1–3 | revisión visual breve |
| Sistema crítico | 20–40+ | 6–12+ | 2–5+ | matriz física focalizada |

Sistemas críticos actuales:

- guardado y migraciones;
- cristalización y prestigio;
- Laboratorio de Balance;
- Comprar todo;
- producción y economía;
- entrada de gamepad;
- nuevas gemas y metaprogresión.

## 4. Cobertura mínima conceptual

Cada cambio funcional importante debe cubrir, cuando corresponda:

1. funcionamiento normal;
2. límites inferiores y superiores;
3. igualdad exacta con el umbral;
4. entradas inválidas;
5. conservación de recursos y niveles;
6. interacción con sistemas relacionados;
7. reversión o restauración;
8. persistencia y recarga;
9. ausencia de mutaciones accidentales;
10. una prueba permanente por cada bug descubierto.

## 5. Regla de regresión

Cada fallo confirmado debe producir una prueba automatizada que falle antes de la corrección y pase después de ella, siempre que el escenario sea automatizable.

Un bug no se considera cerrado de forma robusta si puede reaparecer sin que ninguna prueba lo detecte.

## 6. Comandos oficiales

```powershell
npm run test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:phase4
npm run test:all
```

`npm run test:all` ejecuta:

```text
lint
  ↓
Vitest
  ↓
build
  ↓
Playwright
```

## 7. GitHub Actions

El workflow `.github/workflows/quality-gate.yml` debe ejecutar automáticamente en ramas DEV, PR contra `main` y `main`:

- lint;
- pruebas unitarias;
- pruebas de integración;
- build de producción;
- Playwright en Chromium;
- conservación de reportes y trazas cuando falle el navegador.

Una integración no debe declararse validada automáticamente hasta que los checks asociados hayan terminado correctamente.

## 8. Evidencia y lenguaje obligatorio

- No afirmar que una prueba pasó si no se ejecutó.
- Distinguir entre revisión estática, prueba automatizada, prueba local y validación física.
- Registrar el número real de pruebas y sus resultados.
- Cuando GitHub Actions no exista o no haya corrido, decirlo explícitamente.
- La inspección del código no sustituye una ejecución real.

## 9. Responsabilidad de Arturo

Arturo no debe repetir manualmente reglas matemáticas, límites y recorridos que ya estén cubiertos por la suite.

Su revisión debe centrarse en una comprobación humana corta y valiosa:

- ¿se ve bien?;
- ¿se siente bien?;
- ¿el mando físico responde bien?;
- ¿hay parpadeos, tirones o comportamientos extraños?;
- ¿el diseño comunica correctamente el estado del juego?

## 10. Evolución de la suite

La suite debe crecer junto con el juego, pero mantenerse rápida, determinista y legible.

Evitar:

- pruebas duplicadas sin valor adicional;
- esperas temporales arbitrarias;
- selectores frágiles basados solo en estilos;
- dependencia del orden de ejecución;
- compartir estado entre pruebas;
- ocultar pruebas inestables mediante reintentos indefinidos.

Cuando una prueba E2E sea inestable, corregir la causa o sustituirla por una comprobación más determinista; no normalizar la inestabilidad.
