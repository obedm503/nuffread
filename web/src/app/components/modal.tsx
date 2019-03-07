import * as React from 'react';

declare var document;

type Props = {
  active: boolean;
  title: string;
  children: any;
  save?: (e: any) => void;
  cancel: () => void;
};

export class Modal extends React.PureComponent<Props> {
  esc = e => {
    if (!this.props.cancel) {
      return;
    }
    // @ts-ignore
    const isClick = e.nativeEvent instanceof MouseEvent;
    // @ts-ignore
    const isEsc = e instanceof KeyboardEvent && e.key === 'Escape';

    if (isClick || isEsc) {
      e.preventDefault();
      e.stopPropagation();
      this.props.cancel();
    }
  };
  componentDidMount() {
    document.addEventListener('keydown', this.esc, false);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.esc, false);
  }

  render() {
    const { active, title, children, save } = this.props;
    return (
      <div className={`modal ${active ? 'is-active' : ''}`}>
        <div className="modal-background" onClick={this.esc} />
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">{title}</p>
            <button className="delete" aria-label="close" onClick={this.esc} />
          </header>
          <section className="modal-card-body">{children}</section>
          <footer className="modal-card-foot">
            <button className="button is-success" onClick={save}>
              Save
            </button>
            <button
              className="button"
              onClick={this.esc}
              style={{ marginLeft: 'auto' }}
            >
              Cancel
            </button>
          </footer>
        </div>
      </div>
    );
  }
}
