test("GET to /api/v1/status should return 200", async () => {
    const response = await fetch("http://localhost:3000/api/v1/status");

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody.updated_at).toBeDefined();

    const ParseUpdate = new Date(responseBody.updated_at).toISOString();

    expect(responseBody.updated_at).toEqual(ParseUpdate);
    expect(responseBody.databaseVersion).toEqual("160015");
    expect(responseBody.Maxconnections).toEqual(100)
    expect(responseBody.openConnections).toBeGreaterThan(0);
    expect(responseBody.openConnections).toBeLessThan(10);
    

});