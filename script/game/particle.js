import GameModule from './game-module.js';
import {clearCtx} from '../shortcuts.js';
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
class SingleParticle {
  constructor(x, y, xVelocity, yVelocity) {
    this.x = x;
    this.y = y;
    this.xVelocity = xVelocity;
    this.yVelocity = yVelocity;
    // this.yAccel = -0.11;
    this.yAccel = 0;
    this.lifetime = 0;
    this.maxlife = 100;
    this.opacity = 1;
  }
  update() {
    this.lifetime++;
    this.x += this.xVelocity;
    this.y -= this.yVelocity;
    this.y += this.yAccel;
    this.yAccel *= 1.05;
    this.xVelocity /= 1.005;
    this.yVelocity /= 1.005;
    if (this.lifetime >= this.maxlife) {
      return true;
    }
  }
  draw(ctx) {
    const opacity = (this.maxlife - this.lifetime) / this.maxlife;
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.fillRect(this.x, this.y, 5, 5);
  }
}
export default class Particle extends GameModule {
  constructor(parent, ctx) {
    super(parent);
    this.ctx = ctx;
    this.particles = [];
  }
  add(x, y, xVel, yVel) {
    this.particles.push(new SingleParticle(x, y, xVel, yVel));
  }
  generate(x, y, maxX, maxY, velX, varianceX, velY, varianceY, amount) {
    for (let i = 0; i <= amount; i++) {
      const xGen = getRandomInt(maxX * 100) / 100 + x;
      const yGen = getRandomInt(maxY * 100) / 100 + y;
      const xVelGen = getRandomInt(varianceX * 100) / 100;
      const yVelGen = getRandomInt(varianceY * 100) / 100;
      const xVelocity = varianceX / 2 - xVelGen + velX;
      const yVelocity = varianceY / 2 - yVelGen + velY;
      this.add(xGen, yGen, xVelocity, yVelocity);
      if (i === 1) {
      }
    }
  }
  update() {
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
  }
  draw() {
    clearCtx(this.ctx);
    for (const particle of this.particles) {
      particle.draw(this.ctx);
    }
  }
}
