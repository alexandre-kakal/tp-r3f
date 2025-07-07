import { useMemo } from "react";

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

function Platform({ x, y, type }: { x: number; y: number; type: string }) {
  if (type === "hole") return null;
  const color = type === "jumppad" ? "orange" : "gray";
  // Calcul précis pour la colonne
  const colonneTop = y - PLATFORM_HEIGHT / 2;
  const colonneBottom = GROUND_Y;
  const colonneHeight = colonneTop - colonneBottom;
  const colonneY = colonneBottom + colonneHeight / 2;
  return (
    <>
      {/* Plateforme */}
      <mesh position={[x, y, 0]}>
        <boxGeometry args={[PLATFORM_WIDTH, PLATFORM_HEIGHT, PLATFORM_DEPTH]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Colonne de soutien (mêmes dimensions que la plateforme, bien alignée) */}
      <mesh position={[x, colonneY, 0]}>
        <boxGeometry args={[PLATFORM_WIDTH, colonneHeight, PLATFORM_DEPTH]} />
        <meshStandardMaterial color={"#888"} />
      </mesh>
    </>
  );
}

function Ground() {
  // Sol de référence (plan fin)
  return (
    <mesh position={[60, GROUND_Y - 0.26, 0]} receiveShadow>
      <boxGeometry
        args={[MAP_LENGTH * (PLATFORM_WIDTH + 1), 0.5, PLATFORM_DEPTH * 2]}
      />
      <meshStandardMaterial color="#444" />
    </mesh>
  );
}

function Map() {
  const map = useMemo(() => generateMap(), []);
  return (
    <>
      <Ground />
      {map.map((tile: { x: number; y: number; type: string }, i: number) => (
        <Platform key={i} x={tile.x} y={tile.y} type={tile.type} />
      ))}
    </>
  );
}

export default Map;
