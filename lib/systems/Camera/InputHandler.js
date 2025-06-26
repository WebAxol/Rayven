import { System } from "/kernox.js";
class InputHandler extends System {
    init() {
        window.addEventListener('keydown', (e) => { this.keydown(e); });
        window.addEventListener('keyup', (e) => { this.keyup(e); });
        return true;
    }
    keydown(e) {
        if (!this.__kernox.paused)
            this.dispatchEvent('keydown', { key: e.key });
    }
    keyup(e) {
        if (!this.__kernox.paused)
            this.dispatchEvent('keyup', { key: e.key });
    }
}
export default InputHandler;
//# sourceMappingURL=InputHandler.js.map