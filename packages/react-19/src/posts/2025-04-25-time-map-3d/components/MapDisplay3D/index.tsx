import classNames from 'classnames';
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  MeshBasicMaterial,
  Mesh,
  SphereGeometry,
  CanvasTexture,
  SRGBColorSpace,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { MapDisplayComponent } from '../../../2025-02-17-time-map/TimeMap';
import { useEffect, useRef } from 'react';
import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from '../../constants';
import { canvasHeight, canvasWidth } from '../../../2025-02-17-time-map/constants';
import { useMapUpdater } from '../../../2025-02-17-time-map/components/MapDisplay/updater';
import { CircularProgress } from '@mui/material';

export const MapDisplay3D: MapDisplayComponent = ({ time, renderBehavior }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapCanvasRef = useRef<OffscreenCanvas>(null);

  if (!mapCanvasRef.current) {
    mapCanvasRef.current = new OffscreenCanvas(canvasWidth, canvasHeight);
  }

  const { isAnimating, isRendering, isLoadingImages } = useMapUpdater(
    mapCanvasRef,
    time,
    renderBehavior
  );

  const renderingStateRef = useRef({
    isAnimating,
    isRendering,
  });

  useEffect(() => {
    renderingStateRef.current.isAnimating = isAnimating;
    renderingStateRef.current.isRendering = isRendering;
  }, [isAnimating, isRendering]);

  useEffect(() => {
    if (!canvasRef.current) {
      console.error('Canvas ref is null');
      return;
    }

    if (!mapCanvasRef.current) {
      console.error('Map canvas ref is null');
      return;
    }

    const scene = new Scene();
    const camera = new PerspectiveCamera(75, DISPLAY_WIDTH / DISPLAY_HEIGHT, 0.1, 1000);

    const renderer = new WebGLRenderer({ canvas: canvasRef.current });

    const geometry = new SphereGeometry(10, 32, 16);
    const texture = new CanvasTexture(mapCanvasRef.current);
    texture.colorSpace = SRGBColorSpace;
    const material = new MeshBasicMaterial({ map: texture, color: 0xffffff });
    const cube = new Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 20;

    renderer.setSize(DISPLAY_WIDTH, DISPLAY_HEIGHT, false);

    const controls = new OrbitControls(camera, renderer.domElement);

    let lastTime = performance.now();

    let prevRendering = renderingStateRef.current.isRendering;

    function animate(time: DOMHighResTimeStamp) {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      controls.update(delta);

      const needUpdate =
        renderingStateRef.current.isAnimating ||
        renderingStateRef.current.isRendering ||
        (prevRendering && !renderingStateRef.current.isRendering);

      if (needUpdate) {
        texture.needsUpdate = true;
      }

      prevRendering = renderingStateRef.current.isRendering;

      renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(animate);

    return () => {
      renderer.setAnimationLoop(null);
      texture.dispose();
      material.dispose();
      geometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <figure className="max-w-full relative">
      <canvas
        ref={canvasRef}
        className={classNames('max-w-full select-none touch-pinch-zoom', {})}
        width={DISPLAY_WIDTH}
        height={DISPLAY_HEIGHT}
      ></canvas>
      {isLoadingImages ? (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-neutral-900 flex items-center justify-center">
          <CircularProgress></CircularProgress>
        </div>
      ) : null}
    </figure>
  );
};
