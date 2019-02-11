import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { load } from 'cheerio';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { resolve } from 'path';
import { stringify } from 'querystring';
import { FilledContext } from 'react-helmet-async';
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

function setAttrs($el: Cheerio, attrString: string) {
  if (!attrString) {
    return;
  }

  const attrs = attrString.split(' ').map(s => {
    const [name, value] = s.split('=');
    // remove "" surrounding quotes
    return [name, value.substring(1, value.length - 1)];
  });
  attrs.forEach(([name, value]) => {
    $el.attr(name, value);
  });
}

type Params = {
  html: string;
  state: NormalizedCacheObject;
  helmetContext: FilledContext;
};

export async function render({
  html,
  state,
  helmetContext: { helmet },
}: Params) {
  if (!template && !production) {
    // load index.html on first request only in development
    // has to wait for parcel to build it as the server boots up
    template = await readFile(indexUrl, 'utf-8');
  }

  const $template = load(template);

  $template('head').append(
    `${helmet.title.toString()} ${helmet.meta.toString()}`,
  );

  setAttrs($template('html'), helmet.htmlAttributes.toString());
  setAttrs($template('body'), helmet.bodyAttributes.toString());

  $template('#root').html(html);
  $template('#state').html(script(state));

  return $template.html();
}

const toLogin = (req: Request, res: Response) => {
  res.redirect(`/login?${stringify({ return: req.url })}`);
};
