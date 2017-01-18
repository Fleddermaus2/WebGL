//main context
var gl;

//buffer for positions
var cubeVertexPositionBuffer;
//buffer for objectTexture coordinates
var cubeVertexTextureCoordBuffer;
//buffer for normals
var cubeVertexNormalBuffer;

//model-view-matrix
var mvMatrix = mat4.identity(mat4.create());
//projection matrix
var pMatrix = mat4.identity(mat4.create());

//program
var shaderProgram;

//rotation
var tilt = 90;

//speed
var spin = 0;

//distance to object
var z = -10.0;

//animation
var lastTime = 0;
var effectiveFPMS = 60 / 1000;

//objectTexture
var objectTexture;

//keys
var currentlyPressedKey = {};

//objects
var stars = [];
var mvMatrixStack = [];

var canvas;
var c_height;
var c_width;

var numParticles = 100;

//initialise gl
function initGL(canvas) {
    try{
        gl = canvas.getContext("webgl");
        resize(canvas);
    }catch(e){
    }

    if(!gl){
        alert("Couldn't initialise WebGL.");
    }
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
    shaderProgram.colorUniform = gl.getUniformLocation(shaderProgram, "uColor");
}

function handleLoadedTexture(texture) {
    //flip because of different coordinates
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function initTexture() {
    objectTexture = gl.createTexture();
    objectTexture.image = new Image();
    objectTexture.image.onload = function () {
        handleLoadedTexture(objectTexture);
    };

    objectTexture.image.src = "../img/star.gif";
}

function mvPushMatrix() {
    var copy = mat4.create();
    mat4.copy(copy, mvMatrix);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

//dictionary for pressed keys
function handleKeyDown(event) {
    currentlyPressedKey[event.keyCode] = true;
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
    if(currentlyPressedKey[87]){
        //Up cursor speed
        tilt -= 1;
    }
    if(currentlyPressedKey[83]){
        //Down cursor speed
        tilt += 1;
    }
}

//initialise buffers for position
function initBuffers() {

    //create cube position buffer
    cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);

    var vertices = [
        -1.0, -1.0,  0.0,
        1.0, -1.0,  0.0,
        -1.0,  1.0,  0.0,
        1.0,  1.0,  0.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    cubeVertexPositionBuffer.itemSize = 3;
    cubeVertexPositionBuffer.numItems = 4;

    //create cube texturecoord buffer
    cubeVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);

    var textureCoords = [
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    cubeVertexTextureCoordBuffer.itemSize = 2;
    cubeVertexTextureCoordBuffer.numItems = 4;
}

function drawStar() {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, objectTexture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexTextureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, cubeVertexPositionBuffer.numItems);
}

function Star(startingDistance, rotationSpeed) {
    this.angle = 0;
    this.dist = startingDistance;
    this.rotationSpeed = rotationSpeed;
    //set colors to a starting value
    this.randomiseColors();
}
Star.prototype.draw = function (tilt, spin, twinkle) {
    mvPushMatrix();

    //move to stars position
    mat4.rotate(mvMatrix, mvMatrix, degToRad(this.angle), [0.0, 1.0, 0.0]);
    mat4.translate(mvMatrix, mvMatrix, [this.dist, 0.0, 0.0]);

    //rotate back so that the star is facing the viewer
    mat4.rotate(mvMatrix, mvMatrix, degToRad(-this.angle), [0.0, 1.0, 0.0]);
    mat4.rotate(mvMatrix, mvMatrix, degToRad(-tilt), [1.0, 0.0, 0.0]);

    if(twinkle){
        gl.uniform3f(shaderProgram.colorUniform, this.twinkleR, this.twinkleG, this.twinkleB);
        drawStar();
    }

    //stars spin around z at the same rate
    mat4.rotate(mvMatrix, mvMatrix, degToRad(spin), [0.0, 0.0, 1.0]);

    //draw star in main color
    gl.uniform3f(shaderProgram.colorUniform, this.r, this.g, this.b);
    drawStar();

    mvPopMatrix();
};

Star.prototype.animate = function (elapsedTime) {
    this.angle += this.rotationSpeed * effectiveFPMS * elapsedTime;
    //decrease the distance, resetting the star to the outside of the spiral if it is at the center
    this.dist -= 0.01 * effectiveFPMS * elapsedTime;
    if(this.dist < 0.0){
        this.dist += 5.0;
        this.randomiseColors();
    }
};

Star.prototype.randomiseColors = function () {
    //give star color
    this.r = Math.random();
    this.g = Math.random();
    this.b = Math.random();

    //twinkle
    this.twinkleR = Math.random();
    this.twinkleG = Math.random();
    this.twinkleB = Math.random();
};

function initWorldObjects() {
    stars = [];

    for(var i = 0; i < numParticles; i++){
        stars.push(new Star((i/numParticles) * 5.0, i/numParticles));
    }
}

//draw all elements to canvas
function drawScene() {
    //camera
    resize(canvas);

    gl.viewport(0, 0, c_width, c_height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(pMatrix, 45, c_width / c_height, 0.1, 100.0);
    //switch to blending
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.enable(gl.BLEND);

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, mvMatrix, [0.0, 0, z]);
    //rotate
    mat4.rotate(mvMatrix, mvMatrix, degToRad(tilt), [1, 0, 0]);

    var twinkle = document.getElementById("twinkle").checked;
    for(var i in stars){
        stars[i].draw(tilt, spin, twinkle);
        spin += 0.1;
    }
}

//rotate objects based on passed time since last call
function animate() {
    var timeNow = new Date().getTime();

    if(lastTime != 0){
        var elapsed = timeNow - lastTime;

        for(var i in stars){
            stars[i].animate(elapsed);
        }
    }

    lastTime = timeNow;
}

var stats = new Stats();
window.onload = function () {
    document.getElementById("controls").appendChild(stats.domElement);
};
function tick() {
    stats.begin();
    handleKeys();
    drawScene();
    animate();
    stats.end();

    requestAnimationFrame(tick);
}

//main function
function webGL() {
    canvas = document.getElementById("canvas");
    initGL(canvas);
    initShaders();
    initBuffers();
    initTexture();
    initWorldObjects();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    //depth testing and blending don't work well together
    //gl.enable(gl.DEPTH_TEST);
    //gl.depthFunc(gl.LEQUAL);

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    //draw regularly
    tick();
}

//check if size changed and apply new sizes
function resize(canvas){
    let clientWidth = canvas.clientWidth;
    let clientHeight = canvas.clientHeight;

    if(clientWidth != c_width || clientHeight != c_height){
        c_width = clientWidth;
        c_height = clientHeight;
        canvas.height = clientHeight;
        canvas.width = clientWidth;

        gl.viewport(0, 0, c_width, c_height);
    }
}

function setNumberOfParticles() {
    numParticles = document.getElementById("numParticles").value;
    initWorldObjects();
}