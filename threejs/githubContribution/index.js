let cache = null;

async function getData(toDate = new Date()) {
  if (!cache) {
    const data = await (await fetch('./assets/github_contributions.json')).json();
    cache = data.contributions.map((o) => {
      o.date = new Date(o.date.replace(/-/g, '/'));
      return o;
    });
  }
  // 要拿到 toData 日期之前大约一年的数据（52周）
  let start = 0,
    end = cache.length;

  // 用二分法查找
  while (start < end - 1) {
    const mid = Math.floor(0.5 * (start + end));
    const { date } = cache[mid];
    if (date <= toDate) end = mid;
    else start = mid;
  }

  // 获得对应的一年左右的数据
  let day;
  if (end >= cache.length) {
    day = toDate.getDay();
  } else {
    const lastItem = cache[end];
    day = lastItem.date.getDay();
  }
  // 根据当前星期几，再往前拿52周的数据
  const len = 7 * 52 + day + 1;
  const ret = cache.slice(end, end + len);
  if (ret.length < len) {
    // 日期超过了数据范围，补齐数据
    const pad = new Array(len - ret.length).fill({ count: 0, color: '#ebedf0' });
    ret.push(...pad);
  }

  return ret;
}

function getColor(percent) {
  if (!percent) {
    return '#ccc';
  }
  return `rgb(0, ${Math.floor((1.2 - percent) * 255)}, 0)`;
}

(async function () {
  const dataset = await getData();
  console.log('dataset: ', dataset);

  const max = d3.max(dataset, (a) => {
    return a.count;
  });
  console.log('max: ', max);

  // paint
  const width = 800;
  const height = 400;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(width / - 200, width / 200, height / 200, height / - 200, -1, 10); // 正交投影
  camera.position.set(1, 3, 3);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  // 轨道控制
  const controls = new THREE.OrbitControls(camera, renderer.domElement);

  // 裁剪平面
  var PlaneArr = [
    // 垂直y轴的平面
    new THREE.Plane(new THREE.Vector3(0, 0.001, 0), 0),
  ];
  renderer.clippingPlanes = PlaneArr;

  // 开启模型对象的局部剪裁平面功能
  // 如果不设置为true，设置剪裁平面的模型不会被剪裁
  renderer.localClippingEnabled = true;

  const defaultGeometry = new THREE.BoxGeometry(1, 0.01, 1);
  const defaultMaterial = new THREE.MeshBasicMaterial({
    color: '#ccc',
  });

  dataset.forEach((item, i) => {
    const height = item.count / max * 3;
    const geometry = new THREE.BoxGeometry(1, height, 1);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(`${getColor(item.count / max)}`),
    });
    const cube = new THREE.Mesh(geometry, material);
    const defaultCube = new THREE.Mesh(defaultGeometry, defaultMaterial);

    cube.scale.set(0.2, 0.1, 0.2);//缩小为原来0.5倍
    defaultCube.scale.set(0.2, 0.1, 0.2);//缩小为原来0.5倍
    const x = Math.floor(i / 7) * 0.2;
    const z = i % 7 * 0.2;
    cube.position.set(x - 8, 0, z);
    defaultCube.position.set(x - 8, 0, z);

    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
    line.scale.set(0.2, 0.1, 0.2);//缩小为原来0.5倍
    line.position.set(x - 8, 0.01, z);
    scene.add(line);

    scene.add(defaultCube);
    scene.add(cube);
  });

  function animate() {
    scene.children.forEach(cube => {
      if (cube.scale.y < 1) {
        cube.scale.y += 0.01;
      }
    });
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  animate();

}());