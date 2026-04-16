import request from "supertest";
import app from "../index.js";

describe("URL Shortener API", () => {
  it("should return OK on /health", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("OK");
  });

  it("should shorten a URL", async () => {
    const res = await request(app)
      .post("/shorten")
      .send({ url: "https://google.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body.shortUrl).toBeDefined();
    expect(res.body.id).toBeDefined();
  });

  it("should redirect to original URL", async () => {
    const shorten = await request(app)
      .post("/shorten")
      .send({ url: "https://google.com" });

    const id = shorten.body.id;

    const res = await request(app).get(`/${id}`);

    expect(res.statusCode).toBe(302);
  });
});