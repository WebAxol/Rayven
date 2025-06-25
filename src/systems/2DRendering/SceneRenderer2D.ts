import { ArrayList, System }  from "/kernox.js";
import Vector2D           from "../../utils/physics/Vector2D.js";
import { Camera, camera } from "../../utils/scene/Camera.js";
import canvases           from "../../setup/canvases.js";

class SceneRenderer2D extends System {

    private horizontalWalls! : ArrayList;
    private verticalWalls!   : ArrayList;
    private circles!         : ArrayList;

    private ctx   = canvases.canvas2d.getContext('2d');
    private scale = 1.5 * 3;

    public init(){
        this.horizontalWalls = this.getCollection<ArrayList>('HorizontalWalls');
        this.verticalWalls   = this.getCollection<ArrayList>('VerticalWalls');
        this.circles         = this.getCollection<ArrayList>('Circles');
    }

    public execute() {
        
        this.ctx.fillStyle = 'rgba(0,0,0,1)';
        this.ctx.fillRect(0,0,3000,3000);
        
        for(const wall of this.horizontalWalls){
            this.renderWall(wall);
        }

        for(const wall of this.verticalWalls){
            this.renderWall(wall); 
        }

        for(const circle of this.circles){
            this.renderCircle(circle);
        }
    };

    public renderWall(wall){

        if(!camera.castCenter) return;

        const deg = camera.castCenter?.direction.angle() * (180 / Math.PI);

        this.ctx.strokeStyle = `rgba(${wall.color},1)`;
        this.ctx.lineWidth = 1;

        let from = { x : wall.startX || wall.posX, y : wall.posY || wall.startY};
        let to   = { x : wall.endX   || wall.posX, y : wall.posY || wall.endY  };

        from = Vector2D.rotate(from, camera.pos, deg);
        to   = Vector2D.rotate(to,   camera.pos, deg);

        from = Vector2D.sub(Vector2D.sub(from,camera.pos), { x : -10, y : -10 }).scale(this.scale);
        to   = Vector2D.sub(Vector2D.sub(to,  camera.pos), { x : -10, y : -10 }).scale(this.scale);


        this.ctx.beginPath();
        this.ctx.moveTo(from.x,from.y);
        this.ctx.lineTo(to.x,to.y);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    public renderCircle(circle){

        if(!camera.castCenter) return;

        const deg = camera.castCenter?.direction.angle() * (180 / Math.PI);

        this.ctx.strokeStyle = `rgb(${circle.color})`;
        this.ctx.lineWidth = 1;

        let center = Vector2D.rotate(circle.center,camera.pos,deg);
        center = Vector2D.sub(Vector2D.sub(center,camera.pos), { x : -10, y : -10 }).scale(this.scale);

        this.ctx.beginPath();
        this.ctx.arc(center.x, center.y, circle.radius * this.scale, 0, 2 * Math.PI);
        this.ctx.stroke();

    }

}

export default SceneRenderer2D;