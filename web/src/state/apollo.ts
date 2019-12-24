import {
  LazyQueryHookOptions,
  MutationHookOptions,
  QueryHookOptions,
  useLazyQuery as apolloLazyQuery,
  useMutation as apolloMutation,
  useQuery as apolloQuery,
} from '@apollo/react-hooks';
import { DataProxy } from 'apollo-cache';
import ApolloClient, { OperationVariables } from 'apollo-client';
import { DocumentNode } from 'graphql';
import { IMutation, IQuery } from '../schema.gql';

export const useQuery = <TVariables = never>(
  query: DocumentNode,
  options?: QueryHookOptions<IQuery, TVariables>,
) => apolloQuery<IQuery, TVariables>(query, options);

export const useLazyQuery = <TVariables = never>(
  query: DocumentNode,
  options?: LazyQueryHookOptions<IQuery, TVariables>,
) => apolloLazyQuery<IQuery, TVariables>(query, options);

export const useMutation = <TVariables = never>(
  mutation: DocumentNode,
  options?: MutationHookOptions<IMutation, TVariables>,
) => apolloMutation<IMutation, TVariables>(mutation, options);

/**
 * using custom readQuery because it throws if item is not in cache
 * https://github.com/apollographql/apollo-feature-requests/issues/1
 * https://github.com/apollographql/apollo-client/issues/1542
 */
export function readQuery<T = any, TVariables = OperationVariables>(
  client: ApolloClient<any>,
  options: DataProxy.Query<TVariables>,
  optimistic?: boolean,
): T | null | undefined {
  try {
    return client.readQuery(options, optimistic);
  } catch {
    return undefined;
  }
}
