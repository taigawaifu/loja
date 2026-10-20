import orchestrator from "../orchestrator";

beforeAll(async()=>{
  await orchestrator.awaitForAllServices()
})

test("POST to /api/v1/status", async () => {
    const response = await fetch("http://localhost:3000/api/v1/status",{
      method:"POST"
    });
    
    const responseBody = await response.json();
    expect(responseBody).toEqual({
      name: "MethodNotAllowedError",
      message: "Método não permitido para este endpoint.",
      action: "Verifique se o método HTTP enviado é válido para este endpoint.",
      status_code: 405
    })

    

});