import request from "supertest";
import app from "../app"; // Ensure this is the main Express app file

describe("User Routes", () => {
  let token: string;

  beforeAll(async () => {
    const res = await request(app).post("/api/user/login").send({
      email: "user@example.com",
      password: "user123",
    });
    token = res.body.token;
  });

  test("GET /api/user/profile should return user details", async () => {
    const res = await request(app)
      .get("/api/user/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("email");
  });

  test("POST /api/user/enroll should enroll user in a scheme", async () => {
    const res = await request(app)
      .post("/api/user/enroll")
      .set("Authorization", `Bearer ${token}`)
      .send({
        schemeId: "12345",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("success", true);
  });
});
