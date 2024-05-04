import appStyles from './app-css';

export function addComponentStylesheet(Element: any): any {
  class WrappedElement extends Element {
    constructor(...props: any) {
      super(...props);

      this.shadowRoot.adoptedStyleSheets = [appStyles];
    }
  }

  return WrappedElement;
}
