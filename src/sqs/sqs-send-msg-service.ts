import AWS from 'aws-sdk';
import { IDBUser, IStatistics, IStatisticsArr } from "../types/project-types";

const { AWS_REGION, STATISTICS_QUEUE_URL, API_VERSION } = process.env;

// const credentials = new AWS.SharedIniFileCredentials({profile: 'work-account'});
// AWS.config.credentials = credentials;
AWS.config.update({ region: AWS_REGION });

if (!STATISTICS_QUEUE_URL) {
  throw new Error("No SQS QUEUE_URL");
};

const sqs = new AWS.SQS({ apiVersion: API_VERSION });

const sendDataToAWSQueue = (user: IDBUser, messageBody: string): void => {
  const answers: IStatisticsArr = JSON.parse(messageBody);
  const messageObj: IStatistics = {user, answers};
  const message: string = JSON.stringify(messageObj);

  const params = {
    DelaySeconds: 10,
    MessageBody: message,
    QueueUrl: STATISTICS_QUEUE_URL
  };
  
  sqs.sendMessage(params, (err, data) => {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data.MessageId);
    }
  });
};

export { sendDataToAWSQueue };
