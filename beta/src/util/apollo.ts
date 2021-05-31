import {
  ApolloClient,
  DataProxy,
  DocumentNode,
  LazyQueryHookOptions,
  MutationHookOptions,
  MutationTuple,
  QueryHookOptions,
  QueryResult,
  QueryTuple,
  useLazyQuery as apolloLazyQuery,
  useMutation as apolloMutation,
  useQuery as apolloQuery,
} from '@apollo/client';
import { IMutation, IQuery } from '../schema.gql';

type UseQuery = <TVariables = never>(
  query: DocumentNode,
  options?: QueryHookOptions<IQuery, TVariables>,
) => QueryResult<IQuery, TVariables>;
export const useQuery = apolloQuery as UseQuery;

type UseLazyQuery = <TVariables = never>(
  query: DocumentNode,
  options?: LazyQueryHookOptions<IQuery, TVariables>,
) => QueryTuple<IQuery, TVariables>;
export const useLazyQuery = apolloLazyQuery as UseLazyQuery;

type UseMutation = <TVariables = never>(
  mutation: DocumentNode,
  options?: MutationHookOptions<IMutation, TVariables>,
) => MutationTuple<IMutation, TVariables>;
export const useMutation = apolloMutation as UseMutation;

/**
 * using custom readQuery because it throws if item is not in cache
 * https://github.com/apollographql/apollo-feature-requests/issues/1
 * https://github.com/apollographql/apollo-client/issues/1542
 */
export function readQuery<T = IQuery, TVariables = never>(
  client: ApolloClient<any>,
  options: DataProxy.Query<TVariables, T>,
  optimistic?: boolean,
): T | null | undefined {
  try {
    return client.readQuery(options, optimistic);
  } catch {
    return undefined;
  }
}
