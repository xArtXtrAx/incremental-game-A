# HISTORIAL_GPT — Incremental Game A

> Bitácora compartida entre Arturo y GPT.  
> **Regla para nuevos chats:** leer este archivo y revisar la rama activa antes de proponer o modificar el proyecto.

## 1. Estado actual

- Repositorio: `xArtXtrAx/incremental-game-A`
- Rama estable: `main`
- Entorno: React + TypeScript + Vite + Motion
- Guardado: `localStorage`, clave `incremental-game-a:save:v1`
- Última actualización de esta bitácora: **1 de agosto de 2026**
- Diseño vigente: interfaz compacta con núcleo fijo, resumen superior, pestañas de evoluciones y tarjetas expandibles.
- El contador interno `manualClicks` representa ahora **clics del núcleo**: incluye clics del jugador y pulsos del autoclicker.
- El marcador circular de cavitación está restaurado: cada segmento representa un clic de carga y se ilumina alrededor de la esfera.
- Al dispararse la cavitación, el anillo muestra brevemente todos sus segmentos encendidos antes de volver a carga cero.

## 2. Forma de trabajo acordada

- Trabajar de forma directa y evitar microcomprobaciones repetitivas.
- Usar GitHub Desktop para el flujo local normal.
- Crear ramas de propuesta cuando un cambio visual o estructural necesite aprobación.
- Integrar a `main` solamente después de validar la propuesta.
- No crear ZIP, manifiestos ni hashes salvo necesidad técnica o petición expresa.
- Ejecutar pruebas agrupadas y registrar aquí decisiones importantes.

## 3. Evolución del proyecto

### Base del prototipo

- Contador de energía.
- Botón/esfera interactiva.
- Amplificador de clic.
- Producción automática mediante microgeneradores.
- Guardado automático y reinicio protegido.
- Esfera líquida con capacidad visual de 5,000 clics.
- Corrección de las ondas para eliminar las franjas gruesas giratorias.

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
- Requisito: 100 clics.
- Costo inicial: 500.
- Crecimiento de costo: ×2.4.

### Evolución 05 — Cámara de cavitación

- Los clics cargan una descarga basada en varios segundos de producción.
- Nivel 1: cada 25 clics, recompensa equivalente a 5 segundos.
- Los niveles reducen el ciclo y aumentan los segundos recompensados.
- Requisito: 500 clics y al menos un microgenerador.
- Costo inicial: 2,000.
- Crecimiento de costo: ×2.6.
- Marcador visual: anillo interior de segmentos luminosos alrededor de la esfera; cada clic carga un segmento y, al completar el ciclo, el anillo se ilumina por completo durante la descarga antes de reiniciarse.

### Evolución 06 — Válvula de sobrecarga

- Después de llenar la esfera, los clics adicionales cargan una fase temporal.
- Nivel 1: 100 clics, multiplicador ×2, duración 15 segundos.
- Afecta clics, producción y cavitación.
- Requisito: esfera llena y cavitación nivel 1.
- Costo inicial: 10,000.
- Crecimiento de costo: ×3.

### Evolución 07 — Módulo de pulsación autónoma

- Genera clics reales del núcleo sin interacción del jugador.
- Los pulsos llenan la esfera y cargan presión, cavitación y sobrecarga.
- Usa un acumulador fraccionario; por ejemplo, 0.20 clic/s genera un clic cada 5 segundos.
- Progresión de velocidad: `0.20 × 1.6^(nivel - 1)`.
- Ejemplos: 0.20, 0.32, 0.512, 0.8192, 1.3107 clic/s.
- Límite técnico: 20 clic/s para proteger el rendimiento.
- Requisito: 500 clics y al menos un microgenerador.
- Costo inicial: 5,000.
- Crecimiento de costo: ×2.8.
- Los pulsos automáticos no crean partículas flotantes individuales para evitar saturación visual.

## 4. Diseño de interfaz

La propuesta `Dev-propuesta-A` fue aprobada e integrada a `main`.

Características:

- Núcleo fijo/sticky en escritorio.
- Resumen superior de energía, clic, producción, presión y sobrecarga.
- Pestañas de evoluciones:
  - Producción
  - Núcleo
  - Avanzadas
- Tarjetas compactas con detalles expandibles.
- Panel de evoluciones con desplazamiento propio.
- En móvil:
  - pestaña `Núcleo`
  - pestaña `Evoluciones`
- Estilos adicionales aislados en `src/ProposalA.css`.
- Anillos separados alrededor de la esfera:
  - interior: carga de cavitación;
  - exterior: carga y estado de sobrecarga.

## 5. Arquitectura relevante

- `src/game.ts`
  - Estado, fórmulas, guardado, migración y reducer.
- `src/App.tsx`
  - Ciclo principal, reloj, eventos visuales y navegación móvil.
- `src/GameCore.tsx`
  - Esfera, anillos, estadísticas y efectos.
- `src/UpgradesPanelCompact.tsx`
  - Pestañas y tarjetas de las evoluciones.
- `src/App.css`
  - Estilos visuales base.
- `src/ProposalA.css`
  - Diseño compacto y adaptable aprobado.
- `HISTORIAL_GPT.MD`
  - Esta bitácora.

## 6. Compatibilidad y decisiones técnicas

- Los guardados anteriores se migran añadiendo campos faltantes en nivel 0.
- La sobrecarga activa se conserva al recargar únicamente mientras no haya expirado.
- No hay progreso fuera de línea todavía.
- La producción pasiva y los autoclics se procesan una vez por segundo.
- Cuando hay varios autoclics en un mismo segundo, se procesan secuencialmente para respetar cambios de presión, descargas y activación de sobrecarga.
- El autoclicker no es energía pasiva: ejecuta la misma lógica de un clic del núcleo.
- La posición radial de cada segmento está separada de su animación Motion para evitar que las transformaciones se sobrescriban y el anillo desaparezca.
- La carga lógica de cavitación se reinicia inmediatamente al descargar, pero la capa visual usa el estado temporal de descarga para mostrar el anillo completo durante el efecto.

## 7. Validaciones realizadas

- TypeScript estricto para la lógica.
- TypeScript estricto para App y componentes con módulos simulados.
- Compra bloqueada por requisitos o energía insuficiente.
- Escalado de costos y velocidades.
- Acumulación fraccionaria del autoclicker.
- Interacción del autoclicker con presión, cavitación y sobrecarga.
- Límite de 20 clic/s.
- Migración de guardados previos.
- Restauración del anillo de cavitación y convivencia con el anillo exterior de sobrecarga.
- Visualización del último segmento y del anillo completo durante la descarga de cavitación.
- Se recomienda confirmar siempre en el equipo local:

```powershell
npm run lint
npm run build
```

## 8. Próximas propuestas

Prioridad sugerida:

1. **Primera mecánica de prestigio/desbordamiento**
   - Reinicio parcial a cambio de una moneda permanente.
2. **Progreso fuera de línea controlado**
   - Recompensa con límite temporal y resumen al regresar.
3. **Balance y telemetría local**
   - Tiempo estimado para compras y producción efectiva.
4. **Árbol de mejoras permanentes**
   - Decisiones mutuamente excluyentes o especializaciones.
5. **Integración más profunda con mando**
   - DualSense/Gamepad API, navegación y vibración.
6. **Pruebas automatizadas dentro del repositorio**
   - Fórmulas, migraciones, reducer y ciclos temporales.

## 9. Inicio recomendado para el siguiente chat

Usar este contexto:

> Continúa el desarrollo de `xArtXtrAx/incremental-game-A`. Lee primero `HISTORIAL_GPT.MD`, revisa el estado actual de `main` y conserva las fórmulas y decisiones registradas. Evita comprobaciones redundantes y usa ramas para propuestas visuales o estructurales que necesiten aprobación.