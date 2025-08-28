// tests/barrel-api.spec.js
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const API_URL = "https://to-barrel-monitor.azurewebsites.net";
let createdBarrel = null;

// vytvoření složky logs, pokud neexistuje
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

const ts = new Date().toISOString().replace(/[:T]/g, "-").split(".")[0];
const logFile = path.join(logsDir, `test-results-${ts}.log`);

// helper pro logování request + response
function logRequestResponse(testName, reqData, res, options = {}) {
  let logEntry;
  if (options.minimal) {
    logEntry = `--- ${testName} ---\nSTATUS: ${res.status}\n--- END ---\n`;
  } else {
    logEntry = [
      `--- ${testName} ---`,
      reqData ? `REQUEST: ${JSON.stringify(reqData, null, 2)}` : "",
      `STATUS: ${res.status}`,
      `RESPONSE: ${JSON.stringify(res.data, null, 2)}`,
      `--- END ---\n`
    ].filter(Boolean).join("\n");
  }

  console.log(logEntry);
  fs.appendFileSync(logFile, logEntry + "\n");
}

// axios wrapper → nezpůsobuje chybu pro HTTP >=400
async function safeRequest(config) {
  const cfg = { validateStatus: () => true, ...config };
  return axios(cfg);
}

describe("Barrels API", () => {
  it("Happy flow - create new barrel (POST /barrels)", async () => {
    const payload = {
      id: uuidv4(),
      barrel: "Test Barrel " + Date.now(),
      qr: "QR-" + Date.now(),
      rfid: "RFID-" + Date.now(),
      nfc: "NFC-" + Date.now()
    };
    const res = await safeRequest({
      method: "post",
      url: `${API_URL}/barrels`,
      data: payload,
      headers: { Accept: "application/json" }
    });

    logRequestResponse("Create Barrel", payload, res);

    expect(res.status).toBe(201);
    expect(res.data).toHaveProperty("id");
    createdBarrel = res.data;
  });

  it("Get all barrels (GET /barrels) - minimal log", async () => {
    const res = await safeRequest({ method: "get", url: `${API_URL}/barrels` });
    logRequestResponse("Get All Barrels", null, res, { minimal: true });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });

  it("Get barrel detail (GET /barrels/{id})", async () => {
    const url = `${API_URL}/barrels/${createdBarrel.id}`;
    const res = await safeRequest({ method: "get", url });
    logRequestResponse("Get Barrel Detail", { url }, res);

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(createdBarrel.id);
  });

  it("Negative: Create barrel without QR/NFC/RFID → 400", async () => {
    const payload = { id: uuidv4(), barrel: "Missing Codes Barrel" };
    const res = await safeRequest({ method: "post", url: `${API_URL}/barrels`, data: payload });
    logRequestResponse("Negative Create Barrel", payload, res);

    expect(res.status).toBe(400);
  });

  it("Delete barrel (DELETE /barrels/{id})", async () => {
    const url = `${API_URL}/barrels/${createdBarrel.id}`;
    const res = await safeRequest({ method: "delete", url });
    logRequestResponse("Delete Barrel", { url }, res);

    expect([200, 204]).toContain(res.status);
  });
});

describe("Measurements API", () => {
  beforeAll(async () => {
    const payload = {
      id: uuidv4(),
      barrel: "Measurement Barrel " + Date.now(),
      qr: "QR-" + Date.now(),
      rfid: "RFID-" + Date.now(),
      nfc: "NFC-" + Date.now()
    };
    const res = await safeRequest({
      method: "post",
      url: `${API_URL}/barrels`,
      data: payload,
      headers: { Accept: "application/json" }
    });
    createdBarrel = res.data;
  });

  afterAll(async () => {
    if (createdBarrel) {
      await safeRequest({ method: "delete", url: `${API_URL}/barrels/${createdBarrel.id}` });
    }
  });

  it("Add measurement to barrel (POST /measurements)", async () => {
    const payload = {
      id: uuidv4(),
      barrel: "Test Barrel " + Date.now(), // nebo createdBarrel.id podle Swaggeru
      impurityLevel: 0.02,
      measuredAt: new Date().toISOString()
    };

    const res = await safeRequest({
      method: "post",
      url: `${API_URL}/measurements`,
      data: payload,
      headers: { Accept: "application/json" }
    });

    logRequestResponse("Create Measurement", payload, res);

    expect(res.status).toBe(201);
    expect(res.data).toHaveProperty("id");
  });

  it("Get all measurements (GET /measurements)", async () => {
    const res = await safeRequest({ method: "get", url: `${API_URL}/measurements` });
    logRequestResponse("Get All Measurements", null, res);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });

  it("Negative: Create measurement without barrel → 400", async () => {
    const payload = { id: uuidv4(), impurityLevel: 0.05, measuredAt: new Date().toISOString() };
    const res = await safeRequest({ method: "post", url: `${API_URL}/measurements`, data: payload });

    logRequestResponse("Negative Create Measurement", payload, res);
    expect(res.status).toBe(400);
  });
});
