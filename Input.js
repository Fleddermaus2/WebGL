//all input functions
class Input{
    constructor(){
        document.onkeydown = this.handleKeyDown;
        document.onkeyup = this.handleKeyUp;
    }

    //dictionary for pressed keys
    handleKeyDown(event) {
        currentlyPressedKey[event.keyCode] = true;
    }

    handleKeyUp(event) {
        currentlyPressedKey[event.keyCode] = false;
    }

    handleInput(){
        this.handleKeys();
        this.handleMouse();
    }

    handleKeys() {
        if(currentlyPressedKey[81]){
            //Q
            yRot -= 1;
        }
        if(currentlyPressedKey[69]){
            //E
            yRot += 1;
        }
        if(currentlyPressedKey[87]){
            //W
            xRot -= 1;
        }
        if(currentlyPressedKey[83]){
            //S
            xRot += 1;
        }
        if(currentlyPressedKey[65]){
            //A
            zRot -= 1;
        }
        if(currentlyPressedKey[68]){
            //D
            zRot += 1;
        }
        if(currentlyPressedKey[82]){
            //R
            z -= 0.5;
        }
        if(currentlyPressedKey[70]){
            //F
            z += 0.5;
        }
    }

    handleMouse() {
        canvas.onmouseup = function (ev) {
            //clientX and clientY calculate from top left of browser
            let x, y, top = 0, left = 0, obj = canvas, ob = null;
            while(obj && obj.tagName !== 'Body'){
                top += obj.offsetTop;
                left += obj.offsetLeft;
                obj = obj.offsetParent;
            }

            //remove scrolling
            left -= window.pageXOffset;
            top -= window.pageYOffset;

            //calculate canvas coordinates
            x = ev.clientX - left;
            y = c_height - (ev.clientY - top);

            //read one pixel with RGBA
            let readout = new Uint8Array(readPixelsSize * readPixelsSize * 4);
            gl.bindFramebuffer(gl.FRAMEBUFFER, picker.pickerFrameBuffer);
            gl.readPixels(x - (brushSize/2), y - (brushSize/2), readPixelsSize, readPixelsSize, gl.RGBA, gl.UNSIGNED_BYTE, readout);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            readout = utils.filterUnique(readout);

            //left mouse button
            if(ev.which == 1){
                for(let i = 0; i < cubes.length; i++){
                    ob = cubes[i];
                    if(picker.compare(readout, ob.cPicker)){
                        utils.handlePickedObject(ob, 1);
                    }
                }
            }
            //right mouse button
            else if(ev.which == 3){
                for(let i = 0; i < cubes.length; i++){
                    ob = cubes[i];
                    if(picker.compare(readout, ob.cPicker)){
                        utils.handlePickedObject(ob, 3);
                    }
                }
            }
        }
    }
}