import { toAntdWebComponent } from '../../antdComponentWrapper';
import { TimeMap } from './TimeMap';

customElements.define('xif-time-map', toAntdWebComponent(TimeMap));
