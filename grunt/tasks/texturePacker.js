const path = require('path');
const FILE_NAME = path.basename(__filename).replace(path.extname(__filename), "");

module.exports = function(grunt) {
    const config = grunt.config.get(FILE_NAME);

    grunt.config.set("free_tex_packer", config);
    grunt.loadNpmTasks("grunt-free-tex-packer");

    grunt.registerTask(FILE_NAME, function() {
        for (let target of Object.keys(config)) {
            grunt.task.run(`free_tex_packer:${target}`, `texturePackerAggregateMultiPacks:${target}`, `texturePackerAtlasRename:${target}`);
        }
    });
};