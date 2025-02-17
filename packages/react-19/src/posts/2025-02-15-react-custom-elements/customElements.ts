import { toAntdWebComponent } from '../../antdComponentWrapper';
import { TestComponent } from './TestComponent';

customElements.define('xif-react-test-component', toAntdWebComponent(TestComponent));
