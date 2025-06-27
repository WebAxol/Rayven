import LocatorGL from "../utils/rendering/LocatorGL.js";
import BuilderGL from "../utils/rendering/BuilderGL.js";
import canvases from "./canvases.js";
import { rayvenConfig } from "../config.js";
import loader from "./images.js";
const canvas = canvases.canvas3d;
const gl = canvas.getContext("webgl2");
const locatorPromise = new Promise(async (resolve, reject) => {
    if (!gl)
        return reject("Failed to get rendering context");
    const _locator = new LocatorGL();
    console.log("%cPreparing WebGL...", "color: skyblue");
    console.log('\x1b[36m', "building shaders...");
    const rectangleVertexShader = await BuilderGL.buildShader(gl, "VERTEX_SHADER", rayvenConfig.shaders.vertexShader);
    const frontFragmentShader = await BuilderGL.buildShader(gl, "FRAGMENT_SHADER", rayvenConfig.shaders.frontFragmentShader);
    const lyingFragmentShader = await BuilderGL.buildShader(gl, "FRAGMENT_SHADER", rayvenConfig.shaders.lyingFragmentShader);
    console.log("\n\n");
    console.log("%c[WebGL DEBUG]: shaders' status", "color : skyblue");
    console.table({
        rectangleVertexShader,
        frontFragmentShader,
        lyingFragmentShader
    });
    if (!rectangleVertexShader || !frontFragmentShader || !lyingFragmentShader) {
        return reject("There was an error at building shaders");
    }
    console.log('\x1b[36m', "building programs...");
    const frontProgram = BuilderGL.buildProgram(gl, rectangleVertexShader, frontFragmentShader);
    const lyingProgram = BuilderGL.buildProgram(gl, rectangleVertexShader, lyingFragmentShader);
    console.log("\n\n");
    console.log("%c[WebGL DEBUG]: programs' status", "color : skyblue");
    console.table({
        frontProgram,
        lyingProgram
    });
    if (!frontProgram || !lyingProgram) {
        return reject("There was an error at building programs");
    }
    console.log('\x1b[36m', "allocating programs...");
    _locator.registerProgram("front", frontProgram);
    _locator.registerProgram("lying", lyingProgram);
    console.log('\x1b[36m', "creating buffers...");
    gl.useProgram(frontProgram);
    const frontBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, frontBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(3000 * 5 * 8), gl.DYNAMIC_DRAW);
    const frontElementBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, frontElementBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(3000 * 3 * 4), gl.DYNAMIC_DRAW);
    gl.useProgram(lyingProgram);
    const lyingBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lyingBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(3000 * 3 * 16), gl.DYNAMIC_DRAW);
    const lyingElementBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lyingElementBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(3000 * 3 * 8), gl.DYNAMIC_DRAW);
    if (!frontBuffer || !frontElementBuffer || !lyingBuffer || !lyingElementBuffer) {
        return reject("There was an error at creating buffers");
    }
    console.log('\x1b[36m', "allocating buffers...");
    _locator.registerBuffer(frontBuffer, "ARRAY_BUFFER", "frontBuffer");
    _locator.registerBuffer(frontElementBuffer, "ELEMENT_ARRAY_BUFFER", "frontBuffer");
    _locator.registerBuffer(lyingBuffer, "ARRAY_BUFFER", "lyingBuffer");
    _locator.registerBuffer(lyingElementBuffer, "ELEMENT_ARRAY_BUFFER", "lyingBuffer");
    console.log("\n\n");
    console.log("%cWebGL was prepared successfully!", "color: lawngreen; background:black");
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.ALWAYS);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    const floorTexture = gl.createTexture();
    const bricks = loader.get("bricks");
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, floorTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bricks);
    gl.uniform1i(gl.getUniformLocation(lyingProgram, "floorTexture"), 0);
    const skyTexture = gl.createTexture();
    const sky = loader.get("sky");
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, skyTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sky);
    gl.uniform1i(gl.getUniformLocation(lyingProgram, "skyTexture"), 1);
    return resolve(_locator);
});
export { gl, locatorPromise };
//# sourceMappingURL=webGL.js.map