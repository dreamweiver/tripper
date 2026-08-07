import { jest } from "@jest/globals";
import request from "supertest";
import { createApp } from "../app.js";

const sample = {
  elements: [{ type: "node", lat: 48.8635, lon: 2.3275, tags: { name: "Tuileries Garden", leisure: "park" } }],
};

afterEach(() => jest.restoreAllMocks());

test("GET /api/nearby returns NearbyResult list", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => sample }) as unknown as typeof fetch;
  const res = await request(createApp()).get("/api/nearby").query({ lat: "48.8606", lon: "2.3376" });
  expect(res.status).toBe(200);
  expect(res.body[0]).toMatchObject({ title: "Tuileries Garden", category: "leisure" });
  expect(typeof res.body[0].distance).toBe("number");
});

test("returns 400 when lat or lon is missing or non-numeric", async () => {
  expect((await request(createApp()).get("/api/nearby").query({ lat: "48.8" })).status).toBe(400);
  expect((await request(createApp()).get("/api/nearby").query({ lat: "x", lon: "y" })).status).toBe(400);
});

test("returns 503 when the upstream fails", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 504 }) as unknown as typeof fetch;
  const res = await request(createApp()).get("/api/nearby").query({ lat: "1", lon: "2" });
  expect(res.status).toBe(503);
});
