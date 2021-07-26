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
  TypedDocumentNode,
  useLazyQuery as useApolloLazyQuery,
  useMutation as useApolloMutation,
  useQuery as useApolloQuery,
  useSubscription as useApolloSubscription,
} from '@apollo/client';
import { IMutation, IQuery, ISubscription } from '../queries';

type WaitingResult = {
  status: 'WAITING';
  data: undefined;
  loading: false;
  error: undefined;
};

type LoadingResult = {
  status: 'LOADING';
  data: undefined;
  loading: true;
  error: undefined;
};

type ErrorResult = {
  status: 'ERROR';
  data: undefined;
  loading: false;
  error: ApolloError;
};

type SuccessResult<TData> = {
  status: 'SUCCESS';
  data: TData;
  loading: false;
  error: undefined;
};

export function useQuery<TData = IQuery, TVariables = never>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: QueryHookOptions<TData, TVariables>,
): (LoadingResult | ErrorResult | SuccessResult<TData>) &
  QueryResult<TData, TVariables> {
  const { loading, error, data, ...rest } = useApolloQuery(query, options);

  if (loading) {
    return {
      status: 'LOADING',
      loading: true,
      error: undefined,
      data: undefined,
      ...rest,
    };
  }

  if (error) {
    return {
      status: 'ERROR',
      loading: false,
      error,
      data: undefined,
      ...rest,
    };
  }

  if (data) {
    return {
      status: 'SUCCESS',
      loading: false,
      error: undefined,
      data,
      ...rest,
    };
  }

  throw new Error('unknown request state');
}

export function useLazyQuery<TData = IQuery, TVariables = never>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: LazyQueryHookOptions<TData, TVariables>,
): [
  QueryTuple<TData, TVariables>['0'],
  (WaitingResult | LoadingResult | ErrorResult | SuccessResult<TData>) &
    LazyQueryResult<TData, TVariables>,
] {
  const [func, { loading, error, data, ...rest }] = useApolloLazyQuery(
    query,
    options,
  );

  if (!rest.called) {
    return [
      func,
      {
        status: 'WAITING',
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
        status: 'LOADING',
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
        status: 'ERROR',
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
        status: 'SUCCESS',
        loading: false,
        error: undefined,
        data,
        ...rest,
      },
    ];
  }

  throw new Error('unknown request state');
}

export function useMutation<TData = IMutation, TVariables = never>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: MutationHookOptions<TData, TVariables>,
): [
  MutationTuple<TData, TVariables>['0'],
  (WaitingResult | LoadingResult | ErrorResult | SuccessResult<TData>) &
    MutationResult<TData>,
] {
  const [mutate, { loading, error, data, ...rest }] = useApolloMutation(
    query,
    options,
  );

  if (!rest.called) {
    return [
      mutate,
      {
        status: 'WAITING',
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
        status: 'LOADING',
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
        status: 'ERROR',
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
        status: 'SUCCESS',
        loading: false,
        error: undefined,
        data,
        ...rest,
      },
    ];
  }

  throw new Error('unknown request state');
}

export function useSubscription<TData = ISubscription, TVariables = never>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: SubscriptionHookOptions<TData, TVariables>,
): (LoadingResult | ErrorResult | SuccessResult<TData>) &
  SubscriptionResult<TData> {
  const { loading, error, data, ...rest } = useApolloSubscription(
    query,
    options,
  );

  if (loading) {
    return {
      status: 'LOADING',
      loading: true,
      error: undefined,
      data: undefined,
      ...rest,
    };
  }

  if (error) {
    return {
      status: 'ERROR',
      loading: false,
      error,
      data: undefined,
      ...rest,
    };
  }

  if (data) {
    return {
      status: 'SUCCESS',
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
