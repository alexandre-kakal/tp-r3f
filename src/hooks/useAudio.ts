import { useCallback, useEffect, useRef, useState } from "react";

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

export function useAudio() {
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  
  // Séparer musique de fond et effets sonores
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const jumpSoundRef = useRef<HTMLAudioElement | null>(null);
  
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  // Charger les paramètres depuis localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("rockEtMirtySettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Initialiser la musique de fond
  useEffect(() => {
    try {
      backgroundMusicRef.current = new Audio("/song/theme2.mp3");
      backgroundMusicRef.current.loop = true;
      backgroundMusicRef.current.volume = settings.volume / 100;
      backgroundMusicRef.current.preload = "auto";

      const music = backgroundMusicRef.current;
      
      const handleMusicEnd = () => {
        if (isMusicPlaying) {
          music.currentTime = 0;
          music.play().catch(console.error);
        }
      };

      const handleMusicError = (e: Event) => {
        console.error("Erreur musique de fond:", e);
        setAudioError("Erreur de chargement de la musique");
        setIsMusicPlaying(false);
      };

      const handleCanPlay = () => {
        setAudioError(null);
        console.log("Musique de fond prête");
      };

      music.addEventListener('ended', handleMusicEnd);
      music.addEventListener('error', handleMusicError);
      music.addEventListener('canplay', handleCanPlay);

      return () => {
        if (backgroundMusicRef.current) {
          backgroundMusicRef.current.removeEventListener('ended', handleMusicEnd);
          backgroundMusicRef.current.removeEventListener('error', handleMusicError);
          backgroundMusicRef.current.removeEventListener('canplay', handleCanPlay);
          backgroundMusicRef.current.pause();
          backgroundMusicRef.current = null;
        }
      };
    } catch (error) {
      console.error("Erreur lors de la création de l'audio:", error);
      setAudioError("Impossible de créer l'instance audio");
    }
  }, [isMusicPlaying]);

  // Initialiser les effets sonores
  useEffect(() => {
    try {
      jumpSoundRef.current = new Audio("/song/jump.mp3");
      jumpSoundRef.current.volume = settings.volume / 100;
      jumpSoundRef.current.preload = "auto";

      return () => {
        if (jumpSoundRef.current) {
          jumpSoundRef.current.pause();
          jumpSoundRef.current = null;
        }
      };
    } catch (error) {
      console.error("Erreur lors de la création du son de saut:", error);
    }
  }, []);

  // Mettre à jour le volume
  useEffect(() => {
    const savedSettings = localStorage.getItem("rockEtMirtySettings");
    if (savedSettings) {
      const newSettings = JSON.parse(savedSettings);
      setSettings(newSettings);
      
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.volume = newSettings.volume / 100;
      }
      
      if (jumpSoundRef.current) {
        jumpSoundRef.current.volume = newSettings.volume / 100;
      }
    }
  }, []);

  // Fonction pour activer l'audio (nécessaire pour les navigateurs modernes)
  const enableAudio = useCallback(async () => {
    try {
      if (backgroundMusicRef.current) {
        // Essayer de jouer un peu de silence pour débloquer l'audio
        backgroundMusicRef.current.muted = true;
        await backgroundMusicRef.current.play();
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current.muted = false;
        backgroundMusicRef.current.currentTime = 0;
        setIsAudioEnabled(true);
        setAudioError(null);
        console.log("Audio activé avec succès");
      }
    } catch (error) {
      console.error("Erreur lors de l'activation de l'audio:", error);
      setAudioError("Erreur d'activation audio");
    }
  }, []);

  // Fonctions pour contrôler la musique de fond
  const playBackgroundMusic = useCallback(async () => {
    if (!backgroundMusicRef.current) return;
    
    try {
      // Activer l'audio si ce n'est pas encore fait
      if (!isAudioEnabled) {
        await enableAudio();
      }

      if (settings.volume > 0) {
        setIsMusicPlaying(true);
        backgroundMusicRef.current.currentTime = 0;
        backgroundMusicRef.current.volume = settings.volume / 100;
        
        const playPromise = backgroundMusicRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          console.log("Musique de fond démarrée");
        }
      }
    } catch (error) {
      console.error("Erreur lors du lancement de la musique:", error);
      setAudioError("Impossible de lancer la musique");
      setIsMusicPlaying(false);
    }
  }, [settings.volume, isAudioEnabled, enableAudio]);

  const stopBackgroundMusic = useCallback(() => {
    setIsMusicPlaying(false);
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current.currentTime = 0;
      console.log("Musique de fond arrêtée");
    }
  }, []);

  // Fonction pour jouer les effets sonores
  const playJumpSound = useCallback(async () => {
    if (!jumpSoundRef.current || settings.volume === 0) return;
    
    try {
      // Activer l'audio si ce n'est pas encore fait
      if (!isAudioEnabled) {
        await enableAudio();
      }

      const jumpSound = jumpSoundRef.current.cloneNode() as HTMLAudioElement;
      jumpSound.volume = settings.volume / 100;
      jumpSound.currentTime = 0;
      await jumpSound.play();
    } catch (error) {
      console.error("Erreur lors du son de saut:", error);
    }
  }, [settings.volume, isAudioEnabled, enableAudio]);

  const updateVolume = useCallback((newVolume: number) => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = newVolume / 100;
    }
    
    if (jumpSoundRef.current) {
      jumpSoundRef.current.volume = newVolume / 100;
    }
  }, []);

  // Test de la musique de fond
  const testBackgroundMusic = useCallback(async () => {
    try {
      await enableAudio();
      await playBackgroundMusic();
      
      // Arrêter après 3 secondes pour le test
      setTimeout(() => {
        stopBackgroundMusic();
      }, 3000);
    } catch (error) {
      console.error("Erreur test musique:", error);
    }
  }, [enableAudio, playBackgroundMusic, stopBackgroundMusic]);

  return {
    // Musique de fond
    playBackgroundMusic,
    stopBackgroundMusic,
    testBackgroundMusic,
    isMusicPlaying,
    
    // Effets sonores
    playJumpSound,
    
    // Contrôles généraux
    updateVolume,
    enableAudio,
    isAudioEnabled,
    audioError,
    volume: settings.volume,
  };
} 