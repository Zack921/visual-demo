import * as THREE from './three/three.module.js'; // 新版本 THREE.SkinnedMesh no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.
import { OrbitControls } from './three/orbitcontrols.js';
import { GUI } from './three/dat.gui.module.js';

let domElement = document.getElementById("avatarDom");
let canvasW = domElement.clientWidth;
let canvasH = domElement.clientHeight;

let renderer = new THREE.WebGLRenderer();
domElement.appendChild(renderer.domElement);

renderer.setSize(canvasW, canvasH);

let scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(45, 500 / 500, 1, 2000);
camera.position.z = 400;
camera.lookAt(scene.position);
camera.aspect = canvasW / canvasH;
camera.updateProjectionMatrix();
scene.add(camera);
scene.background = new THREE.Color(0xa0a0a0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 25, 0);
controls.update();

const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

/**
 * 创建骨骼网格模型SkinnedMesh
 */

/* 1.建模：创建一个圆柱几何体，高度120，顶点坐标y分量范围[-60,60] */
let geometry = new THREE.CylinderGeometry(5, 10, 120, 50, 300);
geometry.translate(0, 60, 0); // 平移后，y 分量范围[0,120]

/* 2.创建骨骼 */
const Bone1 = new THREE.Bone(); // 模拟肩关节-根关节
Bone1.name = 'Bone1';
const Bone2 = new THREE.Bone(); // 模拟肘关节
Bone2.name = 'Bone2';
const Bone3 = new THREE.Bone(); // 模拟腕关节
Bone3.name = 'Bone3';
// 设置关节父子关系
Bone1.add(Bone2);
Bone2.add(Bone3);
// 设置关节之间的相对位置，根关节Bone1默认位置是(0,0,0)
// 顶点都是相对骨骼位置作变换的，如果不更新，都是相对根骨骼位置作变换
Bone2.position.y = 60; // Bone2 相对父对象 Bone1 位置
Bone3.position.y = 40; // Bone3 相对父对象 Bone2 位置
 
/* 3.创建骨架 */
const skeleton = new THREE.Skeleton([Bone1, Bone2, Bone3]);

/* 4.绑骨 - 设置顶点关联的骨骼索引和权重 */
// 遍历几何体顶点，为每一个顶点设置蒙皮索引、权重属性
const position = geometry.attributes.position;
const vertex = new THREE.Vector3();
const skinIndices = []; const skinWeights = [];

for ( let i = 0; i < position.count; i ++ ) {

	vertex.fromBufferAttribute( position, i );

  if (vertex.y < 60) { // 0~60

    // 设置每个顶点对应骨骼的索引，受根关节Bone1影响
    skinIndices.push(0, 0, 0, 0);
    // 设置每个顶点对应骨骼的权重
    skinWeights.push(1, 0, 0, 0);
    
  } else if (60 <= vertex.y && vertex.y < 60 + 40) { // 60~100

    skinIndices.push(1, 0, 0, 0);
    skinWeights.push(1, 0, 0, 0);

  } else if (60 + 40 <= vertex.y && vertex.y <= 60 + 40 + 20) { // 100~120

    skinIndices.push(2, 0, 0, 0);
    skinWeights.push(1, 0, 0, 0);
    
  }

}

geometry.setAttribute( 'skinIndex', new THREE.Uint16BufferAttribute( skinIndices, 4 ) );
geometry.setAttribute( 'skinWeight', new THREE.Float32BufferAttribute( skinWeights, 4 ) );

/* 5.创建蒙皮网格 */
const material = new THREE.MeshPhongMaterial({
  wireframe: true,
});

const SkinnedMesh = new THREE.SkinnedMesh(geometry, material);

/* 6.后续绑骨 - 绑完之后才能索引到对应骨骼 */
SkinnedMesh.add(Bone1); // 添加根骨骼
SkinnedMesh.bind(skeleton); // 绑定骨架

/* 7.添加到场景中渲染 */
scene.add(SkinnedMesh);
console.log('scene: ', scene);

// [1, 0, 0, 10,
//  0, 1, 0, 60,
//  0, 0, 1, 0,
//  0, 0, 0, 1 ]

// (10, 60, 0, 1)


/**
 * 骨骼辅助显示
 */
const skeletonHelper = new THREE.SkeletonHelper(SkinnedMesh);
scene.add(skeletonHelper);

// 转动关节带动骨骼网格模型出现弯曲效果  好像腿弯曲一样
// skeleton.bones[1].rotation.x = 0.5;
// skeleton.bones[2].rotation.x = 0.5;

// 渲染函数
function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();


// 准备效果控制条
const gui = new GUI({ width: 300 });

var folder;

var bones = skeleton.bones;

const tips = ['肩关节', '肘关节', '腕关节']

for ( var i = 0; i < bones.length; i ++ ) {

    var bone = bones[ i ];

    folder = gui.addFolder( `Bone${i+1} - ${tips[i]}` );

    folder.add( bone.position, 'x', - 10 + bone.position.x, 10 + bone.position.x );
    folder.add( bone.position, 'y', - 10 + bone.position.y, 10 + bone.position.y );
    folder.add( bone.position, 'z', - 10 + bone.position.z, 10 + bone.position.z );

    folder.add( bone.rotation, 'x', - Math.PI * 0.5, Math.PI * 0.5 );
    folder.add( bone.rotation, 'y', - Math.PI * 0.5, Math.PI * 0.5 );
    folder.add( bone.rotation, 'z', - Math.PI * 0.5, Math.PI * 0.5 );

    folder.add( bone.scale, 'x', 0, 2 );
    folder.add( bone.scale, 'y', 0, 2 );
    folder.add( bone.scale, 'z', 0, 2 );

    folder.__controllers[ 0 ].name( "position.x" ).onChange(function (e) {
      console.log('scene: ', scene);
    });
    folder.__controllers[ 1 ].name( "position.y" );
    folder.__controllers[ 2 ].name( "position.z" );

    folder.__controllers[ 3 ].name( "rotation.x" );
    folder.__controllers[ 4 ].name( "rotation.y" );
    folder.__controllers[ 5 ].name( "rotation.z" );

    folder.__controllers[ 6 ].name( "scale.x" );
    folder.__controllers[ 7 ].name( "scale.y" ).onChange(function (e) {
      console.log('scene: ', scene);
    });
    folder.__controllers[ 8 ].name( "scale.z" );

}
