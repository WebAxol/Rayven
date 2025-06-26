import { Kernox } from '/kernox.js';
import { rayven } from '../rayven.js';
import { camera } from '../utils/scene/Camera.js';
import SceneBuilder from '../utils/scene/SceneBuilder.js';
import { rayvenConfig } from '../config.js';

const app : Kernox = new Kernox();

rayvenConfig.resolution = 600;

app.use(rayven);

camera.init(app,{
    x : 22,
    y:  17,
    dx: -1,
    dy: -2,
    fov : 100.1
});

// Define and create scene

const scene = [
   
    { type:'Wall', info:[[-1e10,-1e10],[-1e10,1e10],1, '255,0,0']},
    { type:'Wall', info:[[-1e10,-1e10],[1e10,-1e10],1, '255,0,0']},
    { type:'Wall', info:[[1e10,-1e10],[1e10,1e10],1, '255,0,0'  ]},
    { type:'Wall', info:[[1e10,1e10],[-1e10,1e10],1, '255,0,0'  ]},
    { type:'Wall', info:[[2,2],[4,2],   1, '255,0,0'            ]},
    { type:'Wall', info:[[2,2],[2,4],   1, '0,255,0'            ]},
    { type:'Wall', info:[[5,5],[5,25],   1, '255,255,0'         ]},
    { type:'Wall', info:[[10,5],[10,-20],   1, '0,255,0'        ]},
    { type:'Wall', info:[[12,5],[12,-20],   1, '255,0,0'        ]},
    { type:'Wall', info:[[5, -24],[5, -25], 1, '255,0,100'      ]},
    { type:'Wall', info:[[5, -21],[5, -20], 1, '0,255,100'      ]},    
    { type:'Wall', info:[[5, -21],[-20, -21], 1, '0,255,0'      ]},    
    { type:'Wall', info:[[5, -24],[-20, -24], 1, '255,0,100'    ]},    
    { type:'Wall', info:[[5, -20],[10, -20], 1, '0,255,100'     ]},
    { type:'Wall', info:[[12, -20],[25, -20], 1, '0,255,100'    ]},
    { type:'Wall', info:[[5,-25],[35,-25], 1, '255,157,0'       ]},
    { type:'Wall', info:[[25,-20],[25,-25], 1, '255,157,0'      ]},
    { type:'Wall', info:[[-25,-20],[-25,-25], 1, '255,157,0'    ]},
    { type:'Wall', info:[[5, 5],[10, 5], 1, '0,255,100'         ]},
    { type:'Wall', info:[[12, 5],[25, 5], 1, '0,255,100'        ]},
    { type:'Wall', info:[[5, 7],[7, 7],  1, '0,255,100'         ]},
    { type:'Wall', info:[[7, 5],[7, 7],  1, '37, 190, 42'       ]},
    { type:'Wall', info:[[7, 13],[7, 20],  0.9, '0,155,200'     ]},
    { type:'Wall', info:[[15, 15],[15, 14],  1, '0,100,100'     ]},
    { type:'Wall', info:[[7, 20],[15, 20],  0.3, '255,46,87'    ]},
    { type:'Wall', info:[[7, 15],[15, 15],  0.3, '0,100,100'    ]},
    { type:'Wall', info:[[7, 14],[15, 14],  1, '0,100,100'      ]},
    { type:'Wall', info:[[15, 19],[15, 20],  1, '255,46,87'     ]},
    { type:'Wall', info:[[25,5],[25,25], 1, '150,150,150'       ]},
    { type:'Wall', info:[[5,25],[25,25], 1, '255,255,255'       ]},
    { type:'Wall', info:[[15,7],[17,7], 1, '255,0,255'          ]},
    { type:'Wall', info:[[15,7],[15,10], 1, '255,155,255'       ]},
    { type:'Wall', info:[[15,10],[15.5,10], 1, '255,155,200'    ]},
    { type:'Wall', info:[[17,7],[17,10],1, '255,155,255'        ]},
    { type:'Wall', info:[[16.5,7],[16.5,10],0.1, '255,0,255'    ]},
    { type:'Wall', info:[[16.5,10],[17,10],1, '255,155,200'     ]},
    
    { type:'Wall', info:[[19, 12],[22, 12], 0.5, '0,255,100'   ]},
    { type:'Wall', info:[[19, 15],[22, 15], 0.5, '0,255,100'   ]},
    { type:'Wall', info:[[22, 12],[22, 15], 0.5, '255,157,0'   ]},
    { type:'Wall', info:[[19, 12],[19, 15], 0.5, '255,157,0'   ]},  

    { type : 'Circle', info:[camera.pos        ,0.3,1,'255,0,0' ]},
    { type : 'Circle', info:[{ x : 17, y : 17 },1.0,1,'0, 0, 0' ]}, 
    ];

const sceneBuilder = new SceneBuilder(app);

sceneBuilder.build(scene);

/* ------ Debugging commands (Not for production) ------- */

const commands = {
    'o' : () => { console.log(app) },
    'c' : () => { console.log(camera)},
    'p' : () => { 
        //app.paused; 
        console.log('execution paused');
    },
    'r' : () => {
        //app.pause = false;
        app.execute();
        console.log('execution resumed');
    }   
}

window.addEventListener('keydown', (e) => {

    if(commands[e.key]) commands[e.key]();
});

// execute

console.log(app);

app.execute();