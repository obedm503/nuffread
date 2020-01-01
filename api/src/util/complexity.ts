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
      const { operationName, query, variables } = request;
      try {
        const complexity = getComplexity({
          schema,
          query: operationName
            ? separateOperations(document)[operationName]
            : document,
          variables,
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({ defaultComplexity: 1 }),
          ],
        });

        logger.info({ complexity, operationName }, 'query complexity');
        if (operationName !== 'IntrospectionQuery') {
          logger.debug({ variables, operationName }, query);
        }

        // if (complexity >= 30) {
        //   throw new Error('query is too complex');
        // }
      } catch (e) {
        logger.error(e, 'error while calculating query complexity');
      }
    },
  }),
});
