import { g } from './loadingScene'
import { fadeIn } from './uiScene'

export const winScene = new Phaser.Scene('winScene')

winScene.create = () => {
  fadeIn()
  const el = document.createElement('div')
  el.className = 'winScene'
  el.innerHTML = `<div class="win">Well Done!</div>
    <div class="winText">You managed to buy the thingy</div>
    <pre>
Cash: $${g.stats.cash}
Days: ${g.stats.day}
    </pre>
    `
  winScene.add.dom(0, 0, el).setOrigin(0)
}
