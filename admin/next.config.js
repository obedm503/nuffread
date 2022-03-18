module.exports = {
  env: {
    API: process.env.API,
  },
  async rewrites() {
    return [
      { source: '/graphql', destination: process.env.NEXT_PUBLIC_GRAPHQL_API },
    ];
  },
};
