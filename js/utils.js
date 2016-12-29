function mvPushMatrix() {
    var copy = mat4.create();
    mat4.copy(copy, mvMatrix);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

//dictionary for pressed keys
function handleKeyDown(event) {
    currentlyPressedKey[event.keyCode] = true;
}

function handleKeyUp(event) {
    currentlyPressedKey[event.keyCode] = false;
}

function handleKeys() {
    if(currentlyPressedKey[81]){
        //Page Up
        z -= 0.05;
    }
    if(currentlyPressedKey[69]){
        //Page Down
        z += 0.05;
    }
    if(currentlyPressedKey[87]){
        //Up cursor speed
        tilt -= 1;
    }
    if(currentlyPressedKey[83]){
        //Down cursor speed
        tilt += 1;
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}