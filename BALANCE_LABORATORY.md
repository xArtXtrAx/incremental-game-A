# LABORATORIO DE BALANCE — Arquitectura y estado

> Documento técnico del sistema de inspección, simulación y edición controlada del balance.
>
> El objetivo es experimentar con la economía sin duplicar fórmulas, introducir estados imposibles ni mezclar el perfil DEV con el guardado normal.

## 1. Estado actual

### Integrado en `main` mediante PR #4

- contrato tipado `BalanceConfig`;
- configuración oficial congelada `DEFAULT_BALANCE_CONFIG`;
- validación de estructura, números finitos, rangos y relaciones;
- runtime reversible con fuente `official`, `session` o `stored-profile`;
- guardado DEV separado de la partida;
- simulador puro de costos, Autoclicker y Zafiro;
- matriz de paridad del balance anterior;
- migración inicial de fórmulas autoritativas en `game.ts`, Refracción, Gatillo y Comprar todo;
- ventana de inspección dentro del Panel de Desarrollador.

### Integrado en `main` mediante PR #5

- editor de borradores en memoria;
- campos controlados para costos, núcleo, desbloqueos, Autoclicker y Zafiro;
- comparación Oficial/Borrador;
- restauración individual y global;
- detección de inflación, estancamiento, desbloqueos tardíos y límites finitos;
- comprobaciones de clonación, modificación y restauración del borrador.

### Integrado en `main` mediante PR #6

- aplicación de configuraciones válidas únicamente a la sesión;
- restauración inmediata del balance oficial;
- normalización conservadora de la partida;
- reporte de ajustes realizados durante la transición;
- cancelación de efectos temporales para evitar duraciones híbridas;
- aplicación inicial de costos, Autoclicker y Zafiro.

### Implementado en `Dev-Balance-Laboratory-Phase-4`

- cobertura dinámica de capacidad de esfera, Presión y desbloqueos;
- textos, botones, reducer y Comprar todo unidos a una política autoritativa;
- previsualización del impacto sobre la partida antes de aplicar;
- transición visible entre esfera completa e incompleta;
- comparación del bono actual de Presión;
- reporte de compras que pasan a estar disponibles o bloqueadas;
- conservación de todos los niveles ya adquiridos;
- continuidad de sistemas comprados aunque un requisito experimental se eleve;
- ampliación de la matriz de normalización.

## 2. Fuente de verdad

```text
DEFAULT_BALANCE_CONFIG
          │
          ▼
Balance Runtime
          │
          ├── game.ts
          ├── balanceUnlockPolicy.ts
          ├── refraction.ts
          ├── pulseTrigger.ts
          ├── bulkPurchase.ts
          ├── UpgradesPanelCompact.tsx
          ├── GameCore.tsx
          ├── DeveloperPanel.tsx
          ├── simulación DEV
          └── editor del Laboratorio
```

Las constantes históricas permanecen como enlaces vivos de compatibilidad. Se sincronizan con el runtime, pero las nuevas fórmulas y reglas deben usar consultas autoritativas.

## 3. Guardados separados

Partida normal:

```text
incremental-game-a:save:v1
```

Perfil experimental:

```text
incremental-game-a:balance-dev:v1
```

El perfil aplicado a la sesión **no se guarda automáticamente**. Recargar la página reconstruye el runtime con `DEFAULT_BALANCE_CONFIG`.

## 4. Aplicación y previsualización

La previsualización consulta el estado vivo de la partida sin modificarlo:

```text
Borrador validado
      │
      ▼
Previsualización pura
      │
      ├── esfera completa / incompleta
      ├── bono actual de Presión
      ├── disponibilidad de compras
      ├── cargas que se recortarán
      └── efectos que se cancelarán
```

La aplicación utiliza después una transición atómica:

```text
Borrador validado
      │
      ▼
Normalización pura de GameState
      │
      ▼
Aplicación completa al runtime
      │
      ▼
Reemplazo del estado normalizado
```

Si la validación falla, ni el runtime ni la partida cambian. La restauración oficial utiliza el mismo proceso en sentido inverso.

## 5. Política de normalización

Se conservan siempre:

- energía;
- clics acumulados;
- niveles comprados;
- prestigio;
- conteo histórico de descargas;
- último valor de recompensa registrado.

Se ajustan únicamente cuando es necesario:

- nivel del Gatillo, si excede su máximo;
- carga parcial de Cavitación;
- progreso fraccionario del Autoclicker;
- carga parcial de Sobrecarga;
- progreso orbital de Refracción;
- facetas cargadas.

Se cancelan al cambiar de perfil:

- Sobrecarga activa;
- PRISMA activo.

Esto evita conservar efectos temporales calculados con una configuración anterior.

## 6. Política de desbloqueos experimentales

La misma función autoritativa decide el estado de compra en:

- reducer;
- tarjetas de mejoras;
- Comprar todo;
- previsualización;
- reporte de normalización.

Reglas:

1. Los requisitos oficiales conservan el comportamiento de planos permanentes después de prestigiar.
2. Reducir un requisito experimental no elimina el beneficio de los planos.
3. Elevar un requisito por encima del valor oficial bloquea compras nuevas hasta cumplirlo, incluso si existe un plano permanente.
4. Ningún nivel comprado se elimina.
5. Un sistema ya comprado continúa funcionando.
6. Refracción comprada continúa cargando y descargando aunque se eleve su requisito de prestigio; únicamente se bloquea la compra del siguiente nivel.
7. Restaurar valores oficiales recupera la política oficial inmediatamente.

Ejemplo:

```text
Autoclicker nivel 4
Requisito experimental: 8,000 clics
Clics actuales: 3,000

Resultado:
- nivel 4 conservado;
- Autoclicker sigue funcionando;
- compra de nivel 5 bloqueada;
- al llegar a 8,000 clics, la compra vuelve a habilitarse.
```

## 7. Parámetros aplicables en Fase 4

Todos los campos editables actuales pueden aplicarse a la sesión:

- costos base de las nueve evoluciones;
- crecimiento de las nueve curvas de costo;
- capacidad de la esfera;
- bono de Presión por tramo;
- desbloqueo de Presión;
- desbloqueo de Cavitación;
- desbloqueo del Autoclicker;
- desbloqueo de Refracción;
- tasa inicial, crecimiento y máximo del Autoclicker;
- multiplicadores P1–P5 del Zafiro;
- incremento provisional posterior a P5.

Los límites absolutos del motor continúan visibles, pero no editables.

## 8. Invariantes de seguridad

1. Una configuración se aplica completa o no se aplica.
2. Todo valor debe ser finito y permanecer dentro de límites absolutos.
3. Los límites del motor no son editables.
4. El Autoclicker no puede superar el máximo de operaciones por tick.
5. Comprar todo conserva su límite de iteraciones.
6. Zafiro mantiene una secuencia estrictamente creciente.
7. No se admiten expresiones JavaScript libres.
8. No se usa `eval()` ni `new Function()`.
9. El perfil de sesión no se guarda automáticamente.
10. Restaurar valores oficiales siempre está disponible.
11. La partida normal no contiene una copia del perfil DEV.
12. Un requisito experimental nunca elimina progreso comprado.
13. Previsualizar nunca cambia el runtime, el reducer ni el guardado.

## 9. Validación requerida de la Fase 4

### Automatizada/local

```powershell
npm run lint
npm run build
```

### Prueba funcional

1. cambiar la capacidad de la esfera de 5,000 a un valor inferior a los clics actuales;
2. confirmar en la previsualización que la esfera pasará a completa;
3. aplicar y verificar contador, llenado, cristalización y requisito de Sobrecarga;
4. elevar la capacidad por encima de los clics actuales;
5. confirmar que la esfera queda incompleta y se limpia la carga de Sobrecarga;
6. modificar el bono de Presión y comprobar resumen, tarjeta y producción;
7. elevar cada requisito de clics por encima del progreso actual;
8. comprobar que la tarjeta y Comprar todo bloquean únicamente compras nuevas;
9. verificar que los niveles existentes continúan funcionando;
10. elevar el prestigio requerido de Refracción por encima del prestigio actual;
11. confirmar que la Matriz comprada sigue cargando, pero su siguiente compra queda bloqueada;
12. alcanzar el requisito experimental y comprobar que la compra se habilita;
13. restaurar la sesión oficial y verificar todos los textos y controles;
14. recargar y confirmar runtime `official` sin pérdida de progreso.

## 10. Fases siguientes

### Fase 5 — Perfiles persistentes

- asignar nombre;
- guardar perfil DEV;
- cargarlo manualmente;
- reemplazarlo;
- eliminarlo;
- exportar e importar JSON validado;
- mantener desactivada la carga automática por defecto.

### Fase 6 — Plantillas matemáticas

Evaluar curvas exponenciales, lineales, potencia, raíz, logarítmicas y rendimientos decrecientes mediante plantillas seguras.

### Etapa de contenido — Esmeralda

Después de cerrar la cobertura y perfiles esenciales, usar el Laboratorio para definir, simular y documentar la economía de Esmeralda antes de implementarla.

## 11. Regla de integración

`Dev-Balance-Laboratory-Phase-4` no debe integrarse hasta que:

- `lint` y `build` pasen;
- la previsualización no altere la partida;
- capacidad, Presión y desbloqueos se reflejen en toda la interfaz;
- Comprar todo respete los requisitos experimentales;
- los sistemas comprados continúen funcionando;
- la restauración oficial recupere todos los valores;
- recargar restaure el balance oficial;
- Arturo autorice expresamente la integración.
