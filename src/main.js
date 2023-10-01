import 'phaser'
import { gameScene } from './gameScene'
import { loadingScene } from './loadingScene'
import { uiScene } from './uiScene'
import { actionScene } from './actionScene'
import { pauseScene } from './pauseScene'
import { overScene } from './overScene'
import { winScene } from './winScene'
const parent = 'main'
export const game = new Phaser.Game({
  type: Phaser.WEBGL,
  width: 640,
  height: 460,
  parent: parent,
  fullscreenTarget: parent,
  backgroundColor: '#111',

  pixelArt: true,
  dom: {
    createContainer: true,
  },

  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      // gravity: { y: 1500 },
      // gravity: { y: 200 },
    },
  },

  input: {
    mouse: {
      preventDefaultDown: true,
    },
  },
  disableContextMenu: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
    autoRound: true,

    min: {
      width: 640,
      height: 460,
    },
    max: {
      width: 1280,
      height: 720,
    },
  },
  scene: [
    loadingScene,
    gameScene,
    actionScene,
    overScene,
    winScene,
    pauseScene,
    uiScene,
  ],
})
window.oncontextmenu = e => {
  e.preventDefault()
}
