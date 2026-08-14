import { jest } from "@jest/globals";
import request from "supertest";
import { createApp } from "../app.js";

const sample = [
  {
    display_name: "Louvre Museum, Rue de Rivoli, Paris",
    name: "Louvre Museum",
    lat: "48.8606",
    lon: "2.3376",
    category: "tourism",
    type: "museum",
  },
];

afterEach(() => jest.restoreAllMocks());

test("GET /api/search returns trimmed results", async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValue({ ok: true, json: async () => sample }) as unknown as typeof fetch;
  const res = await request(createApp()).get("/api/search").query({ q: "louvre" });
  expect(res.status).toBe(200);
  expect(res.body).toEqual([
    {
      title: "Louvre Museum, Rue de Rivoli, Paris",
      name: "Louvre Museum",
      address: "Rue de Rivoli, Paris",
      lat: 48.8606,
      lon: 2.3376,
      category: "tourism",
      type: "museum",
    },
  ]);
});

test("caches by query so a repeat call hits fetch only once", async () => {
  const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => sample });
  global.fetch = fetchMock as unknown as typeof fetch;
  const app = createApp();
  await request(app).get("/api/search").query({ q: "louvre-cache" });
  await request(app).get("/api/search").query({ q: "louvre-cache" });
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test("returns 400 when q is missing", async () => {
  const res = await request(createApp()).get("/api/search");
  expect(res.status).toBe(400);
});

test("returns 503 when the upstream fails", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;
  const res = await request(createApp()).get("/api/search").query({ q: "boom" });
  expect(res.status).toBe(503);
  expect(res.body).toHaveProperty("error");
});
