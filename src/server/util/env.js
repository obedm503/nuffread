const production = process.env.NODE_ENV === 'production';
if (!production) {
  require('dotenv-safe/config');
}

require('isomorphic-fetch');
require('reflect-metadata');

module.exports = { production };
