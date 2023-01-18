import AWS from 'aws-sdk';
import { IDBUser, IStatistics, IStatisticsArr } from "../types/project-types";

// const credentials = new AWS.SharedIniFileCredentials({profile: 'work-account'});
// AWS.config.credentials = credentials;
AWS.config.update({ region: "eu-central-1" });
const queueAWSUrl = "https://sqs.eu-central-1.amazonaws.com/090794209652/StatisticsQueue";

const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

const sendDataToAWSQueue = (user: IDBUser, messageBody: string): void => {
  const answers: IStatisticsArr = JSON.parse(messageBody);
  const messageObj: IStatistics = {user, answers};
  const message: string = JSON.stringify(messageObj);

  const params = {
    DelaySeconds: 10,
    MessageBody: message,
    QueueUrl: queueAWSUrl
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
