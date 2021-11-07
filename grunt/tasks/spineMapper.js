const path = require('path');
const FILE_NAME = path.basename(__filename).replace(path.extname(__filename), "");

module.exports = function(grunt) {
    grunt.registerMultiTask(FILE_NAME, "Grunt spine mapper", function() {
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
                        if (atlas.data.meta.related_multi_packs) continue;

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
}