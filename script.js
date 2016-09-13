//main context
var gl;

//buffer for positions
var cubeVertexPositionBuffer;

//buffer for texture coordinates
var cubeVertexTextureCoordBuffer;

//buffer for Indices
var cubeVertexIndexBuffer;

//model-view-matrix
var mvMatrix = mat4.identity(mat4.create());
//projection matrix
var pMatrix = mat4.identity(mat4.create());

var shaderProgram;

//rotation
var xRot = 0;
var yRot = 0;

//speed
var xSpeed = 0;
var ySpeed = 0;

//distance to object
var z = -5.0;

//which filter to use
var filter = 0;

//animation
var lastTime = 0;
var mvMatrixStack = [];

//texture
var textures = Array();

//keys
var currentlyPressedKey = {};

//main function
function webGL() {
    var canvas = document.getElementById("canvas");
    initGL(canvas);
    initShaders();
    initBuffers();
    initTexture();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    //draw regularly
    tick();
}

//initialise gl
function initGL(canvas) {
    try{
        gl = canvas.getContext("webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    }catch(e){
    }

    if(!gl){
        alert("Couldn't initialise WebGL.");
        console.log("no webgl")
    }
}

//initialise buffers for position
function initBuffers() {

    //create cube position buffer
    cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);

    vertices = [
// vordere Fläche
        -1.0, -1.0,  1.0, //0
        1.0, -1.0,  1.0, //1
        1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        // hintere Fläche
        -1.0, -1.0, -1.0, //4
        -1.0,  1.0, -1.0, //5
        1.0,  1.0, -1.0,
        1.0, -1.0, -1.0,

        // obere Fläche
        -1.0,  1.0, -1.0, //8
        -1.0,  1.0,  1.0, //9
        1.0,  1.0,  1.0,
        1.0,  1.0, -1.0,

        // untere Fläche
        -1.0, -1.0, -1.0, //12
        1.0, -1.0, -1.0, //13
        1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

        // rechte Fläche
        1.0, -1.0, -1.0, //16
        1.0,  1.0, -1.0, //17
        1.0,  1.0,  1.0,
        1.0, -1.0,  1.0,

        // linke Fläche
        -1.0, -1.0, -1.0, //20
        -1.0, -1.0,  1.0, //21
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    cubeVertexPositionBuffer.itemSize = 3;
    cubeVertexPositionBuffer.numItems = 24;

    //create cube color buffer
    cubeVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);

    var textureCoords = [
        // Front face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        // Back face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,

        // Top face
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,

        // Bottom face
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,

        // Right face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,

        // Left face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    cubeVertexTextureCoordBuffer.itemSize = 2;
    cubeVertexTextureCoordBuffer.numItems = 24;

    //index buffer
    cubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    var cubeVertexIndices = [
        0,  1,  2,      0,  2,  3,    // vorne
        4,  5,  6,      4,  6,  7,    // hinten
        8,  9,  10,     8,  10, 11,   // oben
        12, 13, 14,     12, 14, 15,   // unten
        16, 17, 18,     16, 18, 19,   // rechts
        20, 21, 22,     20, 22, 23    // links
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
    cubeVertexIndexBuffer.itemSize = 1;
    cubeVertexIndexBuffer.numItems = 36;
}

function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
        alert("Couldn't initialise shader");
    }

    gl.useProgram(shaderProgram);

    //vertexPositionAttribute custom attribute for easier use
    shaderProgram.vertexPositionAttribute  = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexTextureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.vertexTextureCoordAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
}

function getShader(gl, id) {
    //extracting shader from html because easier to read
    //not in future
    var shaderScript = document.getElementById(id);

    if(!shaderScript){
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;

    while(k){
        if(k.nodeType == 3){
            str += k.textContent;
        }

        k = k.nextSibling;
    }

    var shader;

    if(shaderScript.type == "x-shader/x-fragment"){
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    }else if(shaderScript.type == "x-shader/x-vertex"){
        shader = gl.createShader(gl.VERTEX_SHADER);
    }else{
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        alert(gl.getShaderInfoLog(shader));
        console.log("no shader");
        return null;
    }
    return shader;
}

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function tick() {
    requestAnimationFrame(tick);
    handleKeys();
    drawScene();
    animate();
}

//rotate objects based on passed time since last call
function animate() {
    var timeNow = new Date().getTime();

    if(lastTime != 0){
        var elapsed = timeNow - lastTime;

        //degrees per second
        xRot += (xSpeed * elapsed) / 1000.0;
        yRot += (ySpeed * elapsed) / 1000.0;
    }

    lastTime = timeNow;
}

//store and get matrix before transformation and after
function mvPushMatrix() {
    var copy = mat4.create();
    mat4.copy(copy, mvMatrix);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if(mvMatrixStack.length == 0){
        throw "Invalid popMatrix!";
    }

    mvMatrix = mvMatrixStack.pop();
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function initTexture() {
    var image = new Image();

    for(var i = 0; i < 3; i++){
        texture = gl.createTexture();
        texture.image = image;
        textures.push(texture);

    }

    image.onload = function () {
        handleLoadedTexture(textures);
    };

    image.src = "crate.gif";
}

function handleLoadedTexture(texture) {
    //flip because of different coordinates
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    //load to gpu
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[0].image);
    //scaling parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    gl.bindTexture(gl.TEXTURE_2D, textures[1]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[1].image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.bindTexture(gl.TEXTURE_2D, textures[2]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[2].image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    //mipmap
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, null);
}

//draw all elements to canvas
function drawScene() {
    //camera
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, mvMatrix, [0.0, 0, z]);

    //cube
    //rotate
    mvPushMatrix();
    mat4.rotate(mvMatrix, mvMatrix, degToRad(xRot), [1, 0, 0]);
    mat4.rotate(mvMatrix, mvMatrix, degToRad(yRot), [0, 1, 0]);

    //vertex
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    //texture coordinates
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexTextureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
    //texture
    gl.activeTexture(gl.TEXTURE0);
    //use texture with filter
    gl.bindTexture(gl.TEXTURE_2D, textures[filter]);
    gl.uniform1i(shaderProgram.samplerUniform, 0);
    //indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mvPopMatrix();
}

//dictionary for pressed keys
function handleKeyDown(event) {
    currentlyPressedKey[event.keyCode] = true;

    //check f before
    if(String.fromCharCode(event.keyCode) == "F"){
        filter += 1;
        if(filter == 3){
            filter = 0;
        }
    }
}

function handleKeyUp(event) {
    currentlyPressedKey[event.keyCode] = false;
}

function handleKeys() {
    if(currentlyPressedKey[81]){
        //Page Up
        z -= 0.05;
    }
    if(currentlyPressedKey[69]){
        //Page Down
        z += 0.05;
    }
    if(currentlyPressedKey[65]){
        //Left cursor Key
        ySpeed -= 1;
    }
    if(currentlyPressedKey[68]){
        //Right cursor Key
        ySpeed += 1;
    }
    if(currentlyPressedKey[87]){
        //Up cursor speed
        xSpeed -= 1;
    }
    if(currentlyPressedKey[83]){
        //Down cursor speed
        xSpeed += 1;
    }
    if(currentlyPressedKey[82]){
        xSpeed = 0;
        ySpeed = 0;
    }
}