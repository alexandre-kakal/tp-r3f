import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface CameraControllerProps {
  target: THREE.Vector3;
}

export function CameraController({ target }: CameraControllerProps) {
  const { camera } = useThree();
  const cameraPosition = useRef(new THREE.Vector3(10, 7, 18));
  const cameraLookAt = useRef(new THREE.Vector3(0, 2, 0));

  useFrame(() => {
    // Position idéale de la caméra relative au joueur
    const idealPosition = new THREE.Vector3(
      target.x + 10,  // Décalage sur X (côté)
      target.y + 7,   // Décalage sur Y (hauteur)
      target.z + 18   // Décalage sur Z (distance)
    );

    // Point où la caméra doit regarder (légèrement au-dessus de Rick)
    const idealLookAt = new THREE.Vector3(
      target.x,
      target.y + 2,
      target.z
    );

    // Interpolation douce pour la position (plus rapide pour suivre le mouvement)
    cameraPosition.current.lerp(idealPosition, 0.05);
    camera.position.copy(cameraPosition.current);

    // Interpolation douce pour la direction du regard
    cameraLookAt.current.lerp(idealLookAt, 0.05);
    camera.lookAt(cameraLookAt.current);

    // Mise à jour de la matrice de la caméra
    camera.updateMatrixWorld();
  });

  return null;
} 