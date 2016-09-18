//initGL and drawScene
class Program{
    constructor(canvas){
        this.initGL(canvas);
    }

    //initialise gl
    initGL(canvas) {
        try{
            gl = canvas.getContext("webgl");
            c_width = canvas.width;
            c_height = canvas.height;
        }catch(e){
        }

        if(!gl){
            alert("Couldn't initialise WebGL.");
        }
    }

    //draw all elements to canvas
    drawScene(offscreen) {
        //camera
        gl.viewport(0, 0, c_width, c_height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        mat4.perspective(pMatrix, 45, c_width / c_height, 0.1, 1000.0);

        mat4.identity(mvMatrix);
        mat4.translate(mvMatrix, mvMatrix, [0.0, 0, z]);

        //rotate
        mat4.rotate(mvMatrix, mvMatrix, utils.degToRad(xRot), [1, 0, 0]);
        mat4.rotate(mvMatrix, mvMatrix, utils.degToRad(zRot), [0, 0, 1]);
        mat4.rotate(mvMatrix, mvMatrix, utils.degToRad(yRot), [0, 1, 0]);

        for(var i in cubes){
            cubes[i].draw(offscreen);
        }
    }
}