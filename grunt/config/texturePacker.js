const buildConfig = require("../../build.config.js");
const PATH_PATTERN_TO_EXCLUDE = "src/";

module.exports = buildConfig.spritesheets.reduce((texturePackerConfig, spritesheetConfig) => {
    return Object.assign(texturePackerConfig, {
        [spritesheetConfig.target]: {
            files: Array.of(spritesheetConfig.source).flat().map(sourcePath => ({
                expand: true, src: `${sourcePath}/*`, basePath: PATH_PATTERN_TO_EXCLUDE, filter: "isFile"
            })),
            options: Object.assign({
                dest: spritesheetConfig.target.split(/[\/\\]/).slice(0, -1).join("/"),
                textureName: spritesheetConfig.target.split(/[\/\\]/).pop(),
                exporter: "Pixi",
                extensionAppendix: "atlas"
            }, spritesheetConfig.options || {})
        }
    });
}, {});