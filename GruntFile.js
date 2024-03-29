module.exports = function (grunt) {
    var otherFiles = [
        'src/app/**/*.html',
        'src/app/**/*.css',
        'src/index.html',
        'src/ChangeLog.html',
        'tests/**/*.js'
    ];
    var jsFiles = ['src/app/**/*.js', 'profiles/*.js', 'GruntFile.js'];
    var bumpFiles = [
        'package.json',
        'bower.json',
        'src/app/package.json',
        'src/app/config.js'
    ];

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        amdcheck: {
            main: {
                options: {
                    removeUnusedDependencies: false
                },
                files: [
                    {
                        src: ['src/app/**/*.js']
                    }
                ]
            }
        },
        bump: {
            options: {
                files: bumpFiles,
                commitFiles: bumpFiles.concat('src/ChangeLog.html'),
                push: false
            }
        },
        clean: {
            build: ['dist'],
            deploy: ['deploy']
        },
        connect: {
            uses_defaults: {}
        },
        copy: {
            main: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['ChangeLog.html'],
                    dest: 'dist/'
                }]
            }
        },
        dojo: {
            prod: {
                options: {
                    // You can also specify options to be used in all your tasks
                    profiles: [
                        'profiles/prod.build.profile.js',
                        'profiles/build.profile.js'
                    ] // Profile for build
                }
            },
            stage: {
                options: {
                    // You can also specify options to be used in all your tasks
                    profiles: [
                        'profiles/stage.build.profile.js',
                        'profiles/build.profile.js'
                    ] // Profile for build
                }
            },
            options: {
                // You can also specify options to be used in all your tasks
                dojo: 'src/dojo/dojo.js', // Path to dojo.js file in dojo source
                load: 'build', // Optional: Utility to bootstrap (Default: 'build')
                releaseDir: '../dist',
                require: 'src/app/run.js', // Optional: Module to require for the build (Default: nothing)
                basePath: './src'
            }
        },
        eslint: {
            options: {
                configFile: '.eslintrc',
                fix: true
            },
            main: {
                src: jsFiles
            }
        },
        imagemin: {
            main: {
                options: {
                    optimizationLevel: 3
                },
                files: [
                    {
                        expand: true,
                        cwd: 'src/',
                        // exclude tests because some images in dojox throw errors
                        src: ['**/*.{png,jpg,gif}', '!**/tests/**/*.*'],
                        dest: 'src/'
                    }
                ]
            }
        },
        jasmine: {
            main: {
                src: ['src/app/run.js'],
                options: {
                    specs: ['src/app/**/Spec*.js'],
                    vendor: [
                        'src/jasmine-favicon-reporter/vendor/favico.js',
                        'src/jasmine-favicon-reporter/jasmine-favicon-reporter.js',
                        'src/jasmine-jsreporter/jasmine-jsreporter.js',
                        'src/app/tests/jasmineTestBootstrap.js',
                        'src/dojo/dojo.js',
                        'src/app/tests/jsReporterSanitizer.js',
                        'src/app/tests/jasmineAMDErrorChecking.js'
                    ],
                    host: 'http://localhost:8000'
                }
            }
        },
        parallel: {
            options: {
                grunt: true
            },
            assets: {
                tasks: ['eslint:main', 'stylus', 'jasmine:main:build']
            },
            buildAssets: {
                tasks: ['eslint:main', 'clean:build', 'newer:imagemin:main', 'stylus']
            }
        },
        processhtml: {
            options: {},
            main: {
                files: {
                    'dist/index.html': ['src/index.html'],
                    'dist/user_admin.html': ['src/user_admin.html']
                }
            }
        },
        stylus: {
            main: {
                options: {
                    compress: false,
                    'resolve url': true
                },
                files: [
                    {
                        expand: true,
                        cwd: 'src/',
                        src: ['app/**/*.styl'],
                        dest: 'src/',
                        ext: '.css'
                    }
                ]
            }
        },
        shell: {
            options: {
                stdout: true
            },
            bootstrapMapServices: {
                command: 'python scripts/publish_mxd.py'
            },
            dev: {
                command: 'python scripts/create_points_json.py dev'
            },
            stage: {
                command: 'python scripts/create_points_json.py stage'
            },
            prod: {
                command: 'python scripts/create_points_json.py prod'
            }
        },
        uglify: {
            options: {
                preserveComments: false,
                sourceMap: true,
                compress: {
                    drop_console: true,
                    passes: 2,
                    dead_code: true
                }
            },
            stage: {
                options: {
                    compress: {
                        drop_console: false
                    }
                },
                src: ['dist/dojo/dojo.js'],
                dest: 'dist/dojo/dojo.js'
            },
            prod: {
                files: [
                    {
                        expand: true,
                        cwd: 'dist',
                        src: '**/*.js',
                        dest: 'dist'
                    }
                ]
            }
        },
        watch: {
            eslint: {
                files: jsFiles,
                tasks: ['newer:eslint:main', 'jasmine:main:build']
            },
            src: {
                files: jsFiles.concat(otherFiles),
                options: { livereload: true }
            },
            stylus: {
                files: 'src/app/**/*.styl',
                tasks: ['newer:stylus']
            }
        }
    });

    // Loading dependencies
    for (var key in grunt.file.readJSON('package.json').devDependencies) {
        if (key !== 'grunt' && key.indexOf('grunt') === 0) {
            grunt.loadNpmTasks(key);
        }
    }

    grunt.registerTask('default', [
        'parallel:assets',
        'connect',
        'watch'
    ]);
    grunt.registerTask('build-prod', [
        'parallel:buildAssets',
        'dojo:prod',
        'uglify:prod',
        'copy:main',
        'processhtml:main'
    ]);
    grunt.registerTask('build-stage', [
        'parallel:buildAssets',
        'dojo:stage',
        'uglify:stage',
        'copy:main',
        'processhtml:main'
    ]);
    grunt.registerTask('serve', ['connect', 'watch']);
    grunt.registerTask('travis', ['eslint:main', 'build-prod']);
};
