const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Normal;
  uniform mat4 u_MvpMatrix;
  uniform mat4 u_NormalMatrix;
  varying vec4 v_Color;
  void main() {
    gl_Position = u_MvpMatrix * a_Position;
    // 计算光照
    vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);
    vec4 color = vec4(1.0, 0.4, 0.0, 1.0);
    vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7));
    float nDotL = max(dot(normal, lightDirection), 0.0);
    v_Color = vec4(color.rgb * nDotL + vec3(0.1), color.a);
  }
`;

const FSHADER_SOURCE = `
  precision mediump float;
  varying vec4 v_Color;
  void main() {
    gl_FragColor = v_Color;
  }
`;

function main() {
  const canvas = document.getElementById('webgl');

  const gl = getWebGLContext(canvas);
  if (!gl) {
    return console.log('Failed to get the rendering context for WebGL');
  }

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    return console.log('Failed to intialize shaders.');
  }

  const n = initVertexBuffers(gl);
  if (n < 0) {
    return console.log('Failed to set the vertex information');
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  const u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  const u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_MvpMatrix || !u_NormalMatrix) {
    return console.log('Failed to get the storage location');
  }

  const viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(30.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

　draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

  document.onkeydown = function(ev){ 
    keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix); 
  };
}

const ANGLE_STEP = 3.0;     // The increments of rotation angle (degrees)
let g_arm1Angle = 90.0;   // 控制整个手臂转动
let g_joint1Angle = 45.0; // 控制小臂弯曲
let g_joint2Angle = 0.0;  // 控制手掌转动
let g_joint3Angle = 0.0;  // 控制手指弯曲

function keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
  switch (ev.keyCode) {
    case 40: // Up arrow key -> 控制小臂弯曲
      if (g_joint1Angle < 135.0) g_joint1Angle += ANGLE_STEP;
      break;
    case 38: // Down arrow key -> 控制小臂弯曲
      if (g_joint1Angle > -135.0) g_joint1Angle -= ANGLE_STEP;
      break;
    case 39: // Right arrow key -> 控制整个手臂转动
      g_arm1Angle = (g_arm1Angle + ANGLE_STEP) % 360;
      break;
    case 37: // Left arrow key -> 控制整个手臂转动
      g_arm1Angle = (g_arm1Angle - ANGLE_STEP) % 360;
      break;
    case 90: // 'ｚ'key -> 控制手掌转动
      g_joint2Angle = (g_joint2Angle + ANGLE_STEP) % 360;
      break; 
    case 88: // 'x'key -> 控制手掌转动
      g_joint2Angle = (g_joint2Angle - ANGLE_STEP) % 360;
      break;
    case 86: // 'v'key -> 控制手指弯曲
      if (g_joint3Angle < 60.0)  g_joint3Angle = (g_joint3Angle + ANGLE_STEP) % 360;
      break;
    case 67: // 'c'key -> 控制手指弯曲
      if (g_joint3Angle > -60.0) g_joint3Angle = (g_joint3Angle - ANGLE_STEP) % 360;
      break;
    default: return;
  }

  draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}

function initVertexBuffers(gl) {
  // 公用一个单位立方体，根据具体的形状进行缩放
  // Coordinates（Cube which length of one side is 1 with the origin on the center of the bottom)
  const vertices = new Float32Array([
    0.5, 1.0, 0.5, -0.5, 1.0, 0.5, -0.5, 0.0, 0.5,  0.5, 0.0, 0.5, // v0-v1-v2-v3 front
    0.5, 1.0, 0.5,  0.5, 0.0, 0.5,  0.5, 0.0,-0.5,  0.5, 1.0,-0.5, // v0-v3-v4-v5 right
    0.5, 1.0, 0.5,  0.5, 1.0,-0.5, -0.5, 1.0,-0.5, -0.5, 1.0, 0.5, // v0-v5-v6-v1 up
   -0.5, 1.0, 0.5, -0.5, 1.0,-0.5, -0.5, 0.0,-0.5, -0.5, 0.0, 0.5, // v1-v6-v7-v2 left
   -0.5, 0.0,-0.5,  0.5, 0.0,-0.5,  0.5, 0.0, 0.5, -0.5, 0.0, 0.5, // v7-v4-v3-v2 down
    0.5, 0.0,-0.5, -0.5, 0.0,-0.5, -0.5, 1.0,-0.5,  0.5, 1.0,-0.5  // v4-v7-v6-v5 back
  ]);

  // Normal
  const normals = new Float32Array([
    0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0, // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0, // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0  // v4-v7-v6-v5 back
  ]);

  // Indices of the vertices
  const indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);

  if (!initArrayBuffer(gl, 'a_Position', vertices, gl.FLOAT, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', normals, gl.FLOAT, 3)) return -1;

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  const indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBuffer(gl, attribute, data, type, num) {
  const buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  const a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }

  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

let g_modelMatrix = new Matrix4();
const g_mvpMatrix = new Matrix4();

function draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // 绘制底座
  const baseHeight = 2.0;
  g_modelMatrix.setTranslate(0.0, -12.0, 0.0);
  drawBox(gl, n, 10.0, baseHeight, 10.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
 
  // 绘制大臂
  const arm1Length = 10.0;
  g_modelMatrix.translate(0.0, baseHeight, 0.0);     // 移动到底座之上
  g_modelMatrix.rotate(g_arm1Angle, 0.0, 1.0, 0.0);  // 沿y轴转动
  drawBox(gl, n, 3.0, arm1Length, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

  // 绘制小臂 注意这里是接着使用g_modelMatrix，即继承之前的模型变换
  const arm2Length = 10.0;
  g_modelMatrix.translate(0.0, arm1Length, 0.0);       // 移动到大臂之上
  g_modelMatrix.rotate(g_joint1Angle, 0.0, 0.0, 1.0);  // 沿z轴转动
  drawBox(gl, n, 4.0, arm2Length, 4.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

  // 绘制手掌
  const palmLength = 2.0;
  g_modelMatrix.translate(0.0, arm2Length, 0.0);       // 移动到小臂之上
  g_modelMatrix.rotate(g_joint2Angle, 0.0, 1.0, 0.0);  // 绕y轴转动
  drawBox(gl, n, 2.0, palmLength, 6.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

  // 绘制手指
  g_modelMatrix.translate(0.0, palmLength, 0.0); // 移动到手掌之上

  // 绘制手指1
  pushMatrix(g_modelMatrix); // 缓存之前绘制手指之前模型变换
  g_modelMatrix.translate(0.0, 0.0, 2.0);
  g_modelMatrix.rotate(g_joint3Angle, 1.0, 0.0, 0.0); // 绕x轴转动
  drawBox(gl, n, 1.0, 2.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  g_modelMatrix = popMatrix();

  // 绘制手指2
  g_modelMatrix.translate(0.0, 0.0, -2.0);
  g_modelMatrix.rotate(-g_joint3Angle, 1.0, 0.0, 0.0); // 绕x轴转动
  drawBox(gl, n, 1.0, 2.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}

const g_matrixStack = [];
function pushMatrix(m) {
  const m2 = new Matrix4(m);
  g_matrixStack.push(m2);
}

function popMatrix() {
  return g_matrixStack.pop();
}

const g_normalMatrix = new Matrix4();

function drawBox(gl, n, width, height, depth, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
    // 为了缩放效果不影响到下一个部件，需要先把当前与缩放无关的变换暂存起来 
    pushMatrix(g_modelMatrix);

    g_modelMatrix.scale(width, height, depth);

    g_mvpMatrix.set(viewProjMatrix);
    g_mvpMatrix.multiply(g_modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);

    g_normalMatrix.setInverseOf(g_modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    g_modelMatrix = popMatrix();
}
