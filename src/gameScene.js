export const gameScene = new Phaser.Scene('gameScene')
/** @type {Phaser.Input.Pointer} */
let mouse
/** @type {Phaser.Cameras.Scene2D.Camera} */
let cam

gameScene.create = function () {
  init()
  
}

gameScene.update = () => {}

function init() {
  mouse = gameScene.input.activePointer
  cam = gameScene.cameras.main
}
