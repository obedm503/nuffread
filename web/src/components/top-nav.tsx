import {
  IonButtons,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { personCircleOutline, searchOutline } from 'ionicons/icons';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Optional } from '../util.types';
import { Container } from './container';
import { IonButtonLink } from './ionic';

type TitleProps = Pick<
  React.ComponentPropsWithRef<typeof IonTitle>,
  'title' | 'size'
> & {
  homeHref: Optional<string>;
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

export class NavBar extends React.PureComponent<{
  start?: React.ReactNode;
  end?: React.ReactNode;
  children?: never;
  title: string;
}> {
  render() {
    const { title, start, end } = this.props;
    return (
      <IonHeader>
        <Container className="no-padding">
          <IonToolbar color="white">
            {start}

            <IonTitle color="primary">nuffread</IonTitle>
            <Helmet>
              <title>{title} | nuffread</title>
            </Helmet>

            {typeof end !== 'undefined' ? (
              end
            ) : (
              <IonButtons slot="end">
                <IonButtonLink href="/search">
                  <IonIcon icon={searchOutline} ariaLabel="Search" />
                </IonButtonLink>
                <IonButtonLink href="/profile">
                  <IonIcon icon={personCircleOutline} ariaLabel="Profile" />
                </IonButtonLink>
              </IonButtons>
            )}
          </IonToolbar>
        </Container>
      </IonHeader>
    );
  }
}
