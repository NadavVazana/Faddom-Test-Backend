import { cpuQuerySchema } from "../../models/aws-models";
import {
  getAwsInstanceInfo,
  getInstancesCpuInfo,
  validateDataPointsAmount,
} from "./aws-service";
import { Request, Response } from "express";

export const getCpuUsage = async (req: Request, res: Response) => {
  try {
    const { error, value } = cpuQuerySchema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { startTime, endTime, period, ipAddress } = value;
    const awsInstanceInfo = await getAwsInstanceInfo(ipAddress);

    if (!validateDataPointsAmount(startTime, endTime, period)) {
      throw "Period is too smalll for the given range";
    }

    const instanceCpuInfo = await getInstancesCpuInfo(
      awsInstanceInfo,
      startTime,
      endTime,
      period,
    );

    res.send(instanceCpuInfo);
  } catch (error) {
    res.status(400).send(error);
  }
};
