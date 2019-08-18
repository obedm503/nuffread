import {
  IonBadge,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonSkeletonText,
} from '@ionic/react';
import { range } from 'lodash';
import * as React from 'react';
import { SafeImg } from '../../../components/safe-img';
import { IListing } from '../../../schema.gql';

type IListings = Array<IListing>;
type Props = {
  listings?: IListings;
  loading: boolean;
  onClick;
  title?: string;
};

// @ts-ignore
const Label = ({ children }) => <ion-label text-wrap>{children}</ion-label>;

const listingPlaceholders = range(10).map(n => (
  <IonItem key={n}>
    <IonSkeletonText
      slot="start"
      animated
      style={{ width: '128px', height: '180px' }} // 9:6 aspect ratio
    />
    <Label>
      <IonSkeletonText animated style={{ width: '90%' }} />
      <IonSkeletonText animated style={{ width: '60%' }} />
      <IonSkeletonText animated style={{ width: '50%' }} />
    </Label>
  </IonItem>
));

const wrapper = (title, children) => (
  <IonList>
    {title ? (
      <IonListHeader>
        <IonLabel>{title}</IonLabel>
      </IonListHeader>
    ) : null}

    {children}
  </IonList>
);

const Listing: React.FC<{ onClick; listing: IListing }> = ({
  onClick,
  listing,
}) => (
  <IonItem button onClick={onClick}>
    <SafeImg
      src={listing.book.thumbnail}
      alt={listing.book.title}
      placeholder="/img/book.png"
      slot="start"
    />
    <Label text-wrap>
      {listing.book.title}
      <br />

      {listing.book.subTitle ? (
        <>
          <small>{listing.book.subTitle}</small>
          <br />
        </>
      ) : null}

      <small>{listing.book.authors.join(', ')}</small>
      <br />
      <IonBadge color="secondary">${listing.price / 100}</IonBadge>
    </Label>
  </IonItem>
);

export class Listings extends React.PureComponent<Props> {
  onClick = id => () => {
    this.props.onClick(id);
  };
  render() {
    const { listings, loading, title } = this.props;

    if (loading || !Array.isArray(listings)) {
      return wrapper(title, listingPlaceholders);
    }

    if (!listings.length) {
      return wrapper(
        title,
        <IonItem color="white">
          <IonLabel>Found nothing...</IonLabel>
        </IonItem>,
      );
    }

    return wrapper(
      title,
      listings.map((listing, i) => {
        if (!listing) {
          return null;
        }
        return (
          <Listing
            key={listing.id}
            onClick={this.onClick(listing.id)}
            listing={listing}
          />
        );
      }),
    );
  }
}
