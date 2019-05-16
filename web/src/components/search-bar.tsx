import { SearchbarChangeEventDetail } from '@ionic/core';
import {
  IonButton,
  IonButtons,
  IonIcon,
  IonSearchbar,
  IonToolbar,
} from '@ionic/react';
import { debounce } from 'lodash';
import * as React from 'react';

type SearchBarProps = {
  onSearch: (search: string) => void;
  searchValue: string;
};
export class SearchBar extends React.PureComponent<SearchBarProps> {
  onSearch: any;
  onChange = (e: CustomEvent<SearchbarChangeEventDetail>) => {
    if (!this.onSearch) {
      this.onSearch = debounce(this.props.onSearch, 500);
    }
    this.onSearch && this.onSearch(e.detail.value);
  };

  render() {
    const { searchValue } = this.props;
    return (
      <IonToolbar color="primary">
        <IonSearchbar
          color="light"
          value={searchValue}
          onIonChange={this.onChange}
        />

        <IonButtons slot="end">
          <IonButton color="light">
            <IonIcon slot="icon-only" name="qr-scanner" />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    );
  }
}
