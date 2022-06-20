import mailgun from "mailgun-js";
import { mailgunConfig, emailNotificationsRecipients } from "src/config";

export const notify = async (subject: string, message: string) => {
  return await sendEmail({
    subject: subject,
    text: message,
    html: `<pre style='font-size: 8px;'>${message}</pre>`,
  });
};

interface SendEmailInput {
  subject: string;
  text: string;
  html: string;
}

const sendEmail = async ({ subject, text, html }: SendEmailInput) => {
  const mg = mailgun({
    apiKey: mailgunConfig.apiKey,
    domain: mailgunConfig.domain,
  });

  const msg = {
    to: emailNotificationsRecipients,
    from: mailgunConfig.senderEmail,
    subject: subject,
    text,
    html,
  };

  return await mg.messages().send(msg);
};
