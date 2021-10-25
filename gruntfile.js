const buildConfig = require("./build.config.js");
const texturePacker = require("free-tex-packer-core");
const appInfo = require("./package.json");

const DESTINATION_PATH = "src/assets/spritesheets";
const PATH_PATTERN_TO_EXCLUDE = "src/";

module.exports = function(grunt) {
    grunt.initConfig({
        free_tex_packer: buildConfig.spritesheets.reduce((config, spritesheetConfig) => {
            return Object.assign(config, {
                [spritesheetConfig.target]: {
                    files: Array.of(spritesheetConfig.source).flat().map(sourcePath => ({
                        expand: true, src: `${sourcePath}/*`, basePath: PATH_PATTERN_TO_EXCLUDE, filter: "isFile"
                    })),
                    options: Object.assign({
                        dest: DESTINATION_PATH,
                        textureName: spritesheetConfig.target,
                        exporter: "Pixi"
                    }, spritesheetConfig.options || {})
                }
            });
        }, {})
    });

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
                    if(f.basePath && imagePath.substr(0, f.basePath.length) === f.basePath) {
                        imagePath = imagePath.substr(f.basePath.length);
                    }
                    
                    // TODO: generate mapping file for texture atlas for later use in spine metadata remapping
                    images.push({path: imagePath, contents: grunt.file.read(filepath, {encoding: null})});
                }
            });
        });
        
        texturePacker(images, options, (files) => {
            for(let item of files) {
                grunt.file.write(dest + '/' + item.name, item.buffer);
			}
            
            done();
		});
    });
    
    grunt.registerTask('packAndMap', ["free_tex_packer"]);
};