"use strict";

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks

  grunt.initConfig({
    sass: {
      options: {
        sourceMap: true
      },
      dist: {
        files: {
          'app/css/style.css': 'app/sass/style.scss'
        }
      }
    }
  });

  grunt.registerTask('default', ['sass']);
};
