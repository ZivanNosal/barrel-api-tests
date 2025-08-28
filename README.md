# Barrel API Tests

Automatizované testy pro Barrel API (`https://to-barrel-monitor.azurewebsites.net`).

## Použitý stack
- **Jest** – test runner
- **Axios** – HTTP klient
- **dotenv** – konfigurace BASE_URL

## Spuštění
```bash
npm install
npm install uuid
npm test
npm run test:log
npx jest --testNamePattern="Happy flow"
npm run test:barrels

```

## Test scénáře
1. **Happy flow** – vytvoření barelu s validními daty → 201 Created
2. **Negative flow** – vytvoření barelu s prázdným `id` → 400 Bad Request