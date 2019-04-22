import { debounce } from 'lodash';
import * as React from 'react';
import { IonSearchbar } from '@ionic/react';

type SearchBarProps = {
  onSearch: (search: string) => void;
  searchValue: string;
};
export class SearchBar extends React.PureComponent<SearchBarProps> {
  onSearch: any;
  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!this.onSearch) {
      this.onSearch = debounce(this.props.onSearch, 500);
    }
    this.onSearch && this.onSearch(e.target.value);
  };

  render() {
    const { searchValue } = this.props;
    return (
      <IonSearchbar color="light">

        {/* <HeroBody style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
          <Container>
            <Field hasAddons style={{ width: '100%' }}>
              <Control>
                <Button>
                  <IonIcon name="qr-scanner" />
                </Button>
              </Control>

              <Control hasIcons isExpanded>
                <IonIcon name="search" size="small" align="left" />
                <Input
                  placeholder="Find your book"
                  onChange={this.onChange}
                  defaultValue={searchValue}
                />
              </Control>

              <Control>
                <Button>Search</Button>
              </Control>
            </Field>
          </Container>
        </HeroBody> */}
      </IonSearchbar>
    );
  }
}
