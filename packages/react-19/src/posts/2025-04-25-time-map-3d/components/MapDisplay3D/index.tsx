import classNames from 'classnames';
import { canvasHeight, canvasWidth } from '../../../2025-02-17-time-map/constants';
import { MapDisplayComponent } from '../../../2025-02-17-time-map/TimeMap';

export const MapDisplay3D: MapDisplayComponent = ({}) => {
  return (
    <figure className="max-w-full relative">
      <canvas
        className={classNames('max-w-full select-none touch-pinch-zoom', {})}
        width={canvasWidth}
        height={canvasHeight}
      ></canvas>
    </figure>
  );
};
