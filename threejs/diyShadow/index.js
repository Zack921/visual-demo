import { OrbitControls } from "./assets/orbitcontrols.js";

let renderer;
let stats;
let camera;
let camera4SM;
let scene;
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

  renderer.setClearColor("rgb(255,255,255)", 1.0);
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
  camera.position.set(50, 50, 200);
  camera.lookAt(scene.position);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  scene.add(camera);

  // camera2 = new THREE.PerspectiveCamera(45, width / height, 1, 10000); 暂时不知道为啥不能使用透视相机
  camera4SM = new THREE.OrthographicCamera(-100, 100, 100, -100, 1, 70);
  camera4SM.position.set(20, 50, 0);
  camera4SM.lookAt(bufferScene.position);
  camera4SM.aspect = width / height;
  camera4SM.updateProjectionMatrix();
  bufferScene.add(camera4SM);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  // const lightCameraHelper = new THREE.CameraHelper( camera );
  // scene.add( lightCameraHelper );
}

function initLight() {
  const light = new THREE.DirectionalLight(0xffffff); // 平行光
  light.position.set(20, 50, 0);
  scene.add(light);

  const lightGeo = new THREE.BoxGeometry(5, 5, 5);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
  const lightCube = new THREE.Mesh(lightGeo, lightMat);
  lightCube.position.set(20, 50, 0);
  scene.add(lightCube);
}

function initObject() {
  // add object in buffer scene
  const getSMMaterial = new THREE.ShaderMaterial({
    uniforms: {
      projectionMatrixSM: { value: camera4SM.projectionMatrix },
    },
    vertexShader: document.getElementById("vertexShaderSM").textContent,
    fragmentShader: document.getElementById("fragmentShaderSM").textContent,
  });

  const groundGeo = new THREE.BoxGeometry(40, 40, 1);
  const groundInBuffer = new THREE.Mesh(groundGeo, getSMMaterial);
  groundInBuffer.rotation.x = Math.PI / 2;
  groundInBuffer.name = "groundPlane";
  bufferScene.add(groundInBuffer);

  const cubeGeo = new THREE.BoxGeometry(20, 20, 20);
  const cubeInBuffer = new THREE.Mesh(cubeGeo, getSMMaterial);
  cubeInBuffer.position.y += 10;
  cubeInBuffer.name = "cubeInBuffer";
  bufferScene.add(cubeInBuffer);

  // add object in screen scene
  const useSM4CubeMat = new THREE.ShaderMaterial({
    // attributes 居然传不进去
    uniforms: {
      modelViewMatrixSM: { value: cubeInBuffer.modelViewMatrix },
      projectionMatrixSM: { value: camera4SM.projectionMatrix },
      depthTexture: { value: bufferTexture.texture },
      color: { value: new THREE.Vector3(0, 1, 0) },
    },
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragmentShader").textContent,
  });

  const cubeBufGeo = new THREE.BufferGeometry();
  cubeBufGeo.fromGeometry(cubeGeo);
  const cubeInScreen = new THREE.Mesh(cubeBufGeo, useSM4CubeMat);
  cubeInScreen.position.y += 10;
  cubeInScreen.name = "cubeInScreen";
  scene.add(cubeInScreen);

  const useSM4GroundMat = new THREE.ShaderMaterial({
    uniforms: {
      modelViewMatrixSM: { value: groundInBuffer.modelViewMatrix },
      projectionMatrixSM: { value: camera4SM.projectionMatrix },
      depthTexture: { value: bufferTexture.texture },
      color: { value: new THREE.Vector3(1, 1, 1) },
    },
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragmentShader").textContent,
  });

  const planeInScreen = new THREE.Mesh(groundGeo, useSM4GroundMat);
  planeInScreen.rotation.x = Math.PI / 2;
  planeInScreen.name = "planeInScreen";
  scene.add(planeInScreen);

  // 展示 shadow map
  const showSMGeo = new THREE.BoxGeometry(40, 40, 1);
  const smMaterial = new THREE.MeshBasicMaterial({
    map: bufferTexture.texture, //获取渲染目标缓冲区中的纹理
  });
  const showSMInScreen = new THREE.Mesh(showSMGeo, smMaterial);
  showSMInScreen.position.set(-50, 30, 0);
  showSMInScreen.name = "showSMInScreen";
  scene.add(showSMInScreen);

  console.log("bufferScene: ", bufferScene);
  console.log("scene: ", scene);
}

function render() {
  // 渲染到目标缓冲区
  renderer.setClearColor("rgb(255,255,255)", 1.0);
  renderer.setRenderTarget(bufferTexture);
  renderer.render(bufferScene, camera4SM);

  // 渲染到屏幕
  renderer.setClearColor("rgb(150,150,150)", 1.0);
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
