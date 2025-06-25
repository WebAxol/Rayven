import RayCaster         from "../../../systems/SceneRendering/RayCaster.js";
import CollisionDetector from "../../../utils/physics/CollisionDetector.js";
import Vector2D          from "../../../utils/physics/Vector2D.js";

describe("reflect method", () => {

    it("must be a defined public method that receives one parameter", () => {

        const method = RayCaster.prototype.reflect;
        expect(method).toBeTruthy();
        expect(method.length).toBe(1);
    });
});


const testHorizontalWall = () => {
    return { getType : () => { return "HorizontalWall" }};
};

const testVerticalWall = () => {
    return { getType : () => { return "VerticalWall"  }};
};

const testCircle = (x :number ,y :number ,radius :number ) => {
    return {
        getType : () => { return "Circle"  },
        center: new Vector2D(x,y),
        radius: radius 
    };
};

const baseRay =  {        
    source       : new Vector2D(NaN,NaN),
    collidesAt   : new Vector2D(NaN,NaN),
    reflected    : null,
}

const testCases = [

    // Cases involving horizontal walls (Flat mirrors parallel to the x-axis)

    {
        ray : Object.assign({     
            direction    : Vector2D.normalize(new Vector2D(1,2)),
            collidesWith : testHorizontalWall(), 
        },baseRay),
        res: {
            direction    : Vector2D.normalize(new Vector2D(1,-2)),
        }
    },
    {
        ray : Object.assign({     
            direction    : Vector2D.normalize(new Vector2D(-1.53,290)),
            collidesWith : testHorizontalWall(), 
        },baseRay),
        res: {
            direction    : Vector2D.normalize(new Vector2D(-1.53,-290)),
        }
    },
    {
        ray : Object.assign({     
            direction    : Vector2D.normalize(new Vector2D(30, 0)),
            collidesWith : testHorizontalWall(), 
        },baseRay),
        res: {
            direction    : Vector2D.normalize(new Vector2D(30,-0)),
        }
    },

    // Cases involving vertical walls (Flat mirrors parallel to the y-axis)

    {
        ray : Object.assign({     
            direction    : Vector2D.normalize(new Vector2D(-7.53,10)),
            collidesWith : testVerticalWall(), 
        },baseRay),
        res: {
            direction    : Vector2D.normalize(new Vector2D(7.53,10)),
        }
    },
    {
        ray : Object.assign({     
            direction    : Vector2D.normalize(new Vector2D(100.244,-0.345)),
            collidesWith : testVerticalWall(), 
        },baseRay),
        res: {
            direction    : Vector2D.normalize(new Vector2D(-100.244,-0.345)),
        }
    },
    {
        ray : Object.assign({     
            direction    : Vector2D.normalize(new Vector2D(0,-0.345)),
            collidesWith : testVerticalWall(), 
        },baseRay),
        res: {
            direction    : Vector2D.normalize(new Vector2D(-0,-0.345)),
        }
    },

    // Cases involving circles ( Cylindrical mirrors )

    {
        ray : {     
            direction    : Vector2D.normalize(new Vector2D(2,-1)),
            source       : new Vector2D(0,0),
            collidesAt   : new Vector2D(2,-1),
            collidesWith : testCircle(3,-3,2.236067), 
            reflected    : null,
        },
        res: {
            direction    : Vector2D.normalize(new Vector2D(1,5.50)),
        }
    },
    {
        ray : {     
            direction    : Vector2D.normalize(new Vector2D(-1,-5.5)),
            source       : new Vector2D(2.4,1.2),
            collidesAt   : new Vector2D(2,-1),
            collidesWith : testCircle(3,-3,2.236067), 
            reflected    : null,
        },
        res: {
            direction    : Vector2D.normalize(new Vector2D(-1,0.5)),
        }
    },
    {
        ray : {     
            direction    : Vector2D.normalize(new Vector2D(-3,2)),
            source       : new Vector2D(10,1),
            collidesAt   : new Vector2D(7,3),
            collidesWith : testCircle(6,2,1.414213), 
            reflected    : null,
        },
        res: {
            direction    : Vector2D.normalize(new Vector2D(-1,1.5)),
        }
    },

    // TODO : reparar espejos cilindricos - es tan bien pinches jodidos
    
    /*
    {
        ray : {     
            direction    : Vector2D.normalize(new Vector2D(1,0.37818)),
            source       : new Vector2D(2,-2),
            collidesAt   : new Vector2D(5.0513,-0.846),
            collidesWith : testCircle(6,2,3), 
            reflected    : null,
        },
        res: {
            direction    : Vector2D.normalize(new Vector2D(1,-1.57481)),
        }
    }
    */
];

test("reflection on different surface types", () => {

    const mockChief = { 
        world : { 
            createAgent : jest.fn().mockImplementation((type) => {
                return {
                    "Ray" : {}
                }[type];
            }) 
        }
    };

    const raycaster = new RayCaster(mockChief);

    var ray, res, diff;

    const func = () => { return raycaster.reflect(ray) };

    testCases.forEach((testCase : any) => {

        ray = testCase.ray;
        res = testCase.res;

        const tolerance = 0.01;
        
        expect(func).not.toThrow(Error);


        diff = Vector2D.sub(res.direction, ray.reflected.direction);

        expect(Math.abs(diff.x)).toBeLessThan(tolerance);
        expect(Math.abs(diff.y)).toBeLessThan(tolerance);

    });
});