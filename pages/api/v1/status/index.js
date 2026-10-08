import database from "../../../../infra/database"

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const versionResult = await database.query("SHOW server_version_num;");
  const databaseVersion = versionResult.rows[0].server_version_num;

  const maxConnectionsResult = await database.query("SHOW max_connections;");
  const maxConnections = parseInt(maxConnectionsResult.rows[0].max_connections);

  const openConnectionsResult = await database.query({
    text: "SELECT count(*)::int AS count FROM pg_stat_activity WHERE datname = $1;",
    values: [process.env.POSTGRES_DB],
  });
  const openConnections = openConnectionsResult.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    databaseVersion,
    Maxconnections: maxConnections,
    openConnections,
  });
  
}


export default status;