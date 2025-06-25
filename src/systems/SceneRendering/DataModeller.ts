import LocatorGL          from "../../utils/rendering/LocatorGL.js";
import Vector2D           from "../../utils/physics/Vector2D.js";
import CONFIG             from "../../config.js";
import { gl }             from "../../setup/webGL.js";
import { camera }         from "../../utils/scene/Camera.js";
import { Circle }         from "../../proto/Circle.js";

type RGBA = [ number, number, number, number ]; 
type Pair<T> = [ T, T ];

/* Definitions:

- The scene is modelled as the set of elements and sub-elements within the camera FOV, each of which are represented by 4 vertices, one trapezium made of 2 triangles, (except for cylindrical elements)
- We call "element" to any geometry that is rendered after being detected by a ray
- A "sub-element" is an element rendered within another: either a mirror or a window element

*/
/**
 * @description                           contains information of the current element and sub-elements in contact with an iterating ray
 * @property {number}            itemID : integer that identifies the last entity a ray has collided with
 * @property {Pair<number>}      x      : abscissas in normalized screen-space, representing horizontal left and right bounds of polygon
 * @property {Pair<number>}      y      : ordinates in normalized screen-space, representing vertical left and right bounds of polygon
 * @property {Pair<number>}      z      : depth value
 * @property {Pair<number>}      t      : texture coordinates
 * @property {Pair<number>}      l      : vertical bounds that limit the sky and floor based on the current context
 * @property {Pair<RGBA>}        color  : Polygon background color vector
 * @property {Cache | undefined} child  : It can contain a reference to another Cache object, representing a sub-scene within a mirror
 * @property {boolean}          stripped: If true, it will make a rectangle for each column derived of every iteration of a ray for a particular element (suitable for non-linear geometry)
 */
interface Cache {
    itemID   : number;             
    x        : Pair<number>;
    y        : Pair<number>;        
    z        : Pair<number>;
    t        : Pair<number>;
    l        : Pair<number>;      
    color    : Pair<RGBA>;          
    child    : Cache | undefined;   
    stripped : boolean;
}

class DataModeller {

    public memoryIndex : number = 0;

    private initialized         :boolean = false;
    private frontBuffer!        :WebGLBuffer;
    private frontElementBuffer! :WebGLBuffer;
    private lyingBuffer!        :WebGLBuffer;
    private lyingElementBuffer! :WebGLBuffer;

    private cache :Cache;

    constructor( private chief ){

        const head :any = {};
        const n :number = 14;

        var  node :any = head;

        // Empty cache is created by default

        for(let i = 0; i <= n; i++){
            node.itemID = -1;
            node.color  = [NaN,NaN]; 
            node.x      = [NaN,NaN];
            node.y      = [NaN,NaN]; 
            node.z      = [NaN,NaN];
            node.t      = [NaN,NaN];
            node.l      = [1,1];
            node.child  = undefined
            node.stripped = false;

            if(i == n) continue;

            node.child  = {};
            node = node.child;
        }

        this.cache = head;

        //this.chief.world.pauseExecution();
    }

    /**
    * @description Initializes memory buffers after WebGL is ready 
    */
    public init(){

        const locator :LocatorGL = this.chief.locator;

        this.frontBuffer        = locator.getBuffer("ARRAY_BUFFER","frontBuffer");
        this.frontElementBuffer = locator.getBuffer("ELEMENT_ARRAY_BUFFER","frontBuffer");
        this.lyingBuffer        = locator.getBuffer("ARRAY_BUFFER","lyingBuffer");
        this.lyingElementBuffer = locator.getBuffer("ELEMENT_ARRAY_BUFFER","lyingBuffer");

        this.initialized = true;
    }

    public reset() :void {

        this.memoryIndex = 0;

        var cache :Cache | undefined = this.cache;

        while(cache){
            cache.itemID   = -1;
            cache.stripped = true;
            cache = cache.child;
        }
    }

    private mapTexture(collidesAt : Vector2D, item : any){

        if(collidesAt == null) return 0;

        if(item.getType() == "Circle") return this.mapCylindricalTexture(collidesAt,item);

        return this.mapLinearTexture(collidesAt,item);
    }

    /**
     * @param collidesAt Point of collision at horizontal or vertical line segment
     * @param wall       Horizontal or vertical line segment object
     * @returns          Integer between 0 and 1 corresponding to the normalized x position of the texture
     */
    private mapLinearTexture(collidesAt : Vector2D, wall : any) : number {
        
        let percentage :number = 0;

        if(wall.getType() === 'HorizontalWall'){

            let wallLength = wall.endX - wall.startX;
            percentage = Math.abs(((collidesAt.x - wall.startX)));
        }

        else if(wall.getType() === 'VerticalWall'){

            let wallLength = wall.endY - wall.startY;
            percentage = Math.abs((collidesAt.y - wall.startY));
        }

        return percentage;
    }

    /**
     * @param collidesAt Point of collision at the circumference of the circle
     * @param cyl        Object containing a radius and a position vector 
     * @returns          Integer between 0 and 1 corresponding to the normalized x position of the texture
     */
    private mapCylindricalTexture(collidesAt : Vector2D, cyl : Circle) : number {

        let _angle = Math.ceil(this.chief.world.frame / 1) / 50;

        const direction = new Vector2D(Math.cos(_angle),Math.sin(_angle));
        const centerToPoint = Vector2D.sub(collidesAt,  cyl.center);
        const angle = Vector2D.angleBetween(centerToPoint,direction);

        return angle / (Math.PI / (cyl.radius * 2));
    }

    /**
     * @description Main method, which computes the vertices of each element within the FOV of an observer (the camera), and stores them in buffers for rendering
     * @param ray   Ray entity object
     * @param angle Ray angle at current iteration
     * @param index integer that corresponds to the iteration number
     */
    public model( ray : any, angle: number, index : number, ) : void {

        if(!this.initialized) this.init();  // Initialize buffers if not already
   
        const znear      = 1 / Math.tan(camera.FOV * Math.PI / 360);
        const deltaAngle = (camera.FOV / CONFIG.resolution) * (Math.PI / 180) * -1;

        var cache :Cache | undefined = this.cache;

        var itemID :number = -1; 

        // Current values are the values at the current iteration, depending on the properties of the element in contact with the ray

        var depth : number = 0;
        var currentX, currentY, currentT, currentL = 1;
        var currentColor;
        
        // The following arrays store a subset or all of data passed to WebGL buffers

        var lyingSurf    :any[] = [];
        var frontSurf    :any[] = [];
        var lyingElement :any[] = [];
        var frontElement :any[] = [];
        
        var cut   :boolean = false, stripped : boolean = false;
        var level :number = -1;

        // Hierarchical modelling starts from level 0 to the maximum level containing information
        // Reflections are modelled within the context of mirror surfaces, so whatever is reflected is bounded to the limits of the parent element

        while(cache){

            itemID = -1;

            if(ray && ray.collidesWith){

                itemID = ray.collidesWith.id;

                // If the surface is circular (cylindrical), it will be rendered stripe by stripe
                
                stripped = ray.collidesWith.getType() == "Circle";

                depth +=  ray.lambda * Math.cos(Math.abs(angle));

                currentY = 0.01 + znear / depth;
                currentX = Math.tan(angle - deltaAngle) * znear * ((index <= CONFIG.resolution / 2) ? -1 : 1);
                currentT = this.mapTexture(ray.collidesAt, ray.collidesWith);
                currentColor = (ray.collidesWith ?  ray.collidesWith.color + `,${ray.collidesWith.opacity}` : "0,0,0,1")
                    .split(',')
                    .map((component, i) => {  return i < 3 ? parseFloat(component) / 255 : parseFloat(component); });

            }

            // Variable "cut" indicates if the current element has been iterated completely or stripped is true, 
            // when cut is true, the current trapezium is delimited and a new adjacent one begins

            cut = cache.itemID >= 0 && (cut || (cache.itemID !== itemID || index === CONFIG.resolution - 1 || cache.stripped));

            if(cut){
                
                this.memoryIndex++; // tracks current buffer index
                
                level++;

                let { x, y , z, t, l } = cache; 
                            
                frontSurf = [
                    //          Position              |       Color      |    Texturing
                    //  x           y           z     |  r   g   b   a   | U   V
                    x[0] * z[0] , y[0] * z[0] , z[0] , ...cache.color[0], t[0],0,
                    x[1] * z[1] , y[1] * z[1] , z[1] , ...cache.color[1], t[1],0,
                    x[1] * z[1] ,-y[1] * z[1] , z[1] , ...cache.color[1], t[1],1,
                    x[0] * z[0] ,-y[0] * z[0] , z[0] , ...cache.color[0], t[0],1,
                ]
                
                .concat(frontSurf);

                frontElement = ([
                    0, 1, 2, 
                    0, 3, 2,
                ]
                .map((i) => {  return i + (this.memoryIndex - level) * 4 })
                ).concat(frontElement.map((i) => { return i + 4 }));

                lyingSurf = [
                    //  Ceiling
                    x[0] * z[0] , l[0] * z[0] ,z[0],  1,
                    x[1] * z[1] , l[1] * z[1] ,z[1],  1,
                    x[1] * z[0] , y[1] * z[0] ,z[0],  1,
                    x[0] * z[1] , y[0] * z[1] ,z[1],  1, 
                    //  Floor
                    x[0] * z[0] ,-y[0] * z[0] ,z[0], -1,
                    x[1] * z[1] ,-y[1] * z[1] ,z[1], -1,
                    x[1] * z[1] ,-l[1] * z[1] ,z[1], -1,
                    x[0] * z[0] ,-l[0] * z[0] ,z[0], -1,
                ]
                .concat(lyingSurf);    

                lyingElement = [
                    0, 1, 2, 
                    0, 3, 2,

                    4, 5, 6,
                    4, 7, 6
                ]
                .map((i) => {  return i + (this.memoryIndex - level) * 8 })
                .concat(lyingElement.map((i) => { return i + 8 }));

                // Set first edge after cut

                cache.itemID = itemID; 
                cache.color[0]  = currentColor; 
                cache.x[0] = x[1]; 
                cache.y[0] = currentY;
                cache.l[0] = currentL;
                cache.z[0] = depth;
                cache.t[0] = currentT;    // First texture edge is undefined as it depends on the next geometry the ray collides with
                cache.stripped = stripped;
            }

            // Initialize first edge when cache is untouched
            
            if(cache.itemID < 0 && ray){
                cache.itemID = itemID;
                cache.color[0] = currentColor;
                cache.color[1] = currentColor;
                cache.x[0]     = currentX;
                cache.y[0]     = currentY;
                cache.t[0]     = currentT;
                cache.l[0]     = currentL;
            } 

            // Update second edge

            cache.color[1] = currentColor;            
            cache.x[1]     = currentX;
            cache.y[1]     = currentY;
            cache.t[1]     = currentT;
            cache.l[1]     = currentL;
            cache.z[1]     = depth;
            
            ray = (ray && ray.reflected && ray.reflected.active) ? ray.reflected : null;

            // Go to next sub-element (if exists, implies an element is rendered within the context of the current one)

            currentL = currentY

            cache = cache.child;
        }

        // Update buffers

        if(!frontSurf.length) return;

        gl.bindBuffer(gl.ARRAY_BUFFER,this.frontBuffer);
        gl.bufferSubData(
            gl.ARRAY_BUFFER, 
            (this.memoryIndex - level) * 9 * 4 * Float32Array.BYTES_PER_ELEMENT, 
            new Float32Array(frontSurf)
        );

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.frontElementBuffer);
        gl.bufferSubData(
            gl.ELEMENT_ARRAY_BUFFER, 
            (this.memoryIndex - level) * 6 * Uint16Array.BYTES_PER_ELEMENT, 
            new Uint16Array(frontElement)
        );

        gl.bindBuffer(gl.ARRAY_BUFFER,this.lyingBuffer);
        gl.bufferSubData(
            gl.ARRAY_BUFFER, 
            (this.memoryIndex - level) * 8 * 4 * Float32Array.BYTES_PER_ELEMENT, 
            new Float32Array(lyingSurf)
        );

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.lyingElementBuffer);
        gl.bufferSubData(
            gl.ELEMENT_ARRAY_BUFFER, 
            (this.memoryIndex - level) * 12 * Uint16Array.BYTES_PER_ELEMENT, 
            new Uint16Array(lyingElement)
        );
    }
};  

export default DataModeller;