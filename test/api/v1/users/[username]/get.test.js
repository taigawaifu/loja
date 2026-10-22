import orchestrator from "../../orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("com username existente", async () => {
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Paulo",
          email: "paulo@exemplo.com",
          password: "senha123",
        }),
      });

      const response = await fetch("http://localhost:3000/api/v1/users/Paulo");
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody.username).toBe("Paulo");
      expect(responseBody.email).toBe("paulo@exemplo.com");
      expect(responseBody.id).toBeDefined();
      expect(responseBody.password).toBeUndefined();
    });

    test("com username escrito diferente (maiúsculas)", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users/PAULO");
      expect(response.status).toBe(200);
    });

    test("com username que não existe", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users/NaoExiste");
      expect(response.status).toBe(404);

      const responseBody = await response.json();
      expect(responseBody.name).toBe("NotFoundError");
    });
  });
});