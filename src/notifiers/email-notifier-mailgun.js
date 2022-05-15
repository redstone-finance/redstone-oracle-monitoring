const mailgun = require("mailgun-js");

const config = require("../config");

async function notify(subject, message) {
  return await sendEmail({
    subject: subject,
    text: message,
    html: `<pre style='font-size: 8px;'>${message}</pre>`,
  });
}

async function sendEmail({ subject, text, html }) {
  const mg = mailgun({
    apiKey: config.mailgun.apiKey,
    domain: config.mailgun.domain,
  });

  const msg = {
    to: config.emailNotificationsRecipients,
    from: config.mailgun.senderEmail,
    subject: subject,
    text,
    html,
  };

  return await mg.messages().send(msg);
}

module.exports = { notify };
