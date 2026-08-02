# HISTORIAL_GPT — Incremental Game A

> Bitácora compartida entre Arturo y GPT.  
> **Regla para nuevos chats:** leer este archivo y comprobar la rama activa antes de modificar el proyecto.

## 1. Estado del repositorio

- Repositorio: `xArtXtrAx/incremental-game-A`.
- Rama estable: `main`.
- Ramas históricas: `Dev-Prestigio-Test`, `Dev-Orbita-Zafiro-Test` y `Dev-Matriz-Refraccion-Test`.
- Entorno: React + TypeScript + Vite + Motion.
- Guardado estable: `incremental-game-a:save:v1`.
- Última actualización: **2 de agosto de 2026**.

`main` contiene el prestigio del zafiro, el render WebGL, el pulso progresivo, la órbita WebGL, la iluminación dinámica de la chispa, la Evolución 08 — Matriz de refracción, el bloqueo global de selección/cursor y Comprar todo estratégico. Arturo aprobó visualmente estos sistemas antes de integrarlos.

## 2. Forma de trabajo

- Trabajar de forma directa y evitar microcomprobaciones redundantes.
- Usar GitHub Desktop para el flujo local normal.
- Crear ramas para cambios visuales, estructurales o mecánicos importantes.
- Integrar a `main` solamente después de la validación de Arturo.
- Evitar ZIP, manifiestos y hashes salvo necesidad técnica o petición expresa.
- Agrupar pruebas y registrar aquí las decisiones relevantes.

## 3. Interfaz estable

- Resumen superior compacto.
- Núcleo fijo a la izquierda en escritorio.
- Evoluciones en panel desplazable con pestañas Producción, Núcleo y Avanzadas.
- Tarjetas expandibles.
- Navegación móvil entre Núcleo y Evoluciones.
- Panel de desarrollador a la derecha en pantallas amplias y debajo en pantallas estrechas.
- Selección de texto deshabilitada globalmente salvo en campos editables.
- Flecha normal sobre textos, mano sobre controles y cursor de texto solo en campos editables.
- Un listener global de `selectstart` evita selecciones iniciadas desde el fondo exterior.

## 4. Evoluciones

### Evolución 01 — Amplificador de pulso

- +1 de energía base por nivel y clic.
- Costo inicial: 10.
- Crecimiento: ×1.7.

### Evolución 02 — Microgenerador

- Produce energía automáticamente.
- Costo inicial: 25.
- Crecimiento: ×1.8.

### Evolución 03 — Reactor de resonancia

- Multiplicador: `nivel + 1`.
- Costo inicial: 120.
- Crecimiento: ×2.2.

### Evolución 04 — Condensador de presión

- Cada nivel concede +2% global por cada tramo completo del 10% de llenado.
- Requisito inicial: 100 clics.
- Costo inicial: 500.
- Crecimiento: ×2.4.

### Evolución 05 — Cámara de cavitación

- Nivel 1: descarga cada 25 clics y recompensa equivalente a 5 segundos de producción.
- Los niveles reducen el ciclo y aumentan los segundos recompensados.
- Requiere 500 clics y un microgenerador antes del primer prestigio.
- Costo inicial: 2,000.
- Crecimiento: ×2.6.

### Evolución 06 — Válvula de sobrecarga

- Los clics posteriores al llenado cargan una fase temporal.
- Nivel 1: 100 clics, multiplicador ×2 y duración 15 segundos.
- Afecta clics, producción y cavitación.
- Requiere esfera llena y cavitación nivel 1 antes del primer prestigio.
- Costo inicial: 10,000.
- Crecimiento: ×3.

### Evolución 07 — Módulo de pulsación autónoma

- Genera clics reales del núcleo.
- Llena la esfera y carga presión, cavitación y sobrecarga.
- Progresión: `0.20 × 1.6^(nivel - 1)` clic/s.
- Límite técnico: 20 clic/s.
- Requiere 500 clics y un microgenerador antes del primer prestigio.
- Costo inicial: 5,000.
- Crecimiento: ×2.8.

### Evolución 08 — Matriz de refracción

- Requiere prestigio 1 y un microgenerador.
- Costo inicial: 25,000.
- Crecimiento: ×3.15.
- Facetas requeridas: P1=6, P2=8, P3=10, P4+=12.
- Carga: `1 + 0.15 × (nivel − 1)` facetas por vuelta.
- Usa la misma duración orbital 20→3 segundos del zafiro.
- Recompensa: producción base × `(8 + 3 × nivel)` segundos.
- Multiplicador PRISMA: `1.20 + 0.05 × nivel`.
- Duración PRISMA: `4 + nivel` segundos.
- Nivel 1: 1 faceta/vuelta, 11 segundos de producción, ×1.25 durante 5 segundos.
- PRISMA se combina multiplicativamente con sobrecarga y afecta clics, producción y cavitación.
- Las descargas posteriores extienden la duración activa.
- Al cristalizar se reinician nivel, progreso, facetas y bonificación.

## 5. Prestigio del zafiro

- El núcleo se llena a 5,000 clics.
- El prestigio se confirma con `CRISTALIZAR`; nunca ocurre automáticamente.
- La gema se ensambla, sale del núcleo y se instala en el soporte permanente.

Multiplicadores:

- P0: ×1.00.
- P1: ×1.50.
- P2: ×1.85.
- P3: ×2.20.
- P4: ×2.60.
- P5: ×3.05.
- Posteriores: +0.50 por cristalización.

Al cristalizar se reinician energía, clics, evoluciones temporales y cargas. Se conservan prestigio, zafiro, multiplicador y planos descubiertos.

## 6. Zafiro, órbita e iluminación

- Zafiro WebGL con geometría real, caras triangulares, normales y shaders.
- P1: 6 sectores; P2: 8; P3: 10; P4+: 12.
- Órbita elíptica WebGL separada en capa trasera y delantera transparentes.
- Chispa cian con núcleo blanco y estela de doce partículas.
- La chispa funciona como fuente de luz dinámica sobre las facetas.
- El antiguo destello diagonal 2D fue retirado.
- Duración de órbita y pulso:

```text
duración = 3 + 17 × (1 − clics / 5000)^1.6
```

- Núcleo vacío: 20 segundos por vuelta.
- Núcleo lleno: 3 segundos por vuelta.
- La fase se conserva al cambiar la velocidad.
- SVG y órbita CSS permanecen como respaldo si WebGL falla.
- La Matriz muestra indicadores alrededor del zafiro y genera halo, haces y mensaje de descarga prismática.

## 7. Comprar todo estratégico

Perfiles disponibles:

- `Equilibrado`: combina clics, producción, presión y apertura de sistemas.
- `Juego activo`: favorece Amplificador, Presión, Cavitación y Sobrecarga.
- `Automático`: favorece Microgenerador, Resonancia, Autoclicker y Refracción.

Funcionamiento:

1. Simula cada siguiente compra mediante el reducer real.
2. Descarta compras bloqueadas o inasequibles.
3. Calcula el valor esperado según el perfil.
4. Divide la ganancia estimada entre el costo.
5. Aplica pesos, bonos de apertura y penalización suave por concentración.
6. Compra virtualmente la mejor opción.
7. Recalcula hasta que no queda ninguna compra posible.
8. Al confirmar, vuelve a calcular sobre el estado autoritativo y aplica el resultado de una sola vez.

La estimación considera clic, producción por segundo, cavitación, autoclics, sobrecarga, refracción, clics acumulados, prestigio y dependencias.

Suposiciones internas para comparar estrategias:

- Equilibrado: 1.5 clics manuales/s.
- Juego activo: 5 clics manuales/s.
- Automático: 0.05 clics manuales/s.

Estas tasas no alteran el juego.

Interfaz:

- Panel sobre las evoluciones.
- Selector accesible con tres estrategias.
- Vista previa de niveles, gasto, saldo posterior y categorías principales.
- Botón `COMPRAR TODO POSIBLE`.
- Recibo posterior con niveles comprados, gasto y perfil.
- Máximo técnico: 320 compras por pulsación; no corta compras válidas con la energía máxima admitida.

Escenario de referencia: 5,000 clics, 5,000 energía, P0 y ninguna evolución.

- Equilibrado: Pulso 6, Generador 6, Resonancia 3, Presión 1, Cavitación 1; gasto 4,830.
- Juego activo: Pulso 7, Generador 5, Resonancia 3, Presión 1, Cavitación 1; gasto 4,599.
- Automático: Pulso 6, Generador 7, Resonancia 4, Presión 1; gasto 4,959.

## 8. Panel de desarrollador

Permite modificar únicamente energía acumulada y clics del núcleo.

- Sin negativos, letras, signos, comas ni notación científica.
- Energía con máximo dos decimales.
- Clics enteros.
- Energía máxima: 90,000,000,000,000.
- Clics máximos: 1,000,000,000.
- No modifica niveles, prestigios ni multiplicadores.

## 9. Arquitectura relevante

- `src/game.ts`: estado, migración, compras, reducer y multiplicadores.
- `src/refraction.ts`: costos, órbita, facetas, recompensa y avance de la matriz.
- `src/bulkPurchase.ts`: simulación, perfiles, puntuación y plan de compras.
- `src/BulkPurchaseControls.tsx`: selector, vista previa, confirmación y recibo.
- `src/BulkPurchase.css`: diseño responsivo del panel.
- `src/App.tsx`: ciclo principal, aplicación atómica y eventos visuales.
- `src/GameCore.tsx`: núcleo, PRISMA y descarga radial.
- `src/SapphireGem.tsx`: soporte e indicadores de facetas.
- `src/UpgradesPanelCompact.tsx`: tarjetas de evoluciones.
- `src/SapphireGem3D.tsx`: geometría, shaders e iluminación orbital.
- `src/SapphireOrbit3D.tsx`: anillo, chispa y estela WebGL.
- `src/SapphireOrbitState.ts`: fase y posición 3D compartidas.
- `src/index.css`: bloqueo global de selección y cursores.
- `src/main.tsx`: bloqueo nativo de `selectstart`.

## 10. Compatibilidad y validaciones

- Guardado: `incremental-game-a:save:v1`.
- Partidas anteriores reciben campos de refracción con valores seguros en cero.
- Estados temporales vencidos no se restauran.
- No existe progreso fuera de línea.
- Autoclics múltiples se procesan secuencialmente.
- No se añadieron dependencias.
- TypeScript estricto aislado pasó para los archivos modificados y nuevos.
- Se probaron compra, requisitos, vueltas de 20/3 segundos, descarga, recompensa, PRISMA, migración, reinicio y combinación con sobrecarga/cavitación.
- Comprar todo se probó con energía baja/alta, pocos/muchos clics, prestigio 0/1 y los tres perfiles.
- Arturo validó visualmente la Matriz, Comprar todo, el bloqueo de selección y el comportamiento del cursor.

No se ejecutaron remotamente con las dependencias reales del equipo local:

```powershell
npm run lint
npm run build
npm run dev
```

## 11. Inicio recomendado para otro chat

> Continúa `xArtXtrAx/incremental-game-A`. Lee `HISTORIAL_GPT.MD` y trabaja desde `main`. Las ramas `Dev-Prestigio-Test`, `Dev-Orbita-Zafiro-Test` y `Dev-Matriz-Refraccion-Test` son referencias históricas. Crea una rama nueva para la siguiente evolución importante.