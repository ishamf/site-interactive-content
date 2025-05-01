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

  const { isAnimating, isRendering, isLoadingImages } = useMapUpdater(
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
            isRendering={isRendering}
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
  isRendering,
}: {
  canvasRef: React.RefObject<OffscreenCanvas | null>;
  isAnimating: boolean;
  isRendering: boolean;
}) {
  const renderingStateRef = useRef({
    isAnimating,
    isRendering,
  });

  useEffect(() => {
    renderingStateRef.current.isAnimating = isAnimating;
    renderingStateRef.current.isRendering = isRendering;
  }, [isAnimating, isRendering]);

  const [texture, setTexture] = useState<CanvasTexture | null>(null);

  const prevRenderingRef = useRef(false);

  useFrame(() => {
    const needUpdate =
      renderingStateRef.current.isAnimating ||
      renderingStateRef.current.isRendering ||
      (prevRenderingRef.current && !renderingStateRef.current.isRendering);

    if (needUpdate && texture) {
      texture.needsUpdate = true;
    }

    prevRenderingRef.current = renderingStateRef.current.isRendering;
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
