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