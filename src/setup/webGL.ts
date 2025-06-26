import LocatorGL from "../utils/rendering/LocatorGL.js";
import BuilderGL from "../utils/rendering/BuilderGL.js";
import canvases  from "./canvases.js";
import CONFIG from "../config.js";
import loader from "./images.js";

const canvas = canvases.canvas3d;

const gl :WebGL2RenderingContext = canvas.getContext("webgl2") as WebGL2RenderingContext;

const locatorPromise :Promise<unknown> = new Promise( async (resolve,reject) => {

    if(!gl) return reject("Failed to get rendering context");

    const _locator = new LocatorGL();

    console.log("%cPreparing WebGL...","color: skyblue");

    // Creation of shaders & program build-up

    console.log('\x1b[36m',"building shaders...");

    const rectangleVertexShader :WebGLShader | void = await BuilderGL.buildShader(gl, "VERTEX_SHADER",   "./shaders/rect.vert");
    const frontFragmentShader   :WebGLShader | void = await BuilderGL.buildShader(gl, "FRAGMENT_SHADER", "./shaders/front.frag");
    const lyingFragmentShader   :WebGLShader | void = await BuilderGL.buildShader(gl, "FRAGMENT_SHADER", "./shaders/lying.frag");

    console.log("\n\n");
    console.log("%c[WebGL DEBUG]: shaders' status","color : skyblue")
    console.table({
        rectangleVertexShader,
        frontFragmentShader,
        lyingFragmentShader
    })

    if( !rectangleVertexShader || !frontFragmentShader   || !lyingFragmentShader ){
        return reject("There was an error at building shaders");
    }

    console.log('\x1b[36m',"building programs...");

    const frontProgram :WebGLProgram | void = BuilderGL.buildProgram(gl,rectangleVertexShader,frontFragmentShader);
    const lyingProgram :WebGLProgram | void = BuilderGL.buildProgram(gl,rectangleVertexShader,lyingFragmentShader);
    
    console.log("\n\n");
    console.log("%c[WebGL DEBUG]: programs' status","color : skyblue")
    console.table({
        frontProgram,
        lyingProgram
    })

    if(!frontProgram || !lyingProgram) {  
        return reject("There was an error at building programs");
    }

    // Registration of programs at locator for later usage

    console.log('\x1b[36m',"allocating programs...");

    _locator.registerProgram("front",frontProgram);
    _locator.registerProgram("lying",lyingProgram);

    // Creation of buffers and attribute set-up

    console.log('\x1b[36m',"creating buffers...");
    
    gl.useProgram(frontProgram);

    const frontBuffer        :WebGLBuffer | null = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, frontBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(3000 * 5 * 8), gl.DYNAMIC_DRAW);

    const frontElementBuffer :WebGLBuffer | null = gl.createBuffer();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, frontElementBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(3000 * 3 * 4), gl.DYNAMIC_DRAW);

    gl.useProgram(lyingProgram);
    
    const lyingBuffer        :WebGLBuffer | null = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, lyingBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(3000 * 3 * 16), gl.DYNAMIC_DRAW);
    

    const lyingElementBuffer :WebGLBuffer | null = gl.createBuffer();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lyingElementBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(3000 * 3 * 8), gl.DYNAMIC_DRAW);
    
    if( !frontBuffer || !frontElementBuffer || !lyingBuffer || !lyingElementBuffer){        
        return reject("There was an error at creating buffers");
    }
    
    // Registration of buffers at locator for later usage

    console.log('\x1b[36m',"allocating buffers...");

    _locator.registerBuffer(frontBuffer,"ARRAY_BUFFER","frontBuffer");
    _locator.registerBuffer(frontElementBuffer,"ELEMENT_ARRAY_BUFFER", "frontBuffer");
    _locator.registerBuffer(lyingBuffer,"ARRAY_BUFFER","lyingBuffer");
    _locator.registerBuffer(lyingElementBuffer,"ELEMENT_ARRAY_BUFFER", "lyingBuffer");

    console.log("\n\n");
    console.log("%cWebGL was prepared successfully!","color: lawngreen; background:black");

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.ALWAYS);
       
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    // Textures

    const texture :WebGLTexture | null = gl.createTexture();
    const bricks   :any = loader.get("bricks");

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
        gl.UNSIGNED_BYTE, bricks
    )

    return resolve(_locator);
})

export { gl, locatorPromise };