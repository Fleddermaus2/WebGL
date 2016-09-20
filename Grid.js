//Cube object
class Grid{
    constructor(xGrid, yGrid){
        this.position = [0.0, 0.0, 0.0];
        this.diffuse = [Math.random(), Math.random(), Math.random()];
        //set colors to a starting value
        this.randomiseColors();
        this.initBuffers(xGrid, yGrid);
    }

    draw(offscreen){
        utils.mvPushMatrix();

        //move to cubes position
        mat4.translate(mvMatrix, mvMatrix, this.position);

        //draw cube in main color
        if(offscreen){
            gl.uniform3f(shaderProgram.pickerColorUniform, this.cPicker[0], this.cPicker[1], this.cPicker[2]);
        }else{
            gl.uniform3f(shaderProgram.colorUniform, this.diffuse[0], this.diffuse[1], this.diffuse[2]);
        }

        //bindBuffer and AttribPointer
        //position
        gl.bindBuffer(gl.ARRAY_BUFFER, gridVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, gridVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        //color
        gl.bindBuffer(gl.ARRAY_BUFFER, gridVertexColorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, gridVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
        //indices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gridVertexIndexBuffer);
        //set Matrix Uniform
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

        gl.drawElements(gl.TRIANGLES, gridVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

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

    //initialise buffers
    initBuffers(xGrid, yGrid) {

        var aVertices = 0, bVertices, drawnSquares = 0, numVertices, numSquares;
        numSquares = xGrid * yGrid;
        numVertices = 2 + 2 * numSquares;
        numVertices = 9;
        bVertices = 1 + yGrid;
        console.log(numVertices);

        //create cube position buffer
        gridVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gridVertexPositionBuffer);

        var vertices = [];
        for(let i = 0; i < 1 + xGrid; i++){
            for(let j = 0; j < 1 + yGrid; j++){
                vertices.push(i, 0, j);
            }
        }

        let output = "";
        for(let i in vertices){
            output += vertices[i];
            output += " ";
        }
        console.log(output);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gridVertexPositionBuffer.itemSize = 3;
        gridVertexPositionBuffer.numItems = numVertices;

        //create cube color buffer
        gridVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gridVertexColorBuffer);

        var color = [];

        for(let i = 0; i < numVertices; i++){
            color.push(1, 1, 1, 1);
        }

        output = "";
        for(let i in color){
            output += color[i];
            output += " ";
        }
        console.log(output);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);
        gridVertexColorBuffer.itemSize = 4;
        gridVertexColorBuffer.numItems = numVertices;

        //index buffer
        gridVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gridVertexIndexBuffer);
        var vertexIndices = [];

        while(drawnSquares < numSquares){
            console.log(aVertices + " " + bVertices);

            if(aVertices >= yGrid){
                vertexIndices.push(aVertices, aVertices+1, bVertices);
                vertexIndices.push(aVertices+1, bVertices, bVertices+yGrid);
            }else{
                vertexIndices.push(aVertices, aVertices+1, bVertices);
                vertexIndices.push(aVertices+1, bVertices, bVertices+1);
            }
            aVertices++;
            bVertices++;
            drawnSquares++;
        }

        output = "";
        for(let i in vertexIndices){
            output += vertexIndices[i];
            output += " ";
        }
        console.log(output);

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);
        gridVertexIndexBuffer.itemSize = 1;
        gridVertexIndexBuffer.numItems = vertexIndices.length;
    }
}
