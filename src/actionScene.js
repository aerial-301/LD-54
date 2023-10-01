import { fnt, png } from './assets'
import { gameScene, renters } from './gameScene'
import { g } from './loadingScene'
import { fadeIn, fadeOut } from './uiScene'
import { randF, randi } from './utils'

export const actionScene = new Phaser.Scene('actionScene')

/** @type {Phaser.Input.Pointer} */
let mouse

/** @type {Phaser.Cameras.Scene2D.BaseCamera} */
let cam

/** @type {Phaser.GameObjects.Image} */
let main

/** @type {Phaser.Physics.Arcade.Group} */
let blocks

/** @type {Phaser.Physics.Arcade.Group} */
let bullets

/** @type {Phaser.Physics.Arcade.Group} */
let viruses

const BULLET_SPEED = 700
const TIMER_LENGTH = 5
const BLOCKS_HEALTH = 1

/** @type {Phaser.GameObjects.BitmapText} */
let timerText

let timer
actionScene.create = () => {
  fadeIn()
  mouse = actionScene.input.activePointer
  cam = actionScene.cameras.main

  cam.zoom = 1
  timer = TIMER_LENGTH

  blocks = actionScene.physics.add.group()
  bullets = actionScene.physics.add.group()
  viruses = actionScene.physics.add.group()

  const R_LEN = renters.filter(o => !o.dead).length
  if (R_LEN > 0) {
    addPlayerAndBlocks(R_LEN)
  } else {
    addPlayer(g.hw, g.hh)
  }

  actionScene.input.keyboard.on('keydown-Q', () => {
    actionScene.scene.pause()
    fadeOut(() => {
      actionScene.scene.start(gameScene)
    })
  })

  actionScene.time.addEvent({
    delay: 1000,
    repeat: -1,
    callback() {
      timer -= 1
      updateTimer()
      if (timer === 0) {
        actionScene.scene.pause()
        fadeOut(() => {
          g.stats.day += 1
          actionScene.scene.start(gameScene)
        })
      }
    },
  })

  let virusX
  let virusY

  const V_SPEED = 200

  actionScene.time.addEvent({
    delay: 850,
    repeat: -1,
    callback() {
      if (Math.random() > 0.5) {
        virusX = g.w * randi(0, 1)
        virusY = randF(0, g.h)
      } else {
        virusX = randF(0, g.w)
        virusY = g.h * randi(0, 1)
      }

      /** @type {Phaser.Physics.Arcade.Image} */
      const v = viruses.create(virusX, virusY, png.virus)
      // v.setTintFill(g.pal.red6)
      const angle = Phaser.Math.Angle.BetweenPoints(v, main)
      const xv = Math.cos(angle) * V_SPEED
      const yv = Math.sin(angle) * V_SPEED
      v.setVelocity(xv, yv)
    },
  })

  actionScene.physics.add.overlap(bullets, viruses, (b, v) => {
    b.destroy()
    v.destroy()
  })

  actionScene.physics.add.overlap(viruses, blocks, (v, b) => {
    v.destroy()
    b.hurt(7)
  })

  timerText = actionScene.add.bitmapText(g.hw, 40, fnt.topaz, '')
  updateTimer()
}

actionScene.update = (time, delta) => {
  main.cycle()

  const activeBullets = bullets.getMatching('active', true)

  for (let i = 0; i < activeBullets.length; i++) {
    /** @type {Phaser.Physics.Arcade.Image} */
    const b = activeBullets[i]
    // console.log(b)
    if (b.x < 0 || b.x > g.w || b.y < 0 || b.y > g.h) {
      b.disableBody(true, true)
    }
  }
}
function addPlayerAndBlocks(R_LEN) {
  const BX = 200
  const BY = 200
  const BW = 5
  addPlayer(BX + 40 * (R_LEN % BW), BY + 40 * (0 | (R_LEN / BW)))
  for (let i = 0; i < R_LEN; i++) {
    const x = BX + 40 * (i % BW)
    const y = BY + 40 * (0 | (i / BW))
    const b = blocks.create(x, y, png.block)

    b.text = actionScene.add.text(b.x, b.y, renters[i].space).setOrigin(0.5).setTintFill(0xffffff)
    b.health = BLOCKS_HEALTH
    b.hurt = amount => {
      b.health -= amount
      if (b.health <= 0) {
        b.destroy()
        b.text.destroy()
        // Phaser.Utils.Array.SpliceOne(renters, i)
        renters[i].dead = true

        // console.log(renters)
      }
    }
  }
  const mid = blocks.children.entries[0 | (R_LEN / 2)]
  const mx = mid.x
  const my = mid.y
  mid.x = main.x
  mid.y = main.y
  mid.text.x = main.x
  mid.text.y = main.y

  main.x = mx
  main.y = my
}

function addPlayer(x, y) {
  main = actionScene.add.image(x, y, png.defender)
  // main.setTintFill(0xffffff)
  main.cycle = () => {
    const angle = Phaser.Math.Angle.BetweenPoints(main, mouse)
    // console.log({ angle })
    main.setRotation(angle)

    if (mouse.leftButtonDown()) {
      /** @type {Phaser.Physics.Arcade.Image} */
      const b = bullets.get(main.x, main.y, png.bullet)
      b.enableBody(true, main.x, main.y, true, true)
      b.setBlendMode('ADD')
      const vx = Math.cos(angle) * BULLET_SPEED
      const vy = Math.sin(angle) * BULLET_SPEED
      b.setVelocity(vx, vy)
      b.setDrag(BULLET_SPEED/2)
    }
  }
}

function updateTimer(params) {
  timerText.text = timer
}
