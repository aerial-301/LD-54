import { fnt, ogg, png, sheets } from './assets'
import { gameScene, renters } from './gameScene'
import { g } from './loadingScene'
import { fadeIn, fadeOut, uiScene } from './uiScene'
import { clearT, randF, randi, throttledCall } from './utils'

export const actionScene = new Phaser.Scene('actionScene')

/** @type {Phaser.Input.Pointer} */
let mouse

/** @type {Phaser.Cameras.Scene2D.BaseCamera} */
let cam

/** @type {Phaser.GameObjects.Image} */
let main

/** @type {Phaser.GameObjects.Particles.ParticleEmitter} */
let hitParts

/** @type {Phaser.GameObjects.Particles.ParticleEmitter} */
let expParts

/** @type {Phaser.GameObjects.Particles.ParticleEmitter} */
let fireParts

/** @type {Phaser.Physics.Arcade.Group} */
let blocks

/** @type {Phaser.Physics.Arcade.Group} */
let bullets

/** @type {Phaser.Physics.Arcade.Group} */
let viruses

const V_SPEED = 140
const V_HEALTH = 50
const BULLET_SPEED = 1300
const FIRE_RATE = 70
const BULLET_DAMAGE = 10
const TIMER_LENGTH = 20
// const TIMER_LENGTH = 99999
const BLOCKS_HEALTH = 7

/** @type {Phaser.GameObjects.BitmapText} */
let timerText

let timer
actionScene.create = () => {
  fadeIn()

  clearT()

  for (let i in sheets) {
    if (!actionScene.anims.get(i)) {
      actionScene.anims.create({
        key: i,
        frames: actionScene.anims.generateFrameNames(i),
      })
    }
  }

  mouse = actionScene.input.activePointer
  cam = actionScene.cameras.main

  actionScene.lights.enable().setAmbientColor(0x222222)

  const bg = actionScene.add.image(0, 0, 'testtest').setOrigin(0)
  bg.setPipeline('Light2D')

  cam.zoom = 1
  timer = TIMER_LENGTH

  hitParts = actionScene.add
    .particles(0, 0, '__WHITE', {
      frequency: -1,
      speed: 300,
      scale: { start: 4, end: 0 },
      lifespan: 500,
    })
    .setDepth(888)

  fireParts = actionScene.add
    .particles(0, 0, png.fire, {
      frequency: -1,
      rotate: { start: 0, end: 360 },
      scale: { start: 2, end: 0 },
      // alpha: { start: 0.5, end: 0 },
      lifespan: 500,
      gravityY: 900,
      blendMode: 'ADD',
      emitCallback(e) {
        e.scaleX = e.scaleY = randF(1, 4)
        e.emitter.speedX = randF(-300, 300)
        e.emitter.speedY = randF(-650, -400)
      },
    })
    .setDepth(999)

  expParts = actionScene.add
    .particles(0, 0, sheets.explosions_32x32s0.name, {
      frequency: -1,
      // scale: { start: 1, end: 6 },
      // alpha: { start: 1, end: 0 },
      // frame: [1, 2, 3, 4],
      anim: sheets.explosions_32x32s0.name,
      // lifespan: 300,

      blendMode: 'ADD',
      // color: [g.pal.white, g.pal.purple6, g.pal.red6, g.pal.red6],
      emitCallback(e) {
        e.scaleX = e.scaleY = randF(3, 8)
      },
    })
    .setDepth(999)

  blocks = actionScene.physics.add.group()

  bullets = actionScene.physics.add.group()
  viruses = actionScene.physics.add.group()

  const R_LEN = renters.filter(o => !o.dead).length
  if (R_LEN > 0) {
    addPlayerAndBlocks(R_LEN)
  } else {
    addPlayer(g.hw, g.hh)
  }

  // actionScene.input.keyboard.on('keydown-Q', () => {
  //   actionScene.scene.pause()
  //   fadeOut(() => {
  //     actionScene.scene.start(gameScene)
  //   })
  // })

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

  let delay = 1000 - g.stats.day * 110
  if (delay < 350) delay = 350
  console.log({delay})

  actionScene.time.addEvent({
    delay: delay,
    repeat: -1,
    callback() {
      if (Math.random() > 0.5) {
        virusX = g.w * randi(0, 1)
        virusY = randF(0, g.h)
      } else {
        virusX = randF(0, g.w)
        virusY = g.h * randi(0, 1)
      }

      summonV(virusX, virusY)
    },
  })

  actionScene.physics.add.overlap(bullets, viruses, (b, v) => {
    actionScene.sound.play(ogg.hit, { volume: 0.5, detune: randF(0, 200) })
    hitParts.explode(7, b.x, b.y)
    b.destroy()
    hurt(v, BULLET_DAMAGE * randi(1, 3))
  })

  actionScene.physics.add.overlap(viruses, blocks, (v, b) => {
    actionScene.sound.play(ogg.hit, { volume: 0.5, detune: randF(0, 200) })
    hitParts.explode(30, v.x, v.y)
    v.destroy()
    hurt(b, 1)
    // b.hurt(1)
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
      actionScene.lights.removeLight(b.light)
    }
  }

  for (let b of bullets.getMatching('active', true)) {
    b.cycle()
  }
}
function summonV(virusX, virusY) {
  /** @type {Phaser.Physics.Arcade.Image} */
  const v = viruses.create(virusX, virusY, png.virus)
  const angle = Phaser.Math.Angle.BetweenPoints(v, main)
  const xv = Math.cos(angle) * V_SPEED
  const yv = Math.sin(angle) * V_SPEED
  v.setVelocity(xv, yv)
  v.health = V_HEALTH
  v.die = () => {
    v.destroy()
    actionScene.sound.play(ogg.exp1, { volume: 0.5, detune: randF(-200, 200) })
  }
}

function hurt(o, amount) {
  o.health -= amount
  if (o.health <= 0) {
    expParts.explode(1, o.x, o.y)
    fireParts.explode(10, o.x, o.y)
    o.die()
  } else {
    flash(o)
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
    b.text = actionScene.add
      .text(b.x, b.y, renters[i].space)
      .setOrigin(0.5)
      .setTintFill(0xffffff)
    b.health = BLOCKS_HEALTH
    // b.hurt = amount => {
    //   b.health -= amount
    //   if (b.health <= 0) {
    //     b.die()
    //   }
    // }

    b.die = () => {
      b.destroy()
      actionScene.sound.play(ogg.exp1, { volume: 0.5, detune: randF(0, 200) })
      // Phaser.Utils.Array.SpliceOne(renters, i)
      renters[i].dead = true
      b.text.destroy()

      // console.log(renters)
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
      throttledCall(
        actionScene,
        () => {
          playerShoot(angle)
        },
        FIRE_RATE
      )
    }
  }
}

function playerShoot(angle) {
  actionScene.sound.play(ogg.shoot, { volume: 0.5, detune: randF(0, 200) })
  /** @type {Phaser.Physics.Arcade.Image} */
  const b = bullets.get(main.x, main.y, png.bullet)
  b.enableBody(true, main.x, main.y, true, true)
  b.setBlendMode('ADD')
  b.dead = false
  b.setAlpha(1)

  const light = actionScene.lights.addLight(b.x, b.y, 150, g.pal.red5, 2)
  b.light = light
  b.cycle = () => {
    light.setPosition(b.x, b.y)
  }
  b.on(Phaser.GameObjects.Events.DESTROY, () => {
    actionScene.lights.removeLight(light)
  })

  const vx = Math.cos(angle) * BULLET_SPEED
  const vy = Math.sin(angle) * BULLET_SPEED
  b.setVelocity(vx, vy)
  b.setDrag(BULLET_SPEED / 2)
}

function updateTimer(params) {
  timerText.text = timer
}

function flash(o) {
  o.setTintFill(0xffffff)
  uiScene.time.delayedCall(40, () => {
    o.clearTint()
  })
}

/** @param {Phaser.Physics.Arcade.Image} o*/
function addLight(o) {
  o.setPipeline('Light2D')
}
