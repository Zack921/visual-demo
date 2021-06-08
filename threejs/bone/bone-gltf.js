import { OrbitControls } from './three/orbitcontrols.js';
import './three/GLTFLoader.js';

let domElement = document.getElementById("avatarDom");
let canvasW = domElement.clientWidth;
let canvasH = domElement.clientHeight;

let renderer = new THREE.WebGLRenderer();
domElement.appendChild(renderer.domElement);

renderer.setSize(canvasW, canvasH);

let scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(45, 500 / 500, 1, 1000);
camera.position.set(5, 5, 10);
camera.lookAt(scene.position);
camera.aspect = canvasW / canvasH;
camera.updateProjectionMatrix();
scene.add(camera);
scene.add(new THREE.AmbientLight(0x333333));
scene.background = new THREE.Color(0xa0a0a0);

const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const axisHelper = new THREE.AxisHelper(100);
scene.add(axisHelper);

let clock = new THREE.Clock();
let mixer,animationClip,clipAction = null;
var loader = new THREE.GLTFLoader();

loader.load('human.gltf', function (result) {
  console.log('result: ', result);
  scene.add(result.scene);

  mixer = new THREE.AnimationMixer( result.scene );
  animationClip = result.animations[0];
  clipAction = mixer.clipAction( animationClip ).play();

});

function render() {
  var delta = clock.getDelta();
  requestAnimationFrame(render);
  renderer.render(scene, camera)

  if (mixer && clipAction) {
    mixer.update( delta );
  }
}
render();
           