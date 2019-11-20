import { IonBackButton, IonButtons, IonContent, IonPage } from '@ionic/react';
import React, { memo } from 'react';
import { TopNav } from '../../components';
import { Container } from '../../components/container';
import { SearchBar } from '../../components/search-bar';
import { useSearch } from '../../state/search';
import { SearchListings } from '../public/components/search-results';

export const Search = memo(function Search() {
  const { onClick, onSearch, searchValue } = useSearch('/search');
  return (
    <IonPage>
      <TopNav
        title="Search"
        homeHref="/explore"
        toolbar={
          <Container className="no-v-padding">
            <SearchBar
              onChange={onSearch}
              searchValue={searchValue}
              autofocus
            />
          </Container>
        }
      >
        <IonButtons slot="start">
          <IonBackButton defaultHref="/explore" />
        </IonButtons>
      </TopNav>

      <IonContent>
        <Container>
          {searchValue ? (
            <SearchListings onClick={onClick} searchValue={searchValue} />
          ) : null}
        </Container>
      </IonContent>
    </IonPage>
  );
});
