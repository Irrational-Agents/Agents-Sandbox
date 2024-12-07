import { useRef } from 'react';

import { PhaserGame } from './game/PhaserGame';

function App () {

    const phaserRef = useRef();

    const currentScene = (scene) => {
        // Logic to run on scene change
    }
    return (
        <div id="app">
            <h1>Hello</h1>
            {/* <PhaserGame ref={phaserRef} currentActiveScene={currentScene}/> */}
        </div>
    )
}

export default App
