import { useEffect, useRef, useState } from 'react';
import { Vector3 } from 'three';
import { SPHERE_RADIUS } from '../constants';
import {
  getSunAndEarthStateAtTime,
  linearlyInterpolateSunAndEarthState,
} from '../../2025-02-17-time-map/math';
import { RenderBehavior, SunAndEarthState } from '../../2025-02-17-time-map/types';
import { useThree } from '@react-three/fiber';
import { spring } from 'motion';
import { MAP_ANIMATION_DURATION } from '../../2025-02-17-time-map/constants';

function getPositionFromState(sunAndEarthState: SunAndEarthState): Vector3 {
  const longitude = sunAndEarthState.rightAscension - sunAndEarthState.gmstHours * 15;
  const latitude = sunAndEarthState.declination;

  const longitudeRadians = (longitude * Math.PI) / 180;
  const latitudeRadians = (latitude * Math.PI) / 180;

  const radius = SPHERE_RADIUS + 0.2;

  const y = Math.sin(latitudeRadians) * radius;
  const hRad = Math.cos(latitudeRadians) * radius;
  const x = Math.cos(longitudeRadians) * hRad;
  const z = -Math.sin(longitudeRadians) * hRad;

  return new Vector3(x, y, z);
}

export function SunPin({ time, renderBehavior }: { time: number; renderBehavior: RenderBehavior }) {
  const prevTimeRef = useRef(time);

  const invalidate = useThree((state) => state.invalidate);

  const [position, setPosition] = useState(() => new Vector3());

  useEffect(() => {
    const prevTime = prevTimeRef.current;
    prevTimeRef.current = time;

    if (renderBehavior === 'animated') {
      const startingState = getSunAndEarthStateAtTime(prevTime);
      const endingState = getSunAndEarthStateAtTime(time);

      const springGenerator = spring({
        keyframes: [0, 1],
        visualDuration: MAP_ANIMATION_DURATION / 1000,
        bounce: 0,
      });

      setPosition(getPositionFromState(startingState));

      const animationStart = Date.now();

      function animateMap() {
        const currentTime = Date.now();

        const delta = currentTime - animationStart;

        const { value, done } = springGenerator.next(delta);

        const animatedSolarState = linearlyInterpolateSunAndEarthState(
          startingState,
          endingState,
          value
        );

        if (done) {
          setPosition(getPositionFromState(endingState));
        } else {
          setPosition(getPositionFromState(animatedSolarState));

          animationCallback = requestAnimationFrame(animateMap);
        }
      }

      let animationCallback = requestAnimationFrame(animateMap);

      return () => {
        cancelAnimationFrame(animationCallback);
      };
    } else {
      const sunAndEarthState = getSunAndEarthStateAtTime(time);
      setPosition(getPositionFromState(sunAndEarthState));
    }
  }, [time, renderBehavior, invalidate]);

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]}></sphereGeometry>
        <meshBasicMaterial color={'#ffffff'}></meshBasicMaterial>
      </mesh>
    </group>
  );
}
