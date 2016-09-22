//Cube object
class Cube{
    constructor(position){
        this.position = position;
        //this.diffuse = [Math.random(), Math.random(), Math.random()];
        this.diffuse = [0.4, 1.0, 0.4];
        //set colors to a starting value
        this.randomiseColors();
    }

    draw(offscreen){
        utils.mvPushMatrix();

        //move to cubes position
        mat4.translate(mvMatrix, mvMatrix, this.position);

        gl.uniform1i(shaderProgram.outlineUniform, false);
        //draw cube in main color
        if(offscreen){
            gl.uniform3f(shaderProgram.pickerColorUniform, this.cPicker[0], this.cPicker[1], this.cPicker[2]);
        }else{
            gl.uniform3f(shaderProgram.colorUniform, this.diffuse[0], this.diffuse[1], this.diffuse[2]);
        }

        //bindBuffer and AttribPointer
        //position
        gl.bindBuffer(gl.ARRAY_BUFFER, cubePositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubePositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        //normals
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cubeNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
        //color
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
        //indices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
        //set Matrix Uniform
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
        //calculate Normal Matrix
        let normalMatrix = mat4.create();
        mat4.invert(normalMatrix, mvMatrix);
        mat4.transpose(normalMatrix, normalMatrix);
        gl.uniformMatrix4fv(shaderProgram.normalMatrixUniform, false, normalMatrix);

        gl.drawElements(gl.TRIANGLES, cubeIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        //switch to outlines
        gl.uniform1i(shaderProgram.outlineUniform, true);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, outlineIndexBuffer);
        gl.drawElements(gl.LINES, outlineIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

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
            //unique color Picker
            this.cPicker = color;
        }

    }
}
