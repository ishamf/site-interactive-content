import appStyles from './app-css';

type Remover = () => void;

export function createComponentExtender({ onConnect }: { onConnect?: () => Remover | void }) {
  return function extender(Element: any): any {
    class WrappedElement extends Element {
      onConnectRemover: Remover | undefined;

      constructor(...props: any) {
        super(...props);

        this.shadowRoot.adoptedStyleSheets = [appStyles];
      }

      connectedCallback() {
        super.connectedCallback?.();
        if (onConnect) {
          const remover = onConnect();

          if (remover) {
            this.onConnectRemover = remover;
          }
        }
      }

      disconnectedCallback() {
        super.disconnectedCallback?.();
        if (this.onConnectRemover) {
          this.onConnectRemover();
          this.onConnectRemover = undefined;
        }
      }
    }

    return WrappedElement;
  };
}

export const addComponentStylesheet = createComponentExtender({});
