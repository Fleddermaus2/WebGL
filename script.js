//main context
var gl;

//canvas
var canvas;

//screen
var c_width;
var c_height;

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
var cScale = 1;
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
function initBuffers(cScale) {

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

function initWorldObjects(gWidth, gHeight, cWidth) {
    $("#count").text(((gWidth/cWidth) * (gHeight/cWidth)).toString());

    for(var i = 0; i < gWidth; i += cWidth){
        for(var j = 0; j < gHeight; j += cWidth){
            //Half of Grid - loop integer - half cube c_width
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
    initBuffers(cScale);
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

function handleForm() {
    var xGrid = $("#xGrid").val();
    if(gWidth <= 0){
        xGrid = 1;
        $("#xGrid").val(1);
    }

    var yGrid = $("#yGrid").val();

    if(yGrid <= 0){
        yGrid = 1;
        $("#yGrid").val(1);
    }

    cScale = $("#cScale").val();

    if(cScale <= 0){
        cScale = 1;
        $("#cScale").val(1);
    }

    cubes = [];
    cWidth = 2 * cScale;
    gWidth = xGrid * cWidth;
    gHeight = yGrid * cWidth;
    initBuffers(cScale);
    initWorldObjects(gWidth, gHeight, cWidth);
    picker.render();
}