//main context
var gl;

//canvas
var canvas;

//screen
var c_width;
var c_height;

//buffer for positions
var gridVertexPositionBuffer;
//buffer for color coordinates
var gridVertexColorBuffer;
//buffer for indices
var gridVertexIndexBuffer;

//model-view-matrix
var mvMatrix = mat4.identity(mat4.create());
//projection matrix
var pMatrix = mat4.identity(mat4.create());

//gl program
var shaderProgram;

//rotation
var xRot = 90;
var zRot = 0;
var yRot = 0;

//distance to object
var z = -5.0;

//objects
var grid;

//input
//changes context so can't be used with this
var currentlyPressedKey = {};

//classes
var picker;
var shader;
var utils;
var program;
var input;

function initWorldObjects(xGrid, yGrid) {
    grid = new Grid(xGrid, yGrid);
}

//main function
function webGL() {
    canvas = document.getElementById("canvas");
    utils = new Utils();
    input = new Input();
    program = new Program(canvas);
    shader = new Shader();
    picker = new Picker();
    initWorldObjects(4,4);

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