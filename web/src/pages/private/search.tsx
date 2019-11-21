import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
} from '@ionic/react';
import React, { memo } from 'react';
import { Container, SearchBar, SearchListings } from '../../components';
import { useSearch } from '../../state/search';

export const Search = memo(function Search() {
  const { onClick, onSearch, searchValue } = useSearch('/search');
  return (
    <IonPage>
      <IonHeader>
        <Container className="no-padding">
          <SearchBar onChange={onSearch} searchValue={searchValue} autofocus>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/explore" />
            </IonButtons>
          </SearchBar>
        </Container>
      </IonHeader>

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
