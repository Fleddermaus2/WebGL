//main context
var gl;

//canvas
var canvas;

//screen
var c_width;
var c_height;

//buffer for positions
var cubePositionBuffer;
//buffer for color coordinates
var cubeColorBuffer;
//buffer for indices
var cubeIndexBuffer;
//buffer for normals
var cubeNormalBuffer;

//buffer for outlines
var outlineIndexBuffer;

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
var z = -50.0;

//objects
var cubes = [];
//standard cube is 2 units (cScale = 1)
var cScale = 1;
var cWidth = 2 * cScale;

//grid
var gWidth = 20 * cWidth;
var gHeight = 20 * cWidth;

//input
var currentlyPressedKey = {};

//classes
var picker;
var shader;
var utils;
var program;
var input;

//brush
var readPixelsSize = 1;
var brushSize = 2;

//cube colors
var cColor = [
    [0, 0.4, 1], //blue
    [1, 1, 0], //yellow
    [0.65, 0.45, 0.2], //brown
    [0.38, 0.64, 0.2], //green
    [0.5, 0.5, 0.5], //grey
    [0.9, 0.9, 0.9] //white-grey
];

//initialise buffers
function initBuffers(cScale) {

    //create cube position buffer
    cubePositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubePositionBuffer);

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
    cubePositionBuffer.itemSize = 3;
    cubePositionBuffer.numItems = 8;

    //normals buffer
    cubeNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeNormalBuffer);

    var normals = [
        // front
        0.0,  0.0,  1.0,
        0.0,  0.0,  1.0,
        0.0,  0.0,  1.0,
        0.0,  0.0,  1.0,

        // back
        0.0,  0.0, -1.0,
        0.0,  0.0, -1.0,
        0.0,  0.0, -1.0,
        0.0,  0.0, -1.0,

        // top
        0.0,  1.0,  0.0,
        0.0,  1.0,  0.0,
        0.0,  1.0,  0.0,
        0.0,  1.0,  0.0,

        // bottom
        0.0, -1.0,  0.0,
        0.0, -1.0,  0.0,
        0.0, -1.0,  0.0,
        0.0, -1.0,  0.0,

        // right
        1.0,  0.0,  0.0,
        1.0,  0.0,  0.0,
        1.0,  0.0,  0.0,
        1.0,  0.0,  0.0,

        // left
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    cubeNormalBuffer.itemSize = 3;
    cubeNormalBuffer.numItems = 24;

    //create cube color buffer
    cubeColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);

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
    cubeColorBuffer.itemSize = 4;
    cubeColorBuffer.numItems = 8;

    //index buffer
    cubeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
    var cubeVertexIndices = [
        0, 1, 3, //Front
        1, 2, 3, //Front
        5, 4, 7, //Back
        5, 6, 7, //Back
        3, 2, 6, //Top
        3, 6, 7, //Top
        0, 1, 5, //Bottom
        0, 5, 4, //Bottom
        1, 5, 6, //Right
        1, 6, 2, //Right
        4, 0, 3, //Left
        4, 3, 7 //Left
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
    cubeIndexBuffer.itemSize = 1;
    cubeIndexBuffer.numItems = 36;

    //outline index buffer
    outlineIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, outlineIndexBuffer);
    var outlineVertexIndices = [
        0, 1, 0, 3, 0, 4,
        2, 1, 2, 3, 2, 6,
        5, 1, 5, 4, 5, 6,
        7, 3, 7, 4, 7, 6
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(outlineVertexIndices), gl.STATIC_DRAW);
    outlineIndexBuffer.itemSize = 1;
    outlineIndexBuffer.numItems = outlineVertexIndices.length;
}

function initWorldObjects(gWidth, gHeight, cWidth) {
    $("#count").text(((gWidth/cWidth) * (gHeight/cWidth)).toString());
    let id = 0;


    for(var i = 0; i < gWidth; i += cWidth){
        for(var j = 0; j < gHeight; j += cWidth){
            //Half of Grid - loop integer - half cube c_width
            var x = (gWidth/2) - i - (cWidth/2);
            var z = (gHeight/2) - j - (cWidth/2);
            cubes.push(new Cube([x, 0.0, z], id, i/cWidth, j/cWidth));
            id++;
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

    //remove context menu on canvas
    $('body').on('contextmenu', '#canvas', function(e){ return false; });

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