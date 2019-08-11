import { SearchbarChangeEventDetail } from '@ionic/core';
import { IonButtons, IonSearchbar, IonToolbar } from '@ionic/react';
import * as React from 'react';
import { Scanner } from './scanner';

type SearchBarProps = {
  onSearch: (search: string) => void;
  searchValue: string;
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
          color="light"
          // stick with ios search style because of color differences
          mode="ios"
          value={this.props.searchValue}
          onIonChange={this.onChange}
          debounce={500}
        />

        <IonButtons slot="end">
          <Scanner onScanned={this.props.onSearch} />
        </IonButtons>
      </IonToolbar>
    );
  }
}
