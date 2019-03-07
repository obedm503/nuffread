import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import ApolloClient, { ApolloError } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { load } from 'cheerio';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { resolve } from 'path';
import * as React from 'react';
import { ApolloProvider, renderToStringWithData } from 'react-apollo';
import { FilledContext, HelmetProvider } from 'react-helmet-async';
import { StaticRouter } from 'react-router';
import { promisify } from 'util';
import { App, createCache } from '../app/app';
import { HostProvider } from '../app/state/host';
import { UAProvider } from '../app/state/ua';
import { getUrl } from './util';

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

async function renderHtml({ html, state, helmetContext: { helmet } }: Params) {
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

export async function render(req: Request, res: Response) {
  try {
    const link = createHttpLink({
      uri: process.env.API,
      credentials: 'include',
    });

    const client = new ApolloClient({
      ssrMode: true,
      link,
      cache: createCache(),
    });

    const routerContext = {};
    const helmetContext: any = {};

    const main = (
      <UAProvider value={req.header('user-agent') || ''}>
        <HostProvider value={getUrl(req)}>
          <HelmetProvider context={helmetContext}>
            <ApolloProvider client={client}>
              <StaticRouter location={req.url} context={routerContext}>
                <App />
              </StaticRouter>
            </ApolloProvider>
          </HelmetProvider>
        </HostProvider>
      </UAProvider>
    );

    const html = await renderToStringWithData(main);
    const state = client.extract();

    res.send(await renderHtml({ html, state, helmetContext }));
  } catch (e) {
    if (e instanceof ApolloError) {
      console.error(JSON.stringify(e));
    } else if (e instanceof Error) {
      console.error(e.name, e.message, e.stack);
    } else {
      console.error(e);
    }

    if (production) {
      // the assumption is that if something goes wrong in production, the
      // user was being nefarious and they should be logged out
      // await logout(req, res);
      res.redirect('/');
    } else {
      res.end();
    }
  }
}
