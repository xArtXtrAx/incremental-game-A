# HISTORIAL_GPT — Incremental Game A

> Bitácora compartida entre Arturo y GPT.  
> **Regla para nuevos chats:** leer este archivo, comprobar la rama activa y conservar las fórmulas y decisiones aquí registradas antes de modificar el proyecto.

## 1. Estado actual

- Repositorio: `xArtXtrAx/incremental-game-A`
- Rama estable: `main`
- Rama experimental activa: `Dev-Prestigio-Test`
- Entorno: React + TypeScript + Vite + Motion
- Guardado estable de `main`: `incremental-game-a:save:v1`
- Guardado aislado de la prueba: `incremental-game-a:save:prestige-test:v1`
- Última actualización: **1 de agosto de 2026**
- Diseño estable: interfaz compacta con núcleo fijo, resumen superior, pestañas de evoluciones y tarjetas expandibles.
- El contador interno `manualClicks` representa **clics del núcleo**: incluye clics del jugador y pulsos del autoclicker.

### Situación de ramas

- `main` conserva el juego estable con las evoluciones 01–07.
- `Dev-Prestigio-Test` parte del `main` actual y añade el primer sistema de prestigio mediante un zafiro permanente.
- No integrar `Dev-Prestigio-Test` a `main` hasta que Arturo valide visualmente la formación, extracción, soporte lateral, reinicio y balance.
- Al abrir por primera vez la rama experimental, se usa el guardado estable como punto de partida si todavía no existe un guardado de prueba.
- A partir de ese momento, la rama experimental guarda en su propia clave y no sobrescribe el progreso de `main`.
- El reinicio total dentro de `Dev-Prestigio-Test` elimina únicamente el guardado experimental.

## 2. Forma de trabajo acordada

- Trabajar de forma directa y evitar microcomprobaciones repetitivas.
- Usar GitHub Desktop para el flujo local normal.
- Crear ramas de propuesta cuando un cambio visual o estructural necesite aprobación.
- Integrar a `main` solamente después de validar la propuesta.
- No crear ZIP, manifiestos ni hashes salvo necesidad técnica o petición expresa.
- Ejecutar pruebas agrupadas y registrar aquí decisiones importantes.

## 3. Sistemas estables en `main`

### Base del prototipo

- Contador de energía.
- Botón/esfera interactiva.
- Producción manual y automática.
- Guardado automático y reinicio protegido.
- Esfera líquida con capacidad visual de 5,000 clics.
- Ondas de líquido corregidas para evitar franjas gruesas giratorias.

### Evolución 01 — Amplificador de pulso

- Aumenta en 1 la energía base obtenida por clic.
- Costo inicial: 10.
- Crecimiento de costo: ×1.7.

### Evolución 02 — Microgenerador

- Produce energía automáticamente.
- Costo inicial: 25.
- Crecimiento de costo: ×1.8.

### Evolución 03 — Reactor de resonancia

- Multiplica la producción de todos los microgeneradores.
- Multiplicador: nivel + 1.
- Costo inicial: 120.
- Crecimiento de costo: ×2.2.

### Evolución 04 — Condensador de presión

- Cada nivel concede +2% global por cada tramo completo de 10% de llenado.
- Afecta clics y producción automática.
- Requisito inicial: 100 clics.
- Costo inicial: 500.
- Crecimiento de costo: ×2.4.

### Evolución 05 — Cámara de cavitación

- Los clics cargan una descarga basada en varios segundos de producción.
- Nivel 1: cada 25 clics, recompensa equivalente a 5 segundos.
- Los niveles reducen el ciclo y aumentan los segundos recompensados.
- Requisito inicial: 500 clics y al menos un microgenerador.
- Costo inicial: 2,000.
- Crecimiento de costo: ×2.6.
- Marcador visual: anillo interior de segmentos luminosos.
- Al descargar, se ilumina el círculo completo; cuando el siguiente ciclo enciende la marca de las 12, el resto se apaga inmediatamente.

### Evolución 06 — Válvula de sobrecarga

- Después de llenar la esfera, los clics adicionales cargan una fase temporal.
- Nivel 1: 100 clics, multiplicador ×2, duración 15 segundos.
- Afecta clics, producción y cavitación.
- Requisito inicial: esfera llena y cavitación nivel 1.
- Costo inicial: 10,000.
- Crecimiento de costo: ×3.

### Evolución 07 — Módulo de pulsación autónoma

- Genera clics reales del núcleo sin interacción del jugador.
- Llena la esfera y carga presión, cavitación y sobrecarga.
- Usa acumulación fraccionaria.
- Progresión: `0.20 × 1.6^(nivel - 1)` clics por segundo.
- Ejemplos: 0.20, 0.32, 0.512, 0.8192 y 1.3107 clic/s.
- Límite técnico: 20 clic/s.
- Requisito inicial: 500 clics y al menos un microgenerador.
- Costo inicial: 5,000.
- Crecimiento de costo: ×2.8.
- No genera partículas flotantes individuales para evitar saturación visual.

## 4. Propuesta experimental — Prestigio de zafiro

Implementada únicamente en `Dev-Prestigio-Test`.

### Activación

- Al alcanzar 5,000 clics, el núcleo queda lleno y se forma un zafiro facetado en el centro de la esfera.
- La esfera continúa siendo clicable para permitir cargar y utilizar la sobrecarga.
- Aparece un control independiente `CRISTALIZAR`; el prestigio nunca ocurre de manera accidental.

### Secuencia visual

1. El zafiro nace dentro de la esfera con escala, brillo y rotación.
2. Flota y gira en profundidad mediante SVG facetado, CSS y Motion.
3. Al pulsar `CRISTALIZAR`, se intensifica, sale de la esfera siguiendo una trayectoria hacia la izquierda y desaparece dentro del soporte.
4. Tras la extracción aparece o evoluciona el zafiro permanente en un soporte lateral.
5. El zafiro del soporte flota, gira, emite destellos y reacciona visualmente a cavitación, sobrecarga y nuevas cristalizaciones.
6. En pantallas estrechas, el soporte se convierte en una banda compacta encima del núcleo para evitar cortes laterales.

### Multiplicador permanente

- Prestigio 0: ×1.00
- Prestigio 1: ×1.50
- Prestigio 2: ×1.85
- Prestigio 3: ×2.20
- Prestigio 4: ×2.60
- Prestigio 5: ×3.05
- Prestigios posteriores: +0.50 por cristalización.

El multiplicador afecta:

- Energía por clic.
- Producción de microgeneradores.
- Resultado de resonancia y presión.
- Descargas de cavitación.
- Producción durante sobrecarga.
- Energía producida por los clics del autoclicker.

No modifica:

- Velocidad del autoclicker.
- Cantidad de clics necesaria para cavitación.
- Cantidad de clics necesaria para sobrecarga.
- Capacidad de 5,000 clics de la esfera.

### Reinicio de cristalización

Se reinicia:

- Energía.
- Clics del núcleo.
- Niveles de las evoluciones 01–07.
- Carga de cavitación.
- Carga y tiempo activo de sobrecarga.
- Progreso fraccionario del autoclicker.

Se conserva:

- Número de prestigios.
- Zafiro permanente y multiplicador.
- Planos de los sistemas descubiertos.

### Planos permanentes

Después del primer prestigio se eliminan únicamente los requisitos de descubrimiento por cantidad de clics:

- Presión puede comprarse sin repetir los 100 clics de descubrimiento.
- Cavitación y autoclicker pueden comprarse sin repetir los 500 clics de descubrimiento.
- Sobrecarga puede instalarse antes de llenar la esfera.

Se conservan las dependencias funcionales:

- Cavitación y autoclicker siguen requiriendo un microgenerador.
- Sobrecarga sigue requiriendo cavitación nivel 1.
- La sobrecarga solo comienza a cargarse cuando la esfera vuelve a estar llena.

### Evolución visual del mismo zafiro

- Prestigio 1: Zafiro incipiente.
- Prestigio 2: Zafiro facetado.
- Prestigio 3: Zafiro resonante.
- Prestigio 4: Zafiro astral.
- Prestigio 5+: Zafiro trascendente.

## 5. Arquitectura relevante

- `src/game.ts`
  - Estado, fórmulas, guardado aislado, migración, prestigio y reducer.
- `src/App.tsx`
  - Ciclo principal, reloj, eventos visuales, temporización de extracción y navegación móvil.
- `src/GameCore.tsx`
  - Esfera, anillos, gema en formación, botón de cristalización, soporte y efectos.
- `src/SapphireGem.tsx`
  - SVG facetado, rotación tridimensional, brillo y soporte permanente.
- `src/UpgradesPanelCompact.tsx`
  - Pestañas, tarjetas, cálculos con zafiro y planos permanentes.
- `src/App.css`
  - Estilos visuales base.
- `src/ProposalA.css`
  - Diseño compacto y adaptable aprobado.
- `src/PrestigeSapphire.css`
  - Estilos experimentales del zafiro, extracción, soporte y comportamiento responsivo.
- `HISTORIAL_GPT.MD`
  - Esta bitácora.

## 6. Compatibilidad y decisiones técnicas

- `main` continúa usando `incremental-game-a:save:v1`.
- `Dev-Prestigio-Test` usa `incremental-game-a:save:prestige-test:v1`.
- Si la clave experimental todavía no existe, la rama lee una sola vez el guardado estable como punto de partida y después guarda su propia copia aislada.
- Los guardados anteriores migran `prestigeCount` a 0 automáticamente.
- La sobrecarga activa se conserva al recargar únicamente mientras no haya expirado.
- No hay progreso fuera de línea todavía.
- La producción pasiva y los autoclics se procesan una vez por segundo.
- Cuando hay varios autoclics en un mismo segundo, se procesan secuencialmente para respetar presión, cavitación y sobrecarga.
- El autoclicker ejecuta la misma lógica de un clic del núcleo.
- El zafiro se implementa sin motor 3D: SVG facetado, transformaciones 3D, CSS y Motion.
- El botón de cristalización está separado de la esfera para conservar la elección entre prestigio y sobrecarga.

## 7. Validaciones realizadas para `Dev-Prestigio-Test`

- TypeScript estricto para lógica, App y componentes con módulos simulados.
- Multiplicadores de prestigio 0–6.
- Bloqueo de cristalización antes de 5,000 clics.
- Reinicio completo de la capa temporal.
- Conservación de `prestigeCount`.
- Primer clic tras prestigio 1 produce ×1.50.
- Producción automática recibe el multiplicador del zafiro.
- Planos permanentes eliminan requisitos de descubrimiento sin eliminar dependencias funcionales.
- Migración de guardados antiguos sin `prestigeCount`.
- Importación inicial del progreso estable a la rama experimental.
- Escritura y reinicio limitados a la clave experimental.
- Confirmación de que el guardado estable permanece intacto.
- Estructura responsiva del soporte lateral.

Confirmar en el equipo local:

```powershell
npm run lint
npm run build
```

## 8. Próximo paso inmediato

1. Probar `Dev-Prestigio-Test` en escritorio y móvil.
2. Validar el momento de formación al llegar a 5,000.
3. Validar que la esfera siga cargando sobrecarga mientras el zafiro está listo.
4. Pulsar `CRISTALIZAR` y revisar trayectoria, duración y ubicación final.
5. Confirmar reinicio y multiplicador ×1.50.
6. Cambiar de vuelta a `main` y comprobar que el progreso estable no fue alterado.
7. Ajustar tamaño, posición o velocidad antes de integrar a `main`.

Después de aprobar esta rama, las siguientes propuestas sugeridas son:

- Progreso fuera de línea controlado.
- Árbol de mejoras permanentes del zafiro.
- Telemetría local de tiempos y producción efectiva.
- Integración con DualSense mediante Gamepad API.
- Pruebas automatizadas dentro del repositorio.

## 9. Inicio recomendado para el siguiente chat

> Continúa el desarrollo de `xArtXtrAx/incremental-game-A`. Lee primero `HISTORIAL_GPT.MD`, revisa `main` y la rama `Dev-Prestigio-Test`, y conserva las fórmulas registradas. El prestigio de zafiro está en prueba y no debe integrarse a `main` sin aprobación de Arturo.
