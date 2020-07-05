import { QueryResult } from '@apollo/react-common';
import { RefresherEventDetail } from '@ionic/core';
import {
  IonContent,
  IonInfiniteScroll,
  IonItem,
  IonLabel,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonText,
} from '@ionic/react';
import gql from 'graphql-tag';
import * as React from 'react';
import {
  Container,
  IonItemLink,
  ListingCard,
  ListWrapper,
  NavBar,
  SafeImg,
  useWillEnter,
} from '../../components';
import {
  IPaginatedThreads,
  IPaginationInput,
  IQuery,
  IThread,
} from '../../schema.gql';
import { useLazyQuery } from '../../state';
import { queryLoading } from '../../util';
import { PaginatedRefresh } from '../../util.types';

class Threads extends React.PureComponent<
  Pick<QueryResult<IQuery>, 'data' | 'loading'>
> {
  render() {
    const { loading, data } = this.props;

    if (loading || !(data?.me?.__typename === 'User')) {
      return <ListWrapper>{ListingCard.loading}</ListWrapper>;
    }

    if (!data.me.threads.items.length) {
      return (
        <ListWrapper>
          <IonItem>
            <IonLabel>You have not saved any posts.</IonLabel>
          </IonItem>
        </ListWrapper>
      );
    }

    return (
      <ListWrapper>
        {data.me.threads.items.map(thread => (
          <IonItemLink key={thread.id} href={`/chat/${thread.id}`}>
            <SafeImg
              slot="start"
              src={thread.listing.book.thumbnail || undefined}
              alt={[
                thread.listing.book.title,
                thread.listing.book.subTitle,
              ].join(' ')}
              placeholder="/img/book.png"
              style={{ width: '5rem', fontSize: '5rem', marginRight: '20px' }}
            />
            <IonLabel className="ion-text-wrap">
              {thread.other.name}: {thread.listing.book.title}
              <br />
              <IonText color="medium">{thread.lastMessage?.content}</IonText>
            </IonLabel>
          </IonItemLink>
        ))}
      </ListWrapper>
    );
  }
}

const THREADS = gql`
  query GetThreads($offset: Int!) {
    me {
      ... on User {
        id
        name
        email
        threads(paginate: { limit: 20, offset: $offset }) {
          totalCount
          items {
            id
            lastMessage {
              id
              createdAt
              content
            }
            listingId
            listing {
              id
              book {
                id
                title
                thumbnail
              }
            }
            other {
              id
              email
              name
            }
            messages(paginate: { limit: 1 }) {
              totalCount
              items {
                createdAt
                content
                fromId
              }
            }
          }
        }
      }
    }
  }
`;

function paginated(
  threads?: IPaginatedThreads,
): {
  threads: readonly IThread[] | undefined;
  currentCount: number;
  totalCount: number;
} {
  return {
    threads: threads?.items,
    currentCount: threads?.items.length || 0,
    totalCount: threads?.totalCount || 0,
  };
}
const useData = (): PaginatedRefresh<IQuery> => {
  const [
    load,
    { error, data, loading, fetchMore, called, refetch },
  ] = useLazyQuery<IPaginationInput>(THREADS, {
    variables: { offset: 0 },
  });
  const { totalCount, currentCount } = paginated(
    data?.me?.__typename === 'User' ? data.me.threads : undefined,
  );

  const getMore = React.useCallback(
    async e => {
      await fetchMore({
        variables: { offset: currentCount },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (
            !(fetchMoreResult?.me?.__typename === 'User') ||
            !(prev?.me?.__typename === 'User')
          ) {
            return prev;
          }
          return {
            ...prev,
            me: {
              ...prev.me,
              threads: {
                ...prev.me.threads,
                totalCount: fetchMoreResult.me.threads.totalCount,
                items: [
                  ...prev.me.threads.items,
                  ...fetchMoreResult.me.threads.items,
                ],
              },
            },
          };
        },
      });
      (e.target! as HTMLIonInfiniteScrollElement).complete();
    },
    [currentCount, fetchMore],
  );

  const refresh = React.useCallback(
    async (event: CustomEvent<RefresherEventDetail>) => {
      await refetch();
      event.detail.complete();
    },
    [refetch],
  );

  if (error) {
    throw error;
  }

  return {
    load,
    data,
    loading: queryLoading({ called, loading }),
    canFetchMore: currentCount < totalCount,
    fetchMore: getMore,
    refresh,
  };
};

export const Chat = React.memo(function Chat() {
  const { load, refresh, canFetchMore, fetchMore, loading, data } = useData();
  useWillEnter(load);

  return (
    <IonPage>
      <NavBar title="Cart" />

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={refresh}>
          <IonRefresherContent />
        </IonRefresher>

        <Container gapless>
          <Threads loading={loading} data={data} />

          {canFetchMore ? (
            <IonInfiniteScroll onIonInfinite={fetchMore}>
              {ListingCard.loading}
            </IonInfiniteScroll>
          ) : null}
        </Container>
      </IonContent>
    </IonPage>
  );
});
