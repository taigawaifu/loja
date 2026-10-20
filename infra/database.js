import { Client } from "pg";
import { ServicesError } from "./errors.js";

async function query(queryObject) {
  let client;
  try {
    client = await getNewClient();
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    const servicesError = new ServicesError({
      message:"erro na conexão",
      cause:error
    })
    throw servicesError;
  } finally {
    await client?.end();
  }
}

async function getNewClient() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production",
  });

  await client.connect();
  return client;
}

export default {
  query,
  getNewClient,
};