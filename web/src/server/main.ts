const production = process.env.NODE_ENV === 'production';
const { config } = require('dotenv-safe');
const { join, resolve } = require('path');

if (!production) {
  config({
    path: resolve(__dirname, '../../.env'),
    example: resolve(__dirname, '../../.env.example'),
  });
}

require('isomorphic-fetch');
import * as express from 'express';
import { ServeStaticOptions } from 'serve-static';
import { render } from './render';

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

if (!production) {
  app.use((req, res, next) => {
    console.info('\n\nRequest for ', req.url);
    next();
  });
}

app.get('*', (req, res, done) => render(req, res).then(() => done()));

const port = Number(process.env.PORT) || 8080;
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
