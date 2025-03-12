
const path = require("path")

module.exports = {
    watch: true,
    devtool: "inline-source-map",
    entry: "./src/index.ts",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: [".ts", ".tsx", ".js"],
    },
    module: {
        rules: [
            // all files with a `.ts`, `.cts`, `.mts` or `.tsx` extension will be handled by `ts-loader`
            {
                test: /\.([cm]?ts|tsx)$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            }
        ]
    },
};