# HISTORIAL_GPT — Incremental Game A

> Bitácora compartida entre Arturo y GPT.  
> **Regla para nuevos chats:** leer este archivo y comprobar la rama activa antes de modificar el proyecto.

## 1. Estado estable

- Repositorio: `xArtXtrAx/incremental-game-A`
- Rama estable: `main`
- Rama histórica de desarrollo: `Dev-Prestigio-Test`
- Entorno: React + TypeScript + Vite + Motion.
- Guardado estable: `incremental-game-a:save:v1`.
- La antigua clave experimental `incremental-game-a:save:prestige-test:v1` se migra una sola vez a la estable y después se elimina.
- Última actualización: **1 de agosto de 2026**.
- `manualClicks` significa clics del núcleo e incluye clics manuales y pulsos autónomos.

La propuesta de prestigio fue validada visualmente por Arturo e integrada a `main`. La rama `Dev-Prestigio-Test` se conserva como referencia histórica y no debe considerarse la rama activa de desarrollo.

## 2. Forma de trabajo acordada

- Trabajar de forma directa y evitar microcomprobaciones redundantes.
- Usar GitHub Desktop para el flujo local normal.
- Crear ramas únicamente para propuestas visuales, estructurales o mecánicas importantes.
- Integrar a `main` después de la validación de Arturo.
- Evitar ZIP, manifiestos y hashes salvo necesidad técnica o petición expresa.
- Agrupar pruebas y registrar aquí las decisiones relevantes.

## 3. Interfaz estable

- Diseño compacto con resumen superior.
- Núcleo fijo a la izquierda en escritorio.
- Evoluciones en panel desplazable con pestañas Producción, Núcleo y Avanzado.
- Tarjetas expandibles.
- Navegación móvil entre Núcleo y Evoluciones.
- Panel de desarrollador a la derecha en pantallas amplias y debajo del juego en pantallas estrechas.
- Selección de texto deshabilitada en la interfaz para evitar selecciones accidentales; los campos numéricos del panel sí permiten editar texto.

## 4. Sistemas del juego

### Base

- Esfera líquida con capacidad visual de 5,000 clics.
- Energía manual y producción automática.
- Guardado automático y reinicio protegido.
- Ondas líquidas sin franjas gruesas giratorias.

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
- Requisito inicial: 500 clics y un microgenerador.
- Costo inicial: 2,000.
- Crecimiento: ×2.6.
- Usa un anillo interior de segmentos luminosos.
- Al descargar se ilumina el círculo completo; al comenzar el siguiente ciclo queda únicamente la marca de las 12.

### Evolución 06 — Válvula de sobrecarga

- Los clics posteriores al llenado cargan una fase temporal.
- Nivel 1: 100 clics, multiplicador ×2 y duración 15 segundos.
- Afecta clics, producción y cavitación.
- Requisito inicial: esfera llena y cavitación nivel 1.
- Costo inicial: 10,000.
- Crecimiento: ×3.

### Evolución 07 — Módulo de pulsación autónoma

- Genera clics reales del núcleo.
- Llena la esfera y carga presión, cavitación y sobrecarga.
- Progresión: `0.20 × 1.6^(nivel - 1)` clic/s.
- Ejemplos: 0.20, 0.32, 0.512, 0.8192 y 1.3107 clic/s.
- Límite técnico: 20 clic/s.
- Requisito inicial: 500 clics y un microgenerador.
- Costo inicial: 5,000.
- Crecimiento: ×2.8.
- No genera partículas por cada autoclic.

## 5. Prestigio del zafiro

### Activación

- Al llegar a 5,000 clics se forma un zafiro en el centro de la esfera.
- La esfera sigue aceptando clics para permitir usar la sobrecarga.
- El prestigio se confirma mediante el botón independiente `CRISTALIZAR`.
- Nunca ocurre automáticamente.

### Secuencia visual

1. La gema se ensambla dentro del núcleo.
2. Flota y gira mientras la esfera permanece llena.
3. Al cristalizar sale hacia la izquierda.
4. La capa temporal se reinicia.
5. El zafiro aparece o evoluciona en el soporte permanente.

### Multiplicadores

- Prestigio 0: ×1.00.
- Prestigio 1: ×1.50.
- Prestigio 2: ×1.85.
- Prestigio 3: ×2.20.
- Prestigio 4: ×2.60.
- Prestigio 5: ×3.05.
- Posteriores: +0.50 por cristalización.

Afecta energía por clic, producción, presión, resonancia, cavitación, sobrecarga y energía producida por autoclics. No modifica velocidades ni umbrales de clics.

### Reinicio

Se reinician energía, clics, evoluciones 01–07, cargas de cavitación y sobrecarga, tiempo activo de sobrecarga y progreso fraccionario del autoclicker.

Se conservan prestigio, zafiro, multiplicador y planos descubiertos.

### Planos permanentes

Después del primer prestigio se eliminan los requisitos de descubrimiento por cantidad de clics, pero se conservan dependencias funcionales:

- Cavitación y autoclicker requieren un microgenerador.
- Sobrecarga requiere cavitación nivel 1.
- Sobrecarga solo se carga con la esfera llena.

## 6. Zafiro WebGL

- Malla tridimensional real con vértices `x`, `y`, `z`.
- Caras triangulares y normales independientes.
- Perspectiva, rotación X/Y, flotación y ensamblaje progresivo.
- Fragment shader con luz principal, luz lateral, Fresnel y emisión cian.
- Prestigio 1: 6 sectores; prestigio 2: 8; prestigio 3: 10; prestigio 4+: 12.
- Cavitación y sobrecarga intensifican brillo, rotación y deformación sutil.
- Render normal cercano a 40 FPS y energizado hasta 60 FPS.
- Pixel ratio interno limitado a 2×.
- Respaldo SVG si WebGL o los shaders fallan.
- `prefers-reduced-motion` muestra una gema estática e iluminada.

## 7. Pulso progresivo

- Brillo: 100% → 50% → 100%.
- Fórmula: `0.75 + 0.25 × cos(2π × fase)`.
- Shader, transparencia, halo y destello comparten intensidad.
- Duración con `p = clics / 5,000`:

```text
duración = 3 + 17 × (1 − p)^1.6
```

Referencias:

- 0%: 20.00 s.
- 25%: 13.73 s.
- 50%: 8.61 s.
- 75%: 4.85 s.
- 90%: 3.43 s.
- 100%: 3.00 s.

La fase es continua y compartida entre el zafiro del soporte y el del núcleo. Cavitación, sobrecarga y anuncios elevan suavemente el brillo al máximo y luego regresan a la fase natural.

El reflejo diagonal aparece gradualmente, cruza la gema y se desvanece antes del borde derecho. La pausa entre recorridos ocurre estando invisible.

## 8. Panel de desarrollador

Permite modificar únicamente:

- Energía acumulada.
- Clics del núcleo.

Protecciones:

- Sin negativos, letras, signos, comas ni notación científica.
- Energía con máximo dos decimales.
- Clics como entero.
- Energía máxima: 90,000,000,000,000.
- Clics máximos: 1,000,000,000.
- El formulario y el reducer aplican saneamiento independiente.
- Si los clics bajan de 5,000 se cancelan carga y tiempo activo de sobrecarga.
- No modifica niveles, prestigios ni multiplicadores.

## 9. Arquitectura relevante

- `src/game.ts`: estado, fórmulas, guardado, migración, prestigio y reducer.
- `src/App.tsx`: ciclo principal, eventos y panel de desarrollador.
- `src/GameCore.tsx`: esfera, anillos, gema, cristalización y soporte.
- `src/SapphireGem.tsx`: contenedor, respaldo SVG y destello diagonal.
- `src/SapphireGem3D.tsx`: geometría, normales, shaders y pulso WebGL.
- `src/DeveloperPanel.tsx`: validación y controles de prueba.
- `src/DeveloperPanel.css`: bloqueo de selección y diseño del panel.
- `src/UpgradesPanelCompact.tsx`: tarjetas y cálculos.
- `src/ProposalA.css`: interfaz compacta.
- `src/PrestigeSapphire.css`: estilos del zafiro y cristalización.

## 10. Compatibilidad

- La antigua partida experimental se migra a la clave estable al primer inicio después de la integración.
- Después de migrar, la clave experimental se elimina para evitar restauraciones o divergencias.
- Guardados anteriores sin `prestigeCount` migran a prestigio 0.
- La sobrecarga activa solo se restaura si todavía no expiró.
- No existe progreso fuera de línea todavía.
- Autoclics múltiples se procesan secuencialmente.

## 11. Validación local

Ejecutar cuando se actualice el equipo local:

```powershell
npm run lint
npm run build
npm run dev
```

Las validaciones aisladas realizadas incluyen TypeScript estricto, fórmulas de prestigio, reinicio selectivo, migración de guardados, malla WebGL, rango del pulso, recorrido del destello y saneamiento del panel de desarrollador.

## 12. Próximas mejoras sugeridas

1. Progreso fuera de línea controlado.
2. Árbol de mejoras permanentes del zafiro.
3. Núcleo luminoso interno desde prestigio 3.
4. Anillos orbitales 3D desde prestigio 4.
5. Telemetría local de tiempos y producción.
6. Integración con DualSense mediante Gamepad API.
7. Pruebas automatizadas dentro del repositorio.

## 13. Inicio recomendado para otro chat

> Continúa el desarrollo de `xArtXtrAx/incremental-game-A`. Lee primero `HISTORIAL_GPT.MD`, trabaja sobre `main`, conserva las fórmulas registradas y evita comprobaciones redundantes.
