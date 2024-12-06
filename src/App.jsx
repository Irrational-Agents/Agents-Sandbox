import { useRef, useState } from 'react';

import Phaser from 'phaser';
import { PhaserGame } from './game/PhaserGame';

function App ()
{

    const phaserRef = useRef();

    const currentScene = (scene) => {
        // Logic to run on scene change
    }
    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene}/>
        </div>
    )
}

export default App
