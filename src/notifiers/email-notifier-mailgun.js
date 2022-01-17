const mailgun = require("mailgun-js");

const mailInfo = require("../../.secrets/mail.json");

const DEV_EMAIL = mailInfo.devEmail;
const SENDER_EMAIL = mailInfo.senderEmail; // It is verified in sendgrid 

async function notify(subject, message) {
  return await sendEmail({
    subject: subject,
    text: message,
    html: `<pre style='font-size: 8px;'>${message}</pre>`,
  });
};

async function sendEmail({ subject, text, html }) {
  const DOMAIN = mailInfo.domain;
  const mg = mailgun({ apiKey: mailInfo.apiKey, domain: DOMAIN });

  const msg = {
    to: DEV_EMAIL,
    from: SENDER_EMAIL,
    subject: subject,
    text,
    html,
  };

  return await mg.messages().send(msg);
}

module.exports = { notify };
