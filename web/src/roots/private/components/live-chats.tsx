import { OnSubscriptionDataOptions } from '@apollo/react-common';
import gql from 'graphql-tag';
import React from 'react';
import { THREAD } from '../../../queries';
import {
  IPaginationInput,
  IQuery,
  IQueryThreadArgs,
  ISubscription,
} from '../../../schema.gql';
import { readQuery, useSubscription } from '../../../state';

const CHATS = gql`
  subscription SubsChats {
    newMessage {
      id
      createdAt
      content
      fromId
      threadId
    }
  }
`;
function onSubscriptionData({
  client,
  subscriptionData: { data, loading },
}: OnSubscriptionDataOptions<ISubscription>) {
  const newMessage = data?.newMessage;
  if (!newMessage || loading) {
    return;
  }

  // best effort update
  type Args = IQueryThreadArgs & IPaginationInput;
  const messagesData = readQuery<IQuery, Args>(client, {
    query: THREAD,
    variables: { id: newMessage.threadId, offset: 0 },
  });
  if (!messagesData?.thread?.messages.items) {
    return;
  }

  const messages = messagesData?.thread?.messages.items;
  client.writeQuery({
    query: THREAD,
    variables: { id: newMessage.threadId, offset: 0 },
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
}

export function LiveChats() {
  const { data, loading } = useSubscription(CHATS, { onSubscriptionData });

  const id = data?.newMessage.id;
  React.useLayoutEffect(() => {
    if (id && !loading) {
      setTimeout(() => {
        const el = document.querySelector(`#message-${id}`);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    }
  }, [id, loading]);
  return null;
}
