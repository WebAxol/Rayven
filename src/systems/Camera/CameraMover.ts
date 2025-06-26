import { System }         from '/kernox.js';
import { camera }         from '../../utils/scene/Camera.js';
import Vector2D           from '../../utils/physics/Vector2D.js';

class CameraMover extends System {

    private dt : number = 0;
    private speed :number = 0;
        
    private commandKeyMap = {
        w : () => { this.translateCamera(1, 0) },
        s : () => { this.translateCamera(-1,0) },
        a : () => { this.translateCamera( 0,1) },
        d : () => { this.translateCamera(0,-1) },
        k : () => { this.rotateCamera(  30 * this.dt) },
        l : () => { this.rotateCamera( -30 * this.dt) },
    }

    private control = {
        w : false,
        s : false,
        d : false,
        a : false,
        k : false,
        l : false
    }

    public init(){
        this.attachToEvent("keydown", (e) => { this.onkeydown(e) });
        this.attachToEvent("keyup", (e) => { this.onkeyup(e) });
    }

    public execute() {

        this.dt = 50 / this.__kernox.fps;

        this.speed = 0.09 * this.dt;
        
        let keys = Object.keys(this.control);

        keys.forEach((key) => {

            if(this.control[key] === true){
                this.commandKeyMap[key]();
            }
        });
    }
    
    private rotateCamera(angle :number = 0){

        if(!camera || !camera.castEdge || !camera.castCenter) return false;

        const complex = [ Math.cos(angle / Math.PI / 180), Math.sin(angle / Math.PI / 180) ];
        
        camera.castCenter.direction.complexRotate(complex);
        camera.castEdge.direction.complexRotate(complex);
    }
    
    private translateCamera(forward :number = 0, lateral : number = 0){

        if(!camera || !camera.castEdge || !camera.castCenter) return false;

        const complex = [ Math.cos(Math.PI / 2), Math.sin(Math.PI / 2) ];

        let frontalMovement   = Vector2D.scale(camera.castCenter.direction, forward);
        let lateralMovement   = Vector2D.complexRotate(camera.castCenter.direction, complex).scale(lateral);
        let movementDirection = frontalMovement.add(lateralMovement).normalize();

        let displacement      = movementDirection.scale(this.speed);

        camera.pos.add(displacement);
    }

    // EVENTS
    
    public onkeydown(info){
        if(this.control[info.key] !== undefined && this.control[info.key] !== true ){
            this.control[info.key] = true;
        }
    }

    public onkeyup(info){
        if(this.control[info.key] !== undefined && this.control[info.key] !== false){
            this.control[info.key] = false;
        }
    }
};

export default CameraMover;