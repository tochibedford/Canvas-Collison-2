const canvas = document.querySelector("canvas")
const ctx = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

let gravity = 0.0;
let friction = 1;
let maxRadius = 10;
let maxMass = 1;

let mouse = {
  x: undefined,
  y: undefined,
}

const colors = [
  [200,70,190], 
  [30,178,215]
]

window.addEventListener('resize', ()=>{
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
})

window.addEventListener('mousemove', (e)=>{
  mouse.x = e.clientX;
  mouse.y = e.clientY;
})

function randomIntFromRange(min, max){
  return Math.floor(Math.random()*(max-min+1)+min)
}

function randomColor(){
  return colors[Math.floor(Math.random()*colors.length)]
}

function getDistance(x1,y1,x2,y2){
  let xDistance = x2-x1
  let yDistance = y2-y1
  
  //using th pythagorean theorem
  return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2))
}

function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
}

function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.dx - otherParticle.dx;
    const yVelocityDiff = particle.dy - otherParticle.dy;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate({x: particle.dx, y: particle.dy}, angle);
        const u2 = rotate({x: otherParticle.dx, y: otherParticle.dy}, angle);

        // Velocity after 1d collision equation
        const v1 = { x: u1.x * (m2-m1) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m2-m1) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.dx = vFinal1.x;
        particle.dy = vFinal1.y;

        otherParticle.dx = vFinal2.x;
        otherParticle.dy = vFinal2.y;
    }
}

function Particle(x, y, dx, dy, radius, color, id=undefined){
  this.id = id
  this.x = x
  this.y = y
  this.dx = dx
  this.dy = dy
  this.radius = radius
  this.fill = 0
  this.color  = color
  this.mass = maxMass*(radius/maxRadius) // calculate mass based on radius
  const originalRadius = radius
  
  this.draw = function(){
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
    ctx.strokeStyle = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},1)`
    ctx.fillStyle = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},${this.fill})`
    ctx.stroke()
    ctx.fill()
    ctx.closePath()
  }
  
  this.update = function(particles){
//     collision detection
    particles.forEach((particle)=>{
      if(this !== particle){
        if(getDistance(this.x, this.y, particle.x, particle.y) - this.radius-particle.radius<0){
          // console.log(`${this.id} collided with ${particle.id}`)
          resolveCollision(this, particle)
        }
      }
    })
    
    //mouse position color
    if(getDistance(this.x, this.y, mouse.x, mouse.y)<100){
      this.fill += 0.1
      this.fill = Math.min(1, this.fill)
    }else{
      this.fill -= 0.1
      this.fill = Math.max(0, this.fill)
    }
    // this.fill = Math.abs(100-Math.min(5,getDistance(this.x, this.y, mouse.x, mouse.y)))
    // console.log(mouse.x, mouse.y)
    
//     motion
    if(this.x + this.radius +this.dx>canvas.width||this.x - this.radius + this.dx<0){
      this.dx = -(this.dx*friction)
    }
    if(this.y + this.radius + this.dy>canvas.height || this.y - this.radius + this.dy < 0){
      this.dy = -(this.dy*friction)
      this.dx = this.dx*friction
    }else{
      this.dy += gravity
    }
    this.y += this.dy
    this.x += this.dx
    this.draw()
    
  }
}

let particles;
function init(){
  particles = []
  
  for(let i=0; i<400; i++){
    let radius = maxRadius;
    let x = randomIntFromRange(radius, canvas.width-radius)
    let y = randomIntFromRange(radius, canvas.height-radius)
    let dx = randomIntFromRange(-3,3)
    let dy = randomIntFromRange(-3,3)
    let color = colors[Math.floor(Math.random()*colors.length)]
    
    if(i!==0){
      for(let j=0; j<particles.length; j++){
        if(getDistance(x,y,particles[j].x, particles[j].y)-radius*2<0){
          // console.log(x,y)
          x = randomIntFromRange(radius, canvas.width-radius)
          y = randomIntFromRange(radius, canvas.height-radius)
          j = -1
        }
      }
    }
    
    particles.push(new Particle(x, y, dx, dy, radius, color, id=i))
  }
}

function animate(){
  requestAnimationFrame(animate)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  particles.forEach(particle=>{
    particle.update(particles)
  })
}

init()
animate()
window.addEventListener('click', ()=>{
  // init();
})