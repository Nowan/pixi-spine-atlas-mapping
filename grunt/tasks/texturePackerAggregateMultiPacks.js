const path = require('path');
const FILE_NAME = path.basename(__filename).replace(path.extname(__filename), "");

module.exports = function(grunt) {
    const packerConfig = grunt.config.get("texturePacker");
    
    grunt.registerMultiTask(FILE_NAME, function() {
        const pages = [];

        for (let file of this.files) {
            for (let srcPath of file.src) {
                if (grunt.file.exists(srcPath)) {
                    const suffix = packerConfig[this.target].suffix || "-";
                    const multipackPartPattern = new RegExp(`^${this.target}${suffix}(?<pageIndex>\\d+)\\.json$`);

                    if (multipackPartPattern.test(srcPath)) {
                        const { pageIndex } = srcPath.match(multipackPartPattern).groups;

                        pages.push({
                            index: pageIndex,
                            path: srcPath.replace(file.basePath, "")
                        });
                    }
                }
            }
        }

        if (pages.length > 0) {
            const data = {
                meta: {
                    related_multi_packs: pages.sort((pageA, pageB) => pageA.index - pageB.index).map(page => page.path)
                }
            };
            grunt.file.write(`${this.target}.json`, JSON.stringify(data, null, 2));
        }
    })
};