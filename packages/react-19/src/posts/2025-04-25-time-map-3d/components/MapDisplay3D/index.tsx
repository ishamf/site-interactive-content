import { Canvas, useFrame } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';

import { CanvasTexture } from 'three';

import { MapDisplayComponent } from '../../../2025-02-17-time-map/TimeMap';
import { useEffect, useRef, useState } from 'react';
import { canvasHeight, canvasWidth } from '../../../2025-02-17-time-map/constants';
import { useMapUpdater } from '../../../2025-02-17-time-map/components/MapDisplay/updater';
import { CircularProgress } from '@mui/material';

export const MapDisplay3D: MapDisplayComponent = ({ time, renderBehavior }) => {
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
    <figure className="max-w-full relative aspect-[2] h-auto">
      <Canvas flat gl={{ alpha: false }}>
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
  const renderingStateRef = useRef({
    isAnimating,
    renderedImageVersion,
  });

  useEffect(() => {
    renderingStateRef.current.isAnimating = isAnimating;
    renderingStateRef.current.renderedImageVersion = renderedImageVersion;
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
