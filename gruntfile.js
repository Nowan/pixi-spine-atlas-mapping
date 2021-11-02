const buildConfig = require("./build.config.js");
const texturePacker = require("free-tex-packer-core");
const appInfo = require("./package.json");

const DESTINATION_PATH = "src/assets/spritesheets";
const PATH_PATTERN_TO_EXCLUDE = "src/";
const spineLookupPattern = `${"sourcePath"}(?:-\\d+)?\\.json|png|jpg|jpeg$`;

module.exports = function(grunt) {
    const config = {
        free_tex_packer: buildConfig.spritesheets.reduce((texturePackerConfig, spritesheetConfig) => {
            return Object.assign(texturePackerConfig, {
                [spritesheetConfig.target]: {
                    files: Array.of(spritesheetConfig.source).flat().map(sourcePath => ({
                        expand: true, src: `${sourcePath}/*`, basePath: PATH_PATTERN_TO_EXCLUDE, filter: "isFile"
                    })),
                    options: Object.assign({
                        dest: spritesheetConfig.target.split(/[\/\\]/).slice(0, -1).join("/"),
                        textureName: spritesheetConfig.target.split(/[\/\\]/).pop(),
                        exporter: "Pixi"
                    }, spritesheetConfig.options || {})
                }
            });
        }, {}),
        spineAttachmentsToAtlasesMapper: buildConfig.spineMappings.reduce((spineMapperConfig, spineMapConfig) => {
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
        }, {})
    };

    grunt.initConfig(config);

    grunt.registerMultiTask("free_tex_packer", 'Grunt free texture packer', function() {
        let done = this.async();
        let options = this.options();
        let dest = options.dest || '';
        
        options.appInfo = appInfo;
        
        let images = [];
        
        this.files.forEach((f) => {
            f.src.filter((filepath) => {
                if(grunt.file.exists(filepath)) {
                    let imagePath = filepath;
                    if  (f.basePath && imagePath.substr(0, f.basePath.length) === f.basePath) {
                        imagePath = imagePath.substr(f.basePath.length);
                    }
                    
                    // TODO: generate mapping file for texture atlas for later use in spine metadata remapping
                    images.push({path: imagePath, contents: grunt.file.read(filepath, {encoding: null})});
                }
            });
        });
        
        texturePacker(images, options, (files) => {
            for(let item of files) {
                const itemNameGroups = item.name.match(/^(?<path>.*)\.(?<extension>.+)$/).groups;
                if (itemNameGroups.extension === "json") {
                    const data = JSON.parse(item.buffer.toString());
                    data.meta.image = data.meta.image.replace(/^(.*)\.(.*)$/, "$1.atlas.$2")
                    item.buffer = JSON.stringify(data, null, 2);
                }
                grunt.file.write(`${dest}/${itemNameGroups.path}.atlas.${itemNameGroups.extension}`, item.buffer);
			}
            
            done();
		});
    });

    grunt.registerMultiTask("spineAttachmentsToAtlasesMapper", 'Grunt spine mapper', function() {
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
    
    grunt.registerTask("pack", ["free_tex_packer"]);
    grunt.registerTask("map", ["spineAttachmentsToAtlasesMapper"]);
};