import ApolloClient from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { load } from 'cheerio';
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

const readFile = promisify(fs.readFile);
const indexUrl = resolve(__dirname, '../../dist/public/index.html');
const production = process.env.NODE_ENV === 'production';

let template: string;
if (production) {
  // load index.html initially in production
  template = fs.readFileSync(indexUrl, 'utf-8');
}

type Params = {
  ua: string;
  url: string;
  base: string;
  cookie?: string;
};
export async function render({
  ua,
  url,
  base,
  cookie,
}: Params): Promise<string> {
  const link = createHttpLink({
    uri: process.env.API,
    headers: { cookie },
  });

  const client = new ApolloClient({
    ssrMode: true,
    link,
    cache: createCache(),
  });

  const routerContext = {};
  const helmetContext: FilledContext = {} as any;

  const main = (
    <UAProvider value={ua}>
      <HostProvider value={base}>
        <HelmetProvider context={helmetContext}>
          <ApolloProvider client={client}>
            <StaticRouter location={url} context={routerContext}>
              <App />
            </StaticRouter>
          </ApolloProvider>
        </HelmetProvider>
      </HostProvider>
    </UAProvider>
  );

  const html = await renderToStringWithData(main);
  const state = client.extract();

  if (!template) {
    // load index.html on first request only in development
    // has to wait for parcel to build it as the server boots up
    template = await readFile(indexUrl, 'utf-8');
  }

  const $template = load(template);

  const helmet = helmetContext.helmet;
  $template('head').append(
    `${helmet.title.toString()} ${helmet.meta.toString()}`,
  );

  setAttrs($template('html'), helmet.htmlAttributes.toString());
  setAttrs($template('body'), helmet.bodyAttributes.toString());

  $template('#root').html(html);
  $template('#state').html(
    `window.__APOLLO_STATE__ = ${JSON.stringify(state)};`,
  );

  return $template.html();
}
