import { OBJLoader } from "./assets/OBJLoader.js";

let renderer;
let stats;
let camera;
let scene;
let light;
let geometry1;
let cache;
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
let textRotate = 0;
let lovePoints = [];
let loveGeo;
let loveGroup;
let lovePointNum = 360;
let drawPointNum = 10;
let hasShowLove = false;
let hasShowLoveAni = false;

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

function initObject2() {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  const textureLoader = new THREE.TextureLoader();

  const sprite1 = textureLoader.load("img/0.jpg");

  for (let i = 0; i < 10000; i++) {
    const x = Math.random() * 2000 - 1000;
    const y = Math.random() * 2000 - 1000;
    const z = Math.random() * 2000 - 1000;

    vertices.push(x, y, z);
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  const parameters = [[[0.9, 0.05, 0.5], sprite1, 10]];

  const material = new THREE.PointsMaterial({
    size: 20,
    map: sprite1,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
  });
  material.color.setHSL(0.9, 0.05, 0.5);
  const material2 = new THREE.PointsMaterial({ color: 0x888888, size: 5 });

  geometry1 = new THREE.SphereGeometry(50);
  const particles = new THREE.Points(geometry1, material2);
  console.log("particles: ", particles);
  scene.add(particles);
  cache = JSON.parse(JSON.stringify(geometry1.vertices));
  console.log("cache: ", cache);
  geometry1.vertices.forEach((point, index) => {
    point.x = 0;
    // point.y = -100 - index;
    point.y = 0;
    point.z = 0;
  });

  // 搞一朵花
  var points = [];
  for (var b = 0; b <= 360; b++) {
    var pointx = x(b, lineRose(b, 50));
    var pointy = y(b, lineRose(b, 50));
    var pointz = Math.pow(4 * (pointx * pointx + pointy * pointy), 0.33);
    points.push(new THREE.Vector3(pointx, pointy, -pointz));
  }

  var spline = new THREE.CatmullRomCurve3(points);
  var geometryF = new THREE.Geometry();
  for (var i = 0; i < points.length; i++) {
    var index = i / points.length;
    var position = spline.getPoint(index);
    geometryF.vertices[i] = new THREE.Vector3(
      position.x,
      position.y,
      position.z
    );
  }
  const line = new THREE.Line(geometryF);
  scene.add(line);

  const group = new THREE.Group();
  scene.add(group);

  let particle2;

  //创建一个球型用作最后的形状
  var geometry2 = new THREE.SphereGeometry(50, 8, 8);
  var vl = geometry2.vertices.length;

  var vl = geometryF.vertices.length;

  const material3 = new THREE.PointsMaterial({ color: 0x888888, size: 1 });

  for (var i = 0; i < vl; i++) {
    // //为每个点附上材质
    // var material = new THREE.SpriteCanvasMaterial({
    //   color: Math.random() * 0x808008 + 0x808080,
    //   program: program,
    // });

    particle2 = new THREE.Sprite();
    particle2.position.x = 0;
    particle2.position.y = 0;
    particle2.position.z = 0;
    // particle2.scale.x = particle2.scale.y = Math.random() * 6 + 3;
    var timerandom = 1 * Math.random();
    // 为每个点加动画

    TweenMax.to(particle2.position, timerandom, {
      // x: geometry2.vertices[i].x + (0.5 - Math.random()) * 100,
      // y: geometry2.vertices[i].y + (0.5 - Math.random()) * 100,
      // z: geometry2.vertices[i].z + Math.random() * 100,
      x: geometryF.vertices[i].x,
      y: geometryF.vertices[i].y,
      z: geometryF.vertices[i].z,
      delay: 1.8,
    });

    // TweenMax.to(particle2.position, timerandom, {
    //   y: "-=1500",
    //   z: "300",
    //   delay: 1.8 + timerandom,
    //   ease: Power2.easeIn,
    // });
    group.add(particle2);
  }

  // var loader = new OBJLoader();
  // loader.load('./models/love_heart.obj', function (group) {
  //   console.log('group: ', group);
  //   const geometry2 = group.children[0].geometry;
  //   console.log('geometry2: ', geometry2);
  //   const heartPoint = new THREE.Points(geometry2, material2);
  //   heartPoint.scale.set(30, 30, 30);
  //   scene.add(heartPoint);
  //   console.log('heartPoint: ', heartPoint);
  //   // cache = JSON.parse(JSON.stringify(geometry1.vertices));
  //   // console.log("cache: ", cache);
  //   // geometry1.vertices.forEach((point, index) => {
  //   //   point.x = 0;
  //   //   point.y = -100 - index;
  //   //   point.z = 0;
  //   // });
  // });

  // for (let i = 0; i < parameters.length; i++) {
  //   const color = parameters[i][0];
  //   const sprite = parameters[i][1];
  //   const size = parameters[i][2];

  //   materials[i] = new THREE.PointsMaterial({
  //     size: size,
  //     map: sprite,
  //     blending: THREE.AdditiveBlending,
  //     depthTest: false,
  //     transparent: true,
  //   });
  //   materials[i].color.setHSL(color[0], color[1], color[2]);

  //   const geometry = new THREE.SphereGeometry( 500, 50, 50 );
  //   const particles = new THREE.Points(geometry, materials[i]);

  //   // particles.rotation.x = Math.random() * 6;
  //   // particles.rotation.y = Math.random() * 6;
  //   // particles.rotation.z = Math.random() * 6;

  //   scene.add(particles);
  // }
}

function initObject() {
  // 画玫瑰
  const points = [];
  let pointx, pointy, pointz;
  for (let i = 0; i <= 360; i++) {
    pointx = x(i, lineRose(i, 50));
    pointy = y(i, lineRose(i, 50));
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
  // const roseLine = new THREE.Line(roseGeo);
  // scene.add(roseLine);

  roseGroup = new THREE.Group();
  let roseSprite;
  for (let i = 0; i < roseGeo.vertices.length; i++) {
    roseSprite = new THREE.Sprite();
    roseSprite.position.x = 0;
    roseSprite.position.y = -10 - (i % 50);
    roseSprite.position.z = 0;
    // particle2.scale.x = particle2.scale.y = Math.random() * 6 + 3;

    roseGroup.add(roseSprite);
  }
  scene.add(roseGroup);
  console.log("roseGroup: ", roseGroup);
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
      // x: geometry2.vertices[i].x + (0.5 - Math.random()) * 100,
      // y: geometry2.vertices[i].y + (0.5 - Math.random()) * 100,
      // z: geometry2.vertices[i].z + Math.random() * 100,
      x: roseGeo.vertices[index].x,
      y: roseGeo.vertices[index].y,
      z: roseGeo.vertices[index].z,
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
    const textGeo = new THREE.TextGeometry("1 hello", {
      font: font,
      size: 50,
      height: 5,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 1,
      bevelSegments: 1,
    });

    textGeo.vertices.forEach((vertice) => {
      vertice.x -= 100;
      vertice.y -= 15;
    });
    textGeo.verticesNeedUpdate = true;

    textMesh = new THREE.Mesh(textGeo);
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
      },
    });

    hasShowText = true;
  });
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
  let loveSprite, timerandom;
  for (let i = 0; i < loveGeo.vertices.length; i++) {
    let timerandom = 1 * Math.random();

    loveSprite = new THREE.Sprite();
    loveSprite.position.x = loveGeo.vertices[i].x;
    loveSprite.position.y = loveGeo.vertices[i].y;
    loveSprite.position.z = loveGeo.vertices[i].z;
    // particle2.scale.x = particle2.scale.y = Math.random() * 6 + 3;

    loveGroup.add(loveSprite);

    TweenMax.to(loveSprite.position, timerandom, {
      y: "-=1500",
      delay: 1.8 + timerandom,
      ease: Power2.easeIn,
    });
  }
  scene.add(loveGroup);
  hasShowLoveAni = true;
}

function render() {
  renderer.render(scene, camera);
  stats.update();

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
    return showTextAni();
  }

  if (finishTextHideAni && !hasShowLove) return showLove();

  if (hasShowLove && !hasShowLoveAni) return showLoveAni();
}

function animation() {
  TweenLite.ticker.addEventListener("tick", render);
}

function start() {
  initStatus();
  initThree();
  initScene();
  initCamera();
  initLight();
  initObject();

  animation();
}

start();
