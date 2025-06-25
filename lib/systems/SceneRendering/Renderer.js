import { gl } from "../../setup/webGL.js";
import { camera } from "../../utils/scene/Camera.js";
import canvases from "../../setup/canvases.js";
const ctx = canvases.canvas3d;
class Renderer {
    constructor(sys) {
        this.sys = sys;
        this.initialized = false;
    }
    init() {
        const locator = this.sys.locator;
        this.frontBuffer = locator.getBuffer("ARRAY_BUFFER", "frontBuffer");
        this.frontElementBuffer = locator.getBuffer("ELEMENT_ARRAY_BUFFER", "frontBuffer");
        this.lyingBuffer = locator.getBuffer("ARRAY_BUFFER", "lyingBuffer");
        this.lyingElementBuffer = locator.getBuffer("ELEMENT_ARRAY_BUFFER", "lyingBuffer");
        this.frontProgram = locator.getProgram('front');
        this.lyingProgram = locator.getProgram('lying');
        this.initialized = true;
    }
    render(amount) {
        amount++;
        if (!camera || !camera.castCenter || !camera.castEdge)
            return;
        if (!this.initialized)
            this.init();
        const a_color = gl.getAttribLocation(this.frontProgram, 'a_color');
        const a_position = gl.getAttribLocation(this.frontProgram, 'a_position');
        const a_height = gl.getAttribLocation(this.frontProgram, 'a_height');
        const a_texCoord = gl.getAttribLocation(this.frontProgram, 'a_texCoord');
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(this.lyingProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.lyingBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.lyingElementBuffer);
        gl.disableVertexAttribArray(a_color);
        gl.enableVertexAttribArray(a_position);
        gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.enableVertexAttribArray(a_height);
        gl.vertexAttribPointer(a_height, 1, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
        gl.uniform2f(gl.getUniformLocation(this.lyingProgram, 'u_resolution'), ctx.width, ctx.height);
        gl.uniform1f(gl.getUniformLocation(this.lyingProgram, 'u_time'), this.sys.__kernox.frame / 10);
        gl.uniform3f(gl.getUniformLocation(this.lyingProgram, 'u_cameraPosition'), camera.pos.x, 0, camera.pos.y);
        gl.uniform1f(gl.getUniformLocation(this.lyingProgram, 'u_cameraAngle'), camera.castCenter.direction.angle());
        gl.drawElements(gl.TRIANGLES, 3 * amount * 4, gl.UNSIGNED_SHORT, 3 * 0 * Uint16Array.BYTES_PER_ELEMENT);
        gl.disableVertexAttribArray(a_height);
        gl.useProgram(this.frontProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.frontBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.frontElementBuffer);
        gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 9 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.enableVertexAttribArray(a_color);
        gl.vertexAttribPointer(a_color, 4, gl.FLOAT, false, 9 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(a_texCoord);
        gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, 9 * Float32Array.BYTES_PER_ELEMENT, 7 * Float32Array.BYTES_PER_ELEMENT);
        gl.uniform2f(gl.getUniformLocation(this.frontProgram, 'u_resolution'), ctx.width, ctx.height);
        gl.drawElements(gl.TRIANGLES, 3 * amount * 2, gl.UNSIGNED_SHORT, 3 * 0 * Uint16Array.BYTES_PER_ELEMENT);
        gl.disableVertexAttribArray(a_texCoord);
    }
    ;
}
;
export default Renderer;
//# sourceMappingURL=Renderer.js.map