const production = process.env.NODE_ENV === 'production';
const { join, resolve } = require('path');

if (!production) {
  const { config } = require('dotenv-safe');
  config({
    path: resolve(__dirname, '../../.env'),
    example: resolve(__dirname, '../../.env.example'),
  });
}

require('isomorphic-fetch');
import { ApolloError } from 'apollo-client';
import * as express from 'express';
import gql from 'graphql-tag';
import { ServeStaticOptions } from 'serve-static';
import { getClient, render } from './render';

const distPublicDir = resolve(__dirname, '../../dist/public');
const publicDir = resolve(__dirname, '../../public');

const app = express()
  .disable('etag')
  .disable('x-powered-by')
  .set('trust proxy', true);

if (production) {
  // force ssl
  app.use((req: express.Request, res: express.Response, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(join(`https://${req.hostname}`, req.url));
    } else {
      next();
    }
  });
}

const staticOptions: ServeStaticOptions = { etag: false, index: false };
app.use(
  '/',
  express.static(distPublicDir, staticOptions),
  express.static(publicDir, staticOptions),
);

const port = Number(process.env.PORT) || 8080;
const getBase = (req: express.Request) => {
  const includePort = req.hostname === 'localhost';
  if (includePort) {
    return `${req.protocol}://${req.hostname}:${port}`;
  } else {
    return `${req.protocol}://${req.hostname}`;
  }
};

app.get('/confirm/:binId', async (req, res) => {
  const binId = req.param('binId');
  if (!binId) {
    return res.redirect('/');
  }

  const client = getClient(req.get('cookie'));

  const { errors, data } = await client.mutate<GQL.IMutation>({
    mutation: gql`
      mutation Confirm($id: String!) {
        confirm(id: $id)
      }
    `,
    variables: { id: binId },
  });

  if (errors || !data || !data.confirm) {
    return res.redirect('/');
  }

  res.redirect('/login');
});

app.get('*', async (req, res) => {
  try {
    const html = await render({
      cookie: req.get('cookie'),
      ua: req.get('user-agent') || '',
      base: getBase(req),
      url: req.url,
    });

    res.send(html);
  } catch (e) {
    if (e instanceof ApolloError) {
      console.error(JSON.stringify(e, null, 2));
    } else if (e instanceof Error) {
      console.error(e.name, e.message, e.stack);
    } else {
      console.error(e);
    }

    if (production) {
      // the assumption is that if something goes wrong in production, the
      // user was being nefarious and they should be logged out
      res.clearCookie('session').redirect('/');
    } else {
      res.end();
    }
  }
});

const server = app.listen(port, () => {
  console.info(`Listening on port ${port}`);
});

const close = () =>
  new Promise(resolve => {
    console.info('Closing server');
    server.close(resolve);
  });
process.once('exit', close);
process.once('SIGUSR2', async () => {
  await close();
  process.kill(process.pid, 'SIGUSR2');
});
