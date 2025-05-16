import React, { useRef, useState } from 'react';
import BaseConfigForm from './components/BaseConfigForm';
import NPCManager from './components/NPCManager';
import PhaserGameWrapper from './components/PhaserGameWrapper';

function App() {
  const phaserRef = useRef(null);
  const [baseConfig, setBaseConfig] = useState(null); // Step 1 config
  const [finalConfig, setFinalConfig] = useState(null); // Step 2 complete config

  const handleSceneChange = (scene) => {
    console.log('Scene changed');
  };

  const handleBaseConfigSubmit = (formData) => {
    if (formData.sim_type === 'replay') {
      // Skip NPC config and go straight to final config
      setFinalConfig(formData);
    } else {
      // Continue to NPCManager step
      setBaseConfig(formData);
    }
  };

  const handleNPCConfigSubmit = (npc_config) => {
    setFinalConfig({ ...baseConfig, ...npc_config });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-white p-6">
      <h1 className="text-5xl font-extrabold mb-6 drop-shadow-lg">Agent Simulator</h1>

      {!baseConfig && !finalConfig ? (
        <BaseConfigForm onSubmit={handleBaseConfigSubmit} />
      ) : !finalConfig ? (
        <NPCManager baseConfig={baseConfig} onSubmit={handleNPCConfigSubmit} />
      ) : (
        <PhaserGameWrapper
          finalConfig={finalConfig}
          phaserRef={phaserRef}
          handleSceneChange={handleSceneChange}
        />
      )}
    </div>
  );
}

export default App;
