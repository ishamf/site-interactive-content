import r2wc from '@r2wc/react-to-web-component';

import '@ant-design/v5-patch-for-react-19';
import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider, theme } from 'antd';
import { useMediaQuery } from 'usehooks-ts';

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
    const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    return (
      <StyleProvider container={container}>
        <ConfigProvider
          theme={{
            algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
          }}
        >
          <Component {...rest}></Component>
        </ConfigProvider>
      </StyleProvider>
    );
  };

  return addAppStylesheet(r2wc(AntdWrapperComponent, { shadow: 'open' }));
}
