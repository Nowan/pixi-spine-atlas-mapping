const loadGruntConfig = require("load-grunt-config");

module.exports = function(grunt) {
    const path = require('path');
    
    loadGruntConfig(grunt, {
        configPath: path.join(process.cwd(), "grunt/config"),
        jitGrunt: {
            customTasksDir: "grunt/tasks"
        }
    });
};