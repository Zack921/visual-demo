const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_TexCoord;
  uniform mat4 u_MvpMatrix;
  varying vec2 v_TexCoord;
  void main() {
    gl_Position = u_MvpMatrix * a_Position;
    v_TexCoord = a_TexCoord;
  }
`;

const FSHADER_SOURCE = `
  precision mediump float;
  uniform sampler2D u_Sampler;
  varying vec2 v_TexCoord;
  void main() {
    gl_FragColor = texture2D(u_Sampler, v_TexCoord);
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
  if (!u_MvpMatrix) { 
    return console.log('Failed to get the storage location of uniform variable');
  }

  if (!initTextures(gl)) {
    return console.log('Failed to intialize the texture.');
  }

  const viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(3.0, 3.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  let currentAngle = [0.0, 0.0]; // [x,y]
  initEventHandlers(canvas, currentAngle);

  const tick = function() {
    draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle);
    requestAnimationFrame(tick, canvas);
  };
  tick();
}

function initVertexBuffers(gl) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  const vertices = new Float32Array([   // Vertex coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
  ]);

  const texCoords = new Float32Array([   // Texture coordinates
      1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
      0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
      1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
      1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
      0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
      0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
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

  const indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    return -1;
  }

  if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')) return -1;
  if (!initArrayBuffer(gl, texCoords, 2, gl.FLOAT, 'a_TexCoord')) return -1;

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function initEventHandlers(canvas, currentAngle) {
  let dragging = false;
  let lastX = -1, lastY = -1;

  canvas.onmousedown = function(ev) {
    const x = ev.clientX, y = ev.clientY; // 点击处的坐标
    const rect = ev.target.getBoundingClientRect(); // 被点击元素的大小
    // 如果鼠标在canvas内则表示开始拖动
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      lastX = x; lastY = y;
      dragging = true;
    }
  };

  canvas.onmouseup = function() { 
    dragging = false;
  };

  canvas.onmousemove = function(ev) {
    const x = ev.clientX, y = ev.clientY; // 鼠标解除点击处的坐标
    if (dragging) {
      const factor = 100/canvas.height; // 旋转因子
      const dx = factor * (x - lastX);
      const dy = factor * (y - lastY);
      // 沿x轴转动限制在-90~90
      currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
      currentAngle[1] = currentAngle[1] + dx;
    }
    lastX = x, lastY = y;
  };
}

const g_MvpMatrix = new Matrix4();
function draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle) {
  g_MvpMatrix.set(viewProjMatrix);
  g_MvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0);
  g_MvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0);
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function initArrayBuffer(gl, data, num, type, attribute) {
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

function initTextures(gl) {
  const texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  const u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }

  const image = new Image();
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }

  image.onload = function(){ 
    loadTexture(gl, texture, u_Sampler, image); 
  };
  image.src = './assets/sky.jpg';

  return true;
}

function loadTexture(gl, texture, u_Sampler, image) {
  // 反转y轴，因为图片的坐标系统y轴朝下
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // 激活纹理单元，一个纹理单元管理一个纹理对象
  gl.activeTexture(gl.TEXTURE0);
  // 绑定 纹理对象 到 纹理单元 上
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // 配置纹理对象参数，设置纹理图像映射到图形上的方式
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // 将 纹理图像 分配到 纹理对象 上
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  // 将零号纹理单元指定到片元着色器的取样器参数上
  gl.uniform1i(u_Sampler, 0);
}
