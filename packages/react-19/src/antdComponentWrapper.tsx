import r2wc from '@r2wc/react-to-web-component';

import { StyleProvider } from '@ant-design/cssinjs';
import '@ant-design/v5-patch-for-react-19';

import appStyles from './app-css';

function addAppStylesheet(Element: any): any {
  class WrappedElement extends Element {
    constructor(...props: any) {
      super(...props);

      this.shadowRoot.adoptedStyleSheets = [appStyles];
    }
  }

  return WrappedElement;
}

export function toAntdWebComponent(Component: any) {
  const AntdWrapperComponent = ({ container, ...rest }: { container: any }) => {
    return (
      <StyleProvider container={container}>
        <Component {...rest}></Component>
      </StyleProvider>
    );
  };

  return addAppStylesheet(r2wc(AntdWrapperComponent, { shadow: 'open' }));
}
