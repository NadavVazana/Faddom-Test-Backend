import express from "express";
import dotenv from "dotenv";
import { awsConfig } from "./src/config/aws-config";
import { corsConfig } from "./src/config/cors-config";
import { configAppRoutes } from "./src/config/app-routes";
require("aws-sdk/lib/maintenance_mode_message").suppress = true;

dotenv.config();

const app = express();

function startServer() {
  // Cors config
  corsConfig(app);

  // AWS api route
  configAppRoutes(app);

  // AWS credentials config.
  awsConfig();

  // PORT config
  const port = process.env.PORT || 3030;
  app.listen(port, () => {
    console.log(`Server listening on port http://127.0.0.1:${port}/`);
  });
}
startServer();
