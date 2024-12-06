import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor () {
        super('Preloader');
    }

    init () {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;
        const barWidth = this.scale.width * 0.8

        this.add.image(centerX, centerY, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(centerX, centerY, barWidth + 8, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(centerX-(barWidth/2), centerY, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {
            bar.width = 4 + (barWidth * progress);

        });
    }

    preload () {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');


        // Load map-related assets
        this.load.image("the_ville", "the_ville/thumbnail.jpg");

        // Load meta
        this.load.json("master_movement", "storage/July1_the_ville_isabella_maria_klaus-step-3-20/master_movement.json")
        this.load.json("meta", "storage/July1_the_ville_isabella_maria_klaus-step-3-20/meta.json")

    }

    create () {
        this.scene.start('MapLoader');
    }
}
