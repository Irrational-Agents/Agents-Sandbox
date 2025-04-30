import PropTypes from 'prop-types';
import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import StartGame from './main';
import { EventBus } from './EventBus';

/**
 * The PhaserGame component is responsible for initializing and managing the Phaser game instance.
 * 
 * This component creates the game when it's mounted, and cleans up by destroying the game when it's unmounted.
 * It also listens for scene changes and updates the current active scene via the `EventBus`.
 * 
 * @component
 * @example
 * <PhaserGame currentActiveScene={handleSceneChange} />
 * 
 * @param {Object} props - The properties passed to the component.
 * @param {function} props.currentActiveScene - A callback function to handle scene changes.
 * @param {React.Ref} ref - A reference to the Phaser game instance, allowing interaction with it outside the component.
 * @returns {React.Element} The rendered component containing the Phaser game.
 */
export const PhaserGame = forwardRef(function PhaserGame ({ currentActiveScene, config }, ref) {
    const game = useRef();

    /**
     * Initializes the Phaser game when the component is mounted.
     * Ensures the game is only created once and the reference is passed back through `ref`.
     * Cleans up by destroying the game instance when the component is unmounted.
     * 
     * @returns {void}
     */
    useLayoutEffect(() => {
        if (game.current === undefined) {
            game.current = StartGame("game-container", config);

            if (ref !== null) {
                ref.current = { game: game.current, scene: null };
            }
        }

        return () => {
            if (game.current) {
                game.current.destroy(true);
                game.current = undefined;
            }
        };
    }, [ref]);

    /**
     * Listens for the 'current-scene-ready' event and updates the active scene.
     * The event provides the current scene, which is passed to the `currentActiveScene` callback.
     * 
     * @returns {void}
     */
    useEffect(() => {
        EventBus.on('current-scene-ready', (currentScene) => {
            if (currentActiveScene instanceof Function) {
                currentActiveScene(currentScene);
            }
            ref.current.scene = currentScene;
        });

        return () => {
            EventBus.removeListener('current-scene-ready');
        };
    }, [currentActiveScene, ref]);

    return (
        <div id="game-container"></div>
    );
});

// Props definitions
PhaserGame.propTypes = {
    currentActiveScene: PropTypes.func
};
