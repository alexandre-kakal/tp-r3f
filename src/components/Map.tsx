import { useMemo, useRef, useEffect } from "react";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

// Paramètres de la map
const MAP_LENGTH = 120; // nombre de cases
const PLATFORM_WIDTH = 2;
const PLATFORM_HEIGHT = 0.5;
const PLATFORM_DEPTH = 2;
const JUMPPAD_GAP = 3; // espace supplémentaire après un jump pad
const NORMAL_GAP = 0; // espace normal entre plateformes
const MAX_PLATFORM_Y = 6; // hauteur max d'une plateforme
const GROUND_Y = -2; // niveau du sol de référence

// Probabilités
const HOLE_PROB = 0.2; // 20% de trous
const JUMPPAD_PROB = 0.15; // 15% de jump pads

function generateMap() {
  const map = [];
  let x = 0;
  let prevY = 0;
  for (let i = 0; i < MAP_LENGTH; i++) {
    let type = "normal";
    if (i !== 0 && Math.random() < HOLE_PROB) {
      type = "hole";
    } else if (i !== 0 && Math.random() < JUMPPAD_PROB) {
      type = "jumppad";
    }
    // Hauteur contrôlée : max 1 de différence avec la précédente, bornée à [0, MAX_PLATFORM_Y]
    let y = 0;
    if (i === 0) {
      y = 0;
    } else if (type !== "hole") {
      const minY = Math.max(0, prevY - 1);
      const maxY = Math.min(MAX_PLATFORM_Y, prevY + 1);
      y = Math.round(Math.random() * (maxY - minY) + minY);
    }
    if (type !== "hole") prevY = y;
    map.push({ x, y, type });
    // Calcul du prochain x
    if (type === "jumppad") {
      x += PLATFORM_WIDTH + JUMPPAD_GAP;
    } else {
      x += PLATFORM_WIDTH + NORMAL_GAP;
    }
  }
  return map;
}

function Map() {
  const map = useMemo(() => generateMap(), []);
  const normalCount = map.filter((tile) => tile.type === "normal").length;
  const jumpPadCount = map.filter((tile) => tile.type === "jumppad").length;

  // InstancedMesh refs
  const normalRef = useRef<THREE.InstancedMesh>(null);
  const jumpPadRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    let normalIdx = 0;
    let jumpPadIdx = 0;
    map.forEach((tile) => {
      if (tile.type === "hole") return;
      // Plateforme
      const matrix = new THREE.Matrix4().makeTranslation(tile.x, tile.y, 0);
      if (tile.type === "normal" && normalRef.current) {
        normalRef.current.setMatrixAt(normalIdx++, matrix);
      } else if (tile.type === "jumppad" && jumpPadRef.current) {
        jumpPadRef.current.setMatrixAt(jumpPadIdx++, matrix);
      }
    });
    if (normalRef.current) normalRef.current.instanceMatrix.needsUpdate = true;
    if (jumpPadRef.current)
      jumpPadRef.current.instanceMatrix.needsUpdate = true;
  }, [map]);

  return (
    <>
      <Ground />
      {/* Plateformes normales */}
      <RigidBody type="fixed" colliders="cuboid">
        <instancedMesh
          ref={normalRef}
          args={[undefined, undefined, normalCount]}
        >
          <boxGeometry
            args={[PLATFORM_WIDTH, PLATFORM_HEIGHT, PLATFORM_DEPTH]}
          />
          <meshStandardMaterial color="gray" />
        </instancedMesh>
      </RigidBody>
      {/* Jump pads */}
      <RigidBody type="fixed" colliders="cuboid">
        <instancedMesh
          ref={jumpPadRef}
          args={[undefined, undefined, jumpPadCount]}
        >
          <boxGeometry
            args={[PLATFORM_WIDTH, PLATFORM_HEIGHT, PLATFORM_DEPTH]}
          />
          <meshStandardMaterial color="orange" />
        </instancedMesh>
      </RigidBody>
      {/* Colonnes individuelles pour chaque plateforme (hauteur variable) */}
      {map.map((tile, i) => {
        if (tile.type === "hole") return null;
        const colonneTop = tile.y - PLATFORM_HEIGHT / 2;
        const colonneBottom = GROUND_Y;
        const colonneHeight = colonneTop - colonneBottom;
        const colonneY = colonneBottom + colonneHeight / 2;
        return (
          <RigidBody type="fixed" colliders="cuboid" key={i}>
            <mesh position={[tile.x, colonneY, 0]}>
              <boxGeometry
                args={[PLATFORM_WIDTH, colonneHeight, PLATFORM_DEPTH]}
              />
              <meshStandardMaterial color="#888" />
            </mesh>
          </RigidBody>
        );
      })}
    </>
  );
}

function Ground() {
  // Sol de référence (plan fin)
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh position={[60, GROUND_Y - 0.26, 0]} receiveShadow>
        <boxGeometry
          args={[MAP_LENGTH * (PLATFORM_WIDTH + 1), 0.5, PLATFORM_DEPTH * 2]}
        />
        <meshStandardMaterial color="#444" />
      </mesh>
    </RigidBody>
  );
}

export default Map;
