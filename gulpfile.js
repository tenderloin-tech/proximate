var gulp = require('gulp');

var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');

// checks js files with jshint
gulp.task('lint', function() {
  return gulp.src('src/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// checks js files for jscs styles
gulp.task('checkStyle', function() {
  return gulp.src('src/**/*.js')
    .pipe(jscs());
});

// watch files for changes
gulp.task('watch', function() {
  gulp.watch('src/**/*.js', ['lint', 'checkStyle']);
});

gulp.task('default', ['lint', 'checkStyle', 'watch']);