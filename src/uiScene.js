export const uiScene = new Phaser.Scene('uiScene')
/** @type {Phaser.GameObjects.DOMElement} */
let cover
uiScene.create = () => {
  const el = document.createElement('div')
  el.className = 'cover'
  cover = uiScene.add.dom(0, 0, el).setOrigin(0).setDepth(999)
  uiScene.input.keyboard.on('keyup-ESC', () => {
    if (uiScene.scene.isActive(pauseScene)) {
      uiScene.scene.stop(pauseScene)
      uiScene.scene.resume(actionScene)
    } else if (uiScene.scene.isActive(actionScene)) {
      uiScene.scene.launch(pauseScene)
      uiScene.scene.pause(actionScene)
    }
  })
}

uiScene.update = () => {}

export function fadeIn(onComplete = () => {}) {
  uiScene.tweens.add({
    targets: cover,
    props: {
      alpha: { from: 1, to: 0 },
    },
    duration: 1000,
    onComplete,
  })
}

export function fadeOut(onComplete = () => {}) {
  uiScene.tweens.add({
    targets: cover,
    props: {
      alpha: { from: 0, to: 1 },
    },
    duration: 600,
    onComplete,
  })
}
