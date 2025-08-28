/*
"test": "jest --runInBand",
"test:log": "node -e \"const fs = require('fs'); const { spawnSync } = require('child_process'); const logDir = 'logs'; if (!fs.existsSync(logDir)) fs.mkdirSync(logDir); const ts = new Date().toISOString().replace(/[:T]/g,'-').split('.')[0]; const logFile = `${logDir}/test-results-${ts}.log`; const out = spawnSync('npx', ['jest', '--runInBand'], { stdio: ['ignore','pipe','pipe'], shell: true }); fs.writeFileSync(logFile, out.stdout + out.stderr); process.stdout.write(out.stdout + out.stderr);\""
*/
const axios = require("axios");
require("dotenv").config();

const client = axios.create({
  baseURL: process.env.BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  },
  validateStatus: () => true
});

describe("Barrel API", () => {
  test("Happy flow - create new barrel", async () => {
    const payload = {
      id: "barrel-" + Date.now(),
      qr: "QR123",
      rfid: "RFID123",
      nfc: "NFC123"
    };

    // log requestu
    const fs = require('fs');
    fs.appendFileSync('logs/requests.log', JSON.stringify({
      test: 'Happy flow - create new barrel',
      payload
    }, null, 2) + '\n\n');
    const response = await client.post("/barrels", payload);

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("id");
    expect(response.data.id).toBe(payload.id);
  });

  test("Negative flow - create barrel with empty id", async () => {
    const payload = {
      id: "",
      qr: "string",
      rfid: "string",
      nfc: "string"
    };

    const response = await client.post("/barrels", payload);

    expect(response.status).toBe(400);
  });
});