# PANEL DEV ACOPLADO, NO BLOQUEANTE Y REDIMENSIONABLE

> Contrato visual y de interacción para mantener las herramientas de desarrollo dentro de la columna derecha mientras el juego permanece visible y operable.

## 1. Problema resuelto

El Panel DEV crecía según la cantidad de herramientas insertadas y podía superar ampliamente la altura del juego. Las herramientas avanzadas se abrían además como capas fijas sobre toda la ventana, por lo que impedían observar y manipular la partida durante una prueba.

El ancho fijo tampoco se adaptaba a cada tipo de experimento. Algunas herramientas necesitan más espacio para formularios, tablas o texto técnico, mientras que otras funcionan mejor dejando una superficie mayor al juego.

## 2. Contrato de escritorio

En anchuras mayores a 1,280 px:

- el juego y el Panel DEV permanecen en dos columnas;
- el Panel DEV usa una anchura configurable entre 400 y 760 px;
- el ancho efectivo nunca reduce el juego por debajo de 760 px;
- un `ResizeObserver` sincroniza la altura del panel con la superficie principal del juego;
- el contenido normal usa `overflow-y: auto` y `overflow-x: hidden`;
- la página no obtiene una barra horizontal por causa del panel;
- las herramientas avanzadas ocupan solamente el rectángulo del Panel DEV;
- el panel flotante del control se reserva a la izquierda de la columna DEV y nunca cubre sus accesos;
- el juego conserva eventos de puntero, reloj, animaciones y actualizaciones mientras una herramienta está abierta.

## 3. Anchura configurable

El usuario dispone de cuatro acciones rápidas:

```text
Compacto   440 px
Normal     33% del viewport, limitado a 400–640 px
Amplio     640 px
Restaurar  vuelve al valor Normal y elimina la preferencia guardada
```

También existe un tirador vertical en el borde derecho del panel:

- arrastrar hacia la derecha aumenta el ancho;
- arrastrar hacia la izquierda lo reduce;
- las actualizaciones se agrupan mediante `requestAnimationFrame`;
- el valor se persiste solamente al terminar el arrastre;
- `ArrowLeft` y `ArrowRight` cambian 16 px;
- `Home` usa el mínimo permitido;
- `End` usa el máximo disponible para el viewport.

Los límites son dinámicos. El máximo efectivo se calcula reservando:

```text
760 px para el juego
18 px para el espacio entre columnas
48 px para márgenes seguros del viewport
```

Aunque exista una preferencia de 760 px, una ventana más estrecha puede mostrar temporalmente un valor menor. La preferencia original se conserva y se recupera cuando vuelve a existir espacio suficiente.

## 4. Preferencia visual aislada

La anchura se almacena con la clave:

```text
incremental-game-a:developer-panel-width:v1
```

Esta preferencia:

- no forma parte de la partida;
- no modifica `BalanceConfig`;
- no se exporta con perfiles DEV;
- no altera simulaciones ni resultados A/B;
- ignora valores corruptos, decimales, infinitos o fuera del rango 400–760;
- tolera navegadores donde el almacenamiento esté bloqueado.

## 5. Una sola fuente de verdad

La cuadrícula principal y el panel flotante del control consumen la misma variable CSS:

```css
--developer-panel-width
```

Esto evita duplicar fórmulas y mantiene sincronizados:

- el ancho de la columna DEV;
- el espacio reservado al juego;
- la posición horizontal del panel flotante del DualSense.

El estado de anchura vive en `DeveloperPanelWidthSystem`, separado del reducer, del runtime de balance y del componente principal del Panel DEV.

## 6. Hosts separados

El panel expone dos destinos estables:

```text
.developer-panel-launcher-host
.developer-panel-workspace-host
```

El primero recibe los accesos de las herramientas. El segundo recibe la herramienta abierta.

Esta separación evita que una ventana de trabajo dependa de `document.body` y evita que su fondo cubra el juego.

## 7. Herramientas acopladas

- Laboratorio de Balance;
- Perfiles DEV;
- Centro de Control Experimental;
- Comparador de Experimentos A/B;
- Plantillas Matemáticas Seguras;
- Cámara Cromática cuando se abre en modo de inspección DEV.

La Cámara Cromática normal conserva su presentación de juego a pantalla completa. Solamente la vista solicitada desde el Panel DEV se acopla.

## 8. Modalidad y accesibilidad

Las superficies acopladas conservan `role="dialog"`, pero usan `aria-modal="false"` porque no vuelven inerte el resto de la aplicación.

El tirador usa `role="separator"`, orientación vertical y publica `aria-valuemin`, `aria-valuemax` y `aria-valuenow`.

- Escape y los botones Cerrar siguen funcionando;
- el foco de teclado dentro del workspace no es expulsado por el filtro del Panel DEV;
- mientras una herramienta está abierta, el Panel DEV eleva únicamente su propia columna por encima del panel flotante del control;
- el panel flotante del control permanece disponible, pero nunca intercepta botones del workspace;
- la navegación direccional del gamepad se pausa cuando el foco está dentro del workspace, evitando que la deriva robe campos o desplegables;
- el pulso primario del núcleo y toda la interacción por mouse permanecen disponibles.

## 9. Compatibilidad responsive

En 1,280 px o menos:

- la interfaz vuelve a una sola columna;
- el panel usa anchura automática;
- el tirador se oculta;
- los presets se ocultan;
- la preferencia guardada no se elimina;
- no aparece desplazamiento horizontal de página.

Al volver a escritorio, el sistema recupera la preferencia guardada dentro de los límites disponibles.

## 10. Rendimiento

El cambio de ancho modifica solamente una variable CSS de layout.

Durante el arrastre:

- no se despachan acciones al reducer;
- no se ejecutan simulaciones;
- no cambia el reloj del juego;
- no se escribe continuamente en `localStorage`;
- se realiza como máximo una actualización visual por cuadro mediante `requestAnimationFrame`.

## 11. Pruebas de regresión

### Unitarias

`tests/unit/developerPanelWidth.test.ts` cubre:

1. valor predeterminado responsive;
2. mínimo y máximo globales;
3. máximo dinámico que protege el juego;
4. presets;
5. breakpoint de escritorio;
6. análisis de preferencias válidas e inválidas;
7. lectura, escritura y eliminación aisladas;
8. valores corruptos;
9. almacenamiento bloqueado.

### Playwright

`tests/e2e/developer-panel-workspace.spec.ts`, `developer-panel-responsive.spec.ts` y `developer-panel-width.spec.ts` comprueban:

1. igualdad de altura entre juego y panel;
2. desplazamiento vertical interno y ausencia de expansión horizontal;
3. presets Compacto, Normal y Amplio;
4. redimensionamiento con teclado;
5. arrastre real del borde derecho;
6. persistencia tras recargar;
7. restauración del valor oficial;
8. rechazo de preferencias corruptas;
9. límites dinámicos en una ventana estrecha;
10. recuperación de la preferencia al ampliar el viewport;
11. conservación de al menos 760 px para el juego;
12. separación geométrica frente al panel flotante del control;
13. modo apilado sin tirador ni presets;
14. confinamiento de las ventanas dentro del panel;
15. clics reales del núcleo mientras el Laboratorio permanece abierto;
16. Cámara Cromática DEV sin bloqueo de `body`;
17. foco estable ante deriva de DualSense.

Comando dedicado:

```bash
npm run test:developer-panel
```

Cobertura total actual de la rama:

```text
129 pruebas Vitest
25 pruebas Playwright
154 comprobaciones automatizadas
```
