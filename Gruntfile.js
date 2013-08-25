var lessmonitor  = require('less-monitor');


module.exports = function(grunt) {
	'use strict';
	var log = grunt.log.writeln;

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		less: {
			'default': '',
			'build': ''
		},
		copy: {
			main: {
				files: [
					{
						expand: true,
						src: [
							'./**',
							'./.htaccess', // needs to be explicitly included

							// Excludes:
							'!./node_modules/**',
							'!./*.komodoproject',
							'!./Gruntfile.js',
							'!./package.json'
						],
						dest: '../deploy/'
					}
				]
			}
		},
		uglify: {
			options:   {
				mangle: false
			},
			minifyDeployment: {
				files: {
					'../deploy/js/main.js': ['js/main.js']
				}
			}
		},
		cssmin: {
			minify: {
				expand: true,
				cwd:    'css/',
				src:    ['*.css'],
				dest:   '../deploy/css/',
				ext:    '.css'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	grunt.registerTask('default', ['less']);

	grunt.registerMultiTask('less', 'Build the Less Files in to CSS files', function() {

		var done = this.async();
		var config = {
			'options': {
			}
		};

		//default parsing options
		var options = {
			directory: 'less/',
			output: '../css/', //based on the dir where less files are parsed from
			options: true,
			master: true,
			force: true,
			debug: true,
			debugType: 'comment',
			optimization:2,
			compress: false
		};

		lessmonitor.cli( lessmonitor.app );
		taskName('Less');

		if (this.target === 'build-only' || this.target === 'build') {
			lessmonitor.app.on('parseCompleteAll', function( filesMap, options) {
				log('\nAll files parsed and saved.'.cyan );
				log('\nBuild Complete - Exiting');

				process.removeAllListeners('exit');
				done();
			});
		}

		lessmonitor.app.init( options );
	});


	grunt.registerTask('deploy', 'Generates all the things and copies everything to a deploy folder', function() {

		taskName('Deployment');



		// First do a build of the Less files so we're sure
		// the deployment folder has the latest build.
		grunt.task.run('less:build');

		// Copy files to deployment dir
		grunt.task.run('copy');

		// Minify JS
		grunt.task.run('uglify');

		// Minify CSS
		grunt.task.run('cssmin');

	});

	function taskName(name) {
		log(' -----------------------------'.yellow.bold);
		log(('  Task:  '+name).yellow.bold);
		log(' -----------------------------'.yellow.bold);
	}
};
