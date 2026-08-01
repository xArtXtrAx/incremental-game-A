# HISTORIAL_GPT — Incremental Game A

> Bitácora compartida entre Arturo y GPT.  
> **Regla para nuevos chats:** leer este archivo, comprobar la rama activa y conservar las fórmulas y decisiones aquí registradas antes de modificar el proyecto.

## 1. Estado actual

- Repositorio: `xArtXtrAx/incremental-game-A`
- Rama estable: `main`
- Rama experimental activa: `Dev-Prestigio-Test`
- Entorno: React + TypeScript + Vite + Motion
- Guardado estable: `incremental-game-a:save:v1`
- Guardado experimental aislado: `incremental-game-a:save:prestige-test:v1`
- Última actualización: **1 de agosto de 2026**
- Diseño vigente: interfaz compacta con núcleo fijo, resumen superior, pestañas y tarjetas expandibles.
- `manualClicks` representa clics del núcleo: incluye clics del jugador y pulsos autónomos.

### Situación de ramas

- `main` conserva el juego estable con las evoluciones 01–07.
- `Dev-Prestigio-Test` añade el primer prestigio, el zafiro permanente y su representación WebGL tridimensional.
- No integrar la rama experimental a `main` hasta que Arturo valide la escena, el reinicio, el balance y el rendimiento.
- La primera apertura de la rama experimental importa el progreso estable si todavía no existe una partida de prueba.
- Después guarda exclusivamente en su clave experimental.
- Cristalizar o reiniciar en la rama de prueba no altera la partida de `main`.

## 2. Forma de trabajo acordada

- Trabajar de forma directa y evitar microcomprobaciones repetitivas.
- Usar GitHub Desktop para el flujo local normal.
- Crear ramas de propuesta para cambios visuales, estructurales o mecánicos importantes.
- Integrar a `main` únicamente después de la aprobación de Arturo.
- No crear ZIP, manifiestos ni hashes salvo necesidad técnica o petición expresa.
- Ejecutar validaciones agrupadas y registrar aquí las decisiones importantes.

## 3. Sistemas estables en `main`

### Base

- Contador de energía.
- Esfera líquida interactiva con capacidad visual de 5,000 clics.
- Producción manual y automática.
- Guardado automático y reinicio protegido.
- Ondas de líquido corregidas para evitar franjas gruesas giratorias.

### Evolución 01 — Amplificador de pulso

- Aumenta en 1 la energía base por clic.
- Costo inicial: 10.
- Crecimiento: ×1.7.

### Evolución 02 — Microgenerador

- Produce energía automáticamente.
- Costo inicial: 25.
- Crecimiento: ×1.8.

### Evolución 03 — Reactor de resonancia

- Multiplica la producción de los microgeneradores.
- Multiplicador: nivel + 1.
- Costo inicial: 120.
- Crecimiento: ×2.2.

### Evolución 04 — Condensador de presión

- Cada nivel concede +2% global por cada tramo completo del 10% de llenado.
- Afecta clics y producción automática.
- Requisito inicial: 100 clics.
- Costo inicial: 500.
- Crecimiento: ×2.4.

### Evolución 05 — Cámara de cavitación

- Los clics cargan una descarga basada en varios segundos de producción.
- Nivel 1: cada 25 clics, recompensa equivalente a 5 segundos.
- Los niveles reducen el ciclo y aumentan los segundos recompensados.
- Requisito inicial: 500 clics y un microgenerador.
- Costo inicial: 2,000.
- Crecimiento: ×2.6.
- Anillo interior de segmentos luminosos alrededor de la esfera.
- Al descargar se ilumina el círculo completo; al comenzar el nuevo ciclo queda únicamente la marca de las 12.

### Evolución 06 — Válvula de sobrecarga

- Los clics posteriores al llenado cargan una fase temporal.
- Nivel 1: 100 clics, multiplicador ×2, duración 15 segundos.
- Afecta clics, producción y cavitación.
- Requisito inicial: esfera llena y cavitación nivel 1.
- Costo inicial: 10,000.
- Crecimiento: ×3.

### Evolución 07 — Módulo de pulsación autónoma

- Genera clics reales del núcleo sin interacción del jugador.
- Llena la esfera y carga presión, cavitación y sobrecarga.
- Progresión: `0.20 × 1.6^(nivel - 1)` clic/s.
- Ejemplos: 0.20, 0.32, 0.512, 0.8192 y 1.3107 clic/s.
- Límite técnico: 20 clic/s.
- Requisito inicial: 500 clics y un microgenerador.
- Costo inicial: 5,000.
- Crecimiento: ×2.8.
- No genera partículas flotantes por cada autoclic para evitar saturación visual.

## 4. Propuesta experimental — Prestigio de zafiro

Implementada solamente en `Dev-Prestigio-Test`.

### Activación y elección

- Al alcanzar 5,000 clics se forma un zafiro en el centro de la esfera.
- La esfera sigue aceptando clics para permitir continuar usando la sobrecarga.
- El prestigio se confirma mediante un botón independiente `CRISTALIZAR`.
- Nunca se ejecuta automáticamente ni por accidente.

### Secuencia

1. El zafiro se ensambla dentro del núcleo.
2. Flota y gira mientras la esfera permanece llena.
3. Al pulsar `CRISTALIZAR`, sale hacia la izquierda siguiendo la trayectoria de extracción.
4. La capa temporal se reinicia.
5. El zafiro aparece o evoluciona en el soporte permanente.
6. El soporte reacciona visualmente a cavitación, sobrecarga y nuevas cristalizaciones.

### Multiplicador permanente

- Prestigio 0: ×1.00
- Prestigio 1: ×1.50
- Prestigio 2: ×1.85
- Prestigio 3: ×2.20
- Prestigio 4: ×2.60
- Prestigio 5: ×3.05
- Posteriores: +0.50 por cristalización.

Afecta:

- Energía por clic.
- Producción de microgeneradores.
- Resultado de resonancia y presión.
- Descargas de cavitación.
- Producción durante sobrecarga.
- Energía generada por los autoclics.

No modifica:

- Velocidad del autoclicker.
- Umbral de cavitación.
- Umbral de sobrecarga.
- Capacidad de 5,000 clics de la esfera.

### Reinicio de cristalización

Se reinicia:

- Energía.
- Clics del núcleo.
- Evoluciones 01–07.
- Carga de cavitación.
- Carga y duración activa de sobrecarga.
- Progreso fraccionario del autoclicker.

Se conserva:

- Número de prestigios.
- Zafiro y multiplicador permanente.
- Planos de sistemas descubiertos.

### Planos permanentes

Después del primer prestigio se eliminan los requisitos de descubrimiento por clics:

- Presión no requiere repetir 100 clics.
- Cavitación y autoclicker no requieren repetir 500 clics.
- Sobrecarga puede comprarse antes de volver a llenar la esfera.

Se conservan las dependencias funcionales:

- Cavitación y autoclicker requieren un microgenerador.
- Sobrecarga requiere cavitación nivel 1.
- La carga de sobrecarga solo comienza cuando la esfera está llena.

## 5. Zafiro tridimensional WebGL

El SVG principal fue sustituido en `Dev-Prestigio-Test` por una malla 3D real construida sin dependencias adicionales.

### Geometría

- Los vértices poseen coordenadas `x`, `y`, `z` reales.
- Las superficies están compuestas por triángulos.
- Cada triángulo tiene su propia normal para iluminación facetada.
- La gema usa dos anillos de vértices, una punta superior y una inferior.
- El número de sectores aumenta con el prestigio:
  - prestigio 1: 6 sectores;
  - prestigio 2: 8 sectores;
  - prestigio 3: 10 sectores;
  - prestigio 4+: hasta 12 sectores.
- El mismo zafiro se vuelve progresivamente más facetado.

### Renderizado

- Canvas transparente con WebGL nativo.
- Vertex shader para perspectiva, rotación X/Y, flotación y ensamblaje.
- Fragment shader para luz principal, luz lateral, reflejo Fresnel y emisión cian.
- Las caras nacen progresivamente desde el centro mediante un retraso individual por triángulo.
- Durante cavitación o sobrecarga:
  - aumenta la velocidad de rotación;
  - las caras se expanden sutilmente;
  - aumenta la emisión luminosa.
- La animación externa de extracción continúa controlada por Motion.

### Rendimiento y compatibilidad

- Malla de muy baja cantidad de triángulos.
- Render normal limitado aproximadamente a 40 FPS.
- Estado energizado hasta 60 FPS.
- Resolución interna limitada a un máximo de 2× el pixel ratio.
- Al ocultar la pestaña, el navegador limita el ciclo de `requestAnimationFrame`.
- `prefers-reduced-motion` muestra una gema estática después del primer render.
- Si WebGL o los shaders fallan, aparece automáticamente el SVG anterior como respaldo.
- No fue necesario añadir Three.js ni modificar `package.json`.

## 6. Arquitectura relevante

- `src/game.ts`
  - Estado, fórmulas, migración, guardado aislado, prestigio y reducer.
- `src/App.tsx`
  - Ciclo principal, eventos visuales y temporización de extracción.
- `src/GameCore.tsx`
  - Esfera, anillos, formación, cristalización, soporte y mensajes.
- `src/SapphireGem.tsx`
  - Componente contenedor, soporte permanente y respaldo SVG.
- `src/SapphireGem3D.tsx`
  - Vectores, triángulos, normales, shaders y ciclo WebGL.
- `src/UpgradesPanelCompact.tsx`
  - Tarjetas, cálculos con zafiro y planos permanentes.
- `src/PrestigeSapphire.css`
  - Estilos del soporte, formación, extracción y diseño responsivo.
- `HISTORIAL_GPT.MD`
  - Esta bitácora.

## 7. Compatibilidad y decisiones técnicas

- `main` usa `incremental-game-a:save:v1`.
- La prueba usa `incremental-game-a:save:prestige-test:v1`.
- Los guardados anteriores migran `prestigeCount` a 0.
- La sobrecarga activa solo se conserva al recargar si todavía no expiró.
- No existe progreso fuera de línea todavía.
- Producción pasiva y autoclics se procesan una vez por segundo.
- Los autoclics múltiples se procesan secuencialmente.
- El autoclicker ejecuta la misma lógica que un clic del núcleo.
- El botón de cristalización permanece separado de la esfera para conservar la elección entre prestigio y sobrecarga.

## 8. Validaciones realizadas

- TypeScript estricto para la lógica del juego.
- TypeScript estricto para App y componentes con módulos simulados.
- TypeScript estricto para `SapphireGem.tsx` y `SapphireGem3D.tsx` juntos.
- Multiplicadores de prestigio 0–6.
- Bloqueo de cristalización antes de 5,000 clics.
- Reinicio de la capa temporal y conservación del prestigio.
- Aplicación del multiplicador a clics y producción automática.
- Planos permanentes sin eliminar dependencias funcionales.
- Migración de guardados anteriores.
- Aislamiento del guardado experimental.
- Construcción de malla 3D, normales y datos intercalados verificada por TypeScript.
- Respaldo SVG preparado para ausencia de WebGL o fallo de shader.
- La ejecución GPU real debe confirmarse en el navegador del equipo local, porque el contenedor de validación no dispone de un contexto EGL funcional.

Validación local recomendada:

```powershell
npm run lint
npm run build
npm run dev
```

## 9. Prueba visual pendiente

1. Seleccionar `Dev-Prestigio-Test` en GitHub Desktop.
2. Confirmar que el zafiro dentro de la esfera tiene volumen real al girar.
3. Observar cómo cambian las caras según la iluminación.
4. Probar cavitación y sobrecarga para comprobar la reacción luminosa.
5. Cristalizar y revisar que la trayectoria hacia el soporte siga intacta.
6. Confirmar fluidez y consumo razonable.
7. Probar al menos dos prestigios para comprobar el aumento de facetas.
8. Cambiar a `main` y verificar que la partida estable permanece intacta.

## 10. Próximas propuestas

Después de aprobar el prestigio:

- Núcleo luminoso interno visible desde prestigio 3.
- Anillos orbitales tridimensionales desde prestigio 4.
- Árbol de mejoras permanentes del zafiro.
- Progreso fuera de línea controlado.
- Telemetría local de tiempos y producción.
- Integración con DualSense mediante Gamepad API.
- Pruebas automatizadas dentro del repositorio.

## 11. Inicio recomendado para el siguiente chat

> Continúa el desarrollo de `xArtXtrAx/incremental-game-A`. Lee `HISTORIAL_GPT.MD`, revisa `main` y `Dev-Prestigio-Test`, y conserva las fórmulas registradas. El prestigio y el zafiro WebGL siguen en prueba y no deben integrarse a `main` sin la aprobación de Arturo.
