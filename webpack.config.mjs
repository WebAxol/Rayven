import { fileURLToPath } from "url";
import TerserPlugin from "terser-webpack-plugin";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
    entry   : "./lib/rayven.js",
    output  : {
        path : path.resolve(__dirname,'dist'),
        filename : 'rayven.min.js'
    },
    resolve : {
        alias : {
            "/kernox.js" : path.resolve(__dirname,'vendor/kernox.min.js')
        }
    },

    experiments: {
        outputModule: true
    },

    optimization : {
        minimize : true,
        minimizer : [new TerserPlugin() ]
    } 
};