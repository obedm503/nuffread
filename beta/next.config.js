module.exports = {
  poweredByHeader: false,
  async rewrites() {
    return [
      { source: '/graphql', destination: process.env.NEXT_PUBLIC_GRAPHQL_API },
    ];
  },
};
