import GameModule from './game-module.js';
import {clearCtx} from '../shortcuts.js';
import settings from '../settings.js';
import gameHandler from './game-handler.js';
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
const HZ_MATCH_MULTIPLIER = .5 / 60 * 1000;
class SingleParticle {
  constructor(properties) {
    this.xDampening = 1;
    this.yDampening = 1;
    this.xFlurry = 0;
    this.yFlurry = 0;
    this.flicker = 0;
    this.lifetime = 0;
    this.maxlife = 100;
    this.opacity = 1;
    this.gravity = 0;
    this.gravityAcceleration = 1.05;
    this.lifeVariance = 0;

    for (const key of Object.keys(properties)) {
      const value = properties[key];
      this[key] = value;
    }
    const lifeGen = getRandomInt(this.lifeVariance * 100) / 100;
    this.maxlife += this.lifeVariance / 2 - lifeGen;
    this.maxlife *= HZ_MATCH_MULTIPLIER;
  }
  update(ms) {
    const widthMultiplier = gameHandler.game.particle.ctx.canvas.clientWidth / 400;
    const multiplier = ms / HZ_MATCH_MULTIPLIER;
    const multiplierWithWidth = ms / HZ_MATCH_MULTIPLIER * widthMultiplier;
    const xFlurryGen = getRandomInt(this.xFlurry * 100) / 100;
    const yFlurryGen = getRandomInt(this.yFlurry * 100) / 100;
    this.xVelocity += (this.xFlurry / 2 - xFlurryGen) * multiplier;
    this.yVelocity += (this.yFlurry / 2 - yFlurryGen) * multiplier;
    this.lifetime += HZ_MATCH_MULTIPLIER * multiplier;
    this.x += this.xVelocity * multiplierWithWidth;
    this.y -= this.yVelocity * multiplierWithWidth;
    this.y += this.gravity * multiplier;
    this.gravity *= 1 + (this.gravityAcceleration - 1) * multiplier;
    this.xVelocity /= 1 + (this.xDampening - 1) * multiplier;
    this.yVelocity /= 1 + (this.yDampening - 1) * multiplier;
    if (this.lifetime >= this.maxlife) {
      return true;
    }
  }
  draw(ctx) {
    const opacity = (this.maxlife - this.lifetime) / this.maxlife - Math.random() * this.flicker;
    ctx.fillStyle = `rgba(${this.red}, ${this.blue}, ${this.green}, ${opacity})`;
    const size = gameHandler.game.particle.ctx.canvas.clientHeight / 800 * settings.settings.particleSize;
    ctx.fillRect(this.x, this.y, size, size);
  }
}
export default class Particle extends GameModule {
  constructor(parent, ctx) {
    super(parent);
    this.ctx = ctx;
    this.particles = [];
    this.hasCleared = false;
  }
  add(properties) {
    this.particles.push(new SingleParticle(properties));
  }
  // generate(x, y, xRange, yRange, velX, varianceX, velY, varianceY, amount) {
  generate(properties) {
    if (!settings.settings.particles) {
      return;
    }
    const p = {
      amount: 1,
      red: 255,
      blue: 255,
      green: 255,
      xVariance: 0,
      yVariance: 0,
      xVelocity: 0,
      yVelocity: 0,
      ...properties,
    };
    p.amount *= 0.5 * settings.settings.particleScale;
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
  update(ms) {
    const limit = settings.settings.particleLimit;
    while (this.particles.length > limit) {
      this.particles.splice(getRandomInt(limit - 1), 1);
    }
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      if (particle.update(ms)) {
        this.particles.splice(i, 1);
        i--;
      }
    }
    if (this.particles.length > 0) {
      this.isDirty = true;
    } else {
      if (!this.hasCleared) {
        clearCtx(this.ctx);
        this.hasCleared = true;
      }
    };
  }
  draw() {
    clearCtx(this.ctx);
    for (const particle of this.particles) {
      particle.draw(this.ctx);
    }
  }
}
