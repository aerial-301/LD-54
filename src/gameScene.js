import { actionScene } from './actionScene'
import { fnt, ogg, png, wav } from './assets'
import { g } from './loadingScene'
import { game } from './main'
import { fadeIn, fadeOut, uiScene } from './uiScene'
import { addToArrayOnce, randF, randi } from './utils'

const MAX_OFFERS = 50
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
export const renters = []
let collected

/** @type {Phaser.Sound.WebAudioSound} */
let bgm

export const gameScene = new Phaser.Scene('gameScene')
gameScene.create = function () {
  init()

  if (!bgm) {
    bgm = gameScene.sound.add(wav.BGM, { volume: 0.5, loop: true })
    bgm.play()
  } else if (!bgm.isPlaying) {
    bgm.play()
  }

  createTexts()

  fadeIn(() => {})

  const bg = gameScene.add.image(0, 0, png.bg).setOrigin(0)

  const side = createLeftSideStuff()

  offersEl = side.querySelector('.offers')
  offersEl.addEventListener('click', handleOfferClick)
  offersEl.addEventListener('pointerover', hoverEl)

  rentersEl = side.querySelector('.renters')
  rentersEl.addEventListener('click', handleRenterClick)
  rentersEl.addEventListener('pointerover', hoverEl)

  const offersCount = randi(20, 40)
  // const offersCount = randi(3, 10)
  for (let i = 0; i < offersCount; i++) {
    generateOffers()
  }

  for (let r of renters) {
    createRenter(r)
  }

  gameScene.add.image(g.w - 20, 20, png.ssd).setOrigin(1, 0)

  addStartTheDayButton()

  addPayBillsButton()

  collectRents()

  const deads = renters.filter(o => o.dead).length
  upkeep = (g.stats.day - 1) * (70 + 17 * deads)

  updateUpkeepText()
  updateSpaceText()
  updateCashText()
  // updateIncomeText()

  calculateIncome()
}

let interCash = 0
gameScene.update = () => {}

function addStartTheDayButton() {
  const nextButton = gameScene.add
    .image(g.w - 24, g.h - 79, png.nextButton)
    .setOrigin(1)
  nextButton.setInteractive()
  out(nextButton)
  nextButton.on('pointerdown', () => {
    if (renters.length === 0) return
    gameScene.sound.play(ogg.confirm, { volume: 1, detune: randF(0, 100) })
    fadeOut(() => {
      gameScene.scene.stop()
      gameScene.scene.start(actionScene)
    })
  })
  nextButton.on('pointerout', () => {
    if (renters.length === 0) return
    out(nextButton)
  })
  nextButton.on('pointerover', () => {
    if (renters.length === 0) return
    gameScene.sound.play(ogg.hover, { volume: 1, detune: randF(0, 100) })
    over(nextButton)
  })
}
function addPayBillsButton() {
  const payButton = gameScene.add
    .image(g.w - 186, g.h - 79, png.payButton)
    .setOrigin(1)
  payButton.setInteractive()
  out(payButton)
  payButton.on('pointerdown', () => {
    if (upkeep > 0 && g.stats.cash >= upkeep) {
      g.stats.cash -= upkeep
      upkeep = 0
      updateUpkeepText()
    }
    // if (renters.length === 0) return

    // gameScene.sound.play(ogg.confirm, { volume: 1, detune: randF(0, 100) })
    // fadeOut(() => {
    //   gameScene.scene.start(actionScene)
    // })
  })
  payButton.on('pointerout', () => {
    // if (renters.length === 0) return
    out(payButton)
  })
  payButton.on('pointerover', () => {
    // if (renters.length === 0) return
    gameScene.sound.play(ogg.hover, { volume: 1, detune: randF(0, 100) })
    over(payButton)
  })
}

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
  // updateSpaceText()

  cashText = gameScene.add
    .bitmapText(g.hw, g.h - 60, fnt.topaz, '', FONT_SIZE)
    .setOrigin(0, 1)
    .setTintFill(g.pal.white)
  // updateCashText()

  incomeText = gameScene.add
    .bitmapText(20, g.h - 38, fnt.topaz, '', FONT_SIZE)
    .setOrigin(0, 0)
    .setTintFill(g.pal.white)
  // updateIncomeText()

  upkeepText = gameScene.add
    .bitmapText(g.hw, g.h - 38, fnt.topaz, '', FONT_SIZE)
    .setOrigin(0, 0)
    .setTintFill(g.pal.white)
  // updateUpkeepText()
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
    gameScene.sound.play(ogg.eject, { volume: 1, detune: randF(0, 100) })
  }
}

function handleOfferClick(e) {
  /** @type {HTMLElement} */
  const target = e.target
  const classList = target.classList
  if (classList.contains('accept')) {
    const index = getIndex(target, tempOffers)
    const item = tempOffers[index]
    if (g.stats.space >= item.space) {
      g.stats.space -= item.space
      removeOffer(index, target.parentNode.parentNode)
      createRenter(item)
      gameScene.sound.play(ogg.accept, { volume: 1, detune: randF(0, 100) })
    } else {
      gameScene.sound.play(ogg.can_not, { volume: 0.6, detune: randF(0, 100) })
      // Add stuff later
      console.log('Not enough space')
    }
  } else if (classList.contains('reject')) {
    gameScene.sound.play(ogg.dismiss, { volume: 1, detune: randF(0, 100) })
    const index = getIndex(target, tempOffers)
    removeOffer(index, target.parentNode.parentNode)
  }
}

function hoverEl(e) {
  /** @type {HTMLElement} */
  const target = e.target
  if (target.classList.contains('hov')) {
    gameScene.sound.play(ogg.hover, { volume: 1, detune: randF(0, 100) })
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
  addToArrayOnce(data, renters)
  // renters.push(data)
  const el = document.createElement('div')
  el.className = `offer ${data.dead ? 'dead' : ''}`
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
  // console.log('updating inc text')
  // console.log(g.stats.income)
  const income = g.stats.income
  const incT = `Income: $${income}/day`
  incomeText.text = incT
  // incomeText.text = `Income: $${100}/day`
  if (g.stats.income > 0) {
    incomeText.setTintFill(g.pal.green4)
  } else if (g.stats.income < 0) {
    incomeText.setTintFill(g.pal.red4)
  } else {
    incomeText.setTintFill(g.pal.white)
  }
}

let upkeep
export function updateUpkeepText() {
  // const upkeep = getUpkeep()

  // console.log(upkeepText)
  upkeepText.text = `Bills: $${upkeep}`
  // return upkeep
}

// function getUpkeep() {
//   // let upkeep = 0
//   // for (let renter of renters) {
//   //   upkeep += Math.round(renter.space * 1.27)
//   // }
//   // return upkeep
//   // return (g.stats.day - 1) * 70
// }

function calculateIncome(params) {
  // const upkeep = updateUpkeepText()
  let inc = 0
  for (let renter of renters) {
    if (!renter.dead) {
      inc += renter.rent
    }
  }
  // g.stats.income = inc - upkeep
  g.stats.income = inc
}

/** @param {Phaser.GameObjects.Image} obj  */
function over(obj) {
  obj.clearTint()
}
/** @param {Phaser.GameObjects.Image} obj  */
function out(obj) {
  obj.setTint(OUT_TINT)
}
