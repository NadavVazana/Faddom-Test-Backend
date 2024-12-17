import { Express } from "express";
import { awsRoutes } from "../api/aws/aws-routes";

export const configAppRoutes = (app: Express) => {
  app.use("/api/aws", awsRoutes);
};
