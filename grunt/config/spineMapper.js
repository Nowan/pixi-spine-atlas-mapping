const buildConfig = require("../../build.config.js");
const PATH_PATTERN_TO_EXCLUDE = "src/";

module.exports = buildConfig.spineMappings.reduce((spineMapperConfig, spineMapConfig) => {
    return Object.assign(spineMapperConfig, {
        [spineMapConfig.target]: {
            files: [
                {
                    expand: true, src: `${spineMapConfig.target}`, basePath: PATH_PATTERN_TO_EXCLUDE, filter: "isFile", mapEndpoint: "target"
                },
                ...Array.of(spineMapConfig.source).flat().map(sourcePath => ({
                    expand: true, src: `${sourcePath}?(-?*).atlas.json`, basePath: PATH_PATTERN_TO_EXCLUDE, filter: "isFile", mapEndpoint: "source"
                }))
            ]
        }
    });
}, {});