import Joi from "joi";

export interface CpuInstance {
  instanceId?: string;
  coreCount?: number;
  threadsPerCore?: number;
}

export interface CpuData {
  timestamp?: Date;
  average?: number;
}

export const cpuQuerySchema = Joi.object({
  startTime: Joi.date().iso().required().label("Start Time"),
  endTime: Joi.date().iso().required().label("End Time"),
  ipAddress: Joi.string().required().label("Ip Address"),
  period: Joi.number().integer().min(1).optional().label("Period"),
});
