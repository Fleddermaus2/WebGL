function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function setTime(){
    maxLifetime = document.getElementById("time").value;
}

function setNumberOfParticles() {
    numParticles = document.getElementById("numParticles").value;
}

function setSize() {
    size = document.getElementById("size").value;
}

function setImage(value){
    texture.image.src = imagePaths[value];
}

//check if size changed and apply new sizes
function resize(canvas){
    let clientWidth = canvas.clientWidth;
    let clientHeight = canvas.clientHeight;

    if(clientWidth != c_width || clientHeight != c_height){
        c_width = clientWidth;
        c_height = clientHeight;
        canvas.height = clientHeight;
        canvas.width = clientWidth;

        gl.viewport(0, 0, c_width, c_height);
    }
}