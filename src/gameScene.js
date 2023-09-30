import { fnt, ogg, png } from './assets'
import { g } from './loadingScene'
import { randi } from './utils'

const MAX_OFFERS = 10

/** @type {Phaser.Input.Pointer} */
let mouse
/** @type {Phaser.Cameras.Scene2D.Camera} */
let cam

/** @type {Phaser.GameObjects.BitmapText} */
let spaceText

let offersEl

const tempOffers = []

export const gameScene = new Phaser.Scene('gameScene')
gameScene.create = function () {
  init()
  const bg = gameScene.add.image(0, 0, png.bg).setOrigin(0)

  const side = document.getElementById('tobe1')
  gameScene.add.dom(20, 20, side).setOrigin(0)

  offersEl = side.querySelector('.offers')
  offersEl.addEventListener('click', e => {
    /** @type {HTMLElement} */
    const target = e.target
    if (target.classList.contains('accept')) {
      const uid = target.dataset.uid
      // console.log({ index })
      const index = tempOffers.findIndex(o => o.uid === uid)
      if (index === -1) throw `offer not found uid:${uid}`

      const item = tempOffers[index]
      // console.log({ item })
      // const parent = target.parentNode.parentNode
      // console.log(target.dataset.uid)
      // const uid = target.dataset.uid
      // console.log(g.stats.offers[uid])
      if (g.stats.space >= item.space) {
        g.stats.space -= item.space
        updateSpaceText()
        // Phaser.Utils.Array.SpliceOne(tempOffers, index)
        // offersEl.removeChild(target.parentNode.parentNode)
        removeOffer(index, target.parentNode.parentNode)
      } else {
        console.log('Not enough space')
      }
    } else if (target.classList.contains('reject')) {
      const uid = target.dataset.uid
      const index = tempOffers.findIndex(o => o.uid === uid)
      // delete g.stats.offers[uid]
      // delete tempOffers[uid]
      // console.log(tempOffers)
      // console.log( g.stats.offers[target.dataset.uid])
      // console.log(g.stats.offers)
      // Phaser.Utils.Array.SpliceOne(tempOffers, index)
      // offersEl.removeChild()
      removeOffer(index, target.parentNode.parentNode)
    }
  })

  gameScene.time.addEvent({
    delay: 500,
    repeat: -1,
    callback() {
      // console.log(offersEl.children.length)
      if (offersEl.children.length < MAX_OFFERS) {
        const offer = generateAnOffer(randi(1, 17), randi(7, 99))
        offersEl.appendChild(offer)
      }
    },
  })

  const ssd = gameScene.add.image(g.w - 20, 20, png.ssd).setOrigin(1, 0)

  spaceText = gameScene.add
    .bitmapText(g.w - 20, g.h - 20, fnt.topaz, 'Space: 100/100')
    .setOrigin(1)

  debug_addFullScreenButton(gameScene)
}

gameScene.update = () => {}

function init() {
  mouse = gameScene.input.activePointer
  cam = gameScene.cameras.main
}

function generateAnOffer(space, rent) {
  const uid = Phaser.Math.RND.uuid()
  // g.stats.offers[uid] = {
  //   space,
  //   rent,
  // }
  // tempOffers[uid] = {
  //   space,
  //   rent,
  // }
  const newItem = { uid, space, rent }
  tempOffers.push(newItem)
  // const index = tempOffers.indexOf(newItem)
  const el = document.createElement('div')
  el.className = 'offer'
  el.innerHTML = `
<div class="offer-details">
  <div class="space">${space}</div>
  <div class="rent">${rent}</div>
</div>
<div class="actions">
  <div class="hov accept" data-uid="${uid}" >accept</div>
  <div class="hov reject">reject</div>
</div>`
  return el
}

function removeOffer(index, child) {
  Phaser.Utils.Array.SpliceOne(tempOffers, index)
  offersEl.removeChild(child)
}
// function removeOffer(uid, child) {
//   const index = tempOffers.findIndex(i => i.uid === uid)
//   if (index !== -1) {
//     Phaser.Utils.Array.SpliceOne(tempOffers, index)
//     offersEl.removeChild(child)
//   } else {
//     throw `cant remove item with uid ${uid}`
//   }
// }

function updateSpaceText() {
  spaceText.text = `Space: ${g.stats.space}/100`
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
