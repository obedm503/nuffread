import { SearchbarChangeEventDetail } from '@ionic/core';
import { IonSearchbar, IonToolbar, useIonViewDidEnter } from '@ionic/react';
import * as React from 'react';

export const DummySearchBar = React.memo<{
  onFocus?: () => void;
}>(function SearchBar({ onFocus }) {
  return (
    <IonToolbar color="white">
      <IonSearchbar
        placeholder="Search"
        onIonFocus={onFocus}
        inputMode="search"
      />

      {/* <IonButtons slot="end">
        <IonButton onClick={onFocus} color="primary">
          <IonIcon slot="icon-only" icon={qrScanner} />
        </IonButton>
      </IonButtons> */}
    </IonToolbar>
  );
});

type SearchBarProps = {
  onChange?: (search: string) => void;
  searchValue?: string;
  onFocus?: () => void;
  autofocus?: boolean;
};
export const SearchBar: React.FC<SearchBarProps> = React.memo(
  function SearchBar({
    autofocus = false,
    onChange,
    searchValue = '',
    onFocus,
    children,
  }) {
    const searchBar = React.useRef<HTMLIonSearchbarElement>(null);

    useIonViewDidEnter(() => {
      if (autofocus && searchBar.current) {
        searchBar.current.setFocus();
      }
    });

    // const onScan = React.useCallback(
    //   (value: string) => onChange && onChange(value),
    //   [onChange],
    // );

    const onIonChange = React.useCallback(
      (e: CustomEvent<SearchbarChangeEventDetail>) => {
        if (!onChange || typeof e.detail.value !== 'string') {
          return;
        }
        if (searchValue === e.detail.value) {
          return;
        }
        onChange(e.detail.value);
      },
      [onChange, searchValue],
    );

    return (
      <IonToolbar color="white">
        {children}

        <IonSearchbar
          placeholder="Search"
          debounce={800}
          ref={searchBar}
          onIonChange={onIonChange}
          value={searchValue}
          onIonFocus={onFocus}
          inputMode="search"
        />

        {/* <IonButtons slot="end">
          <Scanner onScanned={onScan} />
        </IonButtons> */}
      </IonToolbar>
    );
  },
);
