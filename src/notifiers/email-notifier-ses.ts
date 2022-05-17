import AWS from "aws-sdk";
// import { SES } from "../config";

// TODO: fix this module

// import { dirPath } from "../config";
// AWS.config.loadFromPath(dirPath);

// const DEV_EMAIL = SES.devEmail;
// const SENDER_EMAIL = SES.senderEmail;
const DEV_EMAIL = "SES.devEmail";
const SENDER_EMAIL = "SES.senderEmail";

export const notify = async (subject: string, message: string) => {
  return await sendEmail({
    subject: subject,
    text: message,
    html: `<pre style="font-size: 12px;">${message}</pre>`,
  });
};

interface SendEmailInput {
  subject: string;
  text: string;
  html: string;
}

export const sendEmail = async ({ subject, text, html }: SendEmailInput) => {
  var sendPromise = new AWS.SES({ apiVersion: "2010-12-01" });

  const params = {
    Destination: {
      ToAddresses: [DEV_EMAIL],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: html,
        },
        Text: {
          Charset: "UTF-8",
          Data: text,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: SENDER_EMAIL,
  };

  return await sendPromise.sendEmail(params).promise();
};
