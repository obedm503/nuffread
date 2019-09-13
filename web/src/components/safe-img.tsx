import * as React from 'react';
import { IonIcon } from '@ionic/react';

const useImage = (src?: string) => {
  const [error, setError] = React.useState<string | Event | undefined>(
    undefined,
  );
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!src) {
      return;
    }
    const img = new Image();

    img.src = src;
    img.onload = e => setLoading(false);
    img.onerror = e => setError(e);

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { loading, error };
};

export const SafeImg: React.FC<{
  src?: string;
  alt: string;
  slot?: string;
  placeholder: string | { ios: string; md: string };
  style?: React.CSSProperties;
}> = ({ placeholder, slot, alt, style, ...props }) => {
  const { error, loading } = useImage(props.src);

  let src = (error ? placeholder : props.src) || placeholder;
  src = loading ? placeholder : src;

  if (typeof src !== 'string') {
    return <IonIcon icon={src} style={style as any}></IonIcon>;
  }
  return (
    <img
      slot={slot}
      src={src}
      style={Object.assign({ width: 'auto' }, style)}
      alt={alt}
    />
  );
};
