/* jshint camelcase:false */
var osx = 'OS X 10.10';
var windows = 'Windows 8.1';
var browsers = [{
    browserName: 'safari',
    platform: osx
}, {
    browserName: 'firefox',
    platform: windows
}, {
    browserName: 'chrome',
    platform: windows
}, {
    browserName: 'internet explorer',
    platform: windows,
    version: '11'
}, {
    browserName: 'internet explorer',
    platform: 'Windows 8',
    version: '10'
}, {
    browserName: 'internet explorer',
    platform: 'Windows 7',
    version: '9'
}];

module.exports = function (grunt) {
    var jsFiles = 'src/app/**/*.js',
        otherFiles = [
            'src/app/**/*.html',
            'src/app/**/*.css',
            'src/index.html',
            'src/ChangeLog.html'
        ],
        gruntFile = 'GruntFile.js',
        internFile = 'tests/intern.js',
        jshintFiles = [
            jsFiles,
            gruntFile,
            internFile
        ],
        bumpFiles = [
            'package.json',
            'bower.json',
            'src/app/package.json',
            'src/app/config.js'
        ],
        deployFiles = [
            '**',
            '!**/*.uncompressed.js',
            '!**/*consoleStripped.js',
            '!**/bootstrap/less/**',
            '!**/bootstrap/test-infra/**',
            '!**/tests/**',
            '!build-report.txt',
            '!components-jasmine/**',
            '!favico.js/**',
            '!jasmine-favicon-reporter/**',
            '!jasmine-jsreporter/**',
            '!stubmodule/**',
            '!util/**'
        ],
        deployDir = 'wwwroot/crash',
        secrets,
        sauceConfig = {
            urls: ['http://127.0.0.1:8000/_SpecRunner.html'],
            tunnelTimeout: 20,
            build: process.env.TRAVIS_JOB_ID,
            browsers: browsers,
            testname: 'crash.web',
            maxRetries: 10,
            maxPollRetries: 10,
            'public': 'public',
            throttled: 3,
            sauceConfig: {
                'max-duration': 10800
            }
        };
    try {
        secrets = grunt.file.readJSON('secrets.json');
        sauceConfig.username = secrets.sauce_name;
        sauceConfig.key = secrets.sauce_key;
    } catch (e) {
        // swallow for build server
        secrets = {
            stageHost: '',
            prodHost: '',
            username: '',
            password: ''
        };
    }

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        amdcheck: {
            main: {
                options: {
                    removeUnusedDependencies: false
                },
                files: [{
                    src: [
                        'src/app/**/*.js'
                    ]
                }]
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
        compress: {
            main: {
                options: {
                    archive: 'deploy/deploy.zip'
                },
                files: [{
                    src: deployFiles,
                    dest: './',
                    cwd: 'dist/',
                    expand: true
                }]
            }
        },
        connect: {
            uses_defaults: {}
        },
        copy: {
            main: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['*.html', 'points.json'],
                    dest: 'dist/'
                }]
            }
        },
        csslint: {
            main: {
                options: {
                    csslintrc: '.csslintrc'
                },
                src: ['src/app/**/*.css']
            }
        },
        dojo: {
            prod: {
                options: {
                    // You can also specify options to be used in all your tasks
                    profiles: ['profiles/prod.build.profile.js', 'profiles/build.profile.js'] // Profile for build
                }
            },
            stage: {
                options: {
                    // You can also specify options to be used in all your tasks
                    profiles: ['profiles/stage.build.profile.js', 'profiles/build.profile.js'] // Profile for build
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
        esri_slurp: {
            options: {
                version: '3.13'
            },
            dev: {
                options: {
                    beautify: true
                },
                dest: 'src/esri'
            },
            travis: {
                dest: 'src/esri'
            }
        },
        imagemin: {
            main: {
                options: {
                    optimizationLevel: 3
                },
                files: [{
                    expand: true,
                    cwd: 'src/',
                    // exclude tests because some images in dojox throw errors
                    src: ['**/*.{png,jpg,gif}', '!**/tests/**/*.*'],
                    dest: 'src/'
                }]
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
        jshint: {
            main: {
                // must use src for newer to work
                src: jshintFiles
            },
            options: {
                reporter: require('jshint-stylish'),
                jshintrc: '.jshintrc'
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
        'saucelabs-jasmine': {
            all: {
                options: sauceConfig
            }
        },
        secrets: secrets,
        sftp: {
            stage: {
                files: {
                    './': 'deploy/deploy.zip'
                },
                options: {
                    host: '<%= secrets.stageHost %>'
                }
            },
            prod: {
                files: {
                    './': 'deploy/deploy.zip'
                },
                options: {
                    host: '<%= secrets.prodHost %>'
                }
            },
            options: {
                path: './' + deployDir + '/',
                srcBasePath: 'deploy/',
                username: '<%= secrets.username %>',
                password: '<%= secrets.password %>',
                showProgress: true,
                readyTimeout: 30000
            }
        },
        stylus: {
            main: {
                options: {
                    compress: false
                },
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['app/**/*.styl'],
                    dest: 'src/',
                    ext: '.css'
                }]
            }
        },
        sshexec: {
            options: {
                username: '<%= secrets.username %>',
                password: '<%= secrets.password %>',
                readyTimeout: 30000
            },
            stage: {
                command: ['cd ' + deployDir, 'unzip -oq deploy.zip', 'rm deploy.zip'].join(';'),
                options: {
                    host: '<%= secrets.stageHost %>'
                }
            },
            prod: {
                command: ['cd ' + deployDir, 'unzip -oq deploy.zip', 'rm deploy.zip'].join(';'),
                options: {
                    host: '<%= secrets.prodHost %>'
                }
            }
        },
        shell: {
            options: {
                stdout: true
            },
            bootstrapMapServices: {
                command: 'python scripts/publish_mxd.py'
            },
            dev:
            {
                command: 'python scripts/create_points_json.py dev'
            },
            stage:
            {
                command: 'python scripts/create_points_json.py stage'
            },
            prod:
            {
                command: 'python scripts/create_points_json.py prod'
            }
        },
        watch: {
            jshint: {
                files: jshintFiles,
                tasks: ['jshint:main', 'jasmine:main:build']
            },
            src: {
                files: jshintFiles.concat(otherFiles),
                options: {
                    livereload: true
                }
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

    // Default task.
    grunt.registerTask('default', [
        //'shell:bootstrapMapServices',
        'shell:dev',
        'jasmine:main:build',
        'jshint:main',
        'amdcheck:main',
        'if-missing:esri_slurp:dev',
        'connect',
        'stylus',
        'csslint',
        'watch'
    ]);
    grunt.registerTask('build-prod', [
        'clean:build',
        'shell:prod',
        'if-missing:esri_slurp:dev',
        'newer:imagemin:main',
        'stylus',
        'dojo:prod',
        'copy:main',
        'processhtml:main'
    ]);
    grunt.registerTask('build-stage', [
        'clean:build',
        'shell:stage',
        'if-missing:esri_slurp:dev',
        'newer:imagemin:main',
        'stylus',
        'dojo:stage',
        'copy:main',
        'processhtml:main'
    ]);
    grunt.registerTask('deploy-prod', [
        'clean:deploy',
        'compress:main',
        'sftp:prod',
        'sshexec:prod'
    ]);
    grunt.registerTask('deploy-stage', [
        'clean:deploy',
        'compress:main',
        'sftp:stage',
        'sshexec:stage'
    ]);
    grunt.registerTask('sauce', [
        'jasmine:main:build',
        'connect',
        'saucelabs-jasmine'
    ]);
    grunt.registerTask('travis', [
        'if-missing:esri_slurp:travis',
        'jshint',
        'sauce',
        'build-prod'
    ]);
};
