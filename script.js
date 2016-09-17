//main context
var gl;

//canvas
var canvas;

//screen
var width;
var height;

//buffer for positions
var cubeVertexPositionBuffer;
//buffer for color coordinates
var cubeVertexColorBuffer;
//buffer for indices
var cubeVertexIndexBuffer;

//model-view-matrix
var mvMatrix = mat4.identity(mat4.create());
//projection matrix
var pMatrix = mat4.identity(mat4.create());

//gl program
var shaderProgram;

//rotation
var xRot = 45;
var zRot = 0;
var yRot = 0;

//distance to object
var z = -25.0;

//objects
var cubes = [];
//standard cube is 2 units (cScale = 1)
var cScale = 1.5;
var cWidth = 2 * cScale;

//grid
var gWidth = 10 * cWidth;
var gHeight = 10 * cWidth;

//input
//changes context so can't be used with this
var currentlyPressedKey = {};

//classes
var picker;
var shader;
var utils;
var program;
var input;

//initialise buffers
function initBuffers() {

    //create cube position buffer
    cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);

    var vertices = [
        -cScale,  -cScale,  -cScale, //0
        cScale, -cScale,  -cScale, //1
        cScale,  cScale, -cScale, //2
        -cScale,  cScale,  -cScale, //3
        -cScale, -cScale,  cScale, //4
        cScale,  -cScale, cScale, //5
        cScale, cScale,  cScale, //6
        -cScale,  cScale, cScale //7
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    cubeVertexPositionBuffer.itemSize = 3;
    cubeVertexPositionBuffer.numItems = 24;

    //create cube color buffer
    cubeVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);

    var color = [
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);
    cubeVertexColorBuffer.itemSize = 3;
    cubeVertexColorBuffer.numItems = 8;

    //index buffer
    cubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    var cubeVertexIndices = [
        0, 1, 3, //Front
        1, 2, 3, //Front
        1, 5, 6, //Right
        1, 6, 2, //Right
        5, 4, 7, //Back
        5, 6, 7, //Back
        4, 0, 3, //Left
        4, 3, 7, //Left
        3, 2, 6, //Top
        3, 6, 7, //Top
        0, 1, 5, //Bottom
        0, 5, 4 //Bottom
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
    cubeVertexIndexBuffer.itemSize = 1;
    cubeVertexIndexBuffer.numItems = 36;
}

//Cube object
class Cube{
    constructor(position){
        this.position = position;
        //set colors to a starting value
        this.randomiseColors();
    }

    draw(){
        utils.mvPushMatrix();

        //move to cubes position
        mat4.translate(mvMatrix, mvMatrix, this.position);

        //draw cube in main color
        gl.uniform3f(shaderProgram.colorUniform, this.diffuse[0], this.diffuse[1], this.diffuse[2]);

        //bindBuffer and AttribPointer
        //position
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        //color
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
        //indices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
        //set Matrix Uniform
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

        gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

        //clean up
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        utils.mvPopMatrix();
    }

    randomiseColors(){
        //give star color
        var color = [Math.random(), Math.random(), Math.random()];
        var key = color[0] + ":" + color[1] + ":" + color[2];

        if(key in picker.colorSet){
            this.randomiseColors();
        }else{
            picker.colorSet[key] = true;
            this.diffuse = color;
            //unique color Picker
            this.cPicker = color;
        }

    }
}

//picker for selecting objects
class Picker{
    constructor(){
        this.pickerTexture = '';
        this.pickerRenderBuffer = '';
        this.pickerFrameBuffer = '';
        this.colorSet = {};

        this.initPicker();
    }

    initPicker() {
        //create texture to store colors
        this.pickerTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.pickerTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        //create renderbuffer for depth information
        this.pickerRenderBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.pickerRenderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        //Framebuffer with texture and renderbuffer
        this.pickerFrameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickerFrameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.pickerTexture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.pickerRenderBuffer);
        //cleanup
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    //draw twice
    render() {
        //off-screen rendering
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickerFrameBuffer);
        gl.uniform1i(shaderProgram.offscreenUniform, true);

        program.drawScene();

        //on-screen rendering
        gl.uniform1i(shaderProgram.offscreenUniform, false);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        program.drawScene();
    }

    //compare pixel with label; scale diffuse [0,1] to [0,255]
    compare(readout, color) {
        return(Math.abs(Math.round(color[0]*255) - readout[0]) <= 1 && Math.abs(Math.round(color[1]*255) - readout[1]) <= 1 && Math.abs(Math.round(color[2]*255) - readout[2]) <= 1);
    }
}

//all input functions
class Input{
    constructor(){
        document.onkeydown = this.handleKeyDown;
        document.onkeyup = this.handleKeyUp;
    }

    //dictionary for pressed keys
    handleKeyDown(event) {
        currentlyPressedKey[event.keyCode] = true;
    }

    handleKeyUp(event) {
        currentlyPressedKey[event.keyCode] = false;
    }

    handleInput(){
        this.handleKeys();
        this.handleMouse();
    }

    handleKeys() {
        if(currentlyPressedKey[81]){
            //Q
            yRot -= 1;
        }
        if(currentlyPressedKey[69]){
            //E
            yRot += 1;
        }
        if(currentlyPressedKey[87]){
            //W
            xRot -= 1;
        }
        if(currentlyPressedKey[83]){
            //S
            xRot += 1;
        }
        if(currentlyPressedKey[65]){
            //A
            zRot -= 1;
        }
        if(currentlyPressedKey[68]){
            //D
            zRot += 1;
        }
        if(currentlyPressedKey[82]){
            //R
            z -= 0.1;
        }
        if(currentlyPressedKey[70]){
            //F
            z += 0.1;
        }
    }

    handleMouse() {
        canvas.onmouseup = function (ev) {
            //clientX and clientY calculate from top left of browser
            var x, y, top = 0, left = 0, obj = canvas;
            while(obj && obj.tagName !== 'Body'){
                top += obj.offsetTop;
                left += obj.offsetLeft;
                obj = obj.offsetParent;
            }

            //remove scrolling
            left += window.pageXOffset;
            top -= window.pageYOffset;

            //calculate canvas coordinates
            x = ev.clientX - left;
            y = height - (ev.clientY - top);

            //read one pixel with RGBA
            var readout = new Uint8Array(1 * 1 * 4);
            gl.bindFramebuffer(gl.FRAMEBUFFER, picker.pickerFrameBuffer);
            gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, readout);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            var ob = null;
            for(var i = 0; i < cubes.length; i++){
                ob = cubes[i];
                if(picker.compare(readout, ob.cPicker)){
                    utils.handlePickedObject(ob);
                    break;
                }
            }
        }
    }
}

//initialise Shader
class Shader{
    constructor(){
        this.initShaders();
    }

    getShader(gl, id) {
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

    initShaders() {
        var fragmentShader = this.getShader(gl, "shader-fs");
        var vertexShader = this.getShader(gl, "shader-vs");

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

        shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
        gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.colorUniform = gl.getUniformLocation(shaderProgram, "uColor");
        shaderProgram.offscreenUniform = gl.getUniformLocation(shaderProgram, "uOffscreen")
    }
}

//initGL and drawScene
class Program{
    constructor(canvas){
        this.initGL(canvas);
    }

    //initialise gl
    initGL(canvas) {
        try{
            gl = canvas.getContext("webgl");
            gl.viewportWidth = canvas.width;
            width = canvas.width;
            gl.viewportHeight = canvas.height;
            height = canvas.height;
        }catch(e){
        }

        if(!gl){
            alert("Couldn't initialise WebGL.");
        }
    }

    //draw all elements to canvas
    drawScene() {
        //camera
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0);

        mat4.identity(mvMatrix);
        mat4.translate(mvMatrix, mvMatrix, [0.0, 0, z]);

        //rotate
        mat4.rotate(mvMatrix, mvMatrix, utils.degToRad(xRot), [1, 0, 0]);
        mat4.rotate(mvMatrix, mvMatrix, utils.degToRad(zRot), [0, 0, 1]);
        mat4.rotate(mvMatrix, mvMatrix, utils.degToRad(yRot), [0, 1, 0]);

        for(var i in cubes){
            cubes[i].draw();
        }
    }
}

//often used functions
class Utils{
    constructor(){
        this.mvMatrixStack = [];
    }

    mvPushMatrix() {
        var copy = mat4.create();
        mat4.copy(copy, mvMatrix);
        this.mvMatrixStack.push(copy);
    }

    mvPopMatrix() {
        if (this.mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        mvMatrix = this.mvMatrixStack.pop();
    }

    degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

    handlePickedObject(hit) {
        var moveY = [0.0, 1.0, 0.0];
        vec3.add(hit.position, hit.position, moveY);

        picker.render();
    }
}

function initWorldObjects(gWidth, gHeight, cWidth) {
    for(var i = 0; i < gWidth; i += cWidth){
        for(var j = 0; j < gHeight; j += cWidth){
            //Half of Grid - loop integer - half cube width
            var x = (gWidth/2) - i - (cWidth/2);
            var z = (gWidth/2) - j - (cWidth/2);
            cubes.push(new Cube([x, 0.0, z]));
        }
    }
}

//main function
function webGL() {
    canvas = document.getElementById("canvas");
    utils = new Utils();
    input = new Input();
    program = new Program(canvas);
    initBuffers();
    shader = new Shader();
    picker = new Picker();
    initWorldObjects(gWidth, gHeight, cWidth);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    //draw regularly
    tick();
}

function tick() {
    requestAnimationFrame(tick);
    input.handleInput();
    picker.render();
}