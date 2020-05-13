import { IonItem, IonLabel } from '@ionic/react';
import * as React from 'react';
import { IBook } from '../schema.gql';
import { ListWrapper } from './list-wrapper';

type Props = {
  books?: readonly IBook[];
  loading: boolean;
  onClick: (id: string) => void;
  title?: string;
  component: React.ComponentType<{
    onClick?: (id: string) => void;
    book: IBook;
  }> & {
    loading: JSX.Element[];
  };
};

export class Books extends React.PureComponent<Props> {
  render() {
    const {
      books,
      loading,
      title,
      component: Book,
      onClick: handleClick,
    } = this.props;

    if (loading) {
      return <ListWrapper title={title}>{Book.loading}</ListWrapper>;
    }

    if (!Array.isArray(books) || !books.length) {
      return (
        <ListWrapper title={title}>
          <IonItem color="white">
            <IonLabel>Found nothing...</IonLabel>
          </IonItem>
        </ListWrapper>
      );
    }

    return (
      <ListWrapper title={title}>
        {books.map(book => {
          if (!book) {
            return null;
          }
          return <Book key={book.id} onClick={handleClick} book={book} />;
        })}
      </ListWrapper>
    );
  }
}
