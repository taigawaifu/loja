import database from "../../../../infra/database";

async function status(request, response) {
  const updateAt = new Date().toISOString();

  const databaseVersion = await database.query("SHOW server_version_num;");
  const databaseShowVersion = databaseVersion.rows[0].server_version_num;

  const databaseMaxConnecitions = await database.query("SHOW max_connections");
  const databaseMaxConnecitionsValue =
    databaseMaxConnecitions.rows[0].max_connections;

  const databaseConnectionOn = await database.query(
    "SELECT count(*)::int AS count FROM pg_stat_activity WHERE datname = current_database();",
  );
  const openConnections = databaseConnectionOn.rows[0].count;

  response.status(200).json({
    updated_at: updateAt,
    databaseVersion: databaseShowVersion,
    Maxconnections: parseInt(databaseMaxConnecitionsValue),
    openConnections: openConnections,
  });
}

export default status;