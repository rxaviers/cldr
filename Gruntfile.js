module.exports = function(grunt) {

	"use strict";

	var pkg = grunt.file.readJSON( "package.json" );

	grunt.initConfig({
		pkg: pkg,
		dco: {
			current: {
				options: {
					exceptionalAuthors: {
						"rxaviers@gmail.com": "Rafael Xavier de Souza"
					}
				}
			}
		},
		run: {
			lint: {
				exec: "npm run lint"
			},
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
			},
			compare_size: {
				exec: "npm run compare_size"
			}
		}
	});

	Object
		.keys(pkg.devDependencies)
		.filter(function(dep) { return dep.indexOf("grunt-") === 0; })
		.forEach(grunt.loadNpmTasks);

	grunt.registerTask( "default", [
		"run:lint",
		"run:test_unit",
		"run:build_dist",
		"run:build_esm",
		"run:test_functional",
		"run:compare_size",
		"dco"
	]);

};

