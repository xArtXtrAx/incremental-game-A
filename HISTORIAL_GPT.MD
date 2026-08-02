# HISTORIAL_GPT — Incremental Game A

> Bitácora compartida entre Arturo y GPT.  
> **Regla para nuevos chats:** leer este archivo y comprobar la rama activa antes de modificar el proyecto.

## 1. Estado del repositorio

- Repositorio: `xArtXtrAx/incremental-game-A`.
- Rama estable: `main`.
- Rama experimental activa: `Dev-Matriz-Refraccion-Test`.
- Ramas históricas: `Dev-Prestigio-Test` y `Dev-Orbita-Zafiro-Test`.
- Entorno: React + TypeScript + Vite + Motion.
- Guardado estable: `incremental-game-a:save:v1`.
- Última actualización: **2 de agosto de 2026**.

`main` contiene el prestigio del zafiro, el render WebGL, el pulso progresivo, la órbita WebGL y la iluminación dinámica producida por la chispa orbital. Arturo validó visualmente esos sistemas antes de integrarlos.

`Dev-Matriz-Refraccion-Test` parte del `main` aprobado y añade la Evolución 08 — Matriz de refracción, el bloqueo global de selección/cursor y el sistema experimental de compra total estratégica. No debe integrarse a `main` sin la validación visual y funcional de Arturo.

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
- Selección de texto deshabilitada globalmente salvo dentro de campos editables.
- Flecha normal sobre textos, mano sobre controles y cursor de texto solo en campos editables.

## 4. Evoluciones estables

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

El prestigio multiplica clics, producción, presión, resonancia, cavitación, sobrecarga y autoclics. Al cristalizar se reinician energía, clics, evoluciones temporales y sus cargas; se conservan prestigio, zafiro, multiplicador y planos descubiertos.

## 6. Zafiro, órbita e iluminación estables

- Zafiro WebGL con geometría real, caras triangulares, normales y shaders.
- P1: 6 sectores; P2: 8; P3: 10; P4+: 12.
- Órbita elíptica WebGL con capa trasera y delantera transparentes.
- Chispa cian con núcleo blanco y estela de doce partículas.
- La chispa funciona como fuente de luz dinámica sobre las facetas.
- El antiguo destello diagonal 2D fue retirado.
- Duración de órbita y pulso:

```text
duración = 3 + 17 × (1 − clics / 5000)^1.6
```

- Núcleo vacío: 20 segundos por vuelta.
- Núcleo lleno: 3 segundos por vuelta.
- La fase se conserva de forma continua al cambiar la velocidad.
- SVG y órbita CSS permanecen como respaldo cuando WebGL falla.

## 7. Propuesta experimental — Evolución 08: Matriz de refracción

Implementada solamente en `Dev-Matriz-Refraccion-Test`.

### Requisitos y costo

- Requiere al menos prestigio 1.
- Requiere un microgenerador.
- Costo inicial: 25,000 de energía.
- Crecimiento de costo: ×3.15 por nivel.
- No altera la clave ni la versión actual del guardado.
- Partidas anteriores reciben los nuevos campos con valores seguros en cero.

### Carga de facetas

La matriz utiliza la misma curva de duración 20→3 segundos de la órbita visual. El ciclo se procesa dentro del `tick` del juego y acumula progreso fraccionario de vuelta.

Número de facetas requeridas:

- Prestigio 1: 6.
- Prestigio 2: 8.
- Prestigio 3: 10.
- Prestigio 4 o superior: 12.

Velocidad de carga:

```text
facetas por vuelta = 1 + 0.15 × (nivel − 1)
```

Nivel 1 carga una faceta por vuelta completa. Los niveles posteriores pueden acumular más de una faceta por vuelta mediante progreso fraccionario.

### Descarga prismática

Al completar todas las facetas:

1. La carga de facetas vuelve a cero.
2. Se entrega una recompensa inmediata basada en producción.
3. Se activa el estado temporal `PRISMA`.
4. Las descargas posteriores extienden la duración activa en vez de reemplazarla.

Recompensa:

```text
segundos recompensados = 8 + 3 × nivel
recompensa = producción base por segundo × segundos recompensados
```

La producción base de la descarga incluye presión, resonancia, zafiro y sobrecarga activa, pero excluye el multiplicador de refracción para evitar retroalimentación recursiva.

Bonificación temporal:

```text
multiplicador PRISMA = 1.20 + 0.05 × nivel
duración = 4 + nivel segundos
```

Nivel 1:

- 1 faceta por vuelta.
- Recompensa equivalente a 11 segundos de producción.
- Multiplicador ×1.25.
- Duración 5 segundos.

El multiplicador PRISMA se combina multiplicativamente con sobrecarga y afecta clics, producción automática y recompensas de cavitación.

### Reinicio y persistencia

- Nivel, progreso orbital, facetas cargadas y estado PRISMA se guardan automáticamente.
- Un estado PRISMA vencido no se restaura al cargar la partida.
- Al cristalizar se reinician nivel, progreso, facetas y bonificación, igual que las demás evoluciones temporales.
- El contador interno de descargas permite detectar cada evento visual sin confundirlo con una actualización normal.

### Representación visual

- El soporte permanente muestra 6, 8, 10 o 12 indicadores alrededor del zafiro.
- Cada indicador encendido representa una faceta cargada.
- Durante PRISMA, los indicadores pulsan y el núcleo recibe un halo prismático giratorio.
- La descarga genera un anillo expansivo, haces radiales y el mensaje `DESCARGA PRISMÁTICA`.
- El estado del núcleo muestra facetas cargadas, porcentaje de la vuelta actual y recompensa prevista.
- La tarjeta de Evolución 08 muestra costo, requisitos, carga, recompensa, multiplicador, duración y tiempo actual por vuelta.

Los indicadores rodean visualmente el zafiro; no modifican todavía la geometría ni colorean individualmente las caras del shader WebGL.

## 8. Propuesta experimental — Comprar todo estratégico

Implementada solamente en `Dev-Matriz-Refraccion-Test`.

### Perfiles disponibles

- `Equilibrado`: combina clics, producción automática, presión y apertura de sistemas.
- `Juego activo`: favorece Amplificador, Presión, Cavitación y Sobrecarga.
- `Automático`: favorece Microgenerador, Resonancia, Autoclicker y Refracción.

El perfil elegido se conserva mientras el componente permanece montado, pero todavía no se guarda en `localStorage`.

### Funcionamiento

1. Simula cada siguiente nivel que puede comprarse mediante el reducer real.
2. Descarta automáticamente cualquier compra bloqueada o inasequible.
3. Calcula el valor esperado del estado resultante según el perfil.
4. Divide la ganancia estimada entre el costo.
5. Aplica pesos estratégicos, bonos de apertura y una penalización suave por concentración.
6. Compra virtualmente la mejor opción.
7. Recalcula desde el nuevo estado y repite hasta que no queda ninguna compra posible.
8. Aplica el estado final de una sola vez para evitar decenas de renders consecutivos.

La estimación considera por separado:

- energía por clic;
- producción por segundo;
- recompensa media de cavitación por clic;
- clics automáticos;
- disponibilidad y ciclo esperado de sobrecarga;
- recompensa y tiempo activo estimados de refracción;
- cantidad actual de clics, prestigio, planos y dependencias.

Los perfiles suponen aproximadamente:

- Equilibrado: 1.5 clics manuales por segundo.
- Juego activo: 5 clics manuales por segundo.
- Automático: 0.05 clics manuales por segundo.

Estas tasas no alteran el juego; solo sirven para comparar compras.

### Interfaz

- Panel independiente sobre las tarjetas de evoluciones.
- Tres botones de estrategia con `radiogroup` accesible.
- Vista previa de niveles, energía gastada y saldo posterior.
- Resumen de las tres categorías con más niveles propuestos.
- Botón `COMPRAR TODO POSIBLE`.
- Mensaje posterior con niveles comprados, gasto y perfil utilizado.
- El botón se deshabilita durante cristalización o cuando no existe ninguna compra posible.

### Límites y seguridad

- Máximo técnico: 320 compras en una pulsación.
- Con la energía máxima permitida por el panel de desarrollador y los costos exponenciales, el máximo teórico conjunto es menor a 320 niveles; el límite no corta compras válidas.
- No modifica clics, prestigio, cargas ni temporizadores por fuera de lo que hace cada acción individual del reducer.
- No compra evoluciones bloqueadas ni omite prerrequisitos.
- La vista previa usa exactamente el mismo estado que se aplica al confirmar.

Escenario de referencia con 5,000 clics, 5,000 de energía, prestigio 0 y ninguna evolución:

- Equilibrado: Pulso 6, Generador 6, Resonancia 3, Presión 1 y Cavitación 1; gasto 4,830.
- Juego activo: Pulso 7, Generador 5, Resonancia 3, Presión 1 y Cavitación 1; gasto 4,599.
- Automático: Pulso 6, Generador 7, Resonancia 4 y Presión 1; gasto 4,959.

Estos resultados son una base inicial de balance, no una promesa de optimalidad matemática absoluta.

## 9. Panel de desarrollador

Permite modificar únicamente energía acumulada y clics del núcleo.

Protecciones:

- Sin negativos, letras, signos, comas ni notación científica.
- Energía con máximo dos decimales.
- Clics enteros.
- Energía máxima: 90,000,000,000,000.
- Clics máximos: 1,000,000,000.
- No modifica niveles, prestigios ni multiplicadores.

## 10. Arquitectura relevante

- `src/game.ts`: estado, migración, compras, reducer y combinación de multiplicadores.
- `src/refraction.ts`: costos, duración orbital, facetas, recompensa y avance de la matriz.
- `src/bulkPurchase.ts`: simulación, perfiles, puntuación adaptativa y plan final de compras.
- `src/BulkPurchaseControls.tsx`: selector de estrategia, vista previa, confirmación y recibo.
- `src/BulkPurchase.css`: diseño responsivo del panel de compra estratégica.
- `src/App.tsx`: ciclo principal, aplicación atómica del plan y detección de descargas prismáticas.
- `src/GameCore.tsx`: estado visual del núcleo, halo PRISMA y descarga radial.
- `src/SapphireGem.tsx`: indicadores de facetas alrededor del zafiro permanente.
- `src/UpgradesPanelCompact.tsx`: tarjeta de Evolución 08 y cálculos de vista previa.
- `src/SapphireGem3D.tsx`: geometría, shaders, pulso e iluminación orbital estable.
- `src/SapphireOrbit3D.tsx`: anillo, chispa y estela WebGL.
- `src/SapphireOrbitState.ts`: fase y posición 3D compartidas.

## 11. Validaciones de la rama experimental

Validaciones aisladas realizadas:

- TypeScript estricto de `game.ts`, `refraction.ts`, `App.tsx`, `GameCore.tsx`, `SapphireGem.tsx` y `UpgradesPanelCompact.tsx` mediante stubs de React, Motion y CSS.
- TypeScript estricto de `bulkPurchase.ts`, `BulkPurchaseControls.tsx` y la integración actualizada de `App.tsx`.
- Compra de nivel 1 de refracción y descuento de costo.
- Una faceta después de una vuelta de 20 segundos con núcleo vacío.
- Una faceta exactamente después de tres pulsos con núcleo lleno.
- Descarga al completar la sexta faceta en prestigio 1.
- Recompensa inmediata y activación de ×1.25 durante 5 segundos.
- Multiplicador aplicado a los clics.
- Migración de partidas anteriores sin campos de refracción.
- Reinicio completo de la matriz al cristalizar.
- Corrección de precisión numérica para vueltas de 3 segundos.
- Temporizador visual persistente aunque se compre otro nivel durante la animación.
- Compra total probada con poca/mucha energía, pocos/muchos clics y prestigio 0/1.
- Diferenciación comprobada entre Equilibrado, Juego activo y Automático.
- Límite de 320 compras contrastado con el máximo de energía del panel.
- Sin dependencias nuevas.

No se ejecutaron con las dependencias reales del equipo local:

```powershell
npm run lint
npm run build
npm run dev
```

Prueba visual pendiente por Arturo:

1. Cambiar a `Dev-Matriz-Refraccion-Test`.
2. Confirmar que el panel `Comprar todo` aparece arriba de las evoluciones.
3. Probar cada perfil con la misma energía y comparar la vista previa.
4. Confirmar que no se compran evoluciones bloqueadas.
5. Verificar que niveles, gasto y saldo coinciden con la vista previa.
6. Probar 5,000 clics con energía baja, media y alta.
7. Probar prestigio 0 y prestigio 1 para incluir o excluir Refracción.
8. Probar Matriz de refracción: carga, descarga, recompensa y PRISMA.
9. Probar simultáneamente PRISMA, cavitación y sobrecarga.
10. Confirmar que cristalizar reinicia la evolución y no conserva compras temporales.
11. Volver a `main` y confirmar que la versión estable permanece intacta.

## 12. Compatibilidad

- Guardado estable: `incremental-game-a:save:v1`.
- La antigua clave experimental de prestigio se migra una sola vez y se elimina.
- No existe progreso fuera de línea.
- Los autoclics múltiples se procesan secuencialmente.
- `main` no contiene todavía la Matriz de refracción ni Comprar todo.

## 13. Inicio recomendado para otro chat

> Continúa `xArtXtrAx/incremental-game-A`. Lee `HISTORIAL_GPT.MD`. La rama estable es `main`; la rama experimental activa es `Dev-Matriz-Refraccion-Test`. Prueba y ajusta la Evolución 08 y Comprar todo sin integrarlos a `main` hasta que Arturo los apruebe visualmente.
