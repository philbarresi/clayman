var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    watch = require('gulp-watch'),
    ts = require('gulp-typescript'),
    path = require('path'),
    yuidoc = require("gulp-yuidoc");

gulp.task('test', function () {
    return gulp.src('./tests/test.js', {
            read: false
        })
        .pipe(mocha());
});

gulp.task('compile', function () {
    return gulp.src(['./typings/**/*.d.ts', './index.ts'])
        .pipe(ts({
            moduleResolution: 'node',
            module: 'commonjs'
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('documentation', function() {
    gulp.src("./index.js")
        .pipe(yuidoc())
        .pipe(gulp.dest("./doc"));
});

gulp.task('default', ['test']);

gulp.task('watch', function () {
    gulp.watch('./index.js', ['test', 'documentation']);
    gulp.watch('./index.ts', ['compile']);
});