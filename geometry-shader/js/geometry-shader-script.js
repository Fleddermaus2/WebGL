//main context
var gl;

//buffer for positions
var pointStartPositionsBuffer;
//buffer for texture coordinates
var pointEndPositionsBuffer;

var pointLifetimesBuffer;

//program
var shaderProgram;

//animation
var lastTime = 0;

//particle Texture
var texture;

//particles
var numParticles = 500;

var time = 1.5;
var centerPos;
var color;

var maxLifetime = 10;
var size = 40;

var canvas;
var c_height;
var c_width;

var imagePaths = {star: "../img/star.gif", cat: "../img/grumpycat.gif", box: "../img/crate.gif"};

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
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
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

    shaderProgram.pointLifetimeAttribute = gl.getAttribLocation(shaderProgram, "aLifetime");
    gl.enableVertexAttribArray(shaderProgram.pointLifetimeAttribute);

    shaderProgram.pointStartPositionAttribute = gl.getAttribLocation(shaderProgram, "aStartPosition");
    gl.enableVertexAttribArray(shaderProgram.pointStartPositionAttribute);

    shaderProgram.pointEndPositionAttribute = gl.getAttribLocation(shaderProgram, "aEndPosition");
    gl.enableVertexAttribArray(shaderProgram.pointEndPositionAttribute);

    shaderProgram.pointSizeUniform = gl.getUniformLocation(shaderProgram, "uSize");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "sTexture");
    shaderProgram.centerPositionUniform = gl.getUniformLocation(shaderProgram, "uCenterPosition");
    shaderProgram.colorUniform = gl.getUniformLocation(shaderProgram, "uColor");
    shaderProgram.timeUniform = gl.getUniformLocation(shaderProgram, "uTime");
}

function handleLoadedTexture(texture) {
    //flip because of different coordinates
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function initTexture() {
    texture = gl.createTexture();
    texture.image = new Image();
    texture.image.width = 1000;
    texture.image.onload = function () {
        handleLoadedTexture(texture);
    };

    texture.image.src = "../img/star.gif";
}

//initialise buffers for position
function initBuffers() {

    lifetimes = [];
    startPositions = [];
    endPositions = [];
    for (var i=0; i < numParticles; i++)  {
        lifetimes.push(getRandomInt(1, maxLifetime));

        startPositions.push((Math.random() * 0.25) - 0.125);
        startPositions.push((Math.random() * 0.25) - 0.125);
        startPositions.push((Math.random() * 0.25) - 0.125);

        endPositions.push((Math.random() * 2) - 1);
        endPositions.push((Math.random() * 2) - 1);
        endPositions.push((Math.random() * 2) - 1);
    }

    pointLifetimesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointLifetimesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lifetimes), gl.STATIC_DRAW);
    pointLifetimesBuffer.itemSize = 1;
    pointLifetimesBuffer.numItems = numParticles;

    pointStartPositionsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointStartPositionsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(startPositions), gl.STATIC_DRAW);
    pointStartPositionsBuffer.itemSize = 3;
    pointStartPositionsBuffer.numItems = numParticles;

    pointEndPositionsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointEndPositionsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(endPositions), gl.STATIC_DRAW);
    pointEndPositionsBuffer.itemSize = 3;
    pointEndPositionsBuffer.numItems = numParticles;
}

//draw all elements to canvas
function drawScene() {
    resize(canvas);

    gl.viewport(0, 0, c_width, c_height);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, pointLifetimesBuffer);
    gl.vertexAttribPointer(shaderProgram.pointLifetimeAttribute, pointLifetimesBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, pointStartPositionsBuffer);
    gl.vertexAttribPointer(shaderProgram.pointStartPositionAttribute, pointStartPositionsBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, pointEndPositionsBuffer);
    gl.vertexAttribPointer(shaderProgram.pointEndPositionAttribute, pointEndPositionsBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    gl.uniform3f(shaderProgram.centerPositionUniform, centerPos[0], centerPos[1], centerPos[2]);
    gl.uniform4f(shaderProgram.colorUniform, color[0], color[1], color[2], color[3]);
    gl.uniform1f(shaderProgram.timeUniform, time);
    gl.uniform1f(shaderProgram.pointSizeUniform, size);

    gl.drawArrays(gl.POINTS, 0, pointLifetimesBuffer.numItems);
}

//rotate objects based on passed time since last call
function animate() {
    var timeNow = new Date().getTime();

    if(lastTime != 0){
        var elapsed = timeNow - lastTime;

        time += elapsed / 3000;
    }
    if(time >= 1.0){
        time = 0;
        centerPos = [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5];
        color = [Math.random() / 2 + 0.5, Math.random() / 2 + 0.5, Math.random() / 2 + 0.5, 0.5];
        initBuffers();
    }

    lastTime = timeNow;
}

var stats = new Stats();
window.onload = function () {
    document.getElementById("controls").appendChild(stats.domElement);
};
function tick() {
    stats.begin();
    animate();
    drawScene();
    stats.end();
}

//main function
function webGL() {
    canvas = document.getElementById("canvas");
    initGL(canvas);
    initTexture();
    initShaders();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    setInterval(tick, 15);
}