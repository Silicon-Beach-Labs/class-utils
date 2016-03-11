'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var eslint = require('gulp-eslint');
var through = require('through2');

gulp.task('coverage', function() {
  return gulp.src(['index.js', 'utils.js'])
    .pipe(istanbul({includeUntested: true}))
    .pipe(istanbul.hookRequire());
});

gulp.task('mocha', ['coverage'], function() {
  return gulp.src('test.js')
    .pipe(mocha())
    .pipe(istanbul.writeReports());
});

gulp.task('eslint', function() {
  return gulp.src('*.js')
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('vars', function() {
  var utils = require('./utils');
  var keys = Object.keys(utils);
  var report = {};
  var cache = {};

  return gulp.src(['index.js', 'utils.js'])
    .pipe(through.obj(function(file, enc, next) {
      var str = file.contents.toString();
      keys.forEach(function(key) {
        report[key] = report[key] || 0;
        var re = cache[key] || (cache[key] = new RegExp('\\.' + key, 'g'));
        var m = str.match(re);
        if (!m) return;
        report[key]++;
      });

      next(null, file);
    }, function(next) {
      var keys = Object.keys(report);
      var res = {};

      keys.sort(function(a, b) {
        return report[a] > report[b] ? -1 : 1;
      });

      keys.forEach(function(key) {
        res[key] = report[key];
      });

      console.log(res);
      console.log(keys.length, 'modules');
      next();
    }))
});

gulp.task('default', ['mocha', 'eslint']);
