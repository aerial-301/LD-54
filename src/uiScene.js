import { actionScene } from './actionScene'
import { g, loadingScene } from './loadingScene'
import { pauseScene } from './pauseScene'

export const uiScene = new Phaser.Scene('uiScene')
/** @type {Phaser.GameObjects.DOMElement} */
let cover
uiScene.create = () => {
  const el = document.createElement('div')
  el.className = 'cover'
  cover = uiScene.add.dom(0, 0, el).setOrigin(0).setDepth(999)
  cover.setInteractive()

  uiScene.input.keyboard.on('keyup-ESC', () => {
    if (uiScene.scene.isActive(pauseScene)) {
      uiScene.scene.stop(pauseScene)
      uiScene.scene.resume(actionScene)
    } else if (uiScene.scene.isActive(actionScene)) {
      uiScene.scene.launch(pauseScene)
      uiScene.scene.pause(actionScene)
    }
  })

  // debug_addFullScreenButton(uiScene)
}

uiScene.update = () => {}

export function fadeIn(complete = () => {}) {
  uiScene.tweens.add({
    targets: cover,
    props: {
      alpha: { from: 1, to: 0 },
    },
    duration: 1000,
    onComplete() {
      complete()
      cover.removeInteractive()
    },
  })
}

export function fadeOut(complete = () => {}) {
  cover.setInteractive()
  uiScene.tweens.add({
    targets: cover,
    props: {
      alpha: { from: 0, to: 1 },
    },
    duration: 600,
    onComplete() {
      complete()
    },
  })
}

/** @param {Phaser.Scene} scene*/
export function debug_addFullScreenButton(scene) {
  const btn = scene.add
    .image(g.w - 4, g.h - 4, '__WHITE')
    .setOrigin(1)
    .setAlpha(0.2)
    .setDisplaySize(32, 32)
  btn.setInteractive()
  btn.on('pointerdown', () => {
    scene.scale.toggleFullscreen()
  })
}
