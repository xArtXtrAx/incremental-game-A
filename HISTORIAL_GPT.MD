# HISTORIAL_GPT — Incremental Game A

> Bitácora compartida entre Arturo y GPT.  
> **Regla para nuevos chats:** leer este archivo y comprobar la rama activa antes de modificar el proyecto.

## 1. Estado del repositorio

- Repositorio: `xArtXtrAx/incremental-game-A`.
- Rama estable: `main`.
- Rama experimental activa: `Dev-Orbita-Zafiro-Test`.
- Ramas históricas: `Dev-Prestigio-Test`.
- Entorno: React + TypeScript + Vite + Motion.
- Guardado estable: `incremental-game-a:save:v1`.
- La antigua clave `incremental-game-a:save:prestige-test:v1` se migra una sola vez a la estable y después se elimina.
- Última actualización: **1 de agosto de 2026**.
- `manualClicks` incluye clics manuales y pulsos autónomos.

`main` contiene el prestigio de zafiro, el render WebGL, el pulso progresivo y el panel de desarrollador ya aprobados. `Dev-Orbita-Zafiro-Test` añade una órbita luminosa experimental y no debe integrarse a `main` sin la validación visual de Arturo.

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
- Evoluciones en panel desplazable con pestañas Producción, Núcleo y Avanzado.
- Tarjetas expandibles.
- Navegación móvil entre Núcleo y Evoluciones.
- Panel de desarrollador a la derecha en pantallas amplias y debajo en pantallas estrechas.
- Selección de texto deshabilitada salvo dentro de los campos numéricos.

## 4. Sistemas del juego

### Núcleo base

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
- Al descargar se ilumina el círculo completo; al iniciar el siguiente ciclo queda la marca de las 12.

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
- Límite técnico: 20 clic/s.
- Requisito inicial: 500 clics y un microgenerador.
- Costo inicial: 5,000.
- Crecimiento: ×2.8.
- No genera partículas por cada autoclic.

## 5. Prestigio del zafiro

### Activación y secuencia

- Al llegar a 5,000 clics se forma un zafiro en el centro.
- La esfera sigue aceptando clics para permitir usar sobrecarga.
- El prestigio se confirma con `CRISTALIZAR`; nunca ocurre automáticamente.
- La gema se ensambla, flota, sale hacia la izquierda y se instala en el soporte permanente.

### Multiplicadores

- Prestigio 0: ×1.00.
- Prestigio 1: ×1.50.
- Prestigio 2: ×1.85.
- Prestigio 3: ×2.20.
- Prestigio 4: ×2.60.
- Prestigio 5: ×3.05.
- Posteriores: +0.50 por cristalización.

Afecta clics, producción, presión, resonancia, cavitación, sobrecarga y energía de autoclics. No altera velocidades ni umbrales.

### Reinicio y planos

Se reinician energía, clics, evoluciones 01–07, cargas, sobrecarga activa y progreso fraccionario del autoclicker.

Se conservan prestigio, zafiro, multiplicador y planos descubiertos.

Después del primer prestigio se eliminan requisitos de descubrimiento por clics, pero se mantienen dependencias:

- Cavitación y autoclicker requieren microgenerador.
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
- `prefers-reduced-motion` mantiene la gema estática e iluminada.

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

La fase es continua y compartida entre las instancias del soporte y el núcleo. Cavitación, sobrecarga y anuncios elevan el brillo al máximo y después regresan a la fase natural.

El reflejo diagonal aparece gradualmente, cruza la gema y se desvanece antes del borde derecho.

## 8. Propuesta experimental — Órbita luminosa

Implementada solamente en `Dev-Orbita-Zafiro-Test`.

### Diseño

- Órbita elíptica horizontal centrada exactamente a media altura del zafiro.
- El anillo orbital permanece visible durante todo el ciclo, independientemente del brillo del cristal.
- Una chispa cian con núcleo blanco recorre la elipse.
- Seis partículas difuminadas forman una estela de aproximadamente 16.8% del giro.
- La intensidad disminuye progresivamente desde la chispa hasta el final de la estela.
- Cavitación y sobrecarga aumentan sutilmente el brillo de la órbita y la chispa.

### Profundidad

- La mitad superior de la órbita se renderiza detrás del canvas del zafiro.
- La mitad inferior se renderiza delante.
- Chispa, anillo y estela están duplicados y recortados por mitades para simular que orbitan alrededor del volumen, no sobre una superficie plana.
- La sección trasera usa menor opacidad; la delantera conserva mayor luminosidad.

### Sincronización

La órbita utiliza la misma fase acumulada del pulso WebGL:

- 20 segundos por vuelta al 0% del núcleo.
- Aceleración continua según la fórmula del pulso.
- 3 segundos por vuelta al llegar a 5,000 clics.
- No usa una animación CSS independiente en modo WebGL, por lo que no reinicia ni salta cuando cambia la duración.
- Todas las instancias visibles comparten fase.
- Con `prefers-reduced-motion`, la chispa permanece fija a la derecha y el anillo sigue visible.
- El respaldo SVG conserva un recorrido CSS básico para la chispa.

## 9. Panel de desarrollador

Permite modificar únicamente energía acumulada y clics del núcleo.

Protecciones:

- Sin negativos, letras, signos, comas ni notación científica.
- Energía con máximo dos decimales.
- Clics enteros.
- Energía máxima: 90,000,000,000,000.
- Clics máximos: 1,000,000,000.
- El formulario y el reducer aplican saneamiento independiente.
- Si los clics bajan de 5,000 se cancelan carga y tiempo activo de sobrecarga.
- No modifica niveles, prestigios ni multiplicadores.

## 10. Arquitectura relevante

- `src/game.ts`: estado, fórmulas, guardado, migración, prestigio y reducer.
- `src/App.tsx`: ciclo principal, eventos y panel de desarrollador.
- `src/GameCore.tsx`: esfera, anillos, gema, cristalización y soporte.
- `src/SapphireGem.tsx`: contenedor, respaldo SVG, destello y capas orbitales.
- `src/SapphireGem3D.tsx`: geometría, shaders, pulso y coordenadas de órbita.
- `src/SapphireOrbit.css`: anillo, chispa, estela, profundidad y respaldo.
- `src/PrestigeSapphire.css`: estilos del zafiro y cristalización.
- `src/DeveloperPanel.tsx`: validación y controles de prueba.
- `src/DeveloperPanel.css`: bloqueo de selección y diseño del panel.
- `src/UpgradesPanelCompact.tsx`: tarjetas y cálculos.
- `src/ProposalA.css`: interfaz compacta.

## 11. Compatibilidad

- La antigua partida experimental se migra a la clave estable al primer inicio después de la integración.
- Guardados anteriores sin `prestigeCount` migran a prestigio 0.
- La sobrecarga activa solo se restaura si todavía no expiró.
- No existe progreso fuera de línea.
- Autoclics múltiples se procesan secuencialmente.
- La órbita no modifica estado, guardado, multiplicadores ni mecánicas.

## 12. Validaciones

Validaciones aisladas realizadas:

- TypeScript estricto de `SapphireGem.tsx` y `SapphireGem3D.tsx`.
- Coordenadas elípticas de chispa y seis puntos de estela.
- Fase compartida y duración 20→3 segundos.
- Limpieza de variables CSS al desmontar.
- Sin dependencias nuevas.
- Sin cambios en fórmulas ni guardado.

Validación local recomendada:

```powershell
npm run lint
npm run build
npm run dev
```

Prueba visual pendiente:

1. Seleccionar `Dev-Orbita-Zafiro-Test`.
2. Confirmar que la órbita esté centrada horizontalmente.
3. Verificar el paso detrás por la mitad superior y delante por la inferior.
4. Comprobar que la estela no parezca una cadena de puntos rígida.
5. Observar una vuelta de 20 segundos con el núcleo vacío.
6. Confirmar la aceleración hacia 3 segundos al llenar el núcleo.
7. Probar cavitación, sobrecarga, extracción y soporte.
8. Volver a `main` y confirmar que la versión estable permanece intacta.

## 13. Próximas mejoras sugeridas

1. Progreso fuera de línea controlado.
2. Árbol de mejoras permanentes del zafiro.
3. Núcleo luminoso interno desde prestigio 3.
4. Anillos orbitales 3D desde prestigio 4.
5. Telemetría local de tiempos y producción.
6. Integración con DualSense mediante Gamepad API.
7. Pruebas automatizadas dentro del repositorio.

## 14. Inicio recomendado para otro chat

> Continúa `xArtXtrAx/incremental-game-A`. Lee `HISTORIAL_GPT.MD`, revisa `main` y `Dev-Orbita-Zafiro-Test`, conserva las fórmulas registradas y no integres la órbita a `main` sin la aprobación de Arturo.
