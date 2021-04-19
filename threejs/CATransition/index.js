let renderer;
let stats;
let camera;
let scene;
let light;
const mesh = [];
const meshMaterial = [];
const meshNum = 9;
let index = 0;
let isFirstClick = true;

const domElement = document.getElementById("canvas-frame");

const hideMaterial = new THREE.MeshBasicMaterial({
  color: 0x333333,
  transparent: true,
  opacity: 0.1,
});

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

  renderer.setClearColor("rgb(255,255,247)", 1.0);
}

function initScene() {
  scene = new THREE.Scene();
  const axisHelper = new THREE.AxesHelper(100);
  scene.add(axisHelper);
}

function initCamera() {
  const width = domElement.clientWidth;
  const height = domElement.clientHeight;

  camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
  camera.position.z = 500;
  camera.lookAt(scene.position);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  scene.add(camera);
}

function initLight() {
  light = new THREE.AmbientLight(0xffffff);
  light.position.set(100, 100, 200);
  scene.add(light);
  light = new THREE.PointLight(0x00ff00);
  light.position.set(0, 0, 300);
  scene.add(light);
}

function initObject() {
  let rand = [];
  for (let i = 0; i <= meshNum; i++) {
    rand[i] = i;
  }
  rand.sort(function () {
    return 0.5 - Math.random();
  });
  console.log("rand: ", rand);
  for (let i = 0; i <= meshNum; i++) {
    const random = Math.random();
    const radius = random * 30 + 20;
    const geometry = new THREE.CubeGeometry(radius, radius, radius);
    const loader = new THREE.TextureLoader();
    const texture = loader.load("img/" + rand[i] + ".jpg");
    const materials = [];
    for (let j = 0; j < 6; ++j) {
      if (j == 4) {
        materials.push(
          new THREE.MeshBasicMaterial({
            map: texture,
          })
        );
      } else {
        materials.push(
          new THREE.MeshBasicMaterial({
            color: 0x333333,
          })
        );
      }
    }
    mesh[i] = new THREE.Mesh(geometry, materials);

    mesh[i].position.x = (Math.random() - 0.5) * 400;
    mesh[i].position.y = (Math.random() - 0.4) * 200;
    mesh[i].position.z = (Math.random() - 0.5) * 300;

    meshMaterial.push(materials);

    let rotateY;
    // 第一象限
    if (mesh[i].position.x > 0 && mesh[i].position.z > 0) {
      const tan = mesh[i].position.x / mesh[i].position.z;
      rotateY = Math.atan(tan) + 3.14;
      // 第二象限
    } else if (mesh[i].position.x < 0 && mesh[i].position.z > 0) {
      const tan = mesh[i].position.z / mesh[i].position.x;
      rotateY = 1.57 - Math.atan(tan);
      // 三、四象限
    } else {
      const tan = mesh[i].position.x / mesh[i].position.z;
      rotateY = Math.atan(tan);
    }

    TweenMax.to(mesh[i].rotation, 1.5, {
      y: rotateY, // 正方体正面朝向 同高度 的原点, 默认逆时针旋转
      delay: 0,
    });

    scene.add(mesh[i]);
  }
}

function render() {
  renderer.render(scene, camera);
  stats.update();
}

function animation() {
  TweenLite.ticker.addEventListener("tick", render);
}

function cameraRoAni() {
  console.log('index: ', index);
  mesh.forEach((item) => {
    item.material = hideMaterial;
  });
  mesh[index - 1].material = meshMaterial[index - 1];
  const cube = mesh[index - 1];
  TweenMax.to(cube.rotation, 5, {
    y: cube.rotation.y + 3.14 * 2,
    delay: 0.5,
  });
}

function initEvent() {
  const next = document.getElementById("next");

  next.addEventListener("click", function () {
    // next.style.visibility = "hidden";

    if(isFirstClick) {
      mesh.forEach((item) => {
        item.material = hideMaterial;
      });
      isFirstClick = false;
    }

    if (index > meshNum) {
      index = 0;
    }
    const cube = mesh[index];
    let rotate = cube.rotation.y;
    // 利用相似三角形，计算camera到物体相隔4倍边长的点
    // 获取边长
    let cubeHeight = cube.geometry.parameters.height;
    // 物体的位置
    let cubeX = cube.position.x;
    let cubeZ = cube.position.z;
    // 物体到y轴的距离
    let toY = Math.sqrt(cubeX * cubeX + cubeZ * cubeZ);
    // camera的位置
    let cameraX = cubeX * (1 - (4 * cubeHeight) / toY);
    let cameraZ = cubeZ * (1 - (4 * cubeHeight) / toY);

    if (index == 0) {
      TweenMax.to(camera.position, 1.5, {
        x: cameraX,
        y: cube.position.y,
        z: cameraZ,
        delay: 0,
        ease: Cubic.easeIn,
      });
      TweenMax.to(camera.rotation, 0.5, {
        y: rotate,
        delay: 1.5,
      });
    } else {
      TweenMax.to(camera.position, 2, {
        x: cameraX,
        y: cube.position.y,
        z: cameraZ,
        delay: 0,
        ease: Cubic.easeIn,
      });

      TweenMax.to(camera.rotation, 2, {
        y: rotate,
        delay: 0,
      });
    }
    index++;
    setTimeout(cameraRoAni, 2000);
  });
}

function start() {
  initEvent();
  initStatus();
  initThree();
  initScene();
  initCamera();
  initLight();
  initObject();

  animation();
}

start();
