export const pauseScene = new Phaser.Scene('pauseScene')

pauseScene.create = () => {
  const el = document.createElement('div')
  el.className = 'pause'
  el.innerHTML = `<div>Paused</div>`
  pauseScene.add.dom(0, 0, el).setOrigin(0)
}
