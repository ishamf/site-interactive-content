import { useThree, useFrame } from '@react-three/fiber';
import { useRef, useEffect, useState } from 'react';
import { CanvasTexture } from 'three';

export function GlobeMaterial({
  canvasRef,
  isAnimating,
  renderedImageVersion,
}: {
  canvasRef: React.RefObject<OffscreenCanvas | null>;
  isAnimating: boolean;
  renderedImageVersion: number;
}) {
  const invalidate = useThree((s) => s.invalidate);

  const renderingStateRef = useRef({
    isAnimating,
    renderedImageVersion,
  });

  useEffect(() => {
    renderingStateRef.current.isAnimating = isAnimating;
    renderingStateRef.current.renderedImageVersion = renderedImageVersion;
    invalidate();
  }, [invalidate, isAnimating, renderedImageVersion]);

  const [texture, setTexture] = useState<CanvasTexture | null>(null);

  const prevImageVersionRef = useRef(-1);

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
  }, [canvasRef]);

  return texture ? (
    <meshBasicMaterial key="hasTexture" map={texture} color={'#ffffff'}></meshBasicMaterial>
  ) : (
    <meshBasicMaterial key="noTexture" color={'#000000'}></meshBasicMaterial>
  );
}
