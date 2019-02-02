import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApolloClient, ApolloError } from 'apollo-client';
import { SchemaLink } from 'apollo-link-schema';
import { Request, Response } from 'express';
import * as React from 'react';
import { ApolloProvider, renderToStringWithData } from 'react-apollo';
import { StaticRouter } from 'react-router';
import { App, createCache } from '../shared/app';
import { HostProvider } from '../shared/state/host';
import { UAProvider } from '../shared/state/ua';
import { render } from './render';
import { getContext, getSchema } from './schema';
import { getUrl } from './util';
import { logout } from './mutation/mutation.resolver';

const production = process.env.NODE_ENV === 'production';

@Controller('/')
export class AppController {
  @Get('*')
  index(@Req() req: Request, @Res() res: Response) {
    this.render(req, res);
  }

  async render(req: Request, res: Response) {
    try {
      const link = new SchemaLink({
        schema: getSchema(),
        context: await getContext({ req, res }),
      });
      const client = new ApolloClient({
        ssrMode: true,
        link,
        cache: createCache(),
      });
      const context = {};
      const main = (
        <UAProvider value={req.header('user-agent') || ''}>
          <HostProvider value={getUrl(req)}>
            <ApolloProvider client={client}>
              <StaticRouter location={req.url} context={context}>
                <App />
              </StaticRouter>
            </ApolloProvider>
          </HostProvider>
        </UAProvider>
      );
      const html = await renderToStringWithData(main);
      const state = client.extract();
      res.send(await render({ html, state }));
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
        await logout(req, res);
        res.redirect('/');
      } else {
        res.end();
      }
    }
  }
}
