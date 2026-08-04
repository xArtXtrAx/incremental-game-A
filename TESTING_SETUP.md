# CONFIGURACIÓN DE PRUEBAS

## Primera instalación local

```powershell
npm ci
npx playwright install chromium
```

`npm ci` instala exactamente las versiones registradas en `package-lock.json`. Si se añade o actualiza una dependencia deliberadamente, se usa `npm install` una sola vez para regenerar el lockfile y después se vuelve a `npm ci`.

## Ejecución rápida

Solo lógica e integración:

```powershell
npm run test
```

Solo navegador:

```powershell
npm run test:e2e
```

Fase 4 completa:

```powershell
npm run test:phase4
```

Control total antes de integrar:

```powershell
npm run test:all
```

## Resultados de Playwright

Cuando una prueba de navegador falla, Playwright genera recursos locales ignorados por Git:

```text
playwright-report/
test-results/
```

En GitHub Actions estos archivos se conservan como artefactos durante 14 días.

## Partidas de prueba

Playwright utiliza un navegador aislado. Cada caso prepara su propio `localStorage` y no accede al perfil habitual de Chrome ni a la partida real de Arturo.
