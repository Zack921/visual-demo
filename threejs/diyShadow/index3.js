function init() {
  var scene = new THREE.Scene();
  // scene.background = new THREE.Color(0x000000); //场景的背景色

  var camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.set(30, 30, 60); //相机的位置
  camera.up.set(0, 1, 0); //相机以哪个方向为上方
  camera.lookAt(new THREE.Vector3(0, 0, 0)); //相机看向哪个坐标

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  // renderer.setClearColor(0xffffff, 1); //渲染器的背景色
  document.body.appendChild(renderer.domElement);

  const diyMaterial = new THREE.ShaderMaterial({
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
  });

//   const material = new THREE.ShaderMaterial({
//     vertexShader : document.getElementById('vertexShader').textContent,
//     fragmentShader: document.getElementById('fragmentShader').textContent
// })
// const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.0,1.0),material);
//   scene.add(mesh);

  const cubeGeo2 = new THREE.BoxGeometry(20, 20, 20);
  var mesh = new THREE.Mesh(cubeGeo2, diyMaterial); //网格模型对象Mesh
  scene.add(mesh);

  function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
  render();
}

init();
