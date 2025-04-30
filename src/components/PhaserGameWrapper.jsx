// PhaserGameWrapper.js
import React from 'react';
import { PhaserGame } from '../game/PhaserGame';

const PhaserGameWrapper = ({ finalConfig, phaserRef, handleSceneChange }) => {
  return (
    <div className="w-full h-screen overflow-hidden flex justify-center items-center">
      <PhaserGame
        ref={phaserRef}
        currentActiveScene={handleSceneChange}
        config={finalConfig}
      />
    </div>
  );
};

export default PhaserGameWrapper;
