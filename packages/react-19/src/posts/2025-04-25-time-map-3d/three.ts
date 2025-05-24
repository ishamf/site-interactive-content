// Import only the necessary modules from three.js and register it with react-three-fiber

import { extend } from '@react-three/fiber';
import { Mesh, SphereGeometry, MeshBasicMaterial, Group } from 'three';
extend({ Mesh, SphereGeometry, MeshBasicMaterial, Group });
