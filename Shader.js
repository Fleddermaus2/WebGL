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

        //get Uniforms from Shader Code
        shaderProgram.vertexPositionAttribute  = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

        shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
        gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.normalMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
        shaderProgram.colorUniform = gl.getUniformLocation(shaderProgram, "uColor");
        shaderProgram.pickerColorUniform = gl.getUniformLocation(shaderProgram, "uPColor");
        shaderProgram.offscreenUniform = gl.getUniformLocation(shaderProgram, "uOffscreen");
        shaderProgram.outlineUniform = gl.getUniformLocation(shaderProgram, "uOutline");
    }
}