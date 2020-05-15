import { IonSlide, IonSlides } from '@ionic/react';
import React from 'react';
import { SafeImg } from '../../../components';
import { IGoogleBook } from '../../../schema.gql';

export const CoverPicker: React.FC<{
  book: IGoogleBook;
  setCoverIndex: (index: number) => void;
  possibleCovers: string[];
  coverIndex: number;
}> = ({ book, setCoverIndex, possibleCovers, coverIndex }) => {
  const handleSlideChanged = React.useCallback(
    (e) => {
      const target = e.target;
      if (typeof target.getActiveIndex === 'function') {
        target.getActiveIndex().then((index) => {
          setCoverIndex(index);
        });
      }
    },
    [setCoverIndex],
  );
  const handleClick = (i) => () => setCoverIndex(i);

  const ref = React.useRef<HTMLIonSlidesElement>(null);
  const current = ref.current;
  React.useEffect(() => {
    if (current) {
      current.slideTo(coverIndex);
    }
  }, [current, coverIndex]);

  return (
    <div className="cover-picker">
      <IonSlides
        key={book.googleId}
        pager={false}
        onIonSlideWillChange={handleSlideChanged}
        ref={ref}
      >
        {possibleCovers.map((url) => (
          <IonSlide key={url}>
            <SafeImg
              src={url}
              alt={[book.title, book.subTitle].join(' ')}
              placeholder="/img/book.png"
              className="book-cover-card"
            />
          </IonSlide>
        ))}
      </IonSlides>

      <div className="pager">
        {possibleCovers.map((url, i) => (
          <button key={url} className="pager-item" onClick={handleClick(i)}>
            <SafeImg
              style={{
                borderColor:
                  coverIndex === i ? 'var(--ion-color-primary)' : 'white',
              }}
              className="image"
              src={url}
              alt={[book.title, book.subTitle].join(' ')}
              placeholder="/img/book.png"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
