//picker for selecting objects
class Picker{
    constructor(){
        this.pickerTexture = '';
        this.pickerRenderBuffer = '';
        this.pickerFrameBuffer = '';
        this.colorSet = {};

        this.initPicker();
    }

    initPicker() {
        //create texture to store colors
        this.pickerTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.pickerTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, c_width, c_height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        //create renderbuffer for depth information
        this.pickerRenderBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.pickerRenderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, c_width, c_height);
        //Framebuffer with texture and renderbuffer
        this.pickerFrameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickerFrameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.pickerTexture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.pickerRenderBuffer);
        //cleanup
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    //draw twice
    render() {
        //off-screen rendering
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickerFrameBuffer);
        gl.uniform1i(shaderProgram.offscreenUniform, true);
        program.drawScene(true);

        //on-screen rendering
        gl.uniform1i(shaderProgram.offscreenUniform, false);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        program.drawScene(false);
    }

    //compare pixel with label; scale diffuse [0,1] to [0,255]
    compare(readout, color) {
        return(Math.abs(Math.round(color[0]*255) - readout[0]) <= 1 && Math.abs(Math.round(color[1]*255) - readout[1]) <= 1 && Math.abs(Math.round(color[2]*255) - readout[2]) <= 1);
    }
}
