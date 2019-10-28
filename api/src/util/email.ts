import * as client from '@sendgrid/client';
import { MailData } from '@sendgrid/helpers/classes/mail';
import * as mail from '@sendgrid/mail';
import { logger } from '.';
import { CONFIG } from '../config';

client.setApiKey(process.env.SENDGRID_API_KEY!);
client.setDefaultHeader('Accept', '*/*');
mail.setApiKey(process.env.SENDGRID_API_KEY!);

export const createBatchId = async (): Promise<string> => {
  const [res, body] = await client.request({
    method: 'POST',
    url: '/v3/mail/batch',
  });
  const id: string = body.batch_id;
  return id;
};

type SendParameters = {
  email: string;
  subject: string;
  html: string;
  sendInSeconds?: number;
  batchId?: string;
};
export const send = async ({
  email,
  subject,
  html,
  sendInSeconds,
  batchId,
}: SendParameters) => {
  const msg: MailData = {
    from: { name: CONFIG.name, email: CONFIG.email },
    to: email,
    html,
    subject,
    sendAt: sendInSeconds, // undefined send email immediatelly
    batchId, // this will allow us to cancel this email
  };

  await mail.send(msg); // send or schedule email

  logger.info({ email }, 'sent email');
};

export const cancel = async id => {
  try {
    await client.request({
      method: 'POST',
      url: '/v3/user/scheduled_sends',
      body: { batch_id: id, status: 'cancel' },
    });
  } catch (e) {
    const body = e.response && e.response.body;
    const errors: any[] | undefined =
      body && Array.isArray(body.errors) && body.errors;
    // comparing to a string message is very fragile
    const emailAlreadySent =
      errors && errors.some(err => err.message === 'max limit reached');

    // the error throw is not that the email was already sent
    if (!emailAlreadySent) {
      throw e;
    }
  }
};
