import { BackSide } from 'three';
import skyboxImageRelativeUrl from '../assets/skymap-low.jpg?no-inline';
import { useTexture } from '@react-three/drei';

const skyboxImageUrl = new URL(skyboxImageRelativeUrl, import.meta.url).toString();

export function Skybox() {
  const { skyTexture } = useTexture({ skyTexture: skyboxImageUrl });

  return (
    <mesh>
      <sphereGeometry args={[1000, 64, 64]} />
      <meshBasicMaterial map={skyTexture} side={BackSide} color={'#ffffff'} />
    </mesh>
  );
}
