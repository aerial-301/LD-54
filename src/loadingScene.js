import { fnt, ogg, png, sheets } from './assets'
import {
  gameScene,
  updateCashText,
  updateIncomeText,
  updateSpaceText,
} from './gameScene'
import { game } from './main'
import { fadeIn, fadeOut, uiScene } from './uiScene'

const pal = {
  blue1: 0x172038,
  blue2: 0x253a5e,
  blue3: 0x3c5e8b,
  blue4: 0x4f8fba,
  blue5: 0x73bed3,
  blue6: 0xa4dddb,
  purple1: 0x1e1d39,
  purple2: 0x402751,
  purple3: 0x7a367b,
  purple4: 0xa23e8c,
  purple5: 0xc65197,
  purple6: 0xdf84a5,
  green1: 0x19332d,
  green2: 0x25562e,
  green3: 0x468232,
  green4: 0x75a743,
  green5: 0xa8ca58,
  green6: 0xd0da91,
  red1: 0x241527,
  red2: 0x411d31,
  red3: 0x752438,
  red4: 0xa53030,
  red5: 0xcf573c,
  red6: 0xda863e,
  white: 0xebede9,
  black: 0x090a14,
}

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
    _space: 100,
    _cash: 0,
    _income: 0,

    get space() {
      return this._space
    },
    set space(value) {
      this._space = value
      updateSpaceText()
    },

    get cash() {
      return this._cash
    },
    set cash(value) {
      this._cash = value
      updateCashText()
    },

    get income() {
      return this._income
    },
    set income(value) {
      this._income = value
      updateIncomeText()
    },
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
  // loadingScene.cameras.main
  //   .fadeIn(700)
  //   .on(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
  //     loadingScene.load.start()
  //   })

  loadingScene.scene.launch(uiScene)
  uiScene.events.on(Phaser.Scenes.Events.CREATE, () => {
    console.log('ui created ')
    fadeIn(() => {
      loadingScene.load.start()
    })
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
          fadeOut(() => {
            loadingScene.scene.start(gameScene)
          })

          // loadingScene.tweens.addCounter({
          //   from: 1,
          //   to: 0,
          //   onUpdate(e) {
          //     loadingScene.cameras.main.setAlpha(e.getValue())
          //   },
          //   duration: 500,
          //   onComplete() {
          //     gameScene.scene.start()
          //   },
          // })
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
