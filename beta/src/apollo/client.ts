import {
  ApolloClient,
  ApolloError,
  DataProxy,
  DocumentNode,
  LazyQueryHookOptions,
  LazyQueryResult,
  MutationHookOptions,
  MutationResult,
  MutationTuple,
  QueryHookOptions,
  QueryResult,
  QueryTuple,
  SubscriptionHookOptions,
  SubscriptionResult,
  useLazyQuery as useApolloLazyQuery,
  useMutation as useApolloMutation,
  useQuery as useApolloQuery,
  useSubscription as useApolloSubscription,
} from '@apollo/client';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';

type WaitingResult = {
  data?: undefined;
  loading: false;
  error?: undefined;
};

type LoadingResult = {
  data?: undefined;
  loading: true;
  error?: undefined;
};

type ErrorResult = {
  data?: undefined;
  loading?: false;
  error: ApolloError;
};

type SuccessResult<TData> = {
  data: TData;
  loading?: false;
  error?: undefined;
};
export type RequestResult<TData> =
  | LoadingResult
  | ErrorResult
  | SuccessResult<TData>;

export function useQuery<TData, TVariables = never>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: QueryHookOptions<TData, TVariables>,
): RequestResult<TData> & QueryResult<TData, TVariables> {
  const { loading, error, data, ...rest } = useApolloQuery(query, options);

  if ((loading && !data) || options?.skip) {
    return {
      loading: true,
      error: undefined,
      data: undefined,
      ...rest,
    };
  }

  if (error) {
    return {
      loading: false,
      error,
      data: undefined,
      ...rest,
    };
  }

  if (data) {
    return {
      loading: false,
      error: undefined,
      data,
      ...rest,
    };
  }

  throw new Error('unknown request state');
}

export function useLazyQuery<TData, TVariables = never>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: LazyQueryHookOptions<TData, TVariables>,
): [
  QueryTuple<TData, TVariables>['0'],
  (WaitingResult | RequestResult<TData>) & LazyQueryResult<TData, TVariables>,
] {
  const [func, { loading, error, data, ...rest }] = useApolloLazyQuery(
    query,
    options,
  );

  if (!rest.called) {
    return [
      func,
      {
        loading: false,
        error: undefined,
        data: undefined,
        ...rest,
      },
    ];
  }

  if (loading) {
    return [
      func,
      {
        loading: true,
        error: undefined,
        data: undefined,
        ...rest,
      },
    ];
  }

  if (error) {
    return [
      func,
      {
        loading: false,
        error,
        data: undefined,
        ...rest,
      },
    ];
  }

  if (data) {
    return [
      func,
      {
        loading: false,
        error: undefined,
        data,
        ...rest,
      },
    ];
  }

  throw new Error('unknown request state');
}

export function useMutation<TData, TVariables = never>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: MutationHookOptions<TData, TVariables>,
): [
  MutationTuple<TData, TVariables>['0'],
  (WaitingResult | RequestResult<TData>) & MutationResult<TData>,
] {
  const [mutate, { loading, error, data, ...rest }] = useApolloMutation(
    query,
    options,
  );

  if (!rest.called) {
    return [
      mutate,
      {
        loading: false,
        error: undefined,
        data: undefined,
        ...rest,
      },
    ];
  }

  if (loading) {
    return [
      mutate,
      {
        loading: true,
        error: undefined,
        data: undefined,
        ...rest,
      },
    ];
  }

  if (error) {
    return [
      mutate,
      {
        loading: false,
        error,
        data: undefined,
        ...rest,
      },
    ];
  }

  if (data) {
    return [
      mutate,
      {
        loading: false,
        error: undefined,
        data,
        ...rest,
      },
    ];
  }

  throw new Error('unknown request state');
}

export function useSubscription<TData, TVariables = never>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: SubscriptionHookOptions<TData, TVariables>,
): RequestResult<TData> & SubscriptionResult<TData> {
  const { loading, error, data, ...rest } = useApolloSubscription(
    query,
    options,
  );

  if (loading) {
    return {
      loading: true,
      error: undefined,
      data: undefined,
      ...rest,
    };
  }

  if (error) {
    return {
      loading: false,
      error,
      data: undefined,
      ...rest,
    };
  }

  if (data) {
    return {
      loading: false,
      error: undefined,
      data,
      ...rest,
    };
  }

  throw new Error('unknown request state');
}

/**
 * using custom readQuery because it throws if item is not in cache
 * https://github.com/apollographql/apollo-feature-requests/issues/1
 * https://github.com/apollographql/apollo-client/issues/1542
 */
export function readQuery<TData, TVariables = never>(
  client: ApolloClient<any>,
  options: DataProxy.Query<TVariables, TData> & {
    query: DocumentNode | TypedDocumentNode<TData, TVariables>;
  },
  optimistic?: boolean,
): TData | null | undefined {
  try {
    return client.readQuery(options, optimistic);
  } catch {
    return undefined;
  }
}
