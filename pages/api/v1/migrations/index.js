import { runner as migrationRunner } from "node-pg-migrate";
import { join } from "node:path";
import { createRouter } from "next-connect";
import database from "../../../../infra/database";
import controller from "../../../../infra/controller";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler({
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function runMigrations({ dryRun }) {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    return await migrationRunner({
      dbClient,
      dryRun,
      dir: join("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    });
  } finally {
    await dbClient?.end();
  }
}

async function getHandler(request, response) {
  const pendingMigrations = await runMigrations({ dryRun: true });
  return response.status(200).json(pendingMigrations);
}

async function postHandler(request, response) {
  const migratedMigrations = await runMigrations({ dryRun: false });

  if (migratedMigrations.length > 0) {
    return response.status(201).json(migratedMigrations);
  }

  return response.status(200).json(migratedMigrations);
}

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(error, request, response) {
  const publicErrorObject = new InternalServerError({ cause: error });
  console.error(publicErrorObject);
  response.status(500).json(publicErrorObject);
}
