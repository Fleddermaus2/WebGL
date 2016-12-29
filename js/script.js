//main context
var gl;

//buffer for positions
var particleVertexPositionBuffer;
//buffer for particleTexture coordinates
var particleVertexTextureCoordBuffer;

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
var z = -20.0;

//animation
var lastTime = 0;
var effectiveFPMS = 60 / 1000;

//particle Texture
var particleTexture;

//keys
var currentlyPressedKey = {};

//objects
var particles = [];
var mvMatrixStack = [];

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
    particleTexture = gl.createTexture();
    particleTexture.image = new Image();
    particleTexture.image.onload = function () {
        handleLoadedTexture(particleTexture);
    };

    particleTexture.image.src = "../img/star.gif";
}

//initialise buffers for position
function initBuffers() {

    //create cube position buffer
    particleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, particleVertexPositionBuffer);

    var vertices = [
        -1.0, -1.0,  0.0,
        1.0, -1.0,  0.0,
        -1.0,  1.0,  0.0,
        1.0,  1.0,  0.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    particleVertexPositionBuffer.itemSize = 3;
    particleVertexPositionBuffer.numItems = 4;

    //create cube texturecoord buffer
    particleVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, particleVertexTextureCoordBuffer);

    var textureCoords = [
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    particleVertexTextureCoordBuffer.itemSize = 2;
    particleVertexTextureCoordBuffer.numItems = 4;
}

function initWorldObjects() {
    var numStars = 50;

    for(var i = 0; i < numStars; i++){
        particles.push(new Particle());
    }
}

//draw all elements to canvas
function drawScene() {
    //camera
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
    //switch to blending
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.enable(gl.BLEND);

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, mvMatrix, [0.0, 0, z]);
    //rotate
    mat4.rotate(mvMatrix, mvMatrix, degToRad(tilt), [1, 0, 0]);

    var twinkle = document.getElementById("twinkle").checked;
    for(var i in particles){
        particles[i].draw(tilt, spin, twinkle);
        spin += 0.1;
    }
}

//rotate objects based on passed time since last call
function animate() {
    var timeNow = new Date().getTime();

    if(lastTime != 0){
        var elapsed = timeNow - lastTime;

        for(var i in particles){
            particles[i].animate(elapsed);
        }
    }

    lastTime = timeNow;
}

function tick() {
    requestAnimationFrame(tick);
    handleKeys();
    drawScene();
    animate();
}

//main function
function webGL() {
    var canvas = document.getElementById("canvas");
    initGL(canvas);
    initShaders();
    initBuffers();
    initTexture();
    initWorldObjects();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    //draw regularly
    tick();
}