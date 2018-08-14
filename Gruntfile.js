module.exports = function(grunt) {

	"use strict";

	var pkg = grunt.file.readJSON( "package.json" );

	grunt.initConfig({
		pkg: pkg,
		jshint: {
			source: {
				src: [ "src/**/*.js", "!src/build/**" ],
				options: {
					jshintrc: "src/.jshintrc"
				}
			},
			grunt: {
				src: [ "Gruntfile.js" ],
				options: {
					jshintrc: ".jshintrc"
				}
			},
			metafiles: {
				src: [ "package.json" ],
				options: {
					jshintrc: ".jshintrc"
				}
			},
			test: {
				src: [ "test/**/*.js" ],
				options: {
					jshintrc: "test/.jshintrc"
				}
			}
		},
		dco: {
			current: {
				options: {
					exceptionalAuthors: {
						"rxaviers@gmail.com": "Rafael Xavier de Souza"
					}
				}
			}
		},
		compare_size: {
			files: [
				"dist/cldr.js",
				"dist/cldr/*.js"
			],
			options: {
				compress: {
					gz: function( fileContents ) {
						return require( "gzip-js" ).zip( fileContents, {} ).length;
					}
				}
			}
		},
		run: {
			test_unit: {
				exec: "npm run test:unit"
			},
			test_functional: {
				exec: "npm run test:functional"
			},
			build_dist: {
				exec: "npm run build:dist"
			},
			build_esm: {
				exec: "npm run build:esm"
			}
		}
	});

	Object
		.keys(pkg.devDependencies)
		.filter(function(dep) { return dep.indexOf("grunt-") === 0; })
		.forEach(grunt.loadNpmTasks);

	grunt.registerTask( "default", [
		"jshint:metafiles",
		"jshint:grunt",
		"jshint:source",
		"jshint:test",
		"run:test_unit",
		"run:build_dist",
		"run:build_esm",
		"run:test_functional",
		"compare_size",
		"dco"
	]);

};

