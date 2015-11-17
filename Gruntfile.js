module.exports = function(grunt) {

    var OUT = 'Chrome\ Apps.gmx/extensions/Chrome\ App/bridge.js'

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            build: {
                src: 'js/index.js',
                dest: OUT
            }
        },
        uglify: {
            build: {
                src: OUT,
                dest: OUT
            }
        }
    });    

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['browserify','uglify']);

};