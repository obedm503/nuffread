import { OnSubscriptionDataOptions } from '@apollo/client';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { personCircleOutline, sendSharp } from 'ionicons/icons';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo } from 'react';
import { object, string } from 'yup';
import { useMutation, useQuery, useSubscription } from '../../apollo/client';
import { makeApolloSSR } from '../../apollo/ssr';
import { withApollo } from '../../apollo/with-apollo';
import { Icon } from '../../components/icon';
import { Layout } from '../../components/layout';
import { Navbar } from '../../components/navbar';
import { Threads } from '../../components/threads';
import {
  IMessageFragment,
  IPaginatedMessagesFragment,
  ISub_MessagesSubscription,
  More_MessagesDocument as MORE_MESSAGES,
  Send_MessageDocument as SEND_MESSAGE,
  Sub_MessagesDocument as SUB_MESSAGES,
  ThreadDocument as THREAD,
} from '../../queries';
import { classes, queryLoading } from '../../util';
import { useMe } from '../../util/auth';

function onSubscriptionData({
  client,
  subscriptionData: { data, loading },
}: OnSubscriptionDataOptions<ISub_MessagesSubscription>) {
  const newMessage = data?.newMessage;
  if (!newMessage || loading) {
    return;
  }

  // best effort update
  client.cache.updateQuery(
    {
      query: THREAD,
      variables: { id: newMessage.threadId, offset: 0 },
    },
    messagesData => {
      if (!messagesData?.thread?.messages.items) {
        return;
      }

      const messages = messagesData?.thread?.messages.items;
      return {
        ...messagesData,
        thread: {
          ...messagesData.thread,
          messages: {
            ...messagesData.thread.messages,
            totalCount: messagesData.thread.messages.totalCount + 1,
            items: [newMessage, ...messages],
          },
        },
      };
    },
  );
}
function SubscribeToLiveMessages() {
  const res = useSubscription(SUB_MESSAGES, {
    onSubscriptionData,
    skip: typeof window === 'undefined',
  });

  const id = res.data?.newMessage?.id;
  useEffect(() => {
    if (id && !res.loading) {
      setTimeout(() => {
        const el = document.querySelector(`#message-${id}`);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    }
  }, [id, res]);
  return null;
}

function groupMessages(
  messages: readonly IMessageFragment[],
): { id: string; fromId: string; messages: IMessageFragment[] }[] {
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
      grouped[grouped.length - 1].messages.unshift(msg);
    } else {
      // other user
      grouped.push({ id: msg.id, fromId: msg.fromId, messages: [msg] });
    }

    currentUserId = msg.fromId;
  }
  return grouped;
}

function paginated(messages?: IPaginatedMessagesFragment): {
  messages: readonly IMessageFragment[] | undefined;
  currentCount: number;
  totalCount: number;
} {
  return {
    messages: messages?.items,
    currentCount: messages?.items.length || 0,
    totalCount: messages?.totalCount || 0,
  };
}
function useData(threadId: string) {
  const { data, loading, error, called, fetchMore } = useQuery(THREAD, {
    variables: { id: threadId, offset: 0 },
    // fetchPolicy: 'cache-and-network',
  });

  const thread = data?.thread || undefined;
  const { currentCount, totalCount } = paginated(thread?.messages);

  const getMore = useCallback(
    async e => {
      if (fetchMore) {
        await fetchMore({
          query: MORE_MESSAGES,
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
      }
    },
    [fetchMore, currentCount, threadId],
  );

  return {
    error,
    fetchMore: getMore,
    canFetchMore: currentCount < totalCount,
    loading: queryLoading({ called, loading }),
    data,
  };
}

const messageSchema = object().shape({
  content: string().required().min(1).max(300),
});

function Chat() {
  const router = useRouter();
  const threadId = router.query.id as string;
  const res = useData(threadId);

  const allMessages = res.data?.thread?.messages.items;
  const grouped = useMemo(
    () => allMessages && groupMessages(allMessages),
    [allMessages],
  );

  const [send, messageRes] = useMutation(SEND_MESSAGE);
  const cache = messageRes.client.cache;
  const { me } = useMe();
  const handleSubmit = useCallback(
    ({ content }: { content: string }, helpers: FormikHelpers<any>) => {
      if (!content || !me) {
        return;
      }
      const createdAt = new Date().toISOString();
      send({
        variables: { content, threadId },
        optimisticResponse: {
          __typename: 'Mutation',
          sendMessage: {
            __typename: 'Message',
            id: me.id + createdAt,
            fromId: me.id,
            createdAt,
            content,
          },
        },
      }).then(res => {
        const newMessage = res.data?.sendMessage;
        if (newMessage) {
          cache.updateQuery(
            { query: THREAD, variables: { id: threadId, offset: 0 } },
            data => {
              if (!data?.thread) {
                return;
              }
              return {
                ...data,
                thread: {
                  ...data.thread,
                  messages: {
                    ...data.thread.messages,
                    items: [newMessage, ...data.thread.messages.items],
                    totalCount: data.thread.messages.items.length + 1,
                  },
                },
              };
            },
          );
        }
      });
      helpers.setFieldValue('content', '');
    },
    [cache, send, threadId, me],
  );

  if (res.loading || !res.data?.thread) {
    return null;
  }
  if (res.error) {
    return <Layout title="Chat">Something went wrong</Layout>;
  }

  const otherId = res.data.thread.otherId;
  return (
    <div className="min-h-screen bg-white md:bg-primary">
      <SubscribeToLiveMessages />

      <Head>
        <title>{res.data.thread.listing.book.title} - Chat - nuffread</title>
      </Head>

      <Navbar />

      <main className="md:flex">
        <div className="hidden md:block w-1/3 m-6 space-y-4">
          <Threads />
        </div>

        <div className="md:w-2/3 md:bg-white">
          <div className="messages flex flex-col-reverse mt-auto overflow-auto">
            {grouped?.map((group, i) => {
              const isOther = group.fromId === otherId;
              return (
                <div
                  key={i}
                  className={classes(
                    'flex items-end m-4 md:max-w-6xl',
                    isOther
                      ? 'ml-4 sm:ml-20 mr-auto'
                      : 'mr-4 sm:mr-20 ml-auto',
                  )}
                >
                  {isOther ? (
                    <div className="p-2">
                      <Icon className="w-8" icon={personCircleOutline} />
                    </div>
                  ) : null}

                  <div className="space-y-[0.18rem]">
                    {group.messages.map((msg, i, arr) => {
                      const isFirst = i === 0;
                      const isLast = i === arr.length - 1;
                      return (
                        <div
                          key={msg.id}
                          id={`message-${msg.id}`}
                          className={classes(
                            'px-4 py-3 max-w-[60vw] sm:max-w-[50vw] md:max-w-[40vw] lg:max-w-[35vw] xl:max-w-[30vw]',
                            isOther
                              ? 'rounded-r-xl rounded-l-sm bg-light'
                              : 'rounded-l-xl rounded-r-sm bg-primary text-white',
                            isFirst
                              ? isOther
                                ? 'rounded-tl-xl'
                                : 'rounded-tr-xl'
                              : '',
                            isLast
                              ? isOther
                                ? 'rounded-bl-xl'
                                : 'rounded-br-xl'
                              : '',
                          )}
                        >
                          {msg.content}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <Formik
            initialValues={{ content: '' }}
            onSubmit={handleSubmit}
            validationSchema={messageSchema}
          >
            {({ isValid }) => (
              <Form className="bg-light flex justify-between relative">
                <Field
                  name="content"
                  type="text"
                  placeholder="Message..."
                  className="p-4 pr-16 w-full outline-none bg-light border-t-2 active:border-t-dark focus:border-t-dark text-md"
                />
                <button
                  type="submit"
                  disabled={messageRes.loading || !isValid}
                  className="absolute right-4 top-4 text-primary disabled:opacity-60 disabled:pointer-events-none"
                >
                  <Icon icon={sendSharp} className="w-7" />
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </main>
    </div>
  );
}

export default withApollo(Chat);
export const getServerSideProps = makeApolloSSR(Chat);
