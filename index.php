<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <script type="text/javascript" src="gl-matrix.js"></script>
    <script type="text/javascript" src="script.js"></script>

    <script id="shader-fs" type="x-shader/x-fragment">
        precision mediump float;

        varying vec4 vColor;

        void main(void) {
            gl_FragColor = vColor;
        }
    </script>

    <script id="shader-vs" type="x-shader/x-vertex">
        attribute vec3 aVertexPosition;
        attribute vec4 aVertexColor;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;

        varying vec4 vColor;

        void main(void){
            gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
            vColor = aVertexColor;
        }
    </script>

</head>
<body onload="webGL();">
<canvas id="canvas" width="1024" height="720" style="border: none"></canvas>
</body>
</html>
