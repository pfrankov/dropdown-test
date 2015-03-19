module.exports = function(grunt) {
	var config = {
		zip: false, // Archive `dist` dir after build

		// Directories names config
		app: "app",
			sass: "sass",
			styles: "css",
			images: "images",
			scripts: "js",
			mocks: "mocks",
		
		dist: "dist",


		// Ignore copying into `config.dist` from `config.app` directory
		copyIgnore: [
			"bower_components/**",
			"includes/**",
			"<%= config.sass %>/**",
			"<%= config.mocks %>/**" 
		]
	};



	

	




	/**
	 * @param {Array} paths
	 */
	function makePathIgnored (paths){
		var result = [];

		for (var i=0; i<paths.length; i++) {
			result[i] = "!"+paths[i];
		}
		return result;
	}


	
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),

		config: config,

		paths: {
			app: "<%= config.app %>",
				sass: "<%= config.app %>/<%= config.sass %>",
				styles: "<%= config.app %>/<%= config.styles %>",
				scripts: "<%= config.app %>/<%= config.scripts %>",
				images: "<%= config.app %>/<%= config.images %>",
				tmp: "<%= config.app %>/.tmp",
				mocks: "<%= config.app %>/<%= config.mocks %>",

			dist: "<%= config.dist %>"
		},


		imagemin: {
			images: {
				files: [{
					expand: true,
					cwd: "<%= paths.app %>/",
					src: [
							"<%= config.images %>/**/*.{png,jpg,gif}", 
							"!<%= config.images %>/**/_*/**"
						].concat(makePathIgnored(config.copyIgnore) ),
					dest: "<%= paths.dist %>/"
				}]
			}
		},

		csso: {
			usemin: {
				options: {
					force: true,
					restructure: true,
					report: 'gzip'
				},
				files: [{

					expand: true,
					cwd: "<%= paths.tmp %>/usemin/",
					src: ["**/*.css"],
					dest: "<%= paths.tmp %>/usemin/",
					ext: ".css"
				}]
			}
		},

		useminPrepare: {
			html: "<%= paths.app %>/*.html",

			options: {
				dest: "<%= paths.tmp %>/usemin",
				flow: {
					steps: {
						js: ["uglifyjs"],
						css: ["concat"]
					},
					post: {
						js: [{
							name: "uglify",
							createConfig: function(context){
								var copyTask = grunt.config("copy");
								copyTask.assets.src = copyTask.assets.src.concat(makePathIgnored(context.inFiles));

								grunt.config("copy", copyTask);
							}
						}],
						css: [{
							name: "concat",
							createConfig: function(context, block){								
								var copyTask = grunt.config("copy");
								copyTask.assets.src = copyTask.assets.src.concat(makePathIgnored(context.inFiles));

								grunt.config("copy", copyTask);


								var usebannerTask = grunt.config("usebanner");
								usebannerTask.banner.files.src = usebannerTask.banner.files.src.concat("<%= paths.dist %>/" + block.dest);

								grunt.config("usebanner", usebannerTask);
							}
						}]
					}
				}
			}
		},

		usemin: {
			html: "<%= paths.dist %>/*.html"
		},

		clean: {
			tmp: "<%= paths.tmp %>",
			dist: "<%= paths.dist %>"
		},

		copy: {
			usemin: {
				expand: true,
				cwd: "<%= paths.tmp %>/usemin/",
				src: "**",
				dest: "<%= paths.dist %>/"
			},
			html: {
				expand: true,
				cwd: "<%= paths.app %>/",
				src: ["*.html"],
				dest: "<%= paths.dist %>/"
			},
			assets: {
				expand: true,
				cwd: "<%= paths.app %>/",
				src: [
						"**/*", "!*.html",
						"!<%= config.images %>/**/*.{png,jpg,gif}",
						"!<%= config.images %>/**/_*/**"
					].concat(makePathIgnored(config.copyIgnore) ),
				dest: "<%= paths.dist %>/"
			}
		},

		compass: {
			tmp: {
				options: {
					sourcemap: true,
					config: "config.rb",
					imagesDir: "<%= paths.images %>",
					javascriptsDir: "<%= paths.scripts %>",
					fontsDir: "<%= paths.styles %>/fonts",
					sassDir: "<%= paths.sass %>",
					cssDir: "<%= paths.tmp %>"
				}
			}
		},

		autoprefixer: {
			tmp: {
				options: {
					map: true
				},
				expand: true,
				flatten: true,
				src: "<%= paths.tmp %>/**/*.css",
				dest: "<%= paths.sass %>"
			}
		},

		connect: {
			options: {
				port: 9000,
				livereload: 35729,
				hostname: "localhost",

				middleware: function(connect, options, middlewares) {
					middlewares.unshift(function(req, res, next) {
						switch ( req.url ) {
							case "/sample": {
								res.end(grunt.file.read(
									grunt.template.process("<%= paths.mocks %>/sample.json")
								));
								return;
							}
						}
						

						return next();
					}); 

					return middlewares;
				}
			},
			livereload: {
				options: {
					open: true,
					base: [
						"<%= paths.app %>"
					]
				}
			}
		},

		watch: {
			js: {
				files: ["<%= paths.scripts %>/**/*.js"],
				tasks: ["build:dev:js"],
				options: {
					spawn: false,
					livereload: true
				}
			},
			sass: {
				files: ["<%= paths.sass %>/**/*.scss"],
				tasks: ["build:dev:css"],
				options: {
					spawn: false,
					livereload: true
				}
			},
			css: {
				files: ["<%= paths.styles %>/**/*.css"],
				options: {
					spawn: false,
					livereload: true
				}
			},
			html: {
				files: ["<%= paths.app %>/**/*.html"],
				options: {
					spawn: false,
					livereload: true
				}
			}
		},

		focus: {
			run: {

			}
		},

		size_report: {
			your_target: {
				files: {
					list: ["<%= paths.dist %>/**/*.{html,css,js,jpg,png,gif,webp,zip}"]
				}
			}
		},

		zip: {
			task: {
				cwd: "<%= paths.dist %>/",
				src: ["<%= paths.dist %>/**/*"],
				dest: "<%= paths.dist %>/<%= pkg.name %>-v<%= pkg.version %>.zip"
			}
		},

		bump: {
			options: {
				files: ["package.json"],
				updateConfigs: ["pkg"],
				commit: false,
				createTag: false,
				push: false
			}
		},

		usebanner: {
			banner: {
				options: {
					position: "top",
					banner: "<%= banner %>",
					linebreak: true
				},
				files: {
					src: []
				}
			}
		},
		markdown: {
			all: {
				files: [
					{
						expand: true,
						src: "*.md",
						dest: "",
						ext: ".html"
					}
				]
			}
		},

		wiredep: {
			app: {
				src: ["<%= paths.app %>/index.html"],
				ignorePath:  /\.\.\//
			},
			gruntFile: {
				src: ["Gruntfile.js"],
				ignorePath:  /\.\.\//
			}
		}
	});

	require("jit-grunt")(grunt, {
		useminPrepare: "grunt-usemin"
	});

	grunt.registerTask("build:dev:css", [
		"compass:tmp",
		"autoprefixer:tmp"
	]);

	grunt.registerTask("build:dev:js", [
		"wiredep"
	]);



	grunt.registerTask("serve", function(param){
		grunt.task.run([
			"build:dev:css",
			"build:dev:js",
			"connect:livereload"
		]);

		grunt.task.run([
			"focus:run"
		]);
		
	});


	grunt.registerTask("server", [
		"serve"
	]);
	
	grunt.registerTask("build:js", [
		"build:dev:js"
	]);
	grunt.registerTask("build:css", [
		"build:dev:css"
	]);

	grunt.registerTask("build", function(param){
		if ( param == "debug" ) {
			require("time-grunt")(grunt);
		}
		
		grunt.task.run([
			"clean:dist",
			"bump",
			"build:css",
			"build:js",
			"useminPrepare",
			"concat:generated",
			"uglify:generated",
			"csso:usemin",
			"copy:usemin",
			"copy:html",
			"imagemin",
			"usemin",
			"copy:assets",
			"clean:tmp"
		]);

		if ( grunt.config.get("config" ).zip ) {
			grunt.task.run([
				"zip"
			]);
		}
		grunt.task.run([
			"size_report"
		]);		
	});
	
	grunt.registerTask("default", ["build"]);
};