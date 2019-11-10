import { logger } from '.';
import { CONFIG } from '../config';

type SendParameters = {
  email: string;
  subject: string;
  html: string;
};
export const send = async ({ email, subject, html }: SendParameters) => {
  const headers = new Headers();
  headers.set(
    'Authorization',
    'Basic ' +
      Buffer.from('api:' + process.env.MAILGUN_API_KEY).toString('base64'),
  );
  headers.set('Content-Type', 'application/x-www-form-urlencoded');

  const body = new URLSearchParams();
  body.set('from', `${CONFIG.name} <${CONFIG.email}>`);
  body.set('to', email);
  body.set('subject', subject);
  body.set('html', html);

  const url = `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`;
  await fetch(url, {
    method: 'POST',
    headers,
    body: body.toString(),
  });

  logger.info({ email }, 'sent email');
};
