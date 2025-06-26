import CameraMover from "../systems/Camera/CameraMover.js";
import InputHandler from "../systems/Camera/InputHandler.js";
import RenderingPipeline from "../systems/SceneRendering/Orchestrator.js";
import SceneRenderer2D from "../systems/2DRendering/SceneRenderer2D.js";
export const systems = [
    SceneRenderer2D,
    RenderingPipeline,
    CameraMover,
    InputHandler
];
//# sourceMappingURL=systems.js.map