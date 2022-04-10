import { ThirdPersonCamera } from "./camera.js";
import {
  scene,
  camera,
  entityManager,
  spatialManager,
  cameraTP,
} from "../index.js";
import { keys, KEY_W, KEY_A, KEY_S, KEY_D } from "./keys.js";

const killerModeDuration = 10; // seconds
export class Pacman {
  constructor(pos) {
    if (!pos) {
      pos = [450, 200];
    }
    this.countdownTimers = [];
    this.modeKiller = false;
    this.origX = pos[0];
    this.origY = pos[1];
    this.radius = 9;
    this.defaultColor = "yellow";
    this.cooldownColor = "pink";
    this.geometry = new THREE.SphereGeometry(this.radius, 100, 100, 0, 5.5);
    this.material = new THREE.MeshPhongMaterial({
      color: this.defaultColor,
      specular: "#111111",
      shininess: 30,
      combine: THREE.MultiplyOperation,
      reflectivity: 0.6,
    });
    this.shape = new THREE.Mesh(this.geometry, this.material);
    // this.direction = -1; // default stop
    this.position = new THREE.Vector3(this.origX, this.origY, 0);
    this.originalPosition = this.position;
    this.shape.position.copy(this.position);
    this.defaultVel = 2.1;
    this.killModeVel = 3;
    this.vel = this.defaultVel; // pacmans velocity
    this.velX = 0; // default stop
    this.velY = 0; // default stop
    this.lives = 3;
    this.cooldown = false;
    this.cooldownTime = 5; // seconds
    this.direction = 0; // 0 stop,  1 ypos, 2 3 4
  }

  update() {
    const controlObject = this.shape;
    const _Q = new THREE.Quaternion();
    const _A = new THREE.Vector3();
    const _R = controlObject.quaternion.clone();

    if (eatKey(KEY_W)) {
      if (this.direction <= 0) this.direction += 1; // virkar bara thegar pac er stop
      
    }

    if (eatKey(KEY_A)) {
      this.direction -= 1;
      if (this.direction === 0) this.direction = 4;
      //this.shape.rotation.z = Math.PI;
      // this.shape.quaternion.setFromAxisAngle(
      //   new THREE.Vector3(0, 0, 1),
      //   Math.PI
      // );
    }
    if (eatKey(KEY_S)) {
     this.direction = 0; // stop.. kannski beila a ad leifa...
    }
    if (eatKey(KEY_D)) {
      this.direction += 1;
      if (this.direction === 5) this.direction = 1;

      //this.shape.rotation.z = (Math.PI * 3) / 2;
      // this.shape.quaternion.setFromAxisAngle(
      //   new THREE.Vector3(0, 0, 1),
      //   2 * Math.PI
      // );
      // cameraTP.camera.quaternion.setFromAxisAngle(
      //   new THREE.Vector3(1, 0, 0),
      //   (Math.PI * 3) / 2
      // );
    }

    this.updateVelFromDirection();

    controlObject.quaternion.clone(_R); // her ef vid viljum smooth seinna

    this.collide();

    this.position["x"] += this.velX;
    this.position["y"] += this.velY;

    this.shape.position.copy(this.position);
    this.shape.updateMatrix();

    cameraTP.update();
  }

  updateVelFromDirection() {
    console.log(this.direction)
    switch(this.direction) {
      case 1: // pos y
        this.velX = 0;
        this.velY = this.vel;

        this.shape.rotation.z = Math.PI / 2;
        this.shape.quaternion.setFromAxisAngle(
          new THREE.Vector3(0, 0, 1),
          Math.PI / 2
        );
        break;
      case 2: // pos x
        this.velX = this.vel;
        this.velY = 0;
        //this.shape.rotation.z = (Math.PI * 3) / 2;
        // this.shape.quaternion.setFromAxisAngle(
        //   new THREE.Vector3(0, 0, 1),
        //   2 * Math.PI
        // );
        // cameraTP.camera.quaternion.setFromAxisAngle(
        //   new THREE.Vector3(1, 0, 0),
        //   (Math.PI * 3) / 2
        // );
        break;
      case 3: // neg y
        this.velX = 0;
        this.velY = -this.vel;
        //this.shape.rotation.z = 0;
        // this.shape.quaternion.setFromAxisAngle(
        //   new THREE.Vector3(0, 0, 1),
        //   (Math.PI * 3) / 2
        // );
        break;
      case 4: // neg x
        this.velX = -this.vel;
        this.velY = 0;
        //this.shape.rotation.z = Math.PI;
        // this.shape.quaternion.setFromAxisAngle(
        //   new THREE.Vector3(0, 0, 1),
        //   Math.PI
        // );
        break;
      default:
        this.velX = 0;
        this.velY = 0;

    }
  }

  collide() {
    this.nextX = this.position["x"] + this.velX;
    this.nextY = this.position["y"] + this.velY;

    switch (spatialManager.isWallCollision(this)) {
      case 0:
        this.velX = 0;
        break;
      case 1:
        this.velY = 0;
        break;
      default:
        break;
    }
  }

  killModeActivate() {
    this.modeKiller = true;
    this.updateVel();
    for (let ghost of entityManager.ghosts) {
      ghost.panik();
    }
    // cancelum gomlum timers
    for (let timeout of this.countdownTimers) {
      clearTimeout(timeout);
    }
    // geyma timer til ad geta cancelad ef vid finnum annan special boi food
    this.countdownTimers.push(
      setTimeout(() => {
        this.modeKiller = false;
        this.vel = this.defaultVel;
        this.updateVel();

        for (let ghost of entityManager.ghosts) {
          ghost.kalm();
        }
      }, 1000 * killerModeDuration)
    );
  }

  updateVel() {
    this.vel = this.modeKiller ? this.killModeVel : this.defaultVel;

    // also.... need this so we don't wait until next keypress to update
    if (this.velX != 0) {
      this.velX = this.velX > 0 ? this.vel : -this.vel;
    }
    if (this.velY != 0) {
      this.velY = this.velY > 0 ? this.vel : -this.vel;
    }
  }

  die() {
    if (this.cooldown) return;
    this.cooldown = true;
    this.shape.material.color.set(this.cooldownColor);
    this.countdownTimers.push(setTimeout(() => {
      this.cooldown = false;
      this.shape.material.color.set(this.defaultColor);
    }, 1000 * this.cooldownTime));

    this.lives -= 1;
    if (this.lives < 0) {
    //   entityManager.lose();
    }
    this.resetPosition();
  }

  resetPosition() {
    this.position["x"] = this.origX;
    this.position["y"] = this.origY;
    this.shape.position.copy(this.position);
    this.shape.updateMatrix();
  }
  
}

function eatKey(keyCode) {
    if (keys[keyCode]) {
      keys[keyCode] = false;
      console.log("key")
      return true;
    } else 
    return false;
}

