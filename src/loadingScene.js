import { fnt, ogg, png, sheets } from './assets'
import { gameScene } from './gameScene'
import { game } from './main'

const pal = {}
const depths = {}
export const g = {
  w: undefined,
  h: undefined,
  hw: undefined,
  hh: undefined,
  m: Phaser.Math,
  depths: depths,
  pal: pal,
  stats: {
    space: 100,
    offers: {}
  },
  sys: undefined,

}

export const loadingScene = new Phaser.Scene('loadingScene')

loadingScene.preload = () => {
  for (let i in fnt) {
    loadingScene.load.bitmapFont(i, `./${i}_0.png`, `./${i}.fnt`)
  }
}

loadingScene.create = () => {
  const scene = game.scene.systemScene
  g.w = scene.renderer.width
  g.hw = g.w / 2
  g.h = scene.renderer.height
  g.hh = g.h / 2
  g.sys = scene

  addLoadUI()
  loadFiles()
  loadingScene.cameras.main
    .fadeIn(700)
    .on(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
      loadingScene.load.start()
    })
}

function addLoadUI() {
  const text = loadingScene.add
    .bitmapText(g.hw, g.hh - 100, fnt.topaz, 'Loading ..', 12 * 2)
    .setTintFill(0xffffff)
    .setOrigin(0.5)

  const bW = g.w * 0.7
  const bar = loadingScene.add.image(g.hw - bW / 2, g.hh, '')
  bar.setTintFill(0xffffff)
  bar.setOrigin(0, 0.5)
  bar.setScale(0, 1)

  loadingScene.load.on('progress', value => {
    loadingScene.tweens.add({
      targets: bar,
      props: {
        displayWidth: bW * value,
      },
      duration: 250,
      onComplete() {
        if (bar.displayWidth === bW) {
          loadingScene.tweens.addCounter({
            from: 1,
            to: 0,
            onUpdate(e) {
              loadingScene.cameras.main.setAlpha(e.getValue())
            },
            duration: 500,
            onComplete() {
              gameScene.scene.start()
            },
          })
        }
      },
    })
  })

  loadingScene.load.on('fileprogress', file => {
    text.text = 'Loading .. ' + file.src
  })
}

function loadFiles() {
  for (let i in sheets) {
    loadingScene.load.spritesheet(i, `./sheets/${i}.png`, {
      frameWidth: sheets[i].width,
      frameHeight: sheets[i].height,
      spacing: sheets[i].spacing,
    })
  }
  for (let i in png) loadingScene.load.image(i)
  for (let i in ogg) loadingScene.load.audio(i, `./${i}.ogg`)
}
