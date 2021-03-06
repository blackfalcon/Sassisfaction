var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cssmin = require('gulp-cssmin'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    livereload = require('gulp-livereload'),
    del = require('del'),

    changed = require('gulp-changed'),
    svgmin = require('gulp-svgmin'),
    uncss = require('gulp-uncss'),
    jade = require('gulp-jade'),
    marked = require('marked'),
    mainBowerFiles = require('main-bower-files'),
    gulpFilter = require('gulp-filter'),
    
    browserify = require('gulp-browserify'),
    reactify = require('reactify'),

    fs = require("fs");



function readWriteAsync(file) {
  fs.readFile(file, 'utf-8', function(err, data){
    if (err) throw err;

    var newValue = data.replace(/<\s*p[^>]*>(.*?)<\s*\/\s*p>/g, '<p>Hi, <br>see your <code>dist</code> proyect <a href="dist/index.html">here</a></p>');

    fs.writeFile(file, newValue, 'utf-8', function (err) {
      if (err) throw err;
      console.log('index.html proyect rewritten');
    });
  });
}


gulp.task('styles', function(){
  return sass('src/styles/', 
              { style: 'expanded' })
              .pipe(autoprefixer())
              .pipe(gulp.dest('dist/assets/css'))
              .pipe(rename({suffix: '.min'}))
              .pipe(cssmin())
              .pipe(gulp.dest('dist/assets/css'))
              .pipe(notify({ message: 'Styles task complete!'}));
});

gulp.task('scripts', function(){
  gulp.src('src/scripts/main.js')
    .pipe(browserify({
      insertGlobals: false,
      debug: true,
      transform: [reactify]
    }))
    .pipe(gulp.dest('./dist/assets/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist/assets/js'))
    .pipe(notify({ message: 'Scripts task complete!'}));
});

gulp.task('images', function(){
  return gulp.src('src/images/**/*')
              .pipe(imagemin({ 
                optimizationLevel:3, 
                progressive: true, 
                interlaced:true,
                svgoPlugins: [{cleanupIDs: false}]
                }))
              .pipe(gulp.dest('dist/assets/img'))
              .pipe(notify({ message: 'Images task complete!'}));
});

gulp.task('templates', function(){
  return gulp.src('src/templates/*.jade')
              .pipe(jade({
                pretty: true
              }))
              .pipe(gulp.dest('dist'))
});

gulp.task('libs', function(){
  return gulp.src(mainBowerFiles(), { base: 'src/components' })
          .pipe(gulp.dest('dist/assets/libs'));
});

gulp.task('clean', function(cb) {
    del(['dist/assets/css', 'dist/assets/js', 'dist/assets/img'], cb)
});

gulp.task('copy-fonts', function(){
    return gulp.src('src/fonts/*.*')
        .pipe(gulp.dest('dist/assets/fonts/'));
});

gulp.task('firstIndex', function(){
  readWriteAsync('index.html');
});

gulp.task('default', ['clean'], function() {
    gulp.start('templates', 'styles', 'scripts', 'images', 'copy-fonts', 'firstIndex');
});

gulp.task('watch', function(){

  // Watch .jade files
  gulp.watch('src/templates/**/*.jade', ['templates']);

  // Watch .scss files
  gulp.watch('src/styles/**/*.scss', ['styles']);

  // Watch .js files
  gulp.watch(['src/scripts/**/*.js', 'src/scripts/**/*.jsx'], ['scripts']);

  // Watch image files
  gulp.watch('src/images/**/*', ['images']);

  // Watch font files
  gulp.watch('src/fonts/**/*', ['copy-fonts']);

  // Create LiveReload server
  livereload.listen();

  // Watch any files in dist/, reload on change
  gulp.watch(['dist/**']).on('change', livereload.changed);

});