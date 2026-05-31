/* eslint-env node */
import app from "./app.js";
import { ensureDatabaseExists, testConnection } from "./config/db.js";
import { env } from "./config/env.js";
import { ensureDefaultUsers } from "./services/bootstrapService.js";

async function startServer() {
  try {
    await ensureDatabaseExists();
    await testConnection();
    await ensureDefaultUsers();

    app.listen(env.port, () => {
      console.log(`Backend API running on port ${env.port}`);
      if (env.seedUsers.enabled) {
        console.log(
          `Default super admin: ${env.seedUsers.superAdmin.email} / ${env.seedUsers.superAdmin.password}`
        );
        console.log(`Default admin: ${env.seedUsers.admin.email} / ${env.seedUsers.admin.password}`);
        console.log(
          `Development team: ${env.seedUsers.developmentTeam.email} / ${env.seedUsers.developmentTeam.password}`
        );
        console.log(`Default operator: ${env.seedUsers.operator.email} / ${env.seedUsers.operator.password}`);
        console.log(`Sales team: ${env.seedUsers.sales.email} / ${env.seedUsers.sales.password}`);
      }
    });
  } catch (error) {
    console.error("Failed to start backend:", error);
    console.error(
      "Verify MySQL is running and backend/.env has correct MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE."
    );
    process.exit(1);
  }
}

startServer();
