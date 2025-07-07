import './Menu.css';

interface MenuProps {
  onPlay: () => void;
  onOptions: () => void;
}

function Menu({ onPlay, onOptions }: MenuProps) {
  return (
    <div className="menu-container">
      {/* Titre du jeu */}
      <h1 className="game-title">
        ROCK ET MIRTY
      </h1>

      {/* Boutons du menu */}
      <div className="menu-buttons">
        <button
          onClick={onPlay}
          className="menu-button play-button"
        >
          🎮 JOUER
        </button>

        <button
          onClick={onOptions}
          className="menu-button options-button"
        >
          ⚙️ OPTIONS
        </button>
      </div>

      {/* Instructions */}
      <div className="menu-instructions">
        <p className="instruction-text">
          <span className="instruction-emoji">🎯</span>
          Utilisez Q et D pour vous déplacer
        </p>
        <p className="instruction-text">
          <span className="instruction-emoji">🚀</span>
          Appuyez sur Z pour sauter !
        </p>
        <p className="instruction-text">
          <span className="instruction-emoji">⭐</span>
          Sautez sur les plateformes orange pour aller plus haut !
        </p>
      </div>
    </div>
  );
}

export default Menu;
