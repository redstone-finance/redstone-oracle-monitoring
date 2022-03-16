var AWS = require('aws-sdk');
const { SES } = require("../config");

const { dirPath } = require("../config");
AWS.config.loadFromPath(dirPath);


const DEV_EMAIL = SES.devEmail;
const SENDER_EMAIL = SES.senderEmail;

async function notify(subject, message) {
  return await sendEmail({
    subject: subject,
    text: message,
    html: `<pre style='font-size: 12px;'>${message}</pre>`,
  });
};


async function sendEmail({ subject, text, html }) {
  var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' });

  const params = {
    Destination: {
      ToAddresses: [
        DEV_EMAIL,
      ]
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: html
        },
        Text: {
          Charset: "UTF-8",
          Data: text
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: SENDER_EMAIL
  };

  return await sendPromise.sendEmail(params).promise();
}

module.exports = { notify };
