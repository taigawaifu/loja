import retry  from "async-retry"

async function awaitForAllServices() {
await waitForWebServer()  
}
  async function waitForWebServer() {
    return retry(fechstatuspage)

    async function fechstatuspage(){
      const response = await fetch("http://localhost:3000/api/v1/status")
      response.json(200)
    }
    
  }
export default {
    awaitForAllServices
}