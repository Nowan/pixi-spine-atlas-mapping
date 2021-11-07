const packerConfig = require("./texturePacker");

module.exports = Object.entries(packerConfig).reduce((extensionConfig, [target, targetConfig]) => ({
    ...extensionConfig,
    [target]: { expand: true, src: `${target}*`, filter: "isFile", extensionAppendix: targetConfig.options.extensionAppendix }
}), {});