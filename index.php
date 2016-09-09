<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <script type="text/javascript" src="gl-matrix.js"></script>
    <script type="text/javascript" src="script.js"></script>

    <script id="shader-fs" type="x-shader/x-fragment">
        precision mediump float;

        void main(void) {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
    </script>

    <script id="shader-vs" type="x-shader/x-vertex">
        attribute vec3 aVertexPosition;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;

        void main(void){
            gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
        }
    </script>

</head>
<body onload="webGL();">
<canvas id="canvas" width="1024" height="720" style="border: none"></canvas>
</body>
</html>
