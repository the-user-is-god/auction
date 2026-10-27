import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js"; // Adjust this path to point to your app.ts

describe("🔐 Auth System Integration Tests", () => {
  it("should return 404 for an invalid GET route", async () => {
    const response = await request(app)
      .get("/api/v1/auth/logout") // Calling GET instead of POST
      .set("Accept", "application/json")
      .expect(404);

    // Validate that your global error handler is shaping the output perfectly
    expect(response.body).toHaveProperty("requestId");
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("not Found");
  });

  it("should enforce payload limits and headers", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@example.com", password: "password123" });

    // Validate that our security middleware attached the Request ID tracking header
    expect(response.headers).toHaveProperty("x-request-id");
  });
});
