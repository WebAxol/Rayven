import { Circle } from '../../proto/Circle.js';
import { HorizontalWall } from '../../proto/HorizontalWall.js';
import { VerticalWall } from '../../proto/VerticalWall.js';
import { Kernox } from '/kernox.js';

class SceneBuilder {

    constructor(
        // Dependency injection
        protected app :Kernox
    ) {}

    public build(scene){
        
        const horizontal :HorizontalWall[] = [];
        const vertical   :VerticalWall[]   = [];
        const circles    :Circle[]         = [];

        scene.forEach((element :any) => {

            if(element.type == "Wall"){

                let segment = element.info;

                let vertexA = segment[0];
                let vertexB = segment[1];
                
                if(vertexA[0] == vertexB[0] && vertexA[1] != vertexB[1]){
                    const wall = this.buildVerticalWall(vertexA,vertexB,segment[2],segment[3]);
                    vertical.push(wall);
                } 
        
                else if(vertexA[1] == vertexB[1] && vertexA[0] != vertexB[0]){
                    const wall = this.buildHorizontalWall(vertexA,vertexB,segment[2],segment[3]);
                    horizontal.push(wall);
                } 
        
                else{
                    console.warn(`Invalid vertex pair given: the vertices must be different and colinear`);
                }    
            }

            else if(element.type == 'Circle'){
                const circle = this.buildCircle(...element.info);
                circles.push(circle);
            }
        });


        horizontal.sort((a : any, b : any ) => {return a.posY - b.posY});
        vertical.sort(  (a : any, b : any ) => {return a.posX - b.posX});

        // Add geometry to their respective collections

        horizontal.forEach(wall => { this.app.collectionManager.addEntityTo(wall,'HorizontalWalls') });
        vertical.forEach(  wall => { this.app.collectionManager.addEntityTo(wall,'VerticalWalls') });
        circles.forEach( circle => { this.app.collectionManager.addEntityTo(circle,'Circles')});

    }

    private  buildHorizontalWall(vertexA,vertexB,opacity,color){

        return this.app.entityFactory.create<HorizontalWall>('HorizontalWall',{
            startX : Math.min(vertexA[0],vertexB[0]),
            endX   : Math.max(vertexA[0],vertexB[0]),
            posY   : vertexA[1],
            opacity: opacity || 1,
            color  : color || 'white' 
        });
    };

    private buildVerticalWall(vertexA,vertexB,opacity,color){

        return this.app.entityFactory.create<VerticalWall>('VerticalWall',{
            startY  : Math.min(vertexA[1],vertexB[1]),
            endY    : Math.max(vertexA[1],vertexB[1]),
            posX    : vertexA[0],
            opacity : opacity || 1,
            color  : color || 'white' 
        });
    };

    private buildCircle(...args){

        return this.app.entityFactory.create<Circle>('Circle',{
            radius : args[1],
            center : args[0],
            opacity: args[2],
            color  : args[3]
        });
    }
}
export default SceneBuilder;
