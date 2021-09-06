function newElement(tagName, className) {
     const element = document.createElement(tagName)
     element.className = className
     return element
}

function Barrier(reverse = false){
     this.element = newElement('div', 'barrier')

     const border = newElement('div', 'border')
     const body = newElement('div', 'body')

     this.element.appendChild(reverse ? body : border)
     this.element.appendChild(reverse ? border : body) 

     this.setHeight = height => body.style.height = `${height}px`
}

/*const b = new Barrier(true)
b.setHeight(200)
document.querySelector('[wm-flappy]').appendChild(b.element)
*/

function PairOfBarriers(hight, aperture, x){
     this.element = newElement('div', 'pair-of-barriers')

     this.upper = new Barrier(true)
     this.lower = new Barrier(false)

     this.element.appendChild(this.upper.element)
     this.element.appendChild(this.lower.element)

     this.drawAperture = () => {
          const upperHight = Math.random() * (hight - aperture)
          const lowerHight = hight - aperture - upperHight

          this.upper.setHeight(upperHight)
          this.lower.setHeight(lowerHight)
     }

     this.getX = () => parseInt(this.element.style.left.split('px')[0])
     this.setX = x => this.element.style.left = `${x}px`
     this.getWidth = () => this.element.clientWidth

     this.drawAperture()
     this.setX(x)
}

/*const b = new PairOfBarriers(700, 200, 400) 
document.querySelector('[wm-flappy]').appendChild(b.element)*/

function Barriers(height, width, aperture, space, notifyPoint){
     this.pairs = [
          new PairOfBarriers(height,aperture, width),
          new PairOfBarriers(height,aperture, width + space),
          new PairOfBarriers(height,aperture, width + (space * 2)),
          new PairOfBarriers(height,aperture, width + (space * 3)),
     ]

     const displacement = 3
     this.animation = () => {
          this.pairs.forEach(pair => {
               pair.setX(pair.getX() - displacement)

               //elemento saindo da area do jogo
               if(pair.getX() < -pair.getWidth()){
                    pair.setX(pair.getX() + (space * this.pairs.length))
                    pair.drawAperture()
               }

               const middle = width/2
               const crossMiddle = ((pair.getX() + displacement) >= middle) && pair.getX() < middle

               if(crossMiddle) {
                    notifyPoint()
               }     
          })
     }
}

function Bird(gameHeight){
     let flying = false

     this.element = newElement ('img', 'bird')
     this.element.src = 'imgs/passaro.png'

     this.getY = () => parseInt(this.element.style.bottom.split('px')[0 ])
     this.setY = y => this.element.style.bottom = `${y}px`

     window.onkeydown = e => flying = true
     window.onkeyup = e => flying =false

     this.animation = () =>{
          const newY = this.getY() + (flying ? 8 : -5)
          const maxHeight = gameHeight - this.element.clientHeight

          if(newY <=0){
               this.setY(0)
          } else if (newY >= maxHeight){
               this.setY(maxHeight)
          } else {
               this.setY(newY)
          }
     }

     this.setY(gameHeight / 2)
}


//teste de movimentação
/*const barriers = new Barriers(700, 1200, 200, 400, e=> console.log('passou'))
const bird = new Bird(700)
const game = document.querySelector('[wm-flappy]')
game.appendChild(bird.element)

barriers.pairs.forEach(pair => game.appendChild(pair.element))
setInterval(()=>{
     barriers.animation()
     bird.animation()
}, 50)*/

function Progress() {
     this.element = newElement('span', 'progress')
     this.updatePoints = points =>{
          this.element.innerHTML = points 
     }
     this.updatePoints(0)
}

function overlaid(elementA, elementB){
     const a = elementA.getBoundingClientRect()
     const b = elementB.getBoundingClientRect()

     const horizontal = a.left + a.width >= b.left
          && b.left + b.width >= a.left
     
     const vertical = a.top + a.height >= b.top
          && b.top + b.height >= a.top

     return horizontal && vertical          
}

function crashed( bird, barriers){
     let crashed = false
     barriers.pairs.forEach(pairs =>{
          if(!crashed) {
               const upper = pairs.upper.element
               const lower = pairs.lower.element
               crashed = overlaid(bird.element, upper)
               || overlaid(bird.element, lower)
          }
     })
     return crashed
}

function FlappyBird() {
     let points = 0

     const gameArea = document.querySelector('[wm-flappy]')
     const height = gameArea.clientHeight
     const width = gameArea.clientWidth

     const progress = new Progress()
     const barriers = new Barriers(height, width, 200, 400, () => progress.updatePoints(++points))
     const bird = new Bird(height)

     gameArea.appendChild(progress.element)
     gameArea.appendChild(bird.element)
    barriers.pairs.forEach(pair => gameArea.appendChild(pair.element))

     this.start = () => {
          const timer = setInterval(() => {
               barriers.animation()
               bird.animation()

               if(crashed(bird, barriers)){
                    clearInterval(timer)
               }
          }, 20);
     }

}

new FlappyBird().start()