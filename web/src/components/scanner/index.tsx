import { IonButton, IonIcon, IonPopover } from '@ionic/react';
import { qrScanner } from 'ionicons/icons';
import { get } from 'lodash';
import Quagga from 'quagga';
import * as React from 'react';
import './scanner.scss';

function hasGetUserMedia() {
  return !!(
    (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ||
    navigator['webkitGetUserMedia'] ||
    navigator['mozGetUserMedia'] ||
    navigator['msGetUserMedia']
  );
}

class QuaggaScanner extends React.PureComponent<{ onScanned; close }> {
  componentDidMount() {
    if (!this.el) {
      return;
    }
    Quagga.init(
      {
        inputStream: {
          target: this.el,
          type: 'LiveStream',
          constraints: {
            width: 240,
            height: 240,
            facingMode: 'environment', // or user
          },
        },
        numOfWorkers: 2,
        decoder: {
          readers: [
            {
              format: 'ean_reader',
              config: {
                supplements: ['ean_5_reader', 'ean_2_reader'],
              },
            },
            'ean_reader',
          ],
        },
        locate: true,
        locator: {
          patchSize: 'x-large', // x-small, small, medium, large, x-large
          halfSample: true,
        },
        debug: false,
        frequency: 1,
      },
      err => {
        if (err) {
          this.props.close();
          return console.error(err);
        }
        Quagga.start();
      },
    );
    Quagga.onDetected(this.onDetected);
  }

  componentWillUnmount() {
    Quagga.offDetected(this.onDetected);
    Quagga.stop();
  }

  onDetected = result => {
    const code: string = get(result, 'codeResult.code');
    if (!code) {
      return;
    }
    this.props.onScanned(code);
  };

  el?: HTMLDivElement;
  setRef = el => {
    this.el = el;
  };

  render() {
    return <div className="scan" ref={this.setRef} />;
  }
}

export class Scanner extends React.PureComponent<{
  onScanned: (code: string) => void;
}> {
  onScanned = (code: string) => {
    this.close();
    this.props.onScanned(code);
  };

  state = { open: false };
  toggle = () => this.setState({ open: !this.state.open });
  close = () => this.setState({ open: false });

  render() {
    if (!hasGetUserMedia()) {
      return null;
    }

    return (
      <IonButton onClick={this.toggle} color="primary">
        <IonIcon slot="icon-only" icon={qrScanner} />

        <IonPopover isOpen={this.state.open} onDidDismiss={this.close}>
          {this.state.open ? (
            <div className="scanner">
              <QuaggaScanner onScanned={this.onScanned} close={this.close} />

              <IonIcon icon={qrScanner} />
            </div>
          ) : null}
        </IonPopover>
      </IonButton>
    );
  }
}
