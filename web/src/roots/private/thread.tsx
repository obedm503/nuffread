import { QueryResult } from '@apollo/react-common';
import { useApolloClient } from '@apollo/react-hooks';
import {
  IonAvatar,
  IonBackButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  useIonViewWillEnter,
} from '@ionic/react';
import { Form, Formik, FormikHelpers } from 'formik';
import gql from 'graphql-tag';
import { personCircleOutline, sendSharp } from 'ionicons/icons';
import * as React from 'react';
import { Redirect } from 'react-router';
import { Container, IonSubmit, ListWrapper, NavBar } from '../../components';
import { TextArea } from '../../components/controls/text-area';
import { MESSAGES } from '../../queries';
import {
  IMessage,
  IMutationSendMessageArgs,
  IPaginatedMessages,
  IPaginationInput,
  IQuery,
  IQueryThreadArgs,
} from '../../schema.gql';
import { readQuery, useLazyQuery, useMutation, useUser } from '../../state';
import { classes, queryLoading } from '../../util';
import { PaginatedRefresh } from '../../util.types';

function groupMessages(
  messages: readonly IMessage[],
): { id: string; fromId: string; messages: IMessage[] }[] {
  if (!messages.length) {
    return [];
  }
  const first = messages[0];
  const grouped = [{ id: first.id, fromId: first.fromId, messages: [first] }];
  if (messages.length === 1) {
    return grouped;
  }

  let currentUserId = first.fromId;
  for (let i = 1; i < messages.length; i++) {
    const msg = messages[i];

    if (currentUserId === msg.fromId) {
      // same user
      grouped[grouped.length - 1].messages.push(msg);
    } else {
      // other user
      grouped.push({ id: msg.id, fromId: msg.fromId, messages: [msg] });
    }

    currentUserId = msg.fromId;
  }
  return grouped;
}

const Messages = React.memo<Pick<QueryResult<IQuery>, 'data' | 'loading'>>(
  function Messages({ loading, data }) {
    // const messages = React.useMemo(() => {
    //   return data?.thread?.messages.items.slice(0).reverse();
    // }, [data?.thread?.messages]);
    const messages = data?.thread?.messages.items;

    const groupedMessages = React.useMemo(
      () => messages && groupMessages(messages.slice(0).reverse()),
      [messages],
    );

    if (loading || !data?.thread || !messages || !groupedMessages) {
      return <ListWrapper>loading</ListWrapper>;
    }

    if (!messages.length) {
      return (
        <IonList>
          <IonItem>
            <IonLabel>You have not saved any posts.</IonLabel>
          </IonItem>
        </IonList>
      );
    }

    const otherId = data.thread.otherId;
    return (
      <IonList className="messages" lines="none">
        {groupedMessages.map((group, i) => {
          const isOther = group.fromId === otherId;
          return (
            <div
              key={group.id}
              id={group.id}
              className={classes('group', isOther ? 'other' : 'me')}
            >
              {isOther ? (
                <IonAvatar>
                  <IonIcon icon={personCircleOutline} />
                </IonAvatar>
              ) : null}

              <div className="message-list">
                {group.messages.map(msg => {
                  return (
                    <IonItem
                      key={msg.id}
                      id={`message-${msg.id}`}
                      color={isOther ? 'light' : 'primary'}
                    >
                      <IonLabel className="ion-text-wrap">
                        {msg.content}
                      </IonLabel>
                    </IonItem>
                  );
                })}
              </div>
            </div>
          );
        })}
      </IonList>
    );
  },
);

function paginated(
  messages?: IPaginatedMessages,
): {
  messages: readonly IMessage[] | undefined;
  currentCount: number;
  totalCount: number;
} {
  return {
    messages: messages?.items,
    currentCount: messages?.items.length || 0,
    totalCount: messages?.totalCount || 0,
  };
}
const useData = (
  threadId: string,
): Omit<PaginatedRefresh<IQuery>, 'refresh'> => {
  const [
    load,
    { data, loading, error, called, fetchMore, subscribeToMore },
  ] = useLazyQuery<IQueryThreadArgs & IPaginationInput>(MESSAGES, {
    variables: { id: threadId, offset: 0 },
    // fetchPolicy: 'cache-and-network',
  });

  const thread = data?.thread || undefined;
  const { currentCount, totalCount } = paginated(thread?.messages);

  const getMore = React.useCallback(
    async e => {
      await fetchMore<keyof (IQueryThreadArgs & IPaginationInput)>({
        query: MESSAGES,
        variables: { id: threadId, offset: currentCount },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult || !fetchMoreResult.thread || !prev.thread) {
            return prev;
          }

          return {
            ...prev,
            thread: {
              ...prev.thread,
              messages: {
                __typename: 'PaginatedMessages',
                totalCount: fetchMoreResult.thread.messages.totalCount,
                items: [
                  ...prev.thread.messages.items,
                  ...fetchMoreResult.thread.messages.items,
                ],
              },
            },
          };
        },
      });
      (e.target! as HTMLIonInfiniteScrollElement).complete();
    },
    [fetchMore, currentCount, threadId],
  );

  if (error) {
    throw error;
  }

  return {
    load: React.useCallback(() => {
      load();
    }, [load]),
    fetchMore: getMore,
    canFetchMore: currentCount < totalCount,
    loading: queryLoading({ called, loading }),
    data,
  };
};

const SEND_MESSAGE = gql`
  mutation SendMessage($threadId: ID!, $content: String!) {
    sendMessage(threadId: $threadId, content: $content) {
      id
      createdAt
      content
      threadId
      fromId
    }
  }
`;

export const Thread = React.memo<{
  threadId: string;
  defaultHref: string;
}>(function Thread({ threadId, defaultHref }) {
  const { loading, data, load, canFetchMore, fetchMore } = useData(threadId);
  useIonViewWillEnter(load);

  const me = useUser();
  const client = useApolloClient();
  const [send, { loading: loadingSend, error }] = useMutation<
    IMutationSendMessageArgs
  >(SEND_MESSAGE, {
    update(proxy, { data }) {
      const newMessage = data?.sendMessage;
      if (!newMessage) {
        return;
      }

      // best effort update
      const messagesData = readQuery<
        IQuery,
        IQueryThreadArgs & IPaginationInput
      >(client, {
        query: MESSAGES,
        variables: { id: threadId, offset: 0 },
      });
      if (!messagesData?.thread?.messages.items) {
        return;
      }
      const messages = messagesData?.thread?.messages.items;
      client.writeQuery({
        query: MESSAGES,
        variables: { id: threadId, offset: 0 },
        data: {
          ...messagesData,
          thread: {
            ...messagesData.thread,
            messages: {
              ...messagesData.thread.messages,
              totalCount: messagesData.thread.messages.totalCount + 1,
              items: [newMessage, ...messages],
            },
          },
        },
      });
    },
  });

  const onSubmit = React.useCallback(
    ({ content }, { setFieldValue }: FormikHelpers<{ content: string }>) => {
      if (!me) {
        return;
      }
      send({
        variables: { content, threadId },
        optimisticResponse: {
          sendMessage: {
            __typename: 'Message',
            id: me.id,
            fromId: me.id,
            createdAt: new Date().toISOString(),
            content,
            threadId,
          },
        } as any,
      });
      setFieldValue('content', '');
    },
    [me, send, threadId],
  );

  const firstId = data?.thread?.messages.items[0].id;
  React.useEffect(() => {
    if (firstId && !loading) {
      setTimeout(() => {
        const el = document.querySelector(`#message-${firstId}`);
        el?.scrollIntoView(true);
      }, 0);
    }
  }, [firstId, loading]);

  if (!loading && !data?.thread) {
    return <Redirect to={defaultHref} />;
  }

  return (
    <IonPage>
      <NavBar
        title="Deals"
        start={
          <IonButtons slot="start">
            <IonBackButton defaultHref={defaultHref} />
          </IonButtons>
        }
        end={null}
      />

      <IonContent>
        <Container style={{ minHeight: '100%' }}>
          {/* {canFetchMore ? (
          <IonInfiniteScroll onIonInfinite={fetchMore}>
          {loadingMessages}
          </IonInfiniteScroll>
        ) : null} */}

          <Messages data={data} loading={loading} />
        </Container>
      </IonContent>

      <IonFooter>
        <Formik<{ content: string }>
          onSubmit={onSubmit}
          // validationSchema={resetSchema}
          initialValues={{ content: '' }}
        >
          <Form>
            <TextArea label="" name="content" autoGrow rows={1} color="light">
              <IonSubmit
                slot="end"
                fill="clear"
                style={{ marginBottom: 'auto' }}
              >
                <IonIcon slot="icon-only" color="primary" icon={sendSharp} />
              </IonSubmit>
            </TextArea>
          </Form>
        </Formik>
      </IonFooter>
    </IonPage>
  );
});