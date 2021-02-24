"use strict";

// https://code.visualstudio.com/docs/languages/css
// https://gist.github.com/jeromecoupe/0b807b0c1050647eb340360902c3203a

// Load plugins
const del = require("del");
const gulp = require("gulp");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const replace = require("gulp-replace");
const merge = require("merge-stream");

const fs = require("fs");

// Clean assets
function clean() {
  return del(["./app.wxss"]);
}

// CSS task
function css() {
  var appScss = gulp
    .src("./scss/**/*.scss")
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(rename("app.wxss"))
    .pipe(gulp.dest("./"));

  var componentsScss = gulp
    .src("./components/**/*.scss", { base: "." })
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(
      rename((path) => {
        path.extname = ".wxss";
      })
    )
    .pipe(gulp.dest("./"));
  return merge(appScss, componentsScss);
}

// Third party js libraries
function jsLibs() {
  const dayjsBasePath = "./node_modules/dayjs";
  const dayjsSrcList = [
    `${dayjsBasePath}/dayjs.min.js`,
    `${dayjsBasePath}/plugin/customParseFormat.js`,
    `${dayjsBasePath}/plugin/isBetween.js`,
    `${dayjsBasePath}/plugin/isoWeek.js`,
    `${dayjsBasePath}/plugin/duration.js`,
  ];
  return gulp
    .src(dayjsSrcList, { base: dayjsBasePath })
    .pipe(gulp.dest("./libs/dayjs/"));
}

// Record commit id
function commitHash(done) {
  try {
    const rev = fs.readFileSync(".git/HEAD").toString();
    const hash = fs
      .readFileSync(`.git/${rev.substring(5)}`.replace(/^\s+|\s+$/g, ""))
      .toString()
      .substring(0, 7);
    gulp
      .src(["env.js"])
      .pipe(replace(/commitHash = ".*?"/g, `commitHash = "${hash}"`))
      .pipe(gulp.dest("./"));
  } catch (err) {
    console.log("Failed to stamp commitHash: " + err);
  }
  done();
}

// Watch files
function watch() {
  gulp.watch("./scss/**/*", css);
  gulp.watch("./components/**/*.scss", css);
}

// define complex tasks
const build = gulp.series(clean, gulp.parallel(css, jsLibs, commitHash));

// export tasks
exports.clean = clean;
exports.css = css;
exports.jsLibs = jsLibs;
exports.commitHash = commitHash;
exports.build = build;
exports.watch = watch;
exports.default = build;
