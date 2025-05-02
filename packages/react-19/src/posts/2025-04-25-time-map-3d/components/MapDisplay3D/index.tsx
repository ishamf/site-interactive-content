/** @jsxImportSource @emotion/react */
import { useRef } from 'react';
import { css } from '@emotion/react';
import { Canvas } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';

import { MapDisplayComponent } from '../../../2025-02-17-time-map/TimeMap';
import { canvasHeight, canvasWidth } from '../../../2025-02-17-time-map/constants';
import { useMapUpdater } from '../../../2025-02-17-time-map/components/MapDisplay/updater';
import { CircularProgress } from '@mui/material';
import classNames from 'classnames';
import { GlobeMaterial } from '../GlobeMaterial';
import { CityItemsRenderer } from '../CityItemsRenderer';
import { CityPinsRenderer } from '../CityPinsRenderer';
import { SPHERE_RADIUS } from '../../constants';

export const MapDisplay3D: MapDisplayComponent = ({
  time,
  renderBehavior,
  isTrackingCurrentTime,
  selectionDataById,
  onRowFocus,
}) => {
  const mapCanvasRef = useRef<OffscreenCanvas>(null);

  if (!mapCanvasRef.current) {
    mapCanvasRef.current = new OffscreenCanvas(canvasWidth, canvasHeight);
  }

  const { isAnimating, renderedImageVersion, isLoadingImages } = useMapUpdater(
    mapCanvasRef,
    time,
    renderBehavior
  );

  return (
    <figure className="w-full relative aspect-[2] h-auto">
      <Canvas flat gl={{ alpha: false }} frameloop={isAnimating ? 'always' : 'demand'}>
        <mesh>
          <sphereGeometry args={[SPHERE_RADIUS, 64, 64]} />
          <GlobeMaterial
            canvasRef={mapCanvasRef}
            isAnimating={isAnimating}
            renderedImageVersion={renderedImageVersion}
          />
        </mesh>
        <CityPinsRenderer selectionDataById={selectionDataById}></CityPinsRenderer>
        <CameraControls minDistance={SPHERE_RADIUS + 0.5} />
      </Canvas>

      {isLoadingImages ? (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-neutral-900 flex items-center justify-center">
          <CircularProgress></CircularProgress>
        </div>
      ) : null}

      <CityItemsRenderer
        time={time}
        selectionDataById={selectionDataById}
        onRowFocus={onRowFocus}
      ></CityItemsRenderer>

      <div
        className={classNames(
          'absolute top-1 right-1 text-red-500 text-xs font-bold contain-content',
          {
            invisible: !isTrackingCurrentTime,
          }
        )}
        css={css`
          z-index: 10;

          &::before {
            content: '';
            position: absolute;
            z-index: -1;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #000;
            opacity: 0.6;
            filter: blur(3px);
            padding: 0.05rem 0.2rem;
            margin: -0.05rem -0.2rem;
          }
        `}
      >
        <span>LIVE</span>
      </div>
    </figure>
  );
};
