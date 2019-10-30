import { SearchbarChangeEventDetail } from '@ionic/core';
import { IonButtons, IonSearchbar, IonToolbar } from '@ionic/react';
import * as React from 'react';
import { Scanner } from './scanner';

type SearchBarProps = {
  onSearch: (search: string) => void;
  searchValue?: string;
  onFocus?: (event: CustomEvent<void>) => void;
};
export class SearchBar extends React.PureComponent<SearchBarProps> {
  onChange = (e: CustomEvent<SearchbarChangeEventDetail>) => {
    if (typeof e.detail.value !== 'string') {
      return;
    }
    this.props.onSearch(e.detail.value);
  };

  render() {
    return (
      <IonToolbar color="white">
        <IonSearchbar
          value={this.props.searchValue || ''}
          onIonChange={this.onChange}
          debounce={500}
          onIonFocus={this.props.onFocus}
        />

        <IonButtons slot="end">
          <Scanner onScanned={this.props.onSearch} />
        </IonButtons>
      </IonToolbar>
    );
  }
}
