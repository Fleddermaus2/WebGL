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
            var x, y, top = 0, left = 0, obj = canvas;
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
            var readout = new Uint8Array(1 * 1 * 4);
            gl.bindFramebuffer(gl.FRAMEBUFFER, picker.pickerFrameBuffer);
            gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, readout);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            var ob = null;
            for(var i = 0; i < grid.length; i++){
                ob = cubes[i];
                if(picker.compare(readout, ob.cPicker)){
                    utils.handlePickedObject(ob);
                    break;
                }
            }
        }
    }
}