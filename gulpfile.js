"use strict";

// https://code.visualstudio.com/docs/languages/css
// https://gist.github.com/jeromecoupe/0b807b0c1050647eb340360902c3203a

// Load plugins
const del = require("del");
const gulp = require("gulp");
const rename = require("gulp-rename");
const sass = require("gulp-sass");

// Clean assets
function clean() {
  return del(["./app.wxss"]);
}

// CSS task
function css() {
  return gulp
    .src("./scss/**/*.scss")
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(rename("app.wxss"))
    .pipe(gulp.dest("./"))
}

// Watch files
function watch() {
  gulp.watch("./scss/**/*", css);
}

// define complex tasks
const build = gulp.series(clean, gulp.parallel(css));

// export tasks
exports.clean = clean;
exports.css = css;
exports.build = build;
exports.watch = watch;
exports.default = build;
