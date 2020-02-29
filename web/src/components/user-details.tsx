import {
  IonButton,
  IonButtons,
  IonCard,
  IonIcon,
  IonItem,
  IonLabel,
  IonSkeletonText,
} from '@ionic/react';
import gql from 'graphql-tag';
import { call, logoFacebook, mail, person } from 'ionicons/icons';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { IQueryListingArgs, IUser } from '../schema.gql';
import { useQuery } from '../state/apollo';
import { useLoggedIn, useUser } from '../state/user';
import { Error } from './error';
import { SafeImg } from './safe-img';

export const UserBasic = React.memo<{ user: IUser }>(function UserBasic({
  user,
}) {
  const isLoggedIn = useLoggedIn();
  if (!isLoggedIn) {
    return null;
  }

  const name = user.name || user.email;
  return (
    <IonItem lines="full">
      <SafeImg
        slot="start"
        style={{ height: '2rem' }}
        src={user.photo || undefined}
        alt={name}
        placeholder={person}
      />

      <IonLabel className="ion-text-wrap">
        <b>
          {user.name ? (
            <>
              {user.name} ({user.email})
            </>
          ) : (
            user.email
          )}
        </b>
        <br />
        {user.school.name}
      </IonLabel>
    </IonItem>
  );
});

export const UserDetailed = React.memo<{ user: IUser }>(function UserDetailed({
  user,
}) {
  const name = user.name || user.email;
  return (
    <IonCard color="white">
      <IonItem lines="none">
        <SafeImg
          style={{ height: '8rem' }}
          slot="start"
          src={user.photo || undefined}
          alt={name}
          placeholder={person}
        />

        <IonLabel>
          <p>
            <strong>{name}</strong>
            {user.school?.name ? (
              <>
                <br />
                <small>{user.school.name}</small>
              </>
            ) : null}
            {/* <br />
          <small>
            <a href="tel: +123456789">+123456789</a>
          </small> */}
          </p>

          <IonButtons>
            <IonButton href={`mailto:${user.email}`}>
              <IonIcon slot="icon-only" size="small" icon={mail} />
            </IonButton>
            <IonButton href="#" disabled>
              <IonIcon slot="icon-only" size="small" icon={call} />
            </IonButton>
            <IonButton href="#" disabled>
              <IonIcon slot="icon-only" size="small" icon={logoFacebook} />
            </IonButton>
          </IonButtons>
        </IonLabel>
      </IonItem>
    </IonCard>
  );
});

const userHidden = (
  <IonCard color="white">
    <IonItem lines="none" color="white">
      <IonIcon slot="start" icon={person} style={{ width: '8rem' }} />

      <IonLabel class="ion-text-wrap">
        <IonSkeletonText style={{ background: 'black' }} />
        <h2>
          <Link to="/login">Login</Link> to see contact information.
        </h2>
        <IonSkeletonText style={{ background: 'black' }} />
      </IonLabel>
    </IonItem>
  </IonCard>
);

const userLoading = (
  <IonCard color="white">
    <IonItem lines="none" color="white">
      <IonSkeletonText
        slot="start"
        animated
        style={{ height: '9rem', width: '7rem' }}
      />

      <IonLabel class="ion-text-wrap">
        <IonSkeletonText animated style={{ width: '5rem' }} />
        <IonSkeletonText style={{ width: '6rem' }} />
      </IonLabel>
    </IonItem>
  </IonCard>
);

const GET_LISTING_SELLER = gql`
  query GetListingSeller($id: ID!) {
    listing(id: $id) {
      id
      user {
        id
        name
        email
        school {
          id
          name
        }
      }
    }
  }
`;
const Seller = React.memo<{ listingId: string }>(function ListingSeller({
  listingId,
}) {
  const { loading, error, data } = useQuery<IQueryListingArgs>(
    GET_LISTING_SELLER,
    { variables: { id: listingId } },
  );
  if (loading) {
    return userLoading;
  }
  if (error) {
    return <Error value={error} />;
  }
  const user = data!.listing!.user;
  if (!user) {
    return userHidden;
  }
  return <UserDetailed user={user} />;
});

export const ListingSeller = React.memo<{
  listingId: string;
}>(function ListingSeller({ listingId }) {
  const user = useUser();
  if (!user) {
    return userHidden;
  }

  return <Seller listingId={listingId} />;
});
