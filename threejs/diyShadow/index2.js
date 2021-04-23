function init() {
  var scene = new THREE.Scene();
  // scene.background = new THREE.Color(0x000000); //场景的背景色

  var camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.set(0, 0, 60); //相机的位置
  camera.up.set(0, 1, 0); //相机以哪个方向为上方
  camera.lookAt(new THREE.Vector3(0, 0, 0)); //相机看向哪个坐标

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff, 1); //渲染器的背景色
  document.body.appendChild(renderer.domElement);

  //缓存场景
  var bufferScene = new THREE.Scene();
  //渲染目标缓冲区
  var bufferTexture = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight
  );

  // create the ground plane
  var fboGeometry = new THREE.PlaneGeometry(60, 30);
  var fboMaterial = new THREE.MeshBasicMaterial({
    color: 0xaaaaaa,
  });

  var fboPlane = new THREE.Mesh(fboGeometry, fboMaterial);

  // add the plane to the scene
  bufferScene.add(fboPlane);

  //渲染到目标缓冲区
  renderer.setRenderTarget(bufferTexture);
  renderer.render(bufferScene, camera);

  // //渲染到屏幕
  renderer.setRenderTarget(null);

  // create the ground plane
  var planeGeometry = new THREE.PlaneGeometry(40, 20);
  var planeMaterial = new THREE.MeshBasicMaterial({
    map: bufferTexture.texture, //获取渲染目标缓冲区中的纹理
  });

  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(plane);

  function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
  render();
}

init();
