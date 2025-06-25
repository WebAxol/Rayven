import { Circle } from '../../proto/Circle.js';
import { HorizontalWall } from '../../proto/HorizontalWall.js';
import { VerticalWall } from '../../proto/VerticalWall.js';
import { Kernox, ArrayList } from '/kernox.js';

class SceneBuilder {

    constructor(
        // Dependency injection
        protected app :Kernox
    ) {}

    public build(scene){
        
        scene.forEach((element :any) => {

            if(element.type == "Wall"){

                let segment = element.info;

                let vertexA = segment[0];
                let vertexB = segment[1];
                
                if(vertexA[0] == vertexB[0] && vertexA[1] != vertexB[1]){
                    this.buildVerticalWall(vertexA,vertexB,segment[2],segment[3]);
                } 
        
                else if(vertexA[1] == vertexB[1] && vertexA[0] != vertexB[0]){
                    this.buildHorizontalWall(vertexA,vertexB,segment[2],segment[3]);
                } 
        
                else{
                    console.warn(`Invalid vertex pair given: the vertices must be different and colinear`);
                }    
            }

            else if(element.type == 'Circle'){
                this.buildCircle(...element.info);
            }
        });

        // Sort both collections

        this.app.collectionManager.get<ArrayList>("HorizontalWalls").sort((a,b) => { 
            return a.posY - b.posY 
        });
        this.app.collectionManager.get<ArrayList>("VerticalWalls").sort((a,b) => { 
            return a.posX - b.posX 
        });
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
