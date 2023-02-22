'use strict';

// Load plugins
const browserify = require('browserify');
const babelify = require('babelify');
const gulp = require("gulp");
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css')
const source = require('vinyl-source-stream');

const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');
const log = require('gulplog');
const uglify = require('gulp-uglify');


const gulpif = require('gulp-if');
const rename = require('gulp-rename');
const { series, watch } = require("gulp");
const browsersync = require('browser-sync').create();


//configurate
let watchMe = false;
const appDefaults = {
    myProxy: "http://127.0.0.1:9292/",
    stylesDir : "../scss/", // path to styles
    stylesDirDest : "../assets/",
    javascriptDir : "../js/",
    dest : "../dist"
}

// Styles
function sassCompile(done) {
    gulp.src(appDefaults.stylesDir+'**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(appDefaults.stylesDirDest))
        // .pipe(rename({ suffix: '.min' }))
        // .pipe(cleanCSS({debug: true, level: {1: {specialComments: 'all'}}}, (details) => {
       //  }))
        .pipe(gulp.dest(appDefaults.stylesDirDest))
        .pipe(gulpif(watchMe === true, browsersync.stream()));
    done();
}

function javascriptCompile(done) {
    // set up the browserify instance on a task basis
    var b = browserify({
        entries: appDefaults.javascriptDir+'/app.js',
        debug: true
    }).transform(babelify.configure({
        presets: ["@babel/preset-env"]
    }));
    return b.bundle()
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', log.error)
        .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('../../'))
    done();
}

function browsersyncServe(cb){
    browsersync.init({
        proxy: appDefaults.myProxy,
        port: 8080,
        ui: {
            port: 9000
        }
    });
    cb();
}

function browsersyncReload(cb){
    browsersync.reload();
    cb();
}

function browsersyncNotify(cb){
    browsersync.notify("sass compile");
    cb();
}

function copyAssets(done ){
    done();
}

function watchTask(){
    watchMe = true;
    watch(['../../**/*.php', '../../**/*.js'], series(browsersyncReload));
    watch(['../**/*.svg','../**/*.jpg', '../**/*.png', '../**/*.gif'], series(browsersyncReload))
    watch(['../**/*.scss'], series( sassCompile, browsersyncNotify));
    // watch([appDefaults.javascriptDir+'/app.js'], series(javascriptCompile));
}
// tasks run from terminal
exports.watch = series(  sassCompile, browsersyncServe, watchTask);
exports.default = series( sassCompile,javascriptCompile );
exports.sass = series( sassCompile );
