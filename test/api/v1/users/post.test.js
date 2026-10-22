import orchestrator from "../orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

async function createUser(body) {
  return fetch("http://localhost:3000/api/v1/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("com dados válidos, cria o usuário", async () => {
  const response = await createUser({
    username: "Paulo",
    email: "paulo@exemplo.com",
    password: "senha123",
  });

  expect(response.status).toBe(201);

  const responseBody = await response.json();
  expect(responseBody.username).toBe("Paulo");
  expect(responseBody.email).toBe("paulo@exemplo.com");
  expect(responseBody.password).toBeUndefined();
});

test("com e-mail inválido, retorna 400", async () => {
  const response = await createUser({
    username: "Outro",
    email: "email-sem-arroba",
    password: "senha123",
  });

  expect(response.status).toBe(400);

  const responseBody = await response.json();
  expect(responseBody.name).toBe("ValidationError");
});

test("com e-mail repetido, retorna 400", async () => {
  const response = await createUser({
    username: "Paulo2",
    email: "PAULO@exemplo.com",
    password: "senha123",
  });

  expect(response.status).toBe(400);

  const responseBody = await response.json();
  expect(responseBody.message).toBe("O e-mail informado já está sendo utilizado.");
});