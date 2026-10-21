import orchestrator from "../orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

test("POST to /api/v1/users should return 201", async () => {
  const response = await fetch("http://localhost:3000/api/v1/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "Paulo",password:"1235" }),
  });

  console.log("status:", response.status);
  const responseBody = await response.json();
  console.log("body:", responseBody);

  expect(response.status).toBe(201);
  expect(responseBody.username).toBe("Paulo");
  expect(responseBody.id).toBeDefined();
  expect(responseBody.password).toBeUndefined();
});