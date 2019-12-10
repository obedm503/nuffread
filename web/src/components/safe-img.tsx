import { IonIcon, IonSkeletonText } from '@ionic/react';
import * as React from 'react';

const useImage = (src?: string) => {
  const [{ error, loading }, setState] = React.useState<{
    error: string | Event | undefined;
    loading: boolean;
  }>({ error: undefined, loading: false });

  React.useEffect(() => {
    if (!src) {
      return;
    }
    const img = new Image();

    img.src = src;
    img.onload = e => setState({ error: undefined, loading: false });
    img.onerror = e => setState({ loading: false, error: e });

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { loading, error };
};

export const SafeImg = React.memo<{
  src?: string;
  alt: string;
  slot?: string;
  placeholder: string | { ios: string; md: string };
  style?: React.CSSProperties;
  className?: string;
}>(function SafeImg({ placeholder, slot, alt, style, className, ...props }) {
  const { error, loading } = useImage(props.src);

  if (loading) {
    return <IonSkeletonText animated className={className} style={style} />;
  }

  const src = (error ? placeholder : props.src) || placeholder;

  if (typeof src !== 'string') {
    return <IonIcon icon={src} style={style as any}></IonIcon>;
  }
  return (
    <img slot={slot} src={src} style={style} alt={alt} className={className} />
  );
});
