class Particle{
    constructor(startingDistance, rotationSpeed){
        this.angle = 0;
        this.dist = startingDistance;
        this.rotationSpeed = rotationSpeed;
        //set colors to a starting value
        this.randomiseColors();
    }

    draw(tilt, spin, twinkle) {
        mvPushMatrix();

        //move to particles position
        mat4.rotate(mvMatrix, mvMatrix, degToRad(this.angle), [0.0, 1.0, 0.0]);
        mat4.translate(mvMatrix, mvMatrix, [this.dist, 0.0, 0.0]);

        //rotate back so that the particle is facing the viewer
        mat4.rotate(mvMatrix, mvMatrix, degToRad(-this.angle), [0.0, 1.0, 0.0]);
        mat4.rotate(mvMatrix, mvMatrix, degToRad(-tilt), [1.0, 0.0, 0.0]);

        if(twinkle){
            gl.uniform3f(shaderProgram.colorUniform, this.twinkleR, this.twinkleG, this.twinkleB);
            this.drawParticle();
        }

        //particle spin around z at the same rate
        mat4.rotate(mvMatrix, mvMatrix, degToRad(spin), [0.0, 0.0, 1.0]);

        //draw star in main color
        gl.uniform3f(shaderProgram.colorUniform, this.r, this.g, this.b);
        this.drawParticle();

        mvPopMatrix();
    }

    animate(elapsedTime) {
        this.angle += this.rotationSpeed * effectiveFPMS * elapsedTime;
        //decrease the distance, resetting the particle to the outside of the spiral if it is at the center
        this.dist -= 0.01 * effectiveFPMS * elapsedTime;
        if(this.dist < 0.0){
            this.dist += 5.0;
            this.randomiseColors();
        }
    }

    randomiseColors() {
        //give star color
        this.r = Math.random();
        this.g = Math.random();
        this.b = Math.random();

        //twinkle
        this.twinkleR = Math.random();
        this.twinkleG = Math.random();
        this.twinkleB = Math.random();
    }

    drawParticle() {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, particleTexture);
        gl.uniform1i(shaderProgram.samplerUniform, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, particleVertexTextureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexTextureCoordAttribute, particleVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, particleVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, particleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        setMatrixUniforms();
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, particleVertexPositionBuffer.numItems);
    }
}