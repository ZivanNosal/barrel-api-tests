# Barrel API Tests

Automation tests for Barrel API (`https://to-barrel-monitor.azurewebsites.net`).

## Stack

- **Jest** – test runner
- **Axios** – HTTP client
- **dotenv** – configuration of BASE_URL

## Run

```bash
npm install
npm install uuid

npm run test:barrels

npm test
npx jest --testNamePattern="Happy flow"

```

## Test cases

Barrels:
    - Happy flow - create new barrel (POST /barrels)
    - Get all barrels (GET /barrels)
    - Get barrel detail (GET /barrels/{id})
    - Negative: Create barrel without QR/NFC/RFID → 400
    - Delete barrel (DELETE /barrels/{id})

Measurements:
    - Add measurement to barrel (POST /measurements)
    - Get all measurements (GET /measurements)
    - Negative: Create measurement without barrel → 400