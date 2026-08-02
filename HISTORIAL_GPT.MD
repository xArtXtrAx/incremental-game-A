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
- Última actualización: **2 de agosto de 2026**.
- `manualClicks` incluye clics manuales y pulsos autónomos.

`main` contiene el prestigio de zafiro, su render WebGL, el pulso progresivo y el panel de desarrollador ya aprobados. `Dev-Orbita-Zafiro-Test` añade la órbita WebGL y la iluminación dinámica producida por su chispa. No debe integrarse a `main` sin validación visual de Arturo.

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
- Shader, transparencia y halo comparten intensidad.
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

El antiguo destello diagonal 2D fue retirado en la rama experimental. La iluminación móvil ahora proviene de la chispa orbital y se calcula dentro del shader de la gema.

## 8. Propuesta experimental — Órbita e iluminación dinámica

Implementada solamente en `Dev-Orbita-Zafiro-Test`.

### Órbita WebGL

- Órbita elíptica horizontal centrada a media altura del zafiro.
- El anillo permanece visible durante todo el ciclo.
- Una chispa cian con núcleo blanco recorre la elipse.
- Doce partículas forman una estela de aproximadamente 18% del giro.
- La intensidad disminuye progresivamente desde la chispa hasta el final de la estela.
- Cavitación y sobrecarga aumentan sutilmente el brillo orbital.
- Dos canvases transparentes WebGL separan profundidad: uno detrás y otro delante de la gema.
- No existen máscaras `clip-path`, filtros rectangulares ni fondos visibles en el modo WebGL.
- La técnica CSS anterior queda únicamente como respaldo si falla WebGL orbital.

### Fase y profundidad

- La órbita usa una fase global compartida por el canvas trasero, la gema y el canvas delantero.
- 20 segundos por vuelta al 0% del núcleo.
- Aceleración continua según la fórmula del pulso.
- 3 segundos por vuelta al llegar a 5,000 clics.
- La fase no reinicia cuando cambia la duración.
- Con `prefers-reduced-motion`, la chispa permanece fija.

### Luz de la chispa sobre las facetas

- `SapphireOrbitState.ts` entrega la misma posición tridimensional a la órbita y al shader de la gema.
- El fragment shader calcula dirección hacia la partícula, distancia, normal de la faceta y dirección de cámara.
- La cara orientada hacia la chispa recibe un reflejo especular blanco-cian concentrado.
- Las caras cercanas reciben una iluminación difusa más suave.
- La intensidad cae con la distancia.
- Cuando la chispa pasa detrás, disminuye la luz directa y queda principalmente un reflejo Fresnel de borde.
- La iluminación viaja exactamente con la partícula y mantiene la aceleración 20→3 segundos.

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
- `src/SapphireGem.tsx`: contenedor, respaldo SVG y selección entre órbita WebGL/CSS.
- `src/SapphireGem3D.tsx`: geometría, shaders, pulso e iluminación de la chispa.
- `src/SapphireOrbit3D.tsx`: anillo, chispa y estela WebGL con capas frontal/trasera.
- `src/SapphireOrbitState.ts`: fase y posición 3D compartidas.
- `src/SapphireOrbit.css`: respaldo orbital CSS.
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
- Órbita e iluminación no modifican estado, guardado, multiplicadores ni mecánicas.

## 12. Validaciones

Validaciones aisladas realizadas:

- TypeScript estricto de `SapphireGem.tsx`, `SapphireGem3D.tsx`, `SapphireOrbit3D.tsx` y `SapphireOrbitState.ts`.
- Conexión de uniformes `uOrbitLightPosition` y `uOrbitFrontness`.
- Fase compartida y duración 20→3 segundos.
- Pausa segura al ocultar el documento.
- Eliminación del elemento `sapphire-gem-glint`.
- Sin dependencias nuevas.
- Sin cambios en fórmulas ni guardado.

No se ejecutaron `npm run lint` ni `npm run build` con las dependencias reales del equipo local.

Validación local recomendada:

```powershell
npm run lint
npm run build
npm run dev
```

Prueba visual pendiente:

1. Seleccionar `Dev-Orbita-Zafiro-Test`.
2. Confirmar que ya no existe el barrido diagonal independiente.
3. Observar cómo el reflejo pasa de una faceta a otra siguiendo la chispa.
4. Confirmar que el reflejo frontal disminuye cuando la chispa pasa detrás.
5. Probar vueltas lentas de 20 segundos y rápidas de 3 segundos.
6. Probar cavitación, sobrecarga, extracción y soporte permanente.
7. Volver a `main` y confirmar que la versión estable permanece intacta.

## 13. Próximas mejoras sugeridas

1. Progreso fuera de línea controlado.
2. Árbol de mejoras permanentes del zafiro.
3. Núcleo luminoso interno desde prestigio 3.
4. Anillos orbitales adicionales desde prestigio 4.
5. Telemetría local de tiempos y producción.
6. Integración con DualSense mediante Gamepad API.
7. Pruebas automatizadas dentro del repositorio.

## 14. Inicio recomendado para otro chat

> Continúa `xArtXtrAx/incremental-game-A`. Lee `HISTORIAL_GPT.MD`, revisa `main` y `Dev-Orbita-Zafiro-Test`, conserva las fórmulas registradas y no integres la órbita ni su iluminación a `main` sin la aprobación de Arturo.
