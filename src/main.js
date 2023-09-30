import 'phaser'
import { gameScene } from './gameScene'
import { loadingScene } from './loadingScene'
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
      width: 320,
      height: 180,
    },
    max: {
      width: 1280,
      height: 720,
    },
  },
  scene: [loadingScene, gameScene],
})
window.oncontextmenu = e => {
  e.preventDefault()
}
