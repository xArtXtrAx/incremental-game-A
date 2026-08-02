# Barras de progreso de Evoluciones

## Rama

Implementación experimental en `Dev-Upgrade-Progress-Bars`, creada desde `Dev-Chromatic-Theme-Preview`.

`main` permanece intacta hasta la validación visual y funcional de Arturo.

## Objetivo

Mejorar la lectura inmediata de las ocho Evoluciones sin convertir todas las tarjetas en medidores idénticos.

Cada tarjeta muestra una barra principal de preparación para el siguiente nivel. Las Evoluciones que tienen un proceso interno real pueden mostrar una segunda barra.

## Barra principal

La barra principal cambia de significado según el estado de la Evolución:

- Mientras está bloqueada, representa el requisito pendiente: clics, esfera, prestigio o una instalación previa.
- Una vez desbloqueada, representa la energía actual frente al costo del siguiente nivel.
- Al llegar al costo, cambia a estado `LISTO` y recibe un pulso luminoso suave.

La barra nunca modifica compras ni recursos. Solo lee el estado saneado de la partida y usa las mismas funciones de costo del reducer.

## Barras de proceso interno

### Amplificador de pulso

- Energía frente al costo del siguiente nivel.

### Microgenerador

- Energía frente al costo del siguiente nivel.

### Reactor de resonancia

- Requisito de Microgenerador antes de instalarse.
- Después, energía frente al costo siguiente.

### Condensador de presión

- Descubrimiento por clics o costo siguiente.
- Segunda barra segmentada en diez tramos para representar la presión del núcleo.

### Cámara de cavitación

- Descubrimiento, requisito de Microgenerador o costo siguiente.
- Segunda barra con clics acumulados frente al umbral de descarga.

### Módulo de pulsación autónoma

- Descubrimiento, requisito de Microgenerador o costo siguiente.
- Segunda barra animada con el progreso hacia el próximo clic autónomo.

### Válvula de sobrecarga

- Esfera llena, requisito de Cavitación o costo siguiente.
- Mientras carga: clics frente al umbral.
- Mientras está activa: temporizador descendente de la fase.

### Matriz de refracción

- Prestigio, requisito de Microgenerador o costo siguiente.
- Mientras carga: facetas segmentadas e incorporación del progreso de la vuelta actual.
- Durante PRISMA: temporizador descendente de la bonificación.

## Estados visuales

- `locked`: gris azulado y bajo contraste.
- `charging`: carga cian normal.
- `ready`: barra completa con pulso suave.
- `active`: flujo luminoso para ciclos o estados temporales activos.

Se respeta `prefers-reduced-motion`: las animaciones se desactivan y la información continúa visible.

## Arquitectura

- `src/UpgradeProgressBar.tsx`: componente accesible y reutilizable.
- `src/UpgradeProgressBar.css`: estilos, segmentación y estados.
- `src/UpgradeProgressSystem.tsx`: conecta las barras a las tarjetas visibles y calcula sus definiciones usando las funciones oficiales.
- `src/main.tsx`: monta la capa como hermana de `App`.

La capa busca únicamente las tarjetas visibles de la pestaña actual. Al cambiar de Producción, Núcleo o Avanzadas, crea los puntos de montaje necesarios y deja de renderizar en las tarjetas retiradas del DOM.

## Rendimiento

- No modifica React dentro de `UpgradesPanelCompact`.
- No crea ocho barras ocultas simultáneamente.
- Lee el guardado saneado cada 100 ms, pero solo actualiza React cuando cambia un dato relevante o existe un temporizador activo.
- Usa `MutationObserver` únicamente para detectar cambios de pestaña y montaje de tarjetas.
- No añade dependencias.

## Prueba recomendada

1. Cambiar a `Dev-Upgrade-Progress-Bars` y hacer Pull.
2. Ejecutar `npm run lint`, `npm run build` y `npm run dev`.
3. Confirmar que las cuatro tarjetas de Producción muestran su preparación de compra.
4. Usar energía inferior y superior al costo para comprobar `cargando` y `LISTO`.
5. Probar requisitos bloqueados antes de los primeros planos.
6. Instalar Presión y confirmar diez segmentos.
7. Instalar Cavitación y comprobar que la barra se reinicia al descargar.
8. Instalar Autoclicker y observar el progreso de cada clic autónomo.
9. Cargar Sobrecarga y comprobar que la barra cambia a temporizador descendente.
10. Activar Refracción y comprobar facetas segmentadas y temporizador PRISMA.
11. Cambiar entre pestañas repetidamente y verificar que no se dupliquen barras.
12. Probar las cinco vistas del laboratorio cromático.

## Validación remota

- Componentes nuevos comprobados con TypeScript estricto, `noUnusedLocals` y `noUnusedParameters` mediante declaraciones equivalentes de React y DOM.
- No se modificaron fórmulas, reducer, costos, guardado ni mecánicas.
- GitHub no dispone de CI configurado.
- `npm run lint`, `npm run build` y la validación visual quedan pendientes en el checkout local con las dependencias reales.
