import {
  LazyQueryHookOptions,
  MutationHookOptions,
  QueryHookOptions,
  useLazyQuery as apolloLazyQuery,
  useMutation as apolloMutation,
  useQuery as apolloQuery,
} from '@apollo/react-hooks';
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
