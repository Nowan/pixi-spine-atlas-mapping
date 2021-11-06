const PATH_PATTERN_TO_EXCLUDE = "src/";

module.exports = class BuildConfigParser {
    static parse(rawBuildConfig) {
        return {
            texturePacker: _parseTexturePackerConfiguration(rawBuildConfig),
            spineMapper: _parseSpineMapperConfiguration(rawBuildConfig)
        };
    }
}

function _parseTexturePackerConfiguration(rawBuildConfig) {
    return rawBuildConfig.spritesheets.reduce((texturePackerConfig, spritesheetConfig) => {
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
}

function _parseSpineMapperConfiguration(rawBuildConfig) {
    return rawBuildConfig.spineMappings.reduce((spineMapperConfig, spineMapConfig) => {
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
}