import { useEffect, useState } from 'react';
import { useAudio } from '../hooks/useAudio';
import './Options.css';

interface OptionsProps {
  onBack: () => void;
}

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

function Options({ onBack }: OptionsProps) {
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [isRecording, setIsRecording] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { 
    updateVolume, 
    playJumpSound, 
    testBackgroundMusic, 
    enableAudio, 
    isAudioEnabled, 
    audioError,
    isMusicPlaying
  } = useAudio();

  // Charger les paramètres depuis localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('rockEtMirtySettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Sauvegarder les paramètres dans localStorage
  const saveSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    localStorage.setItem('rockEtMirtySettings', JSON.stringify(newSettings));
    
    // Mettre à jour le volume audio en temps réel
    updateVolume(newSettings.volume);
  };

  // Vérifier si une touche est déjà utilisée
  const isKeyAlreadyUsed = (keyCode: string, currentKeyType: string) => {
    const keyTypes = ['jumpKey', 'leftKey', 'rightKey'] as const;
    return keyTypes.some(keyType => 
      keyType !== currentKeyType && settings[keyType] === keyCode
    );
  };

  // Obtenir le nom de l'action qui utilise déjà cette touche
  const getActionUsingKey = (keyCode: string) => {
    if (settings.jumpKey === keyCode) return 'Saut';
    if (settings.leftKey === keyCode) return 'Gauche';
    if (settings.rightKey === keyCode) return 'Droite';
    return '';
  };

  // Gérer l'enregistrement des touches
  const handleKeyRecord = (keyType: 'jumpKey' | 'leftKey' | 'rightKey') => {
    setIsRecording(keyType);
    setErrorMessage(null); // Effacer les erreurs précédentes
  };

  // Écouter les touches pressées pour l'enregistrement
  useEffect(() => {
    if (!isRecording) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      event.preventDefault();
      
      // Vérifier si la touche est déjà utilisée
      if (isKeyAlreadyUsed(event.code, isRecording)) {
        const actionName = getActionUsingKey(event.code);
        setErrorMessage(`⚠️ Cette touche est déjà utilisée pour "${actionName}" !`);
        setIsRecording(null);
        
        // Effacer le message d'erreur après 3 secondes
        setTimeout(() => {
          setErrorMessage(null);
        }, 3000);
        return;
      }

      // Si la touche n'est pas utilisée, l'assigner
      const newSettings = { ...settings, [isRecording]: event.code };
      saveSettings(newSettings);
      setIsRecording(null);
      setErrorMessage(null);

      // Test du son de saut si on configure la touche de saut
      if (isRecording === 'jumpKey') {
        playJumpSound();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRecording, settings, playJumpSound]);

  // Formater le nom de la touche pour l'affichage
  const formatKeyName = (keyCode: string) => {
    const keyMap: { [key: string]: string } = {
      'Space': '🚀 Espace',
      'ArrowLeft': '⬅️ Gauche',
      'ArrowRight': '➡️ Droite',
      'ArrowUp': '⬆️ Haut',
      'ArrowDown': '⬇️ Bas',
      'KeyW': '🔤 W',
      'KeyA': '🔤 A',
      'KeyS': '🔤 S',
      'KeyD': '🔤 D',
      'KeyZ': '🔤 Z',
      'KeyQ': '🔤 Q'
    };
    return keyMap[keyCode] || `🔤 ${keyCode.replace('Key', '')}`;
  };

  // Obtenir la classe CSS pour le bouton
  const getKeyButtonClass = (keyType: string) => {
    const baseClass = 'key-button';
    if (isRecording === keyType) return `${baseClass} key-button-recording`;
    if (keyType === 'jumpKey') return `${baseClass} key-button-normal`;
    return `${baseClass} key-button-${keyType === 'leftKey' ? 'left' : 'right'}`;
  };

  // Gérer le changement de volume avec preview
  const handleVolumeChange = (newVolume: number) => {
    const newSettings = { ...settings, volume: newVolume };
    saveSettings(newSettings);
  };

  // Tester l'audio
  const handleTestJump = async () => {
    if (!isAudioEnabled) {
      await enableAudio();
    }
    playJumpSound();
  };

  const handleTestMusic = async () => {
    if (!isAudioEnabled) {
      await enableAudio();
    }
    testBackgroundMusic();
  };

  return (
    <div className="options-container">
      {/* Titre */}
      <h1 className="options-title">
        OPTIONS
      </h1>

      {/* Configuration des touches */}
      <div className="options-section">
        <h2 className="section-title">
          🎮 Configuration des touches
        </h2>

        {/* Touche Saut */}
        <div className="control-row">
          <span className="control-label" data-emoji="🚀">Saut :</span>
          <button
            onClick={() => handleKeyRecord('jumpKey')}
            className={getKeyButtonClass('jumpKey')}
          >
            {isRecording === 'jumpKey' ? '👆 Appuyez...' : formatKeyName(settings.jumpKey)}
          </button>
        </div>

        {/* Touche Gauche */}
        <div className="control-row">
          <span className="control-label" data-emoji="⬅️">Gauche :</span>
          <button
            onClick={() => handleKeyRecord('leftKey')}
            className={getKeyButtonClass('leftKey')}
          >
            {isRecording === 'leftKey' ? '👆 Appuyez...' : formatKeyName(settings.leftKey)}
          </button>
        </div>

        {/* Touche Droite */}
        <div className="control-row">
          <span className="control-label" data-emoji="➡️">Droite :</span>
          <button
            onClick={() => handleKeyRecord('rightKey')}
            className={getKeyButtonClass('rightKey')}
          >
            {isRecording === 'rightKey' ? '👆 Appuyez...' : formatKeyName(settings.rightKey)}
          </button>
        </div>
      </div>

      {/* Configuration du volume */}
      <div className="options-section">
        <h2 className="section-title">
          🔊 Volume et Audio
        </h2>

        <div className="volume-container">
          <span style={{ fontSize: '1.3rem', fontWeight: '700' }}>🔈 Volume :</span>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.volume}
            onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
            className="volume-slider"
          />
          <span className="volume-value">
            {settings.volume}% 🔊
          </span>
        </div>

        {/* Statut audio */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '1rem', 
          fontSize: '0.9rem',
          opacity: 0.8 
        }}>
          {settings.volume === 0 && "🔇 Audio désactivé"}
          {settings.volume > 0 && settings.volume <= 25 && "🔉 Volume faible"}
          {settings.volume > 25 && settings.volume <= 75 && "🔊 Volume modéré"}
          {settings.volume > 75 && "📢 Volume élevé"}
        </div>

        {/* Diagnostic audio */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '1rem',
          borderRadius: '10px',
          marginTop: '1rem',
          fontSize: '0.9rem'
        }}>
          <p style={{ margin: '0.5rem 0' }}>
            📊 Audio activé: {isAudioEnabled ? '✅ Oui' : '❌ Non'}
          </p>
          <p style={{ margin: '0.5rem 0' }}>
            🎵 Musique: {isMusicPlaying ? '🔊 En cours' : '🔇 Arrêtée'}
          </p>
          {audioError && (
            <p style={{ margin: '0.5rem 0', color: '#ff6b6b' }}>
              ⚠️ Erreur: {audioError}
            </p>
          )}
        </div>

        {/* Boutons de test */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '1rem',
          justifyContent: 'center'
        }}>
          <button
            onClick={handleTestJump}
            style={{
              padding: '0.8rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '700',
              color: '#fff',
              background: 'linear-gradient(45deg, #4CAF50, #45a049)',
              border: '2px solid #fff',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🎵 Test Son Saut
          </button>

          <button
            onClick={handleTestMusic}
            style={{
              padding: '0.8rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '700',
              color: '#fff',
              background: 'linear-gradient(45deg, #2196F3, #1976D2)',
              border: '2px solid #fff',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🎶 Test Musique (3s)
          </button>
        </div>

        {!isAudioEnabled && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'rgba(255, 165, 0, 0.2)',
            borderRadius: '10px',
            border: '2px solid #FFA500',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: '700' }}>
              ⚠️ Audio non activé
            </p>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
              Cliquez sur un bouton de test pour activer l'audio
            </p>
            <button
              onClick={enableAudio}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '1rem',
                fontWeight: '700',
                color: '#fff',
                background: '#FFA500',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🔓 Activer l'Audio
            </button>
          </div>
        )}
      </div>

      {/* Message d'erreur */}
      {errorMessage && (
        <div className="error-message">
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Instructions */}
      {isRecording && !errorMessage && (
        <div className="recording-instructions">
          <p>
            🎯 Appuyez sur la touche que vous souhaitez utiliser pour "
            {isRecording === 'jumpKey' ? '🚀 Saut' : 
             isRecording === 'leftKey' ? '⬅️ Gauche' : '➡️ Droite'}"
          </p>
        </div>
      )}

      {/* Bouton Retour */}
      <button
        onClick={onBack}
        className="back-button"
      >
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;← Retour au menu
      </button>
    </div>
  );
}

export default Options;
