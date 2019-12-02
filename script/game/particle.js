import GameModule from './game-module.js';
import {clearCtx} from '../shortcuts.js';
const limit = 5000;
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
class SingleParticle {
  constructor(properties) {
    /*
    this.x = x;
    this.y = y;
    this.xVelocity = xVelocity;
    this.yVelocity = yVelocity;
       */
    // this.yAccel = -0.11;
    this.xDampening = 1;
    this.yDampening = 1;
    this.xFlurry = 0;
    this.yFlurry = 0;
    this.lifetime = 0;
    this.maxlife = 100;
    this.opacity = 1;
    this.gravity = 0;
    this.gravityAcceleration = 1.05;

    for (const key of Object.keys(properties)) {
      const value = properties[key];
      this[key] = value;
    }
  }
  update() {
    const xFlurryGen = getRandomInt(this.xFlurry * 100) / 100;
    const yFlurryGen = getRandomInt(this.yFlurry * 100) / 100;
    this.xVelocity += this.xFlurry / 2 - xFlurryGen;
    this.yVelocity += this.yFlurry / 2 - yFlurryGen;
    this.lifetime++;
    this.x += this.xVelocity;
    this.y -= this.yVelocity;
    this.y += this.gravity;
    this.gravity *= this.gravityAcceleration;
    this.xVelocity /= this.xDampening;
    this.yVelocity /= this.yDampening;
    if (this.lifetime >= this.maxlife) {
      return true;
    }
  }
  draw(ctx) {
    const opacity = (this.maxlife - this.lifetime) / this.maxlife;
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.fillRect(this.x, this.y, 2, 2);
  }
}
export default class Particle extends GameModule {
  constructor(parent, ctx) {
    super(parent);
    this.ctx = ctx;
    this.particles = [];
  }
  add(properties) {
    this.particles.push(new SingleParticle(properties));
  }
  // generate(x, y, xRange, yRange, velX, varianceX, velY, varianceY, amount) {
  generate(properties) {
    // return;
    const p = {
      amount: 1,
      xVariance: 0,
      yVariance: 0,
      xVelocity: 0,
      yVelocity: 0,
      ...properties,
    };
    for (let i = 0; i <= p.amount; i++) {
      const xGen = getRandomInt(p.xRange * 100) / 100 + p.x;
      const yGen = getRandomInt(p.yRange * 100) / 100 + p.y;
      const xVelGen = getRandomInt(p.xVariance * 100) / 100;
      const yVelGen = getRandomInt(p.yVariance * 100) / 100;
      const xVelocity = p.xVariance / 2 - xVelGen + p.xVelocity;
      const yVelocity = p.yVariance / 2 - yVelGen + p.yVelocity;
      const finalProperties = {
        ...p,
        x: xGen,
        y: yGen,
        xVelocity: xVelocity,
        yVelocity: yVelocity,
      };
      this.add(finalProperties);
    }
  }
  update() {
    while (this.particles.length > limit) {
      this.particles.splice(getRandomInt(limit - 1), 1);
    }
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      particle.update();
      if (particle.update()) {
        this.particles.splice(i, 1);
        i--;
      }
    }
    if (this.particles.length > 0) {
      this.isDirty = true;
    } else {
      clearCtx(this.ctx);
    };
    console.log(this.particles.length)
  }
  draw() {
    clearCtx(this.ctx);
    for (const particle of this.particles) {
      particle.draw(this.ctx);
    }
  }
}
