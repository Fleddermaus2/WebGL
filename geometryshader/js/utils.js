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