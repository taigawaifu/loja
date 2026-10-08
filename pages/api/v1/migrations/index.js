import migrationRunner from 'node-pg-migrate'
import {join} from "node:path"
import database from '../../../../infra/database'

export default async function migrations(request, response) {
    const dbCliente =await database.getNewClient()
    const defaultmigrations ={
    dbClient:dbCliente,
    dryRun:true,
    dir:join("infra","migrations"),
    direction:"up",
    verbose:true,
    migrationsTable:"pgmigrations",
    }
  if(request.method === "GET"){
    const  pendingmigrations = await migrationRunner(defaultmigrations)
    await dbCliente.end()
    return response.status(200).json(pendingmigrations)
    console.log("sbi")
  }
  if(request.method === "POST"){
    const migratedMigrations = await migrationRunner({
      ...defaultmigrations,
      dryRun:false
    })
    await dbCliente.end()
    if(migratedMigrations.length > 0){
      return response.status(201).json(migratedMigrations)
    }
    await dbCliente.end()
  }
  const migration = await migrationRunner()
  return response.status(200).json(migration)
}

