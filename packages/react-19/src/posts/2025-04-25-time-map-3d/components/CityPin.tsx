import { useEffect, useMemo, useState } from 'react';
import { CitySelectionData } from '../../2025-02-17-time-map/assets';
import { useCityProjectedPositions } from '../store';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { SPHERE_RADIUS } from '../constants';

export function CityPin({ city }: { city: CitySelectionData }) {
  const position = useMemo(() => {
    const longitudeRadians = (city.longitude * Math.PI) / 180;
    const latitudeRadians = (city.latitude * Math.PI) / 180;

    const radius = SPHERE_RADIUS + 0.001;

    const y = Math.sin(latitudeRadians) * radius;
    const hRad = Math.cos(latitudeRadians) * radius;
    const x = Math.cos(longitudeRadians) * hRad;
    const z = -Math.sin(longitudeRadians) * hRad;

    return new Vector3(x, y, z);
  }, [city]);

  const updateCityPosition = useCityProjectedPositions((s) => s.updateCityPosition);
  const removeCityPosition = useCityProjectedPositions((s) => s.removeCityPosition);

  useEffect(() => {
    return () => {
      removeCityPosition(city.id);
    };
  }, [city, removeCityPosition]);

  const camera = useThree((s) => s.camera);

  const [vectorCache] = useState(() => ({
    screenPos: new Vector3(),
    camToGlobe: new Vector3(),
    camToPoint: new Vector3(),
    distPoint: new Vector3(),
    offPoint: new Vector3(),
  }));

  useFrame(() => {
    const { screenPos, camToGlobe, camToPoint, distPoint, offPoint } = vectorCache;

    screenPos.copy(position).project(camera);

    const xPercentage = ((screenPos.x + 1) / 2) * 100;
    const yPercentage = (1 - (screenPos.y + 1) / 2) * 100;

    const outOfBounds =
      xPercentage < 0 || xPercentage > 100 || yPercentage < 0 || yPercentage > 100;

    const cameraDistance = camera.position.length();

    const theta = Math.asin(SPHERE_RADIUS / cameraDistance);

    camToGlobe.copy(camera.position).negate();
    camToPoint.copy(position).sub(camera.position);
    distPoint.copy(camToPoint).projectOnVector(camToGlobe);
    offPoint.copy(camToPoint).sub(distPoint);

    const distTangentLength = cameraDistance - Math.sin(theta) * SPHERE_RADIUS;

    const distPointLength = distPoint.length();
    const offPointLength = offPoint.length();

    const isBehindGlobe =
      distPointLength > distTangentLength && offPointLength < distPointLength * Math.tan(theta);

    updateCityPosition(city.id, {
      x: xPercentage,
      y: yPercentage,
      hidden: outOfBounds || isBehindGlobe,
    });
  });

  return null;
  //   return (
  //     <group position={position}>
  //       <mesh>
  //         <sphereGeometry args={[0.01, 8, 8]}></sphereGeometry>
  //         <meshBasicMaterial color={'red'}></meshBasicMaterial>
  //       </mesh>
  //     </group>
  //   );
}
