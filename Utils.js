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

    cleanArray(readout){
        let result = [];
        let temp;

        for(let i = 0; i < readout.length; i+=4){
            if(readout[i] != 0 && readout[i+1] != 0 && readout[i+2] != 0){
                temp = [readout[i], readout[i+1], readout[i+2], readout[i+3]];
                result.push(temp);
            }
        }

        return result;
    }

    filterUnique(readout){
        let result = [];

        function findColor(i) {
            let color;
            let color2 = readout[i];
            for(let i in result){
                color = result[i];
                if(color[0] == color2[0] && color[1] == color2[1] && color[2] == color2[2]){
                    return true;
                }
            }
        }

        for(let i = 0; i < readout.length; i++){
            if(i == 0){
                result.push(readout[0]);
            }
            else{
                if(!findColor(i)){
                    result.push(readout[i]);
                }
            }
        }

        return result;
    }
}