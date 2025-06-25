import RayCaster         from "../../../systems/SceneRendering/RayCaster.js";
import CollisionDetector from "../../../utils/physics/CollisionDetector.js";
import Vector2D          from "../../../utils/physics/Vector2D.js";
import { Ray }           from "../../../proto/Ray.js";

/* 
    TODO : Fix inefficient index update when ray doesn't hit a wall of a type
    CASE : 
        Let us start with a vertical index of -1 and move positively at the x-axis. We would 
*/
describe("castRay method", () => {

    it("must be a defined public method that receives two parameters", () => {

        const method = RayCaster.prototype.castRay;
        expect(method).toBeTruthy();
        expect(method.length).toBe(2);
    });
});

const testRay = (x,y,hx,hy) => {
    return {
        level: 1,
        source      : new Vector2D(x,y),
        direction   : Vector2D.normalize(new Vector2D(hx,hy))
    };
};

const testHorizontalWall = (xi,xf,y, opacity = 0.5) => {
    return {
        startX : xi,
        endX   : xf,
        posY   : y,
        opacity: opacity,
        getType: () => { return 'HorizontalWall' }
    };
};

const testVerticalWall = (yi,yf,x, opacity = 0.5) => {
    return {
        startY : yi,
        endY   : yf,
        posX   : x,
        opacity: opacity,
        getType: () => { return 'VerticalWall' }
    };
};

const testCases = [
    {
        verticalWalls   : [
            testVerticalWall(0,0.5,-1),
            testVerticalWall(-1,-0.5,-1),
            testVerticalWall(-0.5,0.5,1),
            testVerticalWall(-1,1,1.5),            
            testVerticalWall(-1.5,-0.5,2), 
        ],
        horizontalWalls : [
            testHorizontalWall(0,1.5,-1.5),
            testHorizontalWall(-1.5,0,-1.5),
            testHorizontalWall(-1,-0.5,-1),
            testHorizontalWall(-1.5,1.5,1),
        ],
        rays: [
            testRay(-1.5,-1,2,-1),
            testRay(0,0.5,-1,-2),
            testRay(-2,0.5,5,-3)
        ],

        indicesPerRay : [
            { horizontal : 1, vertical: -1 },
            { horizontal : 2, vertical:  1 },
            { horizontal : 2, vertical:  -1 }
        ],

        expectedPerRay: [
            { 
                source: { x : -1.5, y : -1 },
                collidesAt : { x : -0.5, y : -1.5 }, 
                reflected  : {
                    source     : { x : -0.5, y : -1.5 },
                    collidesAt : { x : 1.5, y : -0.5 },
                    reflected: {
                        source     : { x : 1.5, y : -0.5 },
                        collidesAt : { x : 1, y : -0.25 }
                    }
                }
            },
            {
                collidesAt: { x : -0.75, y : -1 },
                reflected: {
                    source: { x : -0.75, y : -1 },
                    collidesAt: { x : -1, y : -0.5 },
                    reflected : {
                        source: { x : -1, y : -0.5 },
                        collidesAt: { x : -0.25, y : 1 },
                        reflected: {
                            source: { x : -0.25, y : 1 },
                        }
                    }
                }
            },
            {
                collidesAt: { x : 1.33333333, y : -1.5 },
                source : { x : -2, y : 0.5 },
                reflected : {
                    source: { x : 1.33333333, y : -1.5 },
                    collidesAt: { x : 2, y : -1.1 }
                }
            }
        ]
    },
    {
        verticalWalls: [
            testVerticalWall(0.2,0.6,0),
            testVerticalWall(0.2,0.4,0.4),  
            testVerticalWall(0,0.2,0.6),  
            testVerticalWall(-0.8,-0.4,0.8),
        ],
        horizontalWalls: [
            testHorizontalWall(0,0.4,-0.2)
        ],
        rays: [
            testRay(-0.8,0.4,3,-2)
        ],
        indicesPerRay: [
            { horizontal : 0, vertical: -1 }, 
        ],
        expectedPerRay: [
            {
                source: { x : -0.8, y : 0.4 },
                collidesAt: { x : 0.1, y : -0.2 },
                reflected: {
                    source: { x : 0.1, y : -0.2 },
                    collidesAt: { x : 0.6, y : 0.13333333 },
                    reflected: {
                        source: { x : 0.6, y : 0.13333333 },
                        collidesAt: { x : 0.4, y : 0.266666666 },
                    }
                }
            }
        ]
    }
];

const getDifference    = (v1 :Vector2D,v2 :Vector2D) => { return Vector2D.dot(Vector2D.abs(Vector2D.sub(v1,v2)),{x : 1, y : 1}) };

const evaluateRayState = (ray :Ray | undefined, expected) => {

    if(!ray) throw Error("Unexpected ray");
    
    for(let attrib in expected){

        if(attrib == 'reflected') evaluateRayState(ray.reflected, expected.reflected);
    
        else 
            if (getDifference(ray[attrib], expected[attrib]) > 0.000001){ 

                console.error("received",ray[attrib]);
                console.error("expected",expected[attrib]);

                throw Error(`Unmatching attribute ${attrib}: ${ray[attrib]} does not match ${expected[attrib]}`);  
            }
    }
};

testCases.forEach((case_ : any, index : number) => {

    var raycaster, ray, indices, expected;

    const func = () => { 

        raycaster.castRay(ray,indices) 
        evaluateRayState(ray,expected)
    };

    const mockChief = { 
        world : { 
            getCollection : jest.fn().mockImplementation((name) => {
                return {
                    "VerticalWalls"   : case_.verticalWalls,
                    "HorizontalWalls" : case_.horizontalWalls,
                    "Circles"         : []
                }[name];
            }),
            createAgent : jest.fn().mockImplementation((type) => {
                return {
                    "Ray" : testRay(NaN,NaN,NaN,NaN)
                }[type];
            }) 
        }
    };

    raycaster = new RayCaster(mockChief);

    const n = case_.rays.length;

    for(let i = 0; i < n; i++){

        test(`ray '${i}' of scene ${index}`, () => {

            ray      = case_.rays[i];
            indices  = case_.indicesPerRay[i];
            expected = case_.expectedPerRay[i];

            expect(func).not.toThrow();

        });
    }
});