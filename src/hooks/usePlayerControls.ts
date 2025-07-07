import { useEffect, useState } from "react";

interface GameSettings {
  jumpKey: string;
  leftKey: string;
  rightKey: string;
  volume: number;
}

interface Controls {
  moveLeft: boolean;
  moveRight: boolean;
  jump: boolean;
}

const defaultSettings: GameSettings = {
  jumpKey: "KeyZ",
  leftKey: "KeyQ",
  rightKey: "KeyD",
  volume: 50,
};

export function usePlayerControls() {
  const [controls, setControls] = useState<Controls>({
    moveLeft: false,
    moveRight: false,
    jump: false,
  });
  
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);

  // Charger les paramètres depuis localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("rockEtMirtySettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case settings.leftKey:
          setControls((prev) => ({ ...prev, moveLeft: true }));
          break;
        case settings.rightKey:
          setControls((prev) => ({ ...prev, moveRight: true }));
          break;
        case settings.jumpKey:
          setControls((prev) => ({ ...prev, jump: true }));
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case settings.leftKey:
          setControls((prev) => ({ ...prev, moveLeft: false }));
          break;
        case settings.rightKey:
          setControls((prev) => ({ ...prev, moveRight: false }));
          break;
        case settings.jumpKey:
          setControls((prev) => ({ ...prev, jump: false }));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [settings]);

  return controls;
} 