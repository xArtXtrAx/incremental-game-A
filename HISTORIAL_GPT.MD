# HISTORIAL_GPT — Incremental Game A

> Bitácora compartida entre Arturo y GPT.  
> **Regla para nuevos chats:** leer este archivo, comprobar la rama activa y conservar las fórmulas y decisiones registradas antes de modificar el proyecto.

## 1. Estado del repositorio

- Repositorio: `xArtXtrAx/incremental-game-A`
- Rama estable: `main`
- Rama experimental activa: `Dev-Prestigio-Test`
- Entorno: React + TypeScript + Vite + Motion
- Guardado estable: `incremental-game-a:save:v1`
- Guardado experimental: `incremental-game-a:save:prestige-test:v1`
- Última actualización: **1 de agosto de 2026**
- `manualClicks` significa clics del núcleo e incluye pulsos automáticos.

### Reglas de ramas

- `main` conserva el juego estable con las evoluciones 01–07.
- `Dev-Prestigio-Test` contiene el prestigio, zafiro permanente, WebGL y efectos experimentales.
- No integrar la rama experimental a `main` sin aprobación de Arturo.
- La primera apertura de la rama experimental importa el guardado estable si todavía no existe una partida de prueba.
- Después guarda únicamente en la clave experimental.
- Cristalizar o reiniciar en la rama de prueba no modifica la partida estable.

## 2. Forma de trabajo acordada

- Trabajar de forma directa y evitar microcomprobaciones redundantes.
- Usar GitHub Desktop para el flujo local normal.
- Usar ramas para propuestas visuales, estructurales o mecánicas importantes.
- Integrar a `main` solamente después de la validación visual y funcional.
- Evitar ZIP, manifiestos y hashes salvo necesidad técnica o petición expresa.
- Agrupar pruebas y registrar decisiones importantes en esta bitácora.

## 3. Sistemas estables en `main`

### Núcleo base

- Esfera líquida con capacidad visual de 5,000 clics.
- Energía manual y producción automática.
- Guardado automático y reinicio protegido.
- Ondas líquidas corregidas para evitar franjas gruesas giratorias.

### Evolución 01 — Amplificador de pulso

- +1 de energía base por nivel y clic.
- Costo inicial: 10.
- Crecimiento: ×1.7.

### Evolución 02 — Microgenerador

- Produce energía automáticamente.
- Costo inicial: 25.
- Crecimiento: ×1.8.

### Evolución 03 — Reactor de resonancia

- Multiplicador de microgeneradores: `nivel + 1`.
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
- El anillo se completa durante la descarga y vuelve al nuevo ciclo al encender la marca de las 12.

### Evolución 06 — Válvula de sobrecarga

- Los clics posteriores al llenado cargan una fase temporal.
- Nivel 1: 100 clics, ×2 durante 15 segundos.
- Requisito inicial: esfera llena y cavitación nivel 1.
- Costo inicial: 10,000.
- Crecimiento: ×3.

### Evolución 07 — Módulo de pulsación autónoma

- Ejecuta clics reales del núcleo.
- Progresión: `0.20 × 1.6^(nivel - 1)` clic/s.
- Ejemplos: 0.20, 0.32, 0.512, 0.8192 y 1.3107 clic/s.
- Límite: 20 clic/s.
- Requisito inicial: 500 clics y un microgenerador.
- Costo inicial: 5,000.
- Crecimiento: ×2.8.
- Los autoclics no generan partículas individuales para evitar saturación visual.

## 4. Prestigio experimental de zafiro

### Activación

- Al alcanzar 5,000 clics se forma un zafiro dentro de la esfera.
- La esfera continúa aceptando clics para permitir usar sobrecarga.
- El prestigio se confirma mediante un botón independiente `CRISTALIZAR`.
- Nunca se ejecuta automáticamente.

### Secuencia

1. La gema se ensambla dentro del núcleo.
2. Flota y gira mientras la esfera está llena.
3. Al cristalizar, sale hacia la izquierda.
4. La capa temporal se reinicia.
5. El zafiro aparece o evoluciona en el soporte permanente.

### Multiplicadores

- Prestigio 0: ×1.00
- Prestigio 1: ×1.50
- Prestigio 2: ×1.85
- Prestigio 3: ×2.20
- Prestigio 4: ×2.60
- Prestigio 5: ×3.05
- Posteriores: +0.50 por cristalización.

Afecta energía por clic, microgeneradores, resonancia, presión, cavitación, sobrecarga y energía de los autoclics. No modifica velocidad del autoclicker, umbrales de ciclos ni capacidad de la esfera.

### Reinicio de cristalización

Se reinicia:

- Energía.
- Clics del núcleo.
- Evoluciones 01–07.
- Carga de cavitación.
- Carga y tiempo de sobrecarga.
- Progreso fraccionario del autoclicker.

Se conserva:

- Número de prestigios.
- Zafiro y multiplicador permanente.
- Planos de sistemas descubiertos.

### Planos permanentes

Después del primer prestigio no se repiten requisitos de descubrimiento por clics:

- Presión no requiere repetir 100 clics.
- Cavitación y autoclicker no requieren repetir 500 clics.
- Sobrecarga puede comprarse antes de volver a llenar la esfera.

Dependencias que permanecen:

- Cavitación y autoclicker requieren un microgenerador.
- Sobrecarga requiere cavitación nivel 1.
- Sobrecarga solo se carga con la esfera llena.

## 5. Zafiro tridimensional WebGL

- Malla real con vértices `x`, `y`, `z`.
- Superficies triangulares con normales propias para iluminación facetada.
- Punta superior, punta inferior y dos anillos de vértices.
- Sectores según prestigio:
  - prestigio 1: 6;
  - prestigio 2: 8;
  - prestigio 3: 10;
  - prestigio 4+: 12.
- Canvas transparente con WebGL nativo.
- Vertex shader para perspectiva, rotación X/Y, flotación y ensamblaje.
- Fragment shader para luz principal, luz lateral, reflejo Fresnel y emisión cian.
- Cavitación y sobrecarga aumentan temporalmente rotación, emisión y energía visual.
- El SVG anterior permanece como respaldo si WebGL o los shaders fallan.
- No se añadió Three.js ni se modificó `package.json`.

### Rendimiento

- Malla de muy pocos triángulos.
- Aproximadamente 40 FPS en estado normal y hasta 60 FPS energizado.
- Resolución interna limitada a 2× el pixel ratio.
- `prefers-reduced-motion` muestra una gema estática e iluminada.

## 6. Pulso progresivo

El zafiro funciona como indicador del avance hacia el siguiente prestigio.

### Intensidad

- Empieza al 100%.
- Baja suavemente hasta 50%.
- Regresa al 100% sin saltos.
- Fórmula:

```text
brillo = 0.75 + 0.25 × cos(2π × fase)
```

- Rango resultante: 0.50–1.00.
- Shader, transparencia, halo y destello comparten la misma intensidad.
- El mínimo mantiene visibles el volumen, las facetas y la silueta.

### Duración según llenado

Con `p = clics / 5,000`, limitado entre 0 y 1:

```text
duración = 3 + 17 × (1 − p)^1.6
```

Referencias:

- 0%: 20.00 s
- 25%: 13.73 s
- 50%: 8.61 s
- 75%: 4.85 s
- 90%: 3.43 s
- 100%: 3.00 s

La fase es continua: los clics aceleran el ciclo sin reiniciarlo. Las instancias del soporte y del núcleo comparten fase. Cavitación, sobrecarga y anuncios de prestigio elevan suavemente el brillo al máximo y luego devuelven la gema a su fase natural.

### Destello diagonal

- El reflejo diagonal recorre el zafiro de izquierda a derecha.
- Antes permanecía visible al llegar al lado derecho, lo que parecía un reflejo atascado.
- Ahora aparece gradualmente después de salir del extremo izquierdo.
- Se desvanece antes de tocar el extremo derecho.
- La pausa entre recorridos ocurre con el reflejo completamente invisible.
- Su opacidad continúa multiplicada por el pulso general del zafiro.

## 7. Arquitectura relevante

- `src/game.ts`: estado, fórmulas, guardado, prestigio y reducer.
- `src/App.tsx`: ciclo principal y temporización de extracción.
- `src/GameCore.tsx`: esfera, anillos, formación y controles.
- `src/SapphireGem.tsx`: contenedor, soporte, respaldo SVG y destello diagonal.
- `src/SapphireGem3D.tsx`: geometría, normales, shaders, pulso y WebGL.
- `src/UpgradesPanelCompact.tsx`: tarjetas y cálculos con prestigio.
- `src/PrestigeSapphire.css`: estilos experimentales y responsivos.

## 8. Validaciones y prueba local

Validaciones aisladas realizadas durante el desarrollo:

- Fórmulas de prestigio y reinicio selectivo.
- Multiplicador aplicado a clics y producción.
- Migración de guardados antiguos.
- Aislamiento del guardado experimental.
- Construcción de malla, normales y datos intercalados.
- Respaldo SVG.
- Curva de duración del pulso.
- Rango de intensidad 50–100%.
- Recorrido del destello sin permanencia visible en los extremos.

Confirmar siempre en el equipo local:

```powershell
npm run lint
npm run build
npm run dev
```

La ejecución real de GPU debe verificarse en el navegador local porque el entorno de validación no dispone de un contexto EGL funcional.

## 9. Prueba visual pendiente

1. Seleccionar `Dev-Prestigio-Test` en GitHub Desktop.
2. Comprobar que el pulso mínimo conserva claramente la gema.
3. Observar un ciclo de 20 segundos después de cristalizar.
4. Confirmar la aceleración hacia 3 segundos al llenar la esfera.
5. Revisar que el destello aparezca y desaparezca sin quedarse pegado a ningún borde.
6. Probar cavitación y sobrecarga.
7. Cristalizar y revisar la extracción hacia el soporte.
8. Cambiar a `main` y confirmar que la partida estable permanece intacta.

## 10. Próximas propuestas

- Núcleo luminoso interno desde prestigio 3.
- Anillos orbitales 3D desde prestigio 4.
- Árbol de mejoras permanentes del zafiro.
- Progreso fuera de línea controlado.
- Telemetría local de tiempos y producción.
- Integración con DualSense mediante Gamepad API.
- Pruebas automatizadas dentro del repositorio.

## 11. Inicio recomendado para otro chat

> Continúa el desarrollo de `xArtXtrAx/incremental-game-A`. Lee `HISTORIAL_GPT.MD`, revisa `main` y `Dev-Prestigio-Test`, y conserva las fórmulas registradas. El prestigio y el zafiro WebGL siguen en prueba y no deben integrarse a `main` sin aprobación de Arturo.
