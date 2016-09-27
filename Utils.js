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

    //do things with selected objects
    handlePickedObject(hit, mouseButton) {
        let objects = [];

        if(mouseButton == 1){
            var moveY = [0.0, cWidth/2, 0.0];
        }else if(mouseButton == 3){
            var moveY = [0.0, -1 * (cWidth/2), 0.0];
        }

        //get all cubes in radius
        for(let x = 0; x < (gWidth/cWidth); x++){
            for(let z = 0; z < (gHeight/cWidth); z++){
                let dx = x - hit.x;
                let dy = z - hit.z;
                let distanceSquared = dx*dx + dy*dy;
                //id is x * width + y
                if(distanceSquared <= brushSize*brushSize && cubes[x * (gWidth/cWidth) + z].position[1] == hit.position[1]){
                    objects.push(cubes[x * (gWidth/cWidth) + z]);
                }
            }
        }

        //apply changes
        for(let i in objects){
            vec3.add(objects[i].position, objects[i].position, moveY);
            if(objects[i].position[1] < 0){
                objects[i].diffuse = cColor[0];
            }else if(objects[i].position[1] < cColor.length){
                objects[i].diffuse = cColor[objects[i].position[1]];
            }else{
                objects[i].diffuse = cColor[cColor.length - 1];
            }
        }

        picker.render();
    }

    //convert array [1, 2, 3, 4, 5, ...] to array[[1, 2, 3, 4], []]
    //easier for handling colors
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

    //filter unique values from array with colors
    filterUnique(readout){
        let result = [];
        readout = this.cleanArray(readout);


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