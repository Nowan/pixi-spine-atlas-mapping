const path = require('path');
const FILE_NAME = path.basename(__filename).replace(path.extname(__filename), "");

module.exports = function(grunt) {
    grunt.registerMultiTask(FILE_NAME, function() {
        for (let file of this.files) {
            for (let srcPath of file.src) {
                if (grunt.file.exists(srcPath)) {
                    const { path, nameWithExtension } = srcPath.match(/^(?<path>(?:.*[\\\/])+)(?<nameWithExtension>.*)$/).groups;
                    const name = nameWithExtension.split(".").shift();
                    const extension = nameWithExtension.split(".").slice(1).join(".");
                    const extensionAppendix = file.extensionAppendix;
                    
                    if (!extension.match(extensionAppendix)) {
                        const destPath = `${path}${name}.${extensionAppendix}.${extension}`;

                        switch (extension) {
                            case "json":
                                const atlasData = grunt.file.readJSON(srcPath);

                                if (atlasData.meta.image) {
                                    atlasData.meta.image = atlasData.meta.image.replace(/^(.+)\.(.+)$/, `$1.${extensionAppendix}.$2`);
                                }

                                if (atlasData.meta.related_multi_packs) {
                                    atlasData.meta.related_multi_packs = atlasData.meta.related_multi_packs.map(multiPackPath => (
                                        multiPackPath.replace(/^(.+)\.(.+)$/, `$1.${extensionAppendix}.$2`)
                                    ))
                                }

                                grunt.file.write(destPath, JSON.stringify(atlasData, null, 2));
                                grunt.file.delete(srcPath);
                                break;
                            default:
                                grunt.file.copy(srcPath, destPath);
                                grunt.file.delete(srcPath);
                                break;
                        }
                    }
                }
            }
        }
    })
};