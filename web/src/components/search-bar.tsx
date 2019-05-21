import { SearchbarChangeEventDetail } from '@ionic/core';
import { IonSearchbar, IonToolbar } from '@ionic/react';
import { debounce } from 'lodash';
import * as React from 'react';
import { Scanner } from './scanner';

type SearchBarProps = {
  onSearch: (search: string) => void;
  searchValue: string;
};
export class SearchBar extends React.PureComponent<SearchBarProps> {
  onSearch = debounce((code: string) => {
    this.props.onSearch(code);
  }, 500);

  onChange = (e: CustomEvent<SearchbarChangeEventDetail>) => {
    if (!e.detail.value || !this.onSearch) {
      return;
    }
    this.onSearch(e.detail.value);
  };

  render() {
    return (
      <IonToolbar color="primary">
        <IonSearchbar
          color="light"
          value={this.props.searchValue}
          onIonChange={this.onChange}
        />

        <Scanner onScanned={this.onSearch} />
      </IonToolbar>
    );
  }
}
