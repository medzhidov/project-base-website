'use strict';

const   gulp         = require('gulp'),
        sass         = require('gulp-sass'),
        prefixer     = require('gulp-autoprefixer'),
        srcmaps      = require('gulp-sourcemaps'),
        babel        = require('gulp-babel'),
        addsrc       = require('gulp-add-src'),
        concat       = require('gulp-concat'),
        fileinclude  = require('gulp-file-include'),
        inject_svg   = require('gulp-inject-svg'),
        imagemin     = require('gulp-imagemin'),
        gulpif       = require('gulp-if'),
        htmlbeautify = require('gulp-html-beautify'),
        requirejs    = require('gulp-requirejs'),
        rollup       = require('gulp-rollup'),
        uglifyjs     = require('gulp-uglifyjs');

gulp.task('compile:html', function(){
    return gulp.src('source/*.html')
        .pipe(fileinclude({
            prefix: '@',
            basepath: './source/templates/'
        }))
        .pipe( inject_svg() )
        .pipe( htmlbeautify({
            indentSize: 4
        }) )
        .pipe( gulp.dest('./app/') );
});

gulp.task('compile:js', function () {
    return gulp.src('source/js/main.js')
        .pipe(rollup({
            // any option supported by Rollup can be set here.
            "format": "iife",
            "plugins": [
                require("rollup-plugin-babel")({
                    "presets": [["es2015", { "modules": false }]],
                    "plugins": ["external-helpers"]
                })
            ],
            entry: 'source/js/main.js'
        }))
        .pipe( srcmaps.init() )
        // ADD BABEL POLYFILL
        // .pipe( babel({
		// 	presets: ['es2015']
		// }) )
        .pipe( addsrc.prepend('node_modules/babel-polyfill/dist/polyfill.min.js') )
        .pipe( concat('main.js') )
        .pipe( srcmaps.write() )
        .pipe( gulp.dest('./app/js') );
});

gulp.task('compile:js-libs', function () {
    return gulp.src(['source/js/libs/*.js'])
        // ADD BABEL POLYFILL
        .pipe( babel({
			presets: ['es2015']
		}) )
        .pipe( uglifyjs() )
        .pipe( gulp.dest('./app/js/libs') );
});

gulp.task('compile:scss', function(){
    return gulp.src('source/css/main.scss')
        .pipe( srcmaps.init() )
        .pipe( sass({outputStyle: 'compressed'}).on('error', sass.logError) )
        .pipe( prefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }) )
        .pipe( srcmaps.write() )
        .pipe( concat('main.min.css') )
        .pipe( gulp.dest('app/css') );
});

gulp.task('compile:images', function(){
    return gulp.src('source/img/**')
        .pipe(imagemin([
            imagemin.svgo({
                plugins: [{
                    cleanupListOfValues: false
                }]
            })
        ], {
            verbose: true
        }))
        .pipe(gulp.dest('app/img'));
});

gulp.task('work', function(){
    gulp.watch('source/css/**', gulp.series('compile:scss'));
    gulp.watch(['source/js/main.js'], gulp.series('compile:js'));
    gulp.watch(['source/js/libs/*.js'], gulp.series('compile:js-libs'));
    gulp.watch(['source/*.html', 'templates/**'], gulp.series('compile:html'));
});

gulp.task('default', gulp.series('compile:html', 'compile:js', 'compile:scss', 'compile:images'));