import { CloudWatch, EC2 } from "aws-sdk";
import AWS from "aws-sdk";
import { CpuData, CpuInstance } from "../../models/aws-models";
import { Datapoint, Datapoints } from "aws-sdk/clients/cloudwatch";

const _getInstanceData = async () => {
  try {
    const ec2 = new EC2();
    const data = await new Promise<EC2.DescribeInstancesResult>(
      (resolve, reject) => {
        ec2.describeInstances({}, (err, data) => {
          if (err) {
            reject("Error retrieving instance information: " + err.message);
          } else {
            resolve(data);
          }
        });
      },
    );

    return data;
  } catch (error) {
    throw error;
  }
};

export const getAwsInstanceInfo = async (
  ipAddress?: string,
): Promise<CpuInstance> => {
  try {
    const instanceData = await _getInstanceData();

    const instances = instanceData.Reservations?.map(
      (reservation) => reservation.Instances,
    ).flat();

    if (!instances?.length) {
      throw "No instances found";
    }
    const selectedInstance = instances.find(
      (instance) => instance?.PrivateIpAddress === ipAddress,
    );
    if (!selectedInstance) {
      throw "No instance with the current IP address";
    }
    const cpuOptions = selectedInstance.CpuOptions;
    if (cpuOptions) {
      return {
        instanceId: selectedInstance.InstanceId,
        coreCount: cpuOptions.CoreCount,
        threadsPerCore: cpuOptions.ThreadsPerCore,
      };
    } else {
      throw new Error(
        `Instance ID: ${selectedInstance.InstanceId} has no CPU information.`,
      );
    }
  } catch (err) {
    throw err;
  }
};

export const getInstancesCpuInfo = async (
  instance: CpuInstance, // Single instance instead of array
  startTime: Date,
  endTime: Date,
  period: number,
): Promise<CpuData[]> => {
  try {
    const cloudwatch = new AWS.CloudWatch();
    const { instanceId } = instance;

    if (!instanceId) {
      throw new Error("InstanceId not found");
    }

    const params = {
      Namespace: "AWS/EC2",
      MetricName: "CPUUtilization",
      Dimensions: [
        {
          Name: "InstanceId",
          Value: instanceId,
        },
      ],
      StartTime: startTime,
      EndTime: endTime,
      Period: period,
      Statistics: ["Average"],
    };

    return new Promise<CpuData[]>((resolve, reject) => {
      cloudwatch.getMetricStatistics(params, (err, data) => {
        if (err) {
          reject(`Error fetching CPU data: ${err}`);
        } else {
          if (data?.Datapoints) {
            const filteredDatapoints = data.Datapoints.filter(
              (point: Datapoint) => point?.Timestamp,
            );
            const sortedDatapoints = filteredDatapoints.sort(
              (a: Datapoint, b: Datapoint) =>
                new Date(a?.Timestamp || "").getTime() -
                new Date(b?.Timestamp || "").getTime(),
            );

            const cpuData = sortedDatapoints.map((point) => ({
              timestamp: point.Timestamp,
              cpuUsage: point.Average,
            }));
            resolve(cpuData);
          } else {
            reject("Data points not found");
          }
        }
      });
    });
  } catch (error) {
    throw error;
  }
};

export const validateDataPointsAmount = (
  startTime: Date,
  endTime: Date,
  period: number,
) => {
  const secondsBetweenDates = Math.abs(
    (endTime.getTime() - startTime.getTime()) / 1000,
  );

  return secondsBetweenDates / period <= 1440;
};
