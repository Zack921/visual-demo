import { OrbitControls } from "./assets/orbitcontrols.js";

let renderer;
let stats;
let camera;
let camera2;
let scene;
let light;
let bufferScene;
let bufferTexture;

const domElement = document.getElementById("canvas-frame");

function initStatus() {
  stats = Stats();
  stats.domElement.style.position = "absolute";
  stats.domElement.style.left = "0px";
  stats.domElement.style.top = "0px";
  domElement.appendChild(stats.domElement);
}

function initThree() {
  const width = domElement.clientWidth;
  const height = domElement.clientHeight;

  renderer = new THREE.WebGLRenderer();
  domElement.appendChild(renderer.domElement);

  renderer.setSize(width, height);

  renderer.setClearColor("rgb(150,150,150)", 1.0);
}

function initScene() {
  scene = new THREE.Scene();
  const axisHelper = new THREE.AxesHelper(100);
  scene.add(axisHelper);

  //缓存场景
  bufferScene = new THREE.Scene();
  //渲染目标缓冲区
  bufferTexture = new THREE.WebGLRenderTarget(
    domElement.clientWidth,
    domElement.clientHeight
  );
  bufferTexture.depthBuffer = true;
  bufferTexture.depthTexture = new THREE.DepthTexture();
}

function initCamera() {
  const width = domElement.clientWidth;
  const height = domElement.clientHeight;

  camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
  camera.position.x = 50;
  camera.position.y = 50;
  camera.position.z = 200;
  camera.lookAt(scene.position);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  scene.add(camera);

  // camera2 = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
  camera2 = new THREE.OrthographicCamera( -100, 100, 100, -100, 1, 70 );
  camera2.position.x = 20;
  camera2.position.y = 50;
  camera2.position.z = 0;
  camera2.lookAt(bufferScene.position);
  camera2.aspect = width / height;
  camera2.updateProjectionMatrix();
  bufferScene.add(camera2);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  // const lightCameraHelper = new THREE.CameraHelper( camera );
  // scene.add( lightCameraHelper );
}

function initLight() {
  const light = new THREE.DirectionalLight(0xffffff); // 平行光
  light.position.set(20, 50, 0);
  scene.add(light);
  const light2 = new THREE.DirectionalLight(0xffffff); // 平行光
  light2.position.set(20, 50, 0);
  bufferScene.add(light2);

  const lightGeo = new THREE.BoxGeometry(5, 5, 5);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
  const lightCube = new THREE.Mesh(lightGeo, lightMat);
  lightCube.position.x = 20;
  lightCube.position.y = 50;
  scene.add(lightCube);

  const lightCube2 = new THREE.Mesh(lightGeo, lightMat);
  lightCube2.position.x = 20;
  lightCube2.position.y = 50;
  // bufferScene.add(lightCube2);
}

function initObject() {
  const smMaterial = new THREE.ShaderMaterial({
    uniforms: {
      projectionMatrixSM: { value: camera2.projectionMatrix },
    },
    vertexShader: document.getElementById("vertexShaderSM").textContent,
    fragmentShader: document.getElementById("fragmentShaderSM").textContent,
  });
  console.log('camera2.modelViewMatrix: ', camera2.modelViewMatrix);
  console.log('camera2.projectionMatrixSM: ', camera2.projectionMatrix);

  const geometry = new THREE.BoxGeometry(40, 40, 1);
  var planeMaterial = new THREE.MeshBasicMaterial({
    map: bufferTexture.texture, //获取渲染目标缓冲区中的纹理
  });
  const plane = new THREE.Mesh(geometry, planeMaterial);
  plane.position.x = -50;
  plane.position.y = 30;
  // plane.rotation.x = Math.PI / 2;
  scene.add(plane);

  const plane2 = new THREE.Mesh(geometry, smMaterial);
  plane2.rotation.x = Math.PI / 2;
  bufferScene.add(plane2);

  const cubeGeo = new THREE.BoxGeometry(20, 20, 20);
  const cubeMat = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(cubeGeo, smMaterial);
  // const cube = new THREE.Mesh(cubeGeo, cubeMat);
  cube.position.y += 10;
  cube.name = 'cube';
  bufferScene.add(cube);

  const diyMaterial = new THREE.ShaderMaterial({
    // attributes 居然传不进去
    // attributes: {
    //   test: { value: 0.5 },
    // },
    uniforms: {
      modelViewMatrixSM: { value: cube.modelViewMatrix },
      projectionMatrixSM: { value: camera2.projectionMatrix },
      depthTexture: { value: bufferTexture.texture },
    },
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragmentShader").textContent,
  });
  console.log('modelViewMatrixSM: ', cube.modelViewMatrix);
  console.log('projectionMatrixSM: ', camera2.projectionMatrix);
  const diyMaterial2 = new THREE.ShaderMaterial({
    uniforms: {
      modelViewMatrixSM: { value: plane2.modelViewMatrix },
      projectionMatrixSM: { value: camera2.projectionMatrix },
      depthTexture: { value: bufferTexture.texture },
    },
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragmentShader").textContent,
  });
  const cubeGeo2 = new THREE.BoxGeometry(20, 20, 20);
  const bGeometry = new THREE.BufferGeometry();
  bGeometry.fromGeometry(cubeGeo2);
  var mesh = new THREE.Mesh(bGeometry, diyMaterial); // 网格模型对象Mesh
  mesh.position.y += 10;
  scene.add(mesh);

  const plane3 = new THREE.Mesh(geometry, diyMaterial2);
  plane3.rotation.x = Math.PI / 2;
  scene.add(plane3);

  console.log("bufferScene: ", bufferScene);
  console.log('scene: ', scene);
}

function render() {
  // 渲染到目标缓冲区
  // camera.position.x = 20;
  // camera.position.y = 50;
  // camera.position.z = 0;
  // camera.lookAt(bufferScene.position);
  // camera.updateProjectionMatrix();
  renderer.setRenderTarget(bufferTexture);
  renderer.render(bufferScene, camera2);
  // 渲染到屏幕
  // camera.position.x = 50;
  // camera.position.y = 50;
  // camera.position.z = 200;
  // camera.lookAt(scene.position);
  // camera.updateProjectionMatrix();
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);

  stats.update();
  requestAnimationFrame(render);
}

function start() {
  initStatus();
  initThree();
  initScene();
  initCamera();
  initLight();
  initObject();

  render();
}

start();
