import { KernoAddon, Kernox }     from  '/kernox.js';
import { prototypes }     from './setup/prototypes.js';
import { collections }    from './setup/collections.js';
import { systems }        from './setup/systems.js';

export const rayven : KernoAddon = {
    name : "rayven",
    prototypes,
    collections,
    systems
};

export { prototypes, collections, systems };