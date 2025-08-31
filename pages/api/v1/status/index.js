import database from "/infra/database.js";

async function status(request, response) {
  const updateAt = new Date().toISOString(); // Current timestamp in ISO 8601 format

  const dbVersionResult = await database.query("SHOW server_version;"); // Example result: { rows: [ { server_version: '16.0' } ], ... }
  const dbVersionValue = dbVersionResult.rows[0].server_version; // "16.0"

  const dbMaxConnectionsResult = await database.query("SHOW max_connections;"); // Example result: { rows: [ { max_connections: '100' } ], ... }
  const dbMaxConnectionsValue = dbMaxConnectionsResult.rows[0].max_connections; // "100"

  const dbName = process.env.POSTGRES_DB;
  const dbOpenedConnectionsResult = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1",
    values: [dbName],
  });
  const dbOpenedConnectionsValue = dbOpenedConnectionsResult.rows[0].count; // 1

  // Log values for debugging
  console.log("updateAt:", updateAt);
  console.log("dbVersionValue:", dbVersionValue);
  console.log("dbMaxConnectionsValue:", dbMaxConnectionsValue);
  console.log("dbOpenedConnectionsValue:", dbOpenedConnectionsValue);

  response.status(200).json({
    update_at: updateAt,
    dependencies: {
      database: {
        version: dbVersionValue,
        max_connections: parseInt(dbMaxConnectionsValue),
        opened_connections: dbOpenedConnectionsValue,
      },
    },
  });
}
export default status;
