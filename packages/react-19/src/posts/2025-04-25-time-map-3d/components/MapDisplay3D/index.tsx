/** @jsxImportSource @emotion/react */
import { useEffect, useRef, useState } from 'react';
import { css } from '@emotion/react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';

import { CanvasTexture } from 'three';

import { MapDisplayComponent } from '../../../2025-02-17-time-map/TimeMap';
import { canvasHeight, canvasWidth } from '../../../2025-02-17-time-map/constants';
import { useMapUpdater } from '../../../2025-02-17-time-map/components/MapDisplay/updater';
import { CircularProgress } from '@mui/material';
import classNames from 'classnames';

export const MapDisplay3D: MapDisplayComponent = ({
  time,
  renderBehavior,
  isTrackingCurrentTime,
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
          <sphereGeometry args={[3, 32, 32]} />
          <GlobeMaterial
            canvasRef={mapCanvasRef}
            isAnimating={isAnimating}
            renderedImageVersion={renderedImageVersion}
          />
        </mesh>
        <CameraControls />
      </Canvas>

      {isLoadingImages ? (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-neutral-900 flex items-center justify-center">
          <CircularProgress></CircularProgress>
        </div>
      ) : null}

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

function GlobeMaterial({
  canvasRef,
  isAnimating,
  renderedImageVersion,
}: {
  canvasRef: React.RefObject<OffscreenCanvas | null>;
  isAnimating: boolean;
  renderedImageVersion: number;
}) {
  const { invalidate } = useThree();

  const renderingStateRef = useRef({
    isAnimating,
    renderedImageVersion,
  });

  useEffect(() => {
    renderingStateRef.current.isAnimating = isAnimating;
    renderingStateRef.current.renderedImageVersion = renderedImageVersion;
    invalidate();
  }, [isAnimating, renderedImageVersion]);

  const [texture, setTexture] = useState<CanvasTexture | null>(null);

  const prevImageVersionRef = useRef(0);

  useFrame(() => {
    const needUpdate =
      renderingStateRef.current.isAnimating ||
      renderingStateRef.current.renderedImageVersion !== prevImageVersionRef.current;

    if (needUpdate && texture) {
      texture.needsUpdate = true;
    }

    if (renderingStateRef.current.renderedImageVersion !== prevImageVersionRef.current) {
      prevImageVersionRef.current = renderingStateRef.current.renderedImageVersion;
    }
  });

  useEffect(() => {
    if (!canvasRef.current) {
      console.error('Map canvas ref is null');
      return;
    }

    const texture = new CanvasTexture(canvasRef.current);

    setTexture(texture);

    return () => {
      texture.dispose();
    };
  }, []);

  return <meshBasicMaterial map={texture} color={'#ffffff'}></meshBasicMaterial>;
}
