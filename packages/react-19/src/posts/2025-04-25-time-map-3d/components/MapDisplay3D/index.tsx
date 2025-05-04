/** @jsxImportSource @emotion/react */
import { Suspense, useEffect, useRef } from 'react';
import { css } from '@emotion/react';
import { Canvas } from '@react-three/fiber';
import '../../three';
import { CameraControls } from '@react-three/drei';
import { CircularProgress } from '@mui/material';
import classNames from 'classnames';

import { useElementSize } from '../../../../utils/hooks';
import { MapDisplayComponent } from '../../../2025-02-17-time-map/TimeMap';
import { canvasHeight, canvasWidth } from '../../../2025-02-17-time-map/constants';
import { useMapUpdater } from '../../../2025-02-17-time-map/components/MapDisplay/updater';
import { useTimeMapStore } from '../../../2025-02-17-time-map/store';
import { GlobeMaterial } from '../GlobeMaterial';
import { CityItemsRenderer } from '../CityItemsRenderer';
import { CityPinsRenderer } from '../CityPinsRenderer';
import { SPHERE_RADIUS } from '../../constants';
import { Skybox } from '../Skybox';

export const MapDisplay3D: MapDisplayComponent = ({
  time,
  renderBehavior,
  isTrackingCurrentTime,
  selectionDataById,
  onRowFocus,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapCanvasRef = useRef<OffscreenCanvas>(null);
  const liveLabelRef = useRef<HTMLDivElement>(null);

  const containerSize = useElementSize({ ref: canvasRef });

  const registerContainerSize = useTimeMapStore((state) => state.registerContainerSize);
  const setRecalculationDelay = useTimeMapStore((state) => state.setRecalculationDelay);
  const setObstructions = useTimeMapStore((state) => state.setObstructions);

  useEffect(() => {
    // For the 3D map, add a little delay since there's some camera damping
    // that can repeatedly trigger the recalculation
    setRecalculationDelay(100);
  }, [setRecalculationDelay]);

  if (!mapCanvasRef.current) {
    mapCanvasRef.current = new OffscreenCanvas(canvasWidth, canvasHeight);
  }

  const { isAnimating, renderedImageVersion, isLoadingImages } = useMapUpdater(
    mapCanvasRef,
    time,
    renderBehavior
  );

  const liveLabelSize = useElementSize({
    ref: liveLabelRef,
  });

  useEffect(() => {
    if (containerSize) {
      registerContainerSize(containerSize);
    }
    if (liveLabelRef.current && liveLabelSize) {
      const liveLabel = liveLabelRef.current;
      setObstructions([
        {
          top: liveLabel.offsetTop,
          left: liveLabel.offsetLeft,
          width: liveLabelSize.width,
          height: liveLabelSize.height,
        },
      ]);
    }
  }, [containerSize, liveLabelSize, registerContainerSize, setObstructions]);

  return (
    <figure className="relative flex-1 w-full overflow-hidden">
      <Canvas
        ref={canvasRef}
        flat
        gl={{ alpha: false }}
        frameloop={isAnimating ? 'always' : 'demand'}
      >
        {/* Globe */}
        <mesh>
          <sphereGeometry args={[SPHERE_RADIUS, 64, 64]} />
          <GlobeMaterial
            canvasRef={mapCanvasRef}
            isAnimating={isAnimating}
            renderedImageVersion={renderedImageVersion}
          />
        </mesh>

        {/* Skybox */}
        <Suspense fallback={null}>
          <Skybox></Skybox>
        </Suspense>

        <CityPinsRenderer selectionDataById={selectionDataById}></CityPinsRenderer>
        <CameraControls
          minDistance={SPHERE_RADIUS + 0.5}
          maxDistance={SPHERE_RADIUS * 2}
          truckSpeed={0}
        />
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
        ref={liveLabelRef}
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
