const rawBuildConfig = require("./build.config.js");
const buildConfig = require("./grunt/BuildConfigParser").parse(rawBuildConfig);

module.exports = function(grunt) {
    grunt.initConfig({
        spineMapper: buildConfig.spineMapper,
        texturePacker: buildConfig.texturePacker
    });

    grunt.registerMultiTask("spineMapper", 'Grunt spine mapper', function() {
        const mapData = {};
        let spine = null;
        const atlases = [];

        this.files.forEach((f) => {
            f.src.forEach(filePath => {
                if (grunt.file.exists(filePath)) {
                    const fileContents = grunt.file.read(filePath, {encoding: null});
                    const data = JSON.parse(fileContents.toString());

                    switch(f.mapEndpoint) {
                        case "target":
                            spine = { data, path: filePath };
                            break;
                        case "source":
                            if  (f.basePath && filePath.substr(0, f.basePath.length) === f.basePath) {
                                filePath = filePath.substr(f.basePath.length);
                            }

                            atlases.push({ data, path: filePath })
                            break;
                    }
                }
            });
        });

        for (let skinData of spine.data.skins) {
            for (let attachmentsData of Object.values(skinData.attachments)) {
                for (let attachmentPath of Object.keys(attachmentsData)) {
                    for (let atlas of atlases) {
                        const framesTexturesPaths = Object.keys(atlas.data.frames);
                        const matchingFrameTexturePath = framesTexturesPaths.find(frameTexturePath => frameTexturePath.match(attachmentPath));
        
                        if (matchingFrameTexturePath) {
                            if (mapData[attachmentPath]) {
                                console.warn(`Texture shadowing detected for attachment "${attachmentPath}"`)
                            }
                            else {
                                mapData[attachmentPath] = {
                                    atlas: atlas.path,
                                    frame: matchingFrameTexturePath
                                }
                            }
                        }
                    }
                }
            }
        }

        const dest = spine.path.replace(".spine.json", ".spine.map.json");
        grunt.file.write(dest, JSON.stringify(mapData, null, 2));
    });

    grunt.config.set("free_tex_packer", grunt.config.get("texturePacker"));
    grunt.config.set("free_tex_packer_append_extension", extensionAppenderConfig(grunt.config.get("texturePacker")));

    grunt.loadNpmTasks("grunt-free-tex-packer");

    grunt.registerMultiTask("free_tex_packer_append_extension", function() {
        for (let file of this.files) {
            for (let srcPath of file.src) {
                if (grunt.file.exists(srcPath)) {
                    const { path, nameWithExtension } = srcPath.match(/^(?<path>(?:.*[\\\/])+)(?<nameWithExtension>.*)$/).groups;
                    const name = nameWithExtension.split(".").shift();
                    const extension = nameWithExtension.split(".").slice(1).join(".");
                    const extensionAppendix = file.extensionAppendix;

                    if (!extension.match(extensionAppendix)) {
                        const destPath = `${path}${name}.${extensionAppendix}.${extension}`;

                        grunt.file.copy(srcPath, destPath);
                        grunt.file.delete(srcPath);
                    }
                
                }
            }
        }
    })

    grunt.registerTask("texturePacker", function() {
        for (let target of Object.keys(grunt.config.get("texturePacker"))) {
            grunt.task.run(`free_tex_packer:${target}`, `free_tex_packer_append_extension:${target}`);
        }
    });
};

function extensionAppenderConfig(rawBuildConfig) {
    return Object.entries(rawBuildConfig).reduce((extensionConfig, [target, targetConfig]) => ({
        ...extensionConfig,
        [target]: { expand: true, src: `${target}.*`, filter: "isFile", extensionAppendix: targetConfig.options.extensionAppendix }
    }), {})
}