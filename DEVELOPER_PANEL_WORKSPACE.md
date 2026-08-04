# PANEL DEV ACOPLADO Y NO BLOQUEANTE

> Contrato visual y de interacción para mantener las herramientas de desarrollo dentro de la columna derecha mientras el juego permanece visible y operable.

## 1. Problema resuelto

El Panel DEV crecía según la cantidad de herramientas insertadas y podía superar ampliamente la altura del juego. Las herramientas avanzadas se abrían además como capas fijas sobre toda la ventana, por lo que impedían observar y manipular la partida durante una prueba.

## 2. Contrato de escritorio

En anchuras mayores a 1,280 px:

- el juego y el Panel DEV permanecen en dos columnas;
- el Panel DEV usa una anchura flexible entre 360 y 560 px;
- un `ResizeObserver` sincroniza su altura con la superficie principal del juego;
- el contenido normal del panel usa `overflow-y: auto` y `overflow-x: hidden`;
- la página no obtiene una barra horizontal por causa del panel;
- las herramientas avanzadas ocupan solamente el rectángulo del Panel DEV;
- el panel flotante del control se reserva a la izquierda de la columna DEV y nunca cubre sus accesos;
- el juego conserva eventos de puntero, reloj, animaciones y actualizaciones mientras una herramienta está abierta.

## 3. Hosts separados

El panel expone dos destinos estables:

```text
.developer-panel-launcher-host
.developer-panel-workspace-host
```

El primero recibe los accesos de las herramientas. El segundo recibe la herramienta abierta.

Esta separación evita que una ventana de trabajo dependa de `document.body` y evita que su fondo cubra el juego.

## 4. Herramientas acopladas

- Laboratorio de Balance;
- Perfiles DEV;
- Centro de Control Experimental;
- Comparador de Experimentos A/B;
- Plantillas Matemáticas Seguras;
- Cámara Cromática cuando se abre en modo de inspección DEV.

La Cámara Cromática normal conserva su presentación de juego a pantalla completa. Solamente la vista solicitada desde el Panel DEV se acopla.

## 5. Modalidad y accesibilidad

Las superficies acopladas conservan `role="dialog"`, pero usan `aria-modal="false"` porque no vuelven inerte el resto de la aplicación.

- Escape y los botones Cerrar siguen funcionando;
- el foco de teclado dentro del workspace no es expulsado por el filtro del Panel DEV;
- mientras una herramienta está abierta, el Panel DEV eleva únicamente su propia columna por encima del panel flotante del control;
- el panel flotante del control permanece disponible, pero nunca intercepta botones del workspace;
- la navegación direccional del gamepad se pausa cuando el foco está dentro del workspace, evitando que la deriva robe campos o desplegables;
- el pulso primario del núcleo y toda la interacción por mouse permanecen disponibles;
- en pantallas angostas el panel vuelve a una sola columna sin cubrir la partida.

## 6. Pruebas de regresión

`tests/e2e/developer-panel-workspace.spec.ts` comprueba:

1. igualdad de altura entre juego y panel en escritorio;
2. desplazamiento vertical interno y ausencia de expansión horizontal;
3. confinamiento geométrico de las ventanas dentro del panel;
4. clics reales del núcleo mientras el Laboratorio permanece abierto;
5. acoplamiento de las cinco herramientas principales;
6. vista cromática DEV sin bloqueo de `body`;
7. juego operable durante la inspección cromática;
8. separación geométrica y prioridad de capa frente al panel flotante del control;
9. foco estable ante deriva de DualSense mediante la regresión existente de Plantillas Matemáticas.

Comando dedicado:

```bash
npm run test:developer-panel
```
