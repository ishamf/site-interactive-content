import { useMemo } from 'react';
import { Vector3 } from 'three';
import { SPHERE_RADIUS } from '../constants';
import { getSunAndEarthStateAtTime } from '../../2025-02-17-time-map/math';

export function SunPin({ time }: { time: number }) {
  const position = useMemo(() => {
    const sunAndEarthState = getSunAndEarthStateAtTime(time);

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
  }, [time]);

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]}></sphereGeometry>
        <meshBasicMaterial color={'#ffffff'}></meshBasicMaterial>
      </mesh>
    </group>
  );
}
