const path = require('path');
const FILE_NAME = path.basename(__filename).replace(path.extname(__filename), "");

module.exports = function(grunt) {
    grunt.config.set(FILE_NAME, grunt.config.get("texturePackerAtlasRename"));

    grunt.registerMultiTask(FILE_NAME, function() {
        for (let file of this.files) {
            for (let srcPath of file.src) {
                if (grunt.file.exists(srcPath)) {
                    grunt.file.delete(srcPath);
                }
            }
        }
    });
}