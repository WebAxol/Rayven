import LocatorGL          from "../../utils/rendering/LocatorGL.js";
import { locatorPromise } from "../../setup/webGL.js";

describe("locatorPromise", () => {
    it("must resolve returning an instance of LocatorGL", () => {
        expect(locatorPromise).resolves.toBeInstanceOf(LocatorGL);
    });

});
