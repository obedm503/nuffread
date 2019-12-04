import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import { GraphQLSchema, separateOperations } from 'graphql';
import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';
import { logger } from '.';

// based on
// https://github.com/MichalLytek/type-graphql/blob/1cd84f7f8679d09ab744091d15a2e1061c1e0fa0/examples/query-complexity/index.ts
export const complexityPlugin = (
  schema: GraphQLSchema,
): ApolloServerPlugin => ({
  requestDidStart: () => ({
    didResolveOperation({ request, document }) {
      try {
        const complexity = getComplexity({
          schema,
          query: request.operationName
            ? separateOperations(document)[request.operationName]
            : document,
          variables: request.variables,
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({ defaultComplexity: 1 }),
          ],
        });
        logger.info({ complexity }, 'query complexity');
        // if (complexity >= 30) {
        //   throw new Error('query is too complex');
        // }
      } catch (e) {
        logger.error(e, 'error while calculating query complexity');
      }
    },
  }),
});
