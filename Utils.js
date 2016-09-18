//often used functions
class Utils{
    constructor(){
        this.mvMatrixStack = [];
    }

    mvPushMatrix() {
        var copy = mat4.create();
        mat4.copy(copy, mvMatrix);
        this.mvMatrixStack.push(copy);
    }

    mvPopMatrix() {
        if (this.mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        mvMatrix = this.mvMatrixStack.pop();
    }

    degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

    handlePickedObject(hit) {
        var moveY = [0.0, cWidth/2, 0.0];
        var changeC = [0.1, 0.1, 0.1];
        vec3.add(hit.position, hit.position, moveY);
        vec3.add(hit.diffuse, hit.diffuse, changeC);

        picker.render();
    }
}