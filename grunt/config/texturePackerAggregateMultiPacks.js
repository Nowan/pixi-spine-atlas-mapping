const packerConfig = require("./texturePacker");
const PATH_PATTERN_TO_EXCLUDE = "src/";

module.exports = Object.keys(packerConfig).reduce((extensionConfig, target) => ({
    ...extensionConfig,
    [target]: { expand: true, src: `${target}*.json`, basePath: PATH_PATTERN_TO_EXCLUDE, filter: "isFile" }
}), {});