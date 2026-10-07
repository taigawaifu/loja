import migrationRunner from 'node-pg-migrate'
import {join} from "node:path"

export default async function migrations(request, response) {
  if(request.method === "GET"){
    console.log("sbir")
  }
  if(request.method === "POST"){
    console.log("Cuidado com SanderleiBoloDepote")
  }
  const migration =await migrationRunner({
    databaseUrl:process.env.DATABASE_URL,
    dryRun:true,
    dir:join("infra","migrations"),
    direction:"up",
    verbose:true,
    migrationsTable:"pgmigrations"
  })
  return response.status(200).json(migration)
}

