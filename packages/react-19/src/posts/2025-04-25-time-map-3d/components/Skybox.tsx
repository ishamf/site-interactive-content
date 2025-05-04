import { BackSide } from 'three';
import skyboxImage from '../assets/skymap-low.jpg?no-inline';
import { useTexture } from '@react-three/drei';

export function Skybox() {
  const { skyTexture } = useTexture({ skyTexture: skyboxImage });

  return (
    <mesh>
      <sphereGeometry args={[1000, 64, 64]} />
      <meshBasicMaterial map={skyTexture} side={BackSide} color={'#ffffff'} />
    </mesh>
  );
}
