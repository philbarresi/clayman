var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    watch = require('gulp-watch'),
    ts = require('gulp-typescript'),
    path = require('path');

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

gulp.task('default', ['test']);

gulp.task('watch', function () {
    gulp.watch('./index.js', ['test']);
    gulp.watch('./index.ts', ['compile']);
});