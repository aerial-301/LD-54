import { g } from './loadingScene'
import { fadeIn } from './uiScene'

export const overScene = new Phaser.Scene('overScene')

overScene.create = () => {
  fadeIn()
  const el = document.createElement('div')
  el.className = 'overScene'
  el.innerHTML = `<div class="GO">Game Over</div>
    <div class="text">You failed to pay your bills for too long..</div>
    <pre>
Days: ${g.stats.day}
    </pre>
    `

  overScene.add.dom(0, 0, el).setOrigin(0)
}
