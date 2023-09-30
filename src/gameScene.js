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
/** @type {HTMLElement} */
let offersEl
/** @type {HTMLElement} */
let rentersEl

const tempOffers = []
const renters = []

export const gameScene = new Phaser.Scene('gameScene')
gameScene.create = function () {
  init()
  const bg = gameScene.add.image(0, 0, png.bg).setOrigin(0)

  const side = document.getElementById('tobe1')
  gameScene.add.dom(20, 20, side).setOrigin(0)

  offersEl = side.querySelector('.offers')
  offersEl.addEventListener('click', handleOfferClick)

  rentersEl = side.querySelector('.renters')
  rentersEl.addEventListener('click', handleRenterClick)

  gameScene.time.addEvent({
    delay: 2500,
    repeat: -1,
    startAt: 2200,
    callback: generateOffers,
  })

  const ssd = gameScene.add.image(g.w - 20, 20, png.ssd).setOrigin(1, 0)
  spaceText = gameScene.add
    .bitmapText(g.w - 20, g.h - 20, fnt.topaz, 'Space: 100/100')
    .setOrigin(1)

  debug_addFullScreenButton(gameScene)
}

gameScene.update = () => {}

function generateOffers() {
  if (offersEl.children.length < MAX_OFFERS) {
    const offer = createOffer(randi(1, 17), randi(7, 99))
    offersEl.appendChild(offer)
  }
}

function handleRenterClick() {
  return e => {
    /** @type {HTMLElement} */
    const target = e.target
    if (target.classList.contains('eject')) {
      const index = getIndex(target, renters)
      const item = renters[index]
      g.stats.space += item.space
      updateSpaceText()
      removeRenter(index, target.parentNode.parentNode)
    }
  }
}

function handleOfferClick(e) {
  /** @type {HTMLElement} */
  const target = e.target
  // console.log(target)
  if (target.classList.contains('accept')) {
    const index = getIndex(target, tempOffers)
    const item = tempOffers[index]
    if (g.stats.space >= item.space) {
      g.stats.space -= item.space
      updateSpaceText()
      removeOffer(index, target.parentNode.parentNode)

      const el = createRenter(item)
      rentersEl.appendChild(el)
    } else {
      // Add stuff later
      console.log('Not enough space')
    }
  } else if (target.classList.contains('reject')) {
    const index = getIndex(target, tempOffers)
    removeOffer(index, target.parentNode.parentNode)
  }
}

function init() {
  mouse = gameScene.input.activePointer
  cam = gameScene.cameras.main
}

function getIndex(target, list) {
  const uid = target.parentNode.dataset.uid
  const index = list.findIndex(o => o.uid === uid)
  if (index === -1) throw `renter not found uid:${uid}`
  return index
}

function createRenter(data) {
  addRenter(data)
  const el = document.createElement('div')
  el.className = 'offer'
  el.innerHTML = `
<div class="offer-details">
  <div class="space">${data.space}</div>
  <div class="rent">${data.rent}</div>
</div>
<div class="actions" data-uid=${data.uid}>
  <div class="hov eject">Eject</div>
</div>`
  return el
}

function createOffer(space, rent) {
  const uid = Phaser.Math.RND.uuid()
  const newItem = { uid, space, rent }
  tempOffers.push(newItem)
  const el = document.createElement('div')
  el.className = 'offer'
  el.innerHTML = `
<div class="offer-details">
  <div class="space">${space}</div>
  <div class="rent">${rent}</div>
</div>

<div class="actions" data-uid=${uid}>

  <div class="hov accept">Accept</div>
  <div class="hov reject">Reject</div>

</div>`
  return el
}

function removeOffer(index, child) {
  Phaser.Utils.Array.SpliceOne(tempOffers, index)
  offersEl.removeChild(child)
}

function addRenter(renter) {
  renters.push(renter)
}

function removeRenter(index, child) {
  Phaser.Utils.Array.SpliceOne(renters, index)
  rentersEl.removeChild(child)
}

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
