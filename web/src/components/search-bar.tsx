import { SearchbarChangeEventDetail } from '@ionic/core';
import { IonSearchbar, IonToolbar } from '@ionic/react';
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
      <IonToolbar color="primary">
        <IonSearchbar
          color="light"
          value={this.props.searchValue}
          onIonChange={this.onChange}
          debounce={500}
        />

        <Scanner onScanned={this.props.onSearch} />
      </IonToolbar>
    );
  }
}
