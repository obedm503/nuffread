import fetch, { Headers } from 'node-fetch';
import { logger } from './util';
import { CONFIG } from './config';

type SendParameters = {
  email: string;
  subject: string;
  html: string;
};
export async function send(params: SendParameters): Promise<void> {
  // await mailgun(params);
  await sendgrid(params);

  logger.info({ email: params.email }, 'sent email');
}

async function sendgrid({
  email,
  subject,
  html,
}: SendParameters): Promise<void> {
  const headers = new Headers();
  headers.set('Authorization', `Bearer ${process.env.SENDGRID_API_KEY}`);
  headers.set('Content-Type', 'application/json');

  const url = 'https://api.sendgrid.com/v3/mail/send';
  // sendgrid sends back an empty response
  await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      content: [{ type: 'text/html', value: html }],
      from: { email: CONFIG.email, name: CONFIG.name },
      personalizations: [{ to: [{ email }], subject }],
    }),
  });
}

// async function mailgun({
//   email,
//   subject,
//   html,
// }: SendParameters): Promise<void> {
//   const headers = new Headers();
//   headers.set(
//     'Authorization',
//     'Basic ' +
//       Buffer.from('api:' + process.env.MAILGUN_API_KEY).toString('base64'),
//   );
//   headers.set('Content-Type', 'application/x-www-form-urlencoded');

//   const body = new URLSearchParams();
//   body.set('from', `${CONFIG.name} <${CONFIG.email}>`);
//   body.set('to', email);
//   body.set('subject', subject);
//   body.set('html', html);

//   const url = `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`;
//   const res = await fetch(url, {
//     method: 'POST',
//     headers,
//     body: body.toString(),
//   });
//   const data = await res.json();
//   logger.info({ res: data }, 'mailgun responded with');
// }
