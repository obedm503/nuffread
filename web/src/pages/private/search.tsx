import { IonBackButton, IonButtons, IonContent, IonPage } from '@ionic/react';
import React, { memo } from 'react';
import { Container, SearchBar, SearchListings, TopNav } from '../../components';
import { useSearch } from '../../state/search';

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
