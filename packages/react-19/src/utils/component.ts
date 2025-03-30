import appStyles from '../app-css';

export function addAppStylesheet(Element: any): any {
  class WrappedElement extends Element {
    constructor(...props: any) {
      super(...props);

      this.shadowRoot.adoptedStyleSheets = [appStyles];
    }
  }

  return WrappedElement;
}
