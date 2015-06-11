var gulp = require("gulp"),
    connect = require("gulp-connect"),
    opn = require("opn"),
    sass = require("gulp-sass"),
    jade = require("gulp-jade"),
    browserSync = require('browser-sync').create();

var mainBowerFiles = require('main-bower-files'),
    gulpFilter = require('gulp-filter'),
    rename = require('gulp-rename'),
    rimraf = require('rimraf'),
    uglify = require('gulp-uglify'),
    prefixer = require('gulp-autoprefixer'),
    cssmin = require('gulp-cssmin'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant');

var dest_path = 'public';

// Работа с jade
gulp.task('jade', function() {
    gulp.src('app/templates/*.jade')
        .pipe(jade({pretty: true}))
        .pipe(gulp.dest(dest_path + '/'))
        .pipe(connect.reload());
});
// Работа с Sass
gulp.task('sass', function() {
    gulp.src('app/sass/style.scss')
        .pipe(sass({
            // sourceComments: 'map'
        }))
//        .pipe(prefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest( dest_path + '/css/'))
        .pipe(connect.reload());
});

// Работа с js
gulp.task('js', function() {
    gulp.src('./app/js/**/*.js')
        .pipe(gulp.dest( dest_path + '/js/'))
        .pipe(connect.reload());
});

// Сборка IMG
gulp.task('image', function () {
    gulp.src('./app/images/**/*.*') //Выберем наши картинки
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(dest_path + '/images/')) //И бросим в public/images/
        .pipe(connect.reload());
});

// Сборка Fonts
gulp.task('fonts', function () {
    gulp.src('./app/sass/fonts/**/*.*')
        .pipe(gulp.dest(dest_path + '/css/fonts/')) //И бросим в public/css/fonts/
        .pipe(connect.reload());
});


// Вытянуть зависимости из bower.json и сложить их public
gulp.task('libs', function() {
    var jsFilter = gulpFilter('*.js');
    var cssFilter = gulpFilter('*.css');
    var fontFilter = gulpFilter(['*.eot', '*.woff', '*.svg', '*.ttf']);

    // mainBowerFiles - берёт инфу о проекте из .bower.json, но не у всех либ есть параметр main, поэтому делаем хак, 
    // что бы эти глюкобажные либы тоже скопировались!
    var fix_libs_paths = [
        'corner/jquery.corner.js',
        'modernizr/modernizr.js'     

    ];

    var paths = mainBowerFiles();
    for(var i=0; i < fix_libs_paths.length; i++){
        paths[paths.length] = './app/vendor/' + fix_libs_paths[i];
    }

    gulp.src(paths)

        // grab vendor js files from bower_components, minify and push in /public/js/vendor
        .pipe(jsFilter)
        .pipe(gulp.dest(dest_path + '/js/vendor'))
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(gulp.dest(dest_path + '/js/vendor'))
        .pipe(jsFilter.restore())

        // grab vendor css files from bower_components, minify and push in /public/css
        .pipe(cssFilter)
        .pipe(gulp.dest(dest_path + '/css'))
        .pipe(cssmin())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(gulp.dest(dest_path + '/css'))
        .pipe(cssFilter.restore())

        // grab vendor font files from bower_components and push in /public/fonts
        .pipe(fontFilter)
        //.pipe(flatten())
        .pipe(gulp.dest(dest_path + '/fonts'));
});

// Такс запускает одной командой все предыдущие таски
gulp.task('build', [
    'jade',
    'sass',
    
    'js',
    'image',
    'fonts',

    'libs'
]);

// Если вы добавите какую-нибудь картинку, потом запустите задачу image и потом картинку удалите — она останется в папке public. 
// Так что было бы удобно — периодически подчищать ее. Создадим для этого простой таск
gulp.task('clean', function (cb) {
    rimraf(dest_path, cb);
});


// Слежка
gulp.task('watch', function() {
    gulp.watch(['./app/templates/**/*.jade'], ['jade']);
    gulp.watch(['./app/sass/**/*.scss'], ['sass']);
    gulp.watch(['./app/js/**/*.js'], ['js']);

    gulp.watch(['./app/images/**/*.*'], ['image']);
    gulp.watch(['./app/sass/fonts/**/*.*'], ['fonts']);
    

    gulp.watch(['./bower.json'], ['libs']);
});

// Запуск сервера c лайврелоадом
gulp.task('serv_livereload', function() {
    connect.server({
        root: dest_path,
        livereload: true,
        port: 8888
    });
    opn('http://localhost:8888');
});

// Запуск сервера без лайврелоада
gulp.task('serv_no_livereload', function() {
    connect.server({
        root: dest_path,
        port: 8888
    });
    opn('http://localhost:8888');
});


// Задача по-умолчанию 
gulp.task('default', ['serv_livereload', 'watch']);

// Для ie
gulp.task('serv', ['serv_no_livereload', 'watch']);