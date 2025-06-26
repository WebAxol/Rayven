import type { ArrayList, System }   from "/kernox.js";
import type { HorizontalWall }      from "../../proto/HorizontalWall.js";
import type { VerticalWall }        from "../../proto/VerticalWall.js";
import type { Circle }              from "../../proto/Circle.js";
import type { Ray }                 from "../../proto/Ray.js";

import CollisionDetector            from "../../utils/physics/CollisionDetector.js";
import Vector2D                     from "../../utils/physics/Vector2D.js";

class RayCaster {
    
    private horizontalWalls! : HorizontalWall[];
    private verticalWalls!   : VerticalWall[];
    private circles!         : Circle[];

    constructor( private sys : System ){
        // When the application starts execution, request geometry
        this.sys.attachToEvent("__start", (e) => { this.loadGeometry() });
    }
    
    private loadGeometry(){
        this.horizontalWalls = this.sys.getCollection<ArrayList>('HorizontalWalls').asArray();
        this.verticalWalls   = this.sys.getCollection<ArrayList>('VerticalWalls').asArray();
        this.circles         = this.sys.getCollection<ArrayList>('Circles').asArray();
    }

    /**
     * Tests for closest collision of given ray with geometry within the scene, and recursively 
     * repeats the process for derived rays (reflected or forwarded rays.)
     * @param ray Entity that implements properties of a Ray to be fired against geometry
     * @param indices lower bounds precalculated from ray's position between closest horizontal and vertical walls
     */
    public castRay(ray : any, indices : { horizontal :number, vertical : number }) : void {
        
        if(ray.reflected) ray.reflected.active = false;

        ray.collidesWith = null;
        ray.lambda = Infinity;

        const wallCollision   = this.iterativeWallCollisionTest(ray, indices);
        const circleCollision = this.testAgainstCircles(ray);

        if(!wallCollision && !circleCollision) return;
            
        if(ray.level < 15 &&  ray.collidesWith.opacity < 1 && this.reflect(ray)){ 
            this.castRay(ray.reflected,indices);
        }
    }
    /**
     * Defines a ray which derives from the reflection of the given one, if collided with 
     * one of the existing surface types. It gets a new ray created if necessary.
     * @param ray The incident ray
     * @returns True if a reflection ray emerges (in case of collision with mirror), false otherwise.
     */
    private reflect(ray :any) :boolean {

        if(!ray.collidesWith) return false;

        if(!ray.reflected){
            ray.reflected       = this.sys.__kernox.entityFactory.create('Ray', {});
            ray.reflected.level = ray.level + 1;
        }

        ray.reflected.source    = Vector2D.copy(ray.collidesAt);
        ray.reflected.direction = Vector2D.copy(ray.direction);        
        ray.reflected.active    = true;

        const surfaceType = ray.collidesWith.type;
        const strategy = {
            HorizontalWall : (reflected) => { reflected.direction.y *= -1 },
            VerticalWall   : (reflected) => { reflected.direction.x *= -1 },
            Circle         : (reflected) => { 
                
                const circle = ray.collidesWith;
                const pointToCenter = Vector2D.sub(circle.center,ray.collidesAt); 
                const angleBetween  = Vector2D.angleBetween( Vector2D.scale(ray.direction, -1), pointToCenter );
                const sense         = (ray.direction.x > 0 ? 1 : -1);

                reflected.direction
                    .complexRotate( [ 
                        Math.cos(sense * angleBetween * 2), 
                        Math.sin(sense * angleBetween * 2)
                    ]);

                reflected.source.add(Vector2D.scale(reflected.direction,0.01)); 
                reflected.direction.scale(-1);

            }
        };

        const reflectStrategy = strategy[surfaceType];

        if(!reflectStrategy) return false;

        reflectStrategy(ray.reflected);

        return true;
    }

    // WARNING: The following function assumes that wall collections are properly sorted in ascending order based on their posX and posY values

    private iterativeWallCollisionTest(ray : Ray, indices : { horizontal :number, vertical : number }) :boolean {

        // Sense indicates to which direction the ray moves (up or down) and (left or right)

        const sense = { 
            x :  ray.direction.x > 0 ? 1 : -1, 
            y :  ray.direction.y > 0 ? 1 : -1  
        };
 
        var wallH, wallV, lambdaH, lambdaV, collision;

        while(
            (indices.horizontal < this.horizontalWalls.length && sense.y == 1) || (indices.horizontal >= 0 && sense.y == -1) ||
            (indices.vertical   < this.verticalWalls.length   && sense.x == 1) || (indices.vertical   >= 0 && sense.x == -1)
        ){

            // Closest horizontal and vertical walls not processed so far

            wallH = this.horizontalWalls[indices.horizontal + (sense.y == 1 ? 1 : 0)];
            wallV = this.verticalWalls[  indices.vertical   + (sense.x == 1 ? 1 : 0)];

            lambdaH = wallH ?  CollisionDetector.RayVsHorizontalLine(ray, wallH.posY) : Infinity;
            lambdaV = wallV ?  CollisionDetector.RayVsVerticalLine(ray, wallV.posX)   : Infinity;

            if(lambdaV === lambdaH) break;

            // For closest wall (either vertical or horizontal), test for collision

            if(lambdaH < lambdaV){ 
                collision = CollisionDetector.RayVsHorizontalWall(ray,wallH);
            }
            else{ 
                collision = CollisionDetector.RayVsVerticalWall(ray,wallV);
            }
            
            // If there was a collision, assign data to ray

            if(collision){ 
                ray.collidesAt   = collision;
                ray.lambda       =  Math.min(lambdaH,lambdaV);
                ray.collidesWith = (lambdaH <= lambdaV) ? wallH : wallV;
                break;
            }

            // Update indices

            indices.horizontal += (lambdaH <= lambdaV) ? sense.y : 0;
            indices.vertical   += (lambdaH >= lambdaV) ? sense.x : 0;
        };

        return collision ? true : false;
    }

    private testAgainstCircles(ray : Ray) :boolean {

        var collided = false, collision;

        for(let i = 0; i < this.circles.length; i++){

            collision = CollisionDetector.RayVsCircle(ray,this.circles[i]);
    
            if(!collision) continue;

            if(ray.lambda <= collision.lambda) continue;

            collided = true;
        
            ray.collidesAt   = collision.point;
            ray.lambda       = collision.lambda;
            ray.collidesWith = this.circles[i];
            
        }

        return collided;
    }
};

export default RayCaster;