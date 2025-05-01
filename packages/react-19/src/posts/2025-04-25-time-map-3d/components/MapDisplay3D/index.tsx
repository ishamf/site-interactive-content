import classNames from 'classnames';
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { MapDisplayComponent } from '../../../2025-02-17-time-map/TimeMap';
import { useEffect, useRef } from 'react';
import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from '../../constants';

export const MapDisplay3D: MapDisplayComponent = ({}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      console.error('Canvas ref is null');
      return;
    }

    const scene = new Scene();
    const camera = new PerspectiveCamera(75, DISPLAY_WIDTH / DISPLAY_HEIGHT, 0.1, 1000);

    const renderer = new WebGLRenderer({ canvas: canvasRef.current });

    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    renderer.setSize(DISPLAY_WIDTH, DISPLAY_HEIGHT, false);

    const controls = new OrbitControls(camera, renderer.domElement);

    let lastTime = performance.now();

    function animate(time: DOMHighResTimeStamp) {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      //   cube.rotation.x += Math.PI / 2 * delta;

      controls.update(delta);

      renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(animate);

    return () => {
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
    </figure>
  );
};
