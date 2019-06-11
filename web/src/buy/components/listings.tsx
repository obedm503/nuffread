import { IonContent, IonList } from '@ionic/react';
import { Omit } from 'lodash';
import * as React from 'react';
import { RouteComponentProps, RouteProps } from 'react-router';
import { Footer, Routes } from '../../components';
import { Listing } from '../../components/listing';
import { SearchBar } from '../../components/search-bar';
import { IBook, IListing } from '../../schema.gql';
import { IsDesktop } from '../../state/desktop';
import { Nav } from './nav';

type IListings = Array<IListing | IBook>;
type Props = {
  id?: string;
  listings: IListings;
  onClick;
  base: string;
  component: (props: { id: string; base: string }) => React.ReactNode;
  onSearch;
  searchValue?: string;
};

class List extends React.PureComponent<
  Omit<Props, 'component' | 'onSearch' | 'searchValue'>
> {
  onClick = id => () => this.props.onClick(id);
  render() {
    return (
      <IonList>
        {this.props.listings.map((listing, i) => {
          if (!listing) {
            return null;
          }
          return (
            <Listing
              key={listing.id}
              priceColor={i === 0 ? 'success' : undefined}
              onClick={this.onClick(listing.id)}
              listing={listing}
            />
          );
        })}
      </IonList>
    );
  }
}

const Desktop: React.SFC<Props> = ({
  component,
  id,
  base,
  onSearch,
  searchValue = '',
  ...props
}) => {
  return (
    <>
      <Nav>
        <SearchBar onSearch={onSearch} searchValue={searchValue} />
      </Nav>

      <IonContent>
        <div id="results-container">
          <div className={id ? 'half' : ''}>
            <List {...props} id={id} base={base} />
          </div>

          {id ? <div>{component({ id, base })}</div> : null}
        </div>
      </IonContent>

      <Footer />
    </>
  );
};

const MobileDetail: React.SFC<RouteComponentProps & Props> = ({
  component,
  id,
  base,
  listings,
}) => {
  if (!id) {
    return null;
  }
  const listing = listings.find(item => item.id === id);
  if (!listing) {
    return null;
  }
  return (
    <>
      <Nav title={listing.title} />

      <IonContent>{component({ id, base })}</IonContent>
    </>
  );
};

const MobileList: React.SFC<RouteComponentProps & Props> = ({
  base,
  id,
  listings,
  onClick,
  onSearch,
  searchValue = '',
}) => {
  return (
    <>
      <Nav>
        <SearchBar onSearch={onSearch} searchValue={searchValue} />
      </Nav>

      <IonContent>
        <List base={base} id={id} listings={listings} onClick={onClick} />
      </IonContent>
      <Footer />
    </>
  );
};

const routes: RouteProps[] = [
  {
    path: '/:listingId',
    exact: true,
    component: MobileDetail,
  },
  {
    path: '/',
    exact: true,
    component: MobileList,
  },
];
export class Listings extends React.PureComponent<Props> {
  render() {
    return (
      <IsDesktop>
        {({ isDesktop }) => {
          if (isDesktop) {
            return <Desktop {...this.props} />;
          }
          return <Routes routes={routes} props={this.props} />;
        }}
      </IsDesktop>
    );
  }
}
