import { System } from "/kernox.js";
import { Camera, camera } from "../../utils/scene/Camera.js";

class InputHandler extends System {

    public init() : boolean {

        // Global window events

        window.addEventListener('keydown',  (e) => { this.keydown(e) });
        window.addEventListener('keyup',    (e) => { this.keyup(e)   });
            
        return true;
    }

    private keydown(e){
        if(!this.__kernox.paused) this.dispatchEvent('keydown',{ key : e.key });
    }

    private keyup(e){
        if(!this.__kernox.paused) this.dispatchEvent('keyup',{ key : e.key });

    }

 
}

export default InputHandler;
