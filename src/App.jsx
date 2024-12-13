import { useRef } from 'react';
import { PhaserGame } from './game/PhaserGame';

/**
 * The main application component.
 * 
 * This component renders the `PhaserGame` component and manages the logic for scene transitions.
 * It uses a `useRef` hook to reference the `PhaserGame` instance.
 * 
 * @component
 * @returns {React.Element} The main application UI, containing the Phaser game.
 */
function App() {
  // Reference to the Phaser game instance.
  const phaserRef = useRef();

  /**
   * Handles the logic to run when the scene changes in the game.
   * 
   * @param {Object} scene - The new scene that is activated.
   * @returns {void}
   */
  const currentScene = (scene) => {
    // Logic to run on scene change (e.g., updating UI, state, etc.)
  }

  return (
    <div id="app">
      <PhaserGame ref={phaserRef} currentActiveScene={currentScene}/>
    </div>
  );
}

export default App;
