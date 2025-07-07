import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./App.css";
import { CameraController } from "./components/CameraController";
import Map from "./components/Map";
import { Rick, type RickRef } from "./components/Rick";
import Menu from "./menus/Menu";
import Options from "./menus/Options";

type GameState = "menu" | "playing" | "options";

interface GameSettings {
  jumpKey: string;
  leftKey: string;
  rightKey: string;
  volume: number;
}

const defaultSettings: GameSettings = {
  jumpKey: "KeyZ",
  leftKey: "KeyQ",
  rightKey: "KeyD",
  volume: 50,
};

function App() {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const rickRef = useRef<RickRef>(null);
  const [cameraTarget, setCameraTarget] = useState(new THREE.Vector3(0, 0, 0));

  // Charger les paramètres depuis localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("rockEtMirtySettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Recharger les paramètres quand on revient au jeu depuis les options
  useEffect(() => {
    if (gameState === "playing") {
      const savedSettings = localStorage.getItem("rockEtMirtySettings");
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    }
  }, [gameState]);

  // Mettre à jour la position de la caméra en temps réel
  useEffect(() => {
    if (gameState === "playing") {
      const updateCameraTarget = () => {
        if (rickRef.current) {
          const position = rickRef.current.getPosition();
          setCameraTarget(position);
        }
        requestAnimationFrame(updateCameraTarget);
      };
      
      updateCameraTarget();
    }
  }, [gameState]);

  // Formater le nom de la touche pour l'affichage (même fonction que dans Options.tsx)
  const formatKeyName = (keyCode: string) => {
    const keyMap: { [key: string]: string } = {
      Space: "Espace",
      ArrowLeft: "← Gauche",
      ArrowRight: "→ Droite",
      ArrowUp: "↑ Haut",
      ArrowDown: "↓ Bas",
      KeyW: "W",
      KeyA: "A",
      KeyS: "S",
      KeyD: "D",
      KeyZ: "Z",
      KeyQ: "Q",
    };
    return keyMap[keyCode] || keyCode.replace("Key", "");
  };

  const handlePlay = () => {
    setGameState("playing");
  };

  const handleOptions = () => {
    setGameState("options");
  };

  const handleBackToMenu = () => {
    setGameState("menu");
  };

  return (
    <>
      {/* Interface de jeu avec React Three Fiber */}
      {gameState === "playing" && (
        <>
          <Canvas camera={{ position: [10, 7, 18], fov: 60 }} shadows>
            <ambientLight intensity={0.6} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1} 
              castShadow 
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <Map />
            <Rick ref={rickRef} />
            <CameraController target={cameraTarget} />
            {/* OrbitControls désactivé pour laisser le contrôle à CameraController */}
            {/* <OrbitControls enableZoom={false} enableRotate={false} /> */}
          </Canvas>

          {/* Bouton pause/menu en jeu */}
          <button
            onClick={handleBackToMenu}
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              padding: "0.5rem 1rem",
              fontSize: "1rem",
              fontWeight: "bold",
              color: "#fff",
              background: "rgba(0,0,0,0.7)",
              border: "2px solid #fff",
              borderRadius: "8px",
              cursor: "pointer",
              zIndex: 100,
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.2)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.7)";
            }}
          >
            📱 Menu
          </button>

          {/* Instructions de jeu avec touches configurées */}
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              color: "#fff",
              background: "rgba(0,0,0,0.7)",
              padding: "1rem",
              borderRadius: "8px",
              fontSize: "0.9rem",
              zIndex: 100,
            }}
          >
            <p style={{ margin: "0 0 0.5rem 0" }}>🎮 Contrôles :</p>
            <p style={{ margin: "0 0 0.3rem 0" }}>
              • {formatKeyName(settings.leftKey)} /{" "}
              {formatKeyName(settings.rightKey)} : Se déplacer
            </p>
            <p style={{ margin: "0 0 0.3rem 0" }}>
              • {formatKeyName(settings.jumpKey)} : Sauter
            </p>
            <p style={{ margin: "0" }}>• Plateformes orange : Super saut !</p>
          </div>

          {/* Indicateur de position pour debug (optionnel) */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              color: "#fff",
              background: "rgba(0,0,0,0.5)",
              padding: "0.5rem",
              borderRadius: "5px",
              fontSize: "0.8rem",
              zIndex: 100,
            }}
          >
            Rick: ({cameraTarget.x.toFixed(1)}, {cameraTarget.y.toFixed(1)}, {cameraTarget.z.toFixed(1)})
          </div>
        </>
      )}

      {/* Menu principal */}
      {gameState === "menu" && (
        <Menu onPlay={handlePlay} onOptions={handleOptions} />
      )}

      {/* Menu options */}
      {gameState === "options" && <Options onBack={handleBackToMenu} />}
    </>
  );
}

export default App;
