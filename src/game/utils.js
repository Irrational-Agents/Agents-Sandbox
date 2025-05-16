export const createProgressBar = (scene) => {
    const centerX = scene.scale.width / 2;
    const centerY = scene.scale.height / 2;

    // Define the width of the loading bar (80% of the screen width)
    const barWidth =  scene.scale.width * 0.8;

    // Add an outline for the progress bar (white stroke)
    scene.add.rectangle(centerX, centerY, barWidth + 8, 32).setStrokeStyle(2, 0xffffff);

    // Create the actual progress bar (it will expand based on progress)
    const progressBar =  scene.add.rectangle(centerX - (barWidth / 2), centerY, 4, 28, 0xffffff);

    // Update progress bar width on 'progress' event
     scene.load.on('progress', (progress) => {
        progressBar.width = 4 + (barWidth * progress);
    });

    // Optionally, remove the progress listener after load is complete
     scene.load.on('complete', () => {
         scene.load.off('progress'); // Clean up the progress listener
    });
}

/**
 * Sets up the base URL and asset paths for loading game assets.
 * 
 * @returns {void}
 */
export const setupAssetPaths = (scene) => {
    scene.load.setBaseURL(window.location.origin);
    scene.load.setPath('assets');
}