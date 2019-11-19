import { IonContent, IonPage } from '@ionic/react';
import React, { memo, useCallback } from 'react';
import { TopNav } from '../../components';
import { Container } from '../../components/container';
import { SearchBar } from '../../components/search-bar';
import { useRouter } from '../../state/router';
import { useSearch } from '../../state/search';
import { TopListings } from '../public/components/top-listings';

export const Explore = memo(function Explore() {
  const { onClick } = useSearch('/search');
  const { history } = useRouter();
  const toSearch = useCallback(() => history.push({ pathname: '/search' }), [
    history,
  ]);

  return (
    <IonPage>
      <TopNav title="Explore" homeHref="/explore" />

      <IonContent>
        <Container>
          <SearchBar onFocus={toSearch} searchValue="" />

          <TopListings onClick={onClick} />
        </Container>
      </IonContent>
    </IonPage>
  );
});
