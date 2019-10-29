import { useQuery } from '@apollo/react-hooks';
import {
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
import { Error, IonButtonLink } from '../../../components';
import { SafeImg } from '../../../components/safe-img';
import { IQuery, IUser } from '../../../schema.gql';
import { useUser } from '../../../state/user';

export const UserInfo = React.memo<{ user: IUser }>(({ user }) => (
  <IonCard color="white">
    <IonItem lines="none">
      <SafeImg
        style={{ fontSize: '8rem', color: 'var(--ion-color-contrast)' }}
        slot="start"
        src={user.photo}
        alt={user.name}
        placeholder={person}
      ></SafeImg>

      <IonLabel>
        <p>
          <strong>{user.name}</strong>
          {user.schoolName ? (
            <>
              <br />
              <small>{user.schoolName}</small>
            </>
          ) : null}
          <br />
          <small>
            <a href={`mailto: ${user.email}`}>{user.email}</a>
          </small>
          {/* <br />
          <small>
            <a href="tel: +123456789">+123456789</a>
          </small> */}
        </p>

        <IonButtons>
          <IonButtonLink href="#">
            <IonIcon slot="icon-only" size="small" icon={call} />
          </IonButtonLink>
          <IonButtonLink href="#">
            <IonIcon slot="icon-only" size="small" icon={logoFacebook} />
          </IonButtonLink>
          <IonButtonLink href={`mailto: ${user.email}`}>
            <IonIcon slot="icon-only" size="small" icon={mail} />
          </IonButtonLink>
        </IonButtons>
      </IonLabel>
    </IonItem>
  </IonCard>
));

const userHidden = (
  <IonCard color="white">
    <IonItem lines="none" color="white">
      <IonIcon
        slot="start"
        icon={person}
        style={{ fontSize: '8rem' }}
      ></IonIcon>

      <IonLabel class="ion-text-wrap">
        <IonSkeletonText style={{ background: 'black' }}></IonSkeletonText>
        <h2>
          <Link to="/login">Login</Link> to see contact information.
        </h2>
        <IonSkeletonText style={{ background: 'black' }}></IonSkeletonText>
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
        <IonSkeletonText animated style={{ width: '5rem' }}></IonSkeletonText>
        <IonSkeletonText animated style={{ width: '6rem' }}></IonSkeletonText>
      </IonLabel>
    </IonItem>
  </IonCard>
);

const GET_LISTING_SELLER = gql`
  query GetListing($id: ID!) {
    listing(id: $id) {
      id
      user {
        id
        name
        email
        schoolName
      }
    }
  }
`;
const ListingUser = ({ listingId }) => {
  const { loading, error, data } = useQuery<IQuery>(GET_LISTING_SELLER, {
    variables: { id: listingId },
  });
  if (loading) {
    return userLoading;
  }
  if (error) {
    return <Error value={error}></Error>;
  }
  const user = data!.listing!.user;
  return <UserInfo user={user} />;
};

export const UserDetails: React.FC<{
  listingId: string;
}> = ({ listingId }) => {
  const user = useUser();
  if (!user) {
    return userHidden;
  }

  return <ListingUser listingId={listingId}></ListingUser>;
};
