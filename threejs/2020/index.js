import { OBJLoader } from "./assets/OBJLoader.js";

let renderer;
let stats;
let camera;
let scene;
let light;
let clock = new THREE.Clock();
let delta, speed;
var t1 = new Date().getTime();
let isReady = false;
let hasShowRose = false;
let hasShowRoseAni = false;
let hasShowText = false;
let hasShowTextAni = false;
let hasShowTextAniHide = false;
let finishTextHideAni = false;
let roseGeo;
let roseGroup;
let textMesh;
let lovePoints = [];
let loveGeo;
let loveGroup;
let lovePointNum = 360;
let drawPointNum = 10;
let hasShowLove = false;
let hasShowLoveAni = false;
let finishLoveSpriteNum = 0;
// 转场动画相关
const mesh = [];
const meshMaterial = [];
const meshNum = 1;
let hasInitPhoto = false;
let index = 0;
let isFirstClick = true;
const hideMaterial = new THREE.MeshBasicMaterial({
  color: 0x333333,
  transparent: true,
  opacity: 0.1,
});
// 背景粒子动画
let hasInitBgPoints = false;

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

  // renderer.setClearColor("rgb(255,255,247)", 1.0);
}

function initScene() {
  scene = new THREE.Scene();
  // const axisHelper = new THREE.AxesHelper(100);
  // scene.add(axisHelper);
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

function deleteObj(obj) {
  if (!obj) return;
  if (obj.type === "Group") {
    // 删除掉所有的模型组内的mesh
    obj.traverse(function (item) {
      if (item instanceof THREE.Mesh) {
        item.geometry.dispose(); // 删除几何体
        item.material.dispose(); // 删除材质
      }
    });
  } else if (obj.type === "Mesh") {
    item.geometry.dispose(); // 删除几何体
    item.material.dispose(); // 删除材质
  }
}

// 玫瑰曲线
// k代表有“几朵花瓣”，如果k是奇数，则得到的花瓣数就是k，如果k为偶数，则得到的花瓣数为2k。
// a同上表示从中心点到最远处的距离
function lineRose(o, a = 10, k = 4) {
  return a * Math.cos((k * o * Math.PI) / 180);
}
//心形线
// a表示从x轴上从原点到最远点的一半
function lineLove(o, a = 100) {
  return a * (1 - Math.cos((o * Math.PI) / 180));
}
// 极坐标转 x/y 坐标
function x(o, p, rotate = 0) {
  return p * Math.cos(((o + rotate) * Math.PI) / 180);
}
function y(o, p, rotate = 0, deltaY = 0) {
  return p * Math.sin(((o + rotate) * Math.PI) / 180) + deltaY;
}

function initObject() {
  // 画玫瑰
  const points = [];
  let pointx, pointy, pointz;
  for (let i = 0; i <= 720; i++) {
    pointx = x(i, lineRose(i, 90));
    pointy = y(i, lineRose(i, 90));
    pointz = Math.pow(4 * (pointx * pointx + pointy * pointy), 0.33);
    points.push(new THREE.Vector3(pointx, pointy, -pointz));
  }

  const spline = new THREE.CatmullRomCurve3(points);
  roseGeo = new THREE.Geometry();
  for (let i = 0; i < points.length; i++) {
    let index = i / points.length;
    const position = spline.getPoint(index);
    roseGeo.vertices[i] = new THREE.Vector3(position.x, position.y, position.z);
  }

  roseGroup = new THREE.Group();
  roseGroup.name = "roseGroup";
  let roseSprite;
  for (let i = 0; i < roseGeo.vertices.length; i++) {
    const material = new THREE.PointsMaterial({
      color: Math.random() * 0x808008 + 0x808080,
      size: 5,
    });
    roseSprite = new THREE.Sprite(material);
    roseSprite.position.x = 0;
    roseSprite.position.y = -10 - (i % 50);
    roseSprite.position.z = 0;

    roseGroup.add(roseSprite);
  }
  scene.add(roseGroup);
}

// 正弦函数
function fsin(x, length = 30) {
  return length * Math.sin(x / (Math.PI * 2));
}

function checkIsReady() {
  for (let sprite of roseGroup.children) {
    if (sprite.position.y < 0) {
      return false;
    }
  }
  return (isReady = true);
}

function showRose() {
  let sprite, timerandom;
  for (let index = 0; index < roseGroup.children.length; index++) {
    sprite = roseGroup.children[index];
    timerandom = 1 * Math.random();

    TweenMax.to(sprite.position, timerandom, {
      x: roseGeo.vertices[index].x + (0.5 - Math.random()) * 10,
      y: roseGeo.vertices[index].y + (0.5 - Math.random()) * 10,
      z: roseGeo.vertices[index].z + Math.random() * 10,
      // x: roseGeo.vertices[index].x,
      // y: roseGeo.vertices[index].y,
      // z: roseGeo.vertices[index].z,
      delay: 1,
    });

    TweenMax.to(sprite.position, 0.5, {
      x: 0,
      y: 0,
      z: 0,
      delay: 2 + timerandom,
      ease: Power2.easeIn,
      onComplete: () => {
        hasShowRoseAni = true;
      },
    });
  }
  hasShowRose = true;
}

function showText() {
  const loader = new THREE.FontLoader();
  loader.load("assets/helvetiker_regular.typeface.json", function (font) {
    const textGeo = new THREE.TextGeometry("1 year", {
      font: font,
      size: 40,
      height: 5,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 1,
      bevelSegments: 1,
    });

    textGeo.vertices.forEach((vertice) => {
      vertice.x -= 80;
      vertice.y -= 15;
    });
    textGeo.verticesNeedUpdate = true;

    const textMaterial = new THREE.MeshPhongMaterial({
      color: 0xe166d3,
      shininess: 30,
    });

    textMesh = new THREE.Mesh(textGeo, textMaterial);
    textMesh.name = "textMesh";
    textMesh.scale.set(0, 0, 0);

    scene.add(textMesh);

    TweenMax.to(textMesh.scale, 0.5, {
      x: 1,
      y: 1,
      z: 1,
      delay: 1,
      ease: Power2.easeIn,
      onComplete: () => {
        hasShowTextAni = true;
        scene.remove(roseGroup);
        deleteObj(roseGroup);
        console.log(scene);
      },
    });
  });
  hasShowText = true;
}

function showTextAni() {
  if (!textMesh) return;

  TweenMax.to(textMesh.rotation, 3, {
    y: textMesh.rotation.y + Math.PI * 4,
    delay: 0.5,
    ease: Power2.easeIn,
    onComplete: () => {
      textMesh = null;
    },
  });
  TweenMax.to(textMesh.scale, 3, {
    x: 0,
    y: 0,
    z: 0,
    delay: 0.5,
    ease: Power2.easeIn,
    onComplete: () => {
      textMesh = null;
      finishTextHideAni = true;
    },
  });
  hasShowTextAniHide = true;
}

function showLove() {
  if (lovePoints.length === 0) {
    let pointx, pointy, pointz;
    for (let i = 0; i <= 360; i++) {
      pointx = x(i, lineLove(i, 50), 90);
      pointy = y(i, lineLove(i, 50), 90, 40);
      pointz = 0;
      lovePoints.push(new THREE.Vector3(pointx, pointy, -pointz));
    }
  }

  if (drawPointNum > lovePointNum) {
    return (hasShowLove = true);
  } else {
    drawPointNum += 1;
    const drawPoints = lovePoints.slice(0, drawPointNum);
    const spline = new THREE.CatmullRomCurve3(drawPoints);
    loveGeo = new THREE.Geometry();
    for (let i = 0; i < drawPoints.length; i++) {
      let index = i / drawPoints.length;
      const position = spline.getPoint(index);
      loveGeo.vertices[i] = new THREE.Vector3(
        position.x,
        position.y,
        position.z
      );
    }
    let loveLine = scene.getObjectByName("loveLine");
    if (loveLine) {
      scene.remove(loveLine);
    }
    loveLine = new THREE.Line(loveGeo);
    loveLine.name = "loveLine";
    scene.add(loveLine);
  }
}

function showLoveAni() {
  let loveLine = scene.getObjectByName("loveLine");
  if (loveLine) {
    scene.remove(loveLine);
  }
  const drawPoints = lovePoints.slice(0, drawPointNum);
  const spline = new THREE.CatmullRomCurve3(drawPoints);
  loveGeo = new THREE.Geometry();
  for (let i = 0; i < drawPoints.length; i++) {
    let index = i / drawPoints.length;
    const position = spline.getPoint(index);
    loveGeo.vertices[i] = new THREE.Vector3(position.x, position.y, position.z);
  }

  loveGroup = new THREE.Group();
  loveGroup.name = "loveGroup";
  let loveSprite, timerandom;
  for (let i = 0; i < loveGeo.vertices.length; i++) {
    timerandom = 1 * Math.random();

    const material = new THREE.PointsMaterial({
      color: Math.random() * 0x808008 + 0x808080,
      size: 5,
    });

    loveSprite = new THREE.Sprite(material);
    loveSprite.position.x = loveGeo.vertices[i].x;
    loveSprite.position.y = loveGeo.vertices[i].y;
    loveSprite.position.z = loveGeo.vertices[i].z;
    // particle2.scale.x = particle2.scale.y = Math.random() * 6 + 3;

    loveGroup.add(loveSprite);

    TweenMax.to(loveSprite.position, timerandom, {
      y: "-=1500",
      delay: 1.8 + timerandom,
      ease: Power2.easeIn,
      onComplete: () => {
        finishLoveSpriteNum++;
      },
    });
  }
  scene.add(loveGroup);
  hasShowLoveAni = true;
}

function initPhotoEnv() {
  scene.remove(loveGroup);
  scene.remove(textMesh);
  deleteObj(loveGroup);
  deleteObj(textMesh);

  renderer.setClearColor("rgb(255,255,247)", 0.9);
  if (!hasInitPhoto) initPhotoObject();
}

function initMeshMaterial() {
  const loader = new THREE.TextureLoader();
  for (let i = 0; i <= meshNum; i++) {
    const materials = [];
    let seed = 0;
    for (let j = 0; j < 6; ++j) {
      if (j !== 2 && j !== 3 ) {
        const texture = loader.load(`img/${i}-${seed++}.jpg`);
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

    meshMaterial.push(materials);
  }
}

function initPhotoObject() {
  const next = document.getElementById("next");
  next.innerHTML = 'Wait~'
  next.style.display = "block";
  next.disabled = true;
  setTimeout(() => {
    next.innerHTML = '点我吧~'
    next.disabled = false;
  }, 2000);

  initEvent();
  initBgPoints();

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

    mesh[i] = new THREE.Mesh(geometry, meshMaterial[i]);

    mesh[i].position.x = (Math.random() - 0.5) * 400;
    mesh[i].position.y = (Math.random() - 0.4) * 200;
    mesh[i].position.z = (Math.random() - 0.5) * 300;

    let rotateY;
    // 第一象限
    if (mesh[i].position.x > 0 && mesh[i].position.z > 0) {
      const tan = mesh[i].position.x / mesh[i].position.z;
      rotateY = Math.atan(tan) + Math.PI;
      // 第二象限
    } else if (mesh[i].position.x < 0 && mesh[i].position.z > 0) {
      const tan = mesh[i].position.z / mesh[i].position.x;
      rotateY = Math.PI * 0.5 - Math.atan(tan);
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
  hasInitPhoto = true;
}

function cameraRoAni() {
  console.log("index: ", index);
  mesh.forEach((item) => {
    item.material = hideMaterial;
  });
  mesh[index - 1].material = meshMaterial[index - 1];
  const cube = mesh[index - 1];
  TweenMax.to(cube.rotation, 5, {
    y: cube.rotation.y + Math.PI * 1.5,
    delay: 0.5,
    onComplete: () => {
      next.disabled = false;
      if(index == meshNum + 1){
        console.log('onComplete: ');
        setTimeout(() => {
          showEnd();
        }, 1000);
      }
    }
  });
}

function initEvent() {
  const next = document.getElementById("next");

  next.addEventListener("click", function () {
    next.disabled = true;

    if (isFirstClick) {
      mesh.forEach((item) => {
        item.material = hideMaterial;
      });
      next.innerHTML = '下一张～'
      isFirstClick = false;
    }

    console.log('index: ', index);
    if (index == meshNum) { // 2
      next.style.display = "none";
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

function initBgPoints() {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  const textureLoader = new THREE.TextureLoader();

  const sprite1 = textureLoader.load("img/love.png");

  for (let i = 0; i < 100; i++) {
    const x = Math.random() * 2000 - 1000;
    const y = Math.random() * 2000 - 1000;
    const z = Math.random() * 2000 - 1000;

    vertices.push(x, y, z);
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  const parameters = [[[0.9, 0.05, 0.5], sprite1, 50]];
  const materials = [];

  for (let i = 0; i < parameters.length; i++) {
    const color = parameters[i][0];
    const sprite = parameters[i][1];
    const size = parameters[i][2];

    materials[i] = new THREE.PointsMaterial({
      size: size,
      map: sprite,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
    });

    const particles = new THREE.Points(geometry, materials[i]);

    particles.rotation.x = Math.random() * 6;
    particles.rotation.y = Math.random() * 6;
    particles.rotation.z = Math.random() * 6;

    scene.add(particles);
  }
  hasInitBgPoints = true;
}

function showEnd() {
  const endDiv = document.getElementById("end");
  endDiv.style.display = "block";
  let opacity = 0;
  const timer = setInterval(()=>{
    if(opacity >= 1){
      clearInterval(timer);
    } else {
      opacity += 0.05;
      endDiv.style.opacity = opacity;
    }
  }, 500);
}

function render() {
  renderer.render(scene, camera);
  // stats.update();

  if (!isReady) checkIsReady();

  if (!isReady) {
    delta = 10 * clock.getDelta();
    const speed = 5;
    delta = delta < 2 ? delta : 2;
    const dur = new Date().getTime() - t1;
    if (dur < 18000) {
      roseGroup.traverse(function (child) {
        if (child.position.y < 0) {
          child.position.y += delta * speed * Math.random();
          child.position.x = fsin(child.position.y, 10);
        }
        if (child.position.y >= 0) {
          child.position.x = 0;
          child.position.y = 0;
        }
      });
    }
    return;
  }

  if (!hasShowRose) {
    return showRose();
  }

  if (hasShowRoseAni && !hasShowText) {
    return showText();
  }

  if (hasShowTextAni && !hasShowTextAniHide) {
    initMeshMaterial();
    return showTextAni();
  }

  if (finishTextHideAni && !hasShowLove) return showLove();

  if (hasShowLove && !hasShowLoveAni) return showLoveAni();

  if (loveGeo && finishLoveSpriteNum === loveGeo.vertices.length) {
    initPhotoEnv();
  }

  // initPhotoEnv();

  if (hasInitBgPoints) {
    const time = Date.now() * 0.00003;
    for (let i = 0; i < scene.children.length; i++) {
      const object = scene.children[i];

      if (object instanceof THREE.Points) {
        object.rotation.y = time * (i < 4 ? i + 1 : -(i + 1));
      }
    }
  }
}

function animation() {
  TweenLite.ticker.addEventListener("tick", render);
}

function start() {
  // initStatus();
  initThree();
  initScene();
  initCamera();
  initLight();
  initObject();

  animation();
}

start();
