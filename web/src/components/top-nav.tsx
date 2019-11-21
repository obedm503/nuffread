import { IonHeader, IonTitle, IonToolbar } from '@ionic/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Container } from './container';

type TitleProps = Pick<
  React.ComponentPropsWithRef<typeof IonTitle>,
  'title' | 'size'
> & {
  homeHref: string | false;
};
export const Title = React.memo<TitleProps>(function Title({
  homeHref: href,
  title = 'nuffread',
  size,
}) {
  return (
    <>
      <IonTitle color="primary" size={size}>
        {href === false ? (
          title
        ) : (
          <Link to={href} style={{ textDecoration: 'none' }}>
            {title}
          </Link>
        )}
      </IonTitle>
      <Helmet>
        <title>{title}</title>
      </Helmet>
    </>
  );
});

type Props = {
  toolbar?: React.ReactNode;
} & TitleProps;
export class TopNav extends React.PureComponent<Props> {
  render() {
    const { children, toolbar = null, homeHref, title } = this.props;
    return (
      <IonHeader>
        <Container className="no-padding">
          <IonToolbar color="white">
            <Title title={title} homeHref={homeHref} />
            {children}
          </IonToolbar>

          {toolbar}
        </Container>
      </IonHeader>
    );
  }
}
