import express from "express";
import { getCpuUsage } from "./aws-controller";

const router = express.Router();

router.get("/cpu-usage", getCpuUsage);

export const awsRoutes = router;
