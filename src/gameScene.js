import { fnt, ogg, png } from './assets'
import { g } from './loadingScene'
import { game } from './main'
import { fadeIn, uiScene } from './uiScene'
import { randi } from './utils'

const MAX_OFFERS = 15
const OUT_TINT = 0x999999

/** @type {Phaser.Input.Pointer} */
let mouse
/** @type {Phaser.Cameras.Scene2D.Camera} */
let cam
/** @type {Phaser.GameObjects.BitmapText} */
let spaceText
/** @type {Phaser.GameObjects.BitmapText} */
let cashText
/** @type {Phaser.GameObjects.BitmapText} */
let incomeText
/** @type {Phaser.GameObjects.BitmapText} */
let upkeepText
/** @type {HTMLElement} */
let offersEl
/** @type {HTMLElement} */
let rentersEl

const tempOffers = []
const renters = []
let collected

export const gameScene = new Phaser.Scene('gameScene')
gameScene.create = function () {
  init()

  fadeIn()

  const bg = gameScene.add.image(0, 0, png.bg).setOrigin(0)

  const side = createLeftSideStuff()

  offersEl = side.querySelector('.offers')
  offersEl.addEventListener('click', handleOfferClick)

  rentersEl = side.querySelector('.renters')
  rentersEl.addEventListener('click', handleRenterClick)

  // gameScene.time.addEvent({
  //   delay: 2500,
  //   repeat: -1,
  //   startAt: 2200,
  //   callback: generateOffers,
  // })
  // gameScene.time.addEvent({
  //   delay: 1000,
  //   repeat: -1,
  //   startAt: 0,
  //   callback: collectRents,
  // })

  const offersCount = randi(3, 10)
  for (let i = 0; i < offersCount; i++) {
    generateOffers()
  }

  gameScene.add.image(g.w - 20, 20, png.ssd).setOrigin(1, 0)

  const nextButton = gameScene.add
    .image(g.w - 24, g.h - 79, png.nextButton)
    .setOrigin(1)
  nextButton.setInteractive()
  out(nextButton)

  nextButton.on('pointerdown', () => {
    gameScene.scene.restart()
  })
  nextButton.on('pointerout', () => {
    out(nextButton)
  })
  nextButton.on('pointerover', () => {
    over(nextButton)
  })

  createTexts()

  collectRents()

  debug_addFullScreenButton(gameScene)
}

let interCash = 0
gameScene.update = () => {}

function createLeftSideStuff() {
  const side = document.createElement('div')
  side.innerHTML = `<div class="sort-btns">
  <div>Offers</div>
</div>
<div class="offers sb"></div>
<div class="sort-btns">
  <div>Renters</div>
</div>
<div class="renters sb"></div>`

  gameScene.add.dom(20, 20, side).setOrigin(0)
  return side
}

function createTexts() {
  const FONT_SIZE = 12
  spaceText = gameScene.add
    .bitmapText(g.hw, g.h - 42, fnt.topaz, '', FONT_SIZE)
    .setOrigin(0, 1)
    .setTintFill(g.pal.white)
  updateSpaceText()

  cashText = gameScene.add
    .bitmapText(g.hw, g.h - 60, fnt.topaz, '', FONT_SIZE)
    .setOrigin(0, 1)
    .setTintFill(g.pal.white)
  updateCashText()

  incomeText = gameScene.add
    .bitmapText(20, g.h - 38, fnt.topaz, '', FONT_SIZE)
    .setOrigin(0, 0)
    .setTintFill(g.pal.white)
  updateIncomeText()

  upkeepText = gameScene.add
    .bitmapText(g.hw, g.h - 38, fnt.topaz, '', FONT_SIZE)
    .setOrigin(0, 0)
    .setTintFill(g.pal.white)
  getAndUpdateUpkeepText()
}

function collectRents() {
  // collected = 0
  // for (let renter of renters) {
  //   collected += renter.rent
  // }
  g.stats.cash += g.stats.income
}

function generateOffers() {
  if (offersEl.children.length < MAX_OFFERS) {
    createOffer(randi(1, 17), randi(7, 99))
  }
}

function handleRenterClick(e) {
  /** @type {HTMLElement} */
  const target = e.target
  if (target.classList.contains('eject')) {
    const index = getIndex(target, renters)
    const item = renters[index]
    g.stats.space += item.space
    removeRenter(index, target.parentNode.parentNode)
    addOffer(item)
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
      removeOffer(index, target.parentNode.parentNode)
      createRenter(item)
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
  renters.push(data)
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
  rentersEl.appendChild(el)
  calculateIncome()
}

function createOffer(space, rent) {
  const uid = Phaser.Math.RND.uuid()
  const offer = { uid, space, rent }
  addOffer(offer)
}

function addOffer(offer) {
  tempOffers.push(offer)
  const el = document.createElement('div')
  el.className = 'offer'
  el.innerHTML = `
<div class="offer-details">
  <div class="space">${offer.space}</div>
  <div class="rent">${offer.rent}</div>
</div>

<div class="actions" data-uid=${offer.uid}>

  <div class="hov accept">Accept</div>
  <div class="hov reject">Dismiss</div>

</div>`

  offersEl.appendChild(el)
  // return el
}

function removeOffer(index, child) {
  Phaser.Utils.Array.SpliceOne(tempOffers, index)
  offersEl.removeChild(child)
}

function removeRenter(index, child) {
  Phaser.Utils.Array.SpliceOne(renters, index)
  rentersEl.removeChild(child)
  calculateIncome()
}

export function updateSpaceText() {
  spaceText.text = `Space: ${g.stats.space}/100 Mb`
}

export function updateCashText() {
  cashText.text = `Cash: $${g.stats.cash}`
}

export function updateIncomeText() {
  incomeText.text = `Income: $${g.stats.income}/day`
  if (g.stats.income > 0) {
    incomeText.setTintFill(g.pal.green4)
  } else if (g.stats.income < 0) {
    incomeText.setTintFill(g.pal.red4)
  } else {
    incomeText.setTintFill(g.pal.white)
  }
}

export function getAndUpdateUpkeepText() {
  const upkeep = getUpkeep()
  upkeepText.text = `Upkeep: $${upkeep}`
  return upkeep
}

function calculateIncome(params) {
  const upkeep = getAndUpdateUpkeepText()
  let inc = 0
  for (let renter of renters) {
    inc += renter.rent
  }
  g.stats.income = inc - upkeep
}

function getUpkeep(params) {
  let upkeep = 0
  for (let renter of renters) {
    upkeep += Math.round(renter.space * 1.27)
  }
  return upkeep
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

/** @param {Phaser.GameObjects.Image} obj  */
function over(obj) {
  obj.clearTint()
}
/** @param {Phaser.GameObjects.Image} obj  */
function out(obj) {
  obj.setTint(OUT_TINT)
}
