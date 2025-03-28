import request from "supertest";
import app from "../app"; // Ensure this is the main Express app file
import mockQuery from "./__mocks__/db"; // Import mock DB

describe("Admin Routes", () => {
  let token: string;

  beforeAll(async () => {
    const res = await request(app).post("/api/admin/login").send({
      email: "admin@example.com",
      password: "admin123",
    });
    token = res.body.token;
  });

  test("GET /api/admin/schemes should return all schemes", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: "1", name: "Gold Plan" }] });

    const res = await request(app)
      .get("/api/admin/schemes")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: "1", name: "Gold Plan" }]);
  });

  test("POST /api/admin/scheme should create a new scheme", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: "2" }] });

    const res = await request(app)
      .post("/api/admin/scheme")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Silver Plan",
        duration: 12,
        goldGrams: 15,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
  });
});
