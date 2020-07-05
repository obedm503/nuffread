import { IonButton, IonIcon } from '@ionic/react';
import gql from 'graphql-tag';
import { chatbubblesOutline } from 'ionicons/icons';
import React from 'react';
import { IListing, IMutationStartThreadArgs } from '../schema.gql';
import { tracker, useIsAdmin, useMutation, useRouter, useUser } from '../state';

const START_THREAD = gql`
  mutation StartThread($listingId: ID!) {
    startThread(listingId: $listingId) {
      id
    }
  }
`;

export const GoToChat = React.memo<{
  listing: IListing;
}>(function GoToChat({ listing }) {
  const listingId = listing.id;
  const router = useRouter();
  const me = useUser();
  const isAdmin = useIsAdmin();

  const [save] = useMutation<IMutationStartThreadArgs>(START_THREAD);

  const onClick = React.useCallback(
    async (e: React.MouseEvent<HTMLIonButtonElement, MouseEvent>) => {
      e.stopPropagation();

      const { data } = await save({ variables: { listingId } });

      const newThread = data?.startThread;
      if (!newThread) {
        return;
      }

      tracker.event('START_THREAD', { listingId });

      router.history.push(`/chat/${newThread.id}`);
    },
    [listingId, save, router.history],
  );

  if (!listing.user || !me || me.__typename !== 'User') {
    return null;
  }

  if (me.id === listing.user.id) {
    return null;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <IonButton onClick={onClick} color="white" fill="clear">
      <IonIcon
        slot="icon-only"
        color="dark"
        icon={chatbubblesOutline}
        size="large"
      />
    </IonButton>
  );
});
