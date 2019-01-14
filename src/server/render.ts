import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { load } from 'cheerio';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { resolve } from 'path';
import { stringify } from 'querystring';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const script = (state: NormalizedCacheObject) =>
  `window.__APOLLO_STATE__ = ${JSON.stringify(state)};`;

const indexUrl = resolve(__dirname, '../../dist/public/index.html');
const production = process.env.NODE_ENV === 'production';

let template: string;
if (production) {
  // load index.html initially in production
  template = fs.readFileSync(indexUrl, 'utf-8');
}

type Params = {
  html: string;
  title?: string;
  state: NormalizedCacheObject;
};

export async function render({ html, title, state }: Params) {
  if (!template && !production) {
    // load index.html on first request only in development
    // has to wait for parcel to build it as the server boots up
    template = await readFile(indexUrl, 'utf-8');
  }

  const $template = load(template);
  if (title) {
    $template('title').text(title);
  }
  $template('#root').html(html);
  $template('#state').html(script(state));

  return $template.html();
}

const toLogin = (req: Request, res: Response) => {
  res.redirect(`/login?${stringify({ return: req.url })}`);
};
