import orchestrator from "../orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.createUser({
    username: "Paulo",
    email: "paulo@exemplo.com",
    password: "senha-correta",
  });
});

async function login(body) {
  return fetch("http://localhost:3000/api/v1/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("com e-mail errado e senha certa", async () => {
      const response = await login({
        email: "email.errado@exemplo.com",
        password: "senha-correta",
      });

      expect(response.status).toBe(401);
      const responseBody = await response.json();
      expect(responseBody.message).toBe("Dados de autenticação não conferem.");
    });

    test("com e-mail certo e senha errada", async () => {
      const response = await login({
        email: "paulo@exemplo.com",
        password: "senha-errada",
      });

      expect(response.status).toBe(401);
      const responseBody = await response.json();
      expect(responseBody.message).toBe("Dados de autenticação não conferem.");
    });

    test("com e-mail e senha corretos", async () => {
      const response = await login({
        email: "paulo@exemplo.com",
        password: "senha-correta",
      });

      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody.username).toBe("Paulo");
      expect(responseBody.password).toBeUndefined();
    });
  });
});