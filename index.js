import { EntityManager } from "./src/entityManager.js";
import { keys } from "./src/keys.js"
import { Level } from "./src/level.js";

window.onload = function init () {
   // Meðhöndlun lykla
   window.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
  });

  window.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
  });
}

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

export const scene = new THREE.Scene();


const fov = 60;
const aspect =  window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 1000.0;
export const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

const ambLight = new THREE.AmbientLight( 0x404040 ); // soft white light
ambLight.position.z = 50;

const dirLight = new THREE.DirectionalLight( 0xffffff);
dirLight.position.set(10,10,10);
scene.add( ambLight );
scene.add( dirLight );

const loader = new THREE.CubeTextureLoader();
const skyTex = loader.load([
      './assets/graycloud_ft.jpg',
      './assets/graycloud_bk.jpg',
      './assets/graycloud_up.jpg',
      './assets/graycloud_dn.jpg',
      './assets/graycloud_lf.jpg',
      './assets/graycloud_rt.jpg',
    
]);

scene.background = skyTex;

//todo window resize

const entityManager = new EntityManager();
const level = new Level()


const testWalls = level.walls;
console.log(level.walls);

testWalls.forEach( item => {
  if (item == null) return; // dont push null;
  scene.add(item.wall);
});

//scene.add(level.floor.floor);

// dummy floor
//const dummyfloorGeometry = new THREE.PlaneGeometry( 800, 1000 );
//const dummyMat = new THREE.MeshPhongMaterial({ color: "grey"});
//const dummyFloor = new THREE.Mesh(dummyfloorGeometry, dummyMat)
//
//scene.add(dummyFloor);

//scene.add(level.floor);

scene.add(entityManager.pacman.sphere);


//scene.add(entityManager.plane.floor);
//scene.add(entityManager.wall.wall);
// entityManager.kill(entityManager.pacman.sphere);

camera.position.z = 1000;
camera.position.y = 500;
camera.position.x = 500;




function render() {
  requestAnimationFrame(render);
  entityManager.update();
  renderer.render(scene, camera);
};

render();