/**
 * gulp build
 * business.yingwumeijia.com
 *
 *
 *修改成xxxx.js/css?v=xx
 * 打开node_modules\gulp-rev\index.js
 找到 manifest[originalFile] = revisionedFile;
 更新为: manifest[originalFile] = originalFile + '?v=' + file.revHash;


 打开node_modules\rev-path\index.js
 10行 return filename + '-' + hash + ext;
 更新为: return filename + ext;


 打开node_modules\gulp-rev-collector\index.js
 31行 if ( path.basename(json[key]).replace(new RegExp( opts.revSuffix ), '' ) !== path.basename(key) ) {
更新为: if ( path.basename(json[key]).split('?')[0] !== path.basename(key) ) {

 * **/
// npm install gulp
// npm install gulp-uglify
// npm install gulp-concat
// npm install gulp-minify-css
// npm install gulp-clean
// npm install gulp-rename
// npm install gulp-htmlmin //way 2
// npm install gulp-minify-html
// npm install run-sequence
// npm install gulp-watch
// npm install gulp-sass


// ng相关
// npm install gulp-ng-annotate
// npm install gulp-ngmin
// npm install gulp-strip-debug
// 版本相关
// npm install gulp-asset-rev
// npm install gulp-rev
// npm install gulp-rev-collector
// js/css检测
// npm install jshint // 依赖
// npm install gulp-jshint
// npm install jshint-stylish
// npm install gulp-csslint
// npm install csslint-stylish



// 直接复制安装
//cnpm install gulp  gulp-uglify gulp-concat gulp-minify-css gulp-rename gulp-htmlmin gulp-asset-rev run-sequence gulp-strip-debug gulp-clean gulp-rev-collector gulp-rev gulp-ngmin  gulp-ng-annotate gulp-minify-html gulp-jshint jshint-stylish jshint gulp-csslint csslint-stylish gulp-watch gulp-sass

// gulp 运行
var gulp = require('gulp');
var uglify = require('gulp-uglify'),//压缩js代码
    concat = require('gulp-concat'),//合并文件
    minifyCss = require("gulp-minify-css"),//css压缩
    clean = require('gulp-clean'),         //清空文件夹
    rename = require('gulp-rename'),      //重命名
    ngmin = require('gulp-ngmin'),         //压缩ng
    htmlmin= require('gulp-htmlmin'),//压缩和动态html
    minifyHtml= require('gulp-minify-html'),//压缩和动态html WAY2
    stripDebug= require('gulp-strip-debug'),//清空Debug
    assetRev= require('gulp-asset-rev'),//设置css中版本代码串
    rev = require('gulp-rev'),//生成版本映射
    revCollector = require('gulp-rev-collector'),//替换文件内容版本
    runSequence= require('run-sequence'),//运行组件，原生为run,多任务并行或顺序
    watch = require('gulp-watch'),//监听
    //sass = require('gulp-sass'), //win10安裝問題
    //可忽略
    jshint = require('gulp-jshint'), //js检测
    stylish = require('jshint-stylish'),// 高亮
    csslint = require('gulp-csslint'),//css检测
    cssStylish = require('csslint-stylish');//css高亮




//定义路径
var paths = {
	js:['./src/static/js/**'],
    css:['./src/static/css/*'],
    libs:['./src/static/libs/**'],
    icons:['./src/static/icons/*'],
    images:['./src/static/images/*'],
    templates:['./src/templates/**'],
   // roothtml:['./src/!build.html'],
    minHtml:['./rev/**/*.json','./src/*.html'], //修改版本号

    //分环境移动配置文件
    devConfig:['./src/config.js'],
    testConfig:['./src/config/config_test.js'],
    preConfig:['./src/config/config_pre.js'],
    proConfig:['./src/config/config_pro.js']
};



// move
gulp.task('buildMov', function () {
    gulp.src(paths.icons)
        .pipe(gulp.dest('./dist/static/icons/'));
    gulp.src(paths.images)
        .pipe(gulp.dest('./dist/static/images/'));
    gulp.src(paths.templates)
        .pipe(gulp.dest('./dist/templates/'));
    gulp.src(paths.libs)
        .pipe(gulp.dest('./dist/static/libs/'));
});

//检测js
gulp.task('lintJs', function(){
    return gulp.src(paths.js)
        .pipe(jshint({
            "undef": false,  // 所有的非全局变量，在使用前必须都被声明
            "unused": false, // 所有的变量必须都被使用
        }))
        .pipe(jshint.reporter(stylish))//高亮提示
});

//检测css
gulp.task('lintCss', function(){
    return gulp.src(paths.css)
        .pipe(csslint())
        .pipe(csslint.formatter(cssStylish))
});


//js
gulp.task('script', function() {
    gulp.src(paths.js)
        //.pipe(uglify())
        .pipe(ngmin({dynamic: false}))//Pre-minify AngularJS apps with ngmin
        //.pipe(stripDebug())//除去js代码中的console和debugger输出
        .pipe(rev()) //设置含编码文件名
        .pipe(gulp.dest('./dist/static/js/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/js/'));// rev-manifest.json文件名对照映射
});


//css
gulp.task('stylesheets', function () {
    gulp.src(paths.css) // 要压缩的css文件
        .pipe(minifyCss()) //压缩css
        .pipe(rev()) //设置含编码文件名
        .pipe(gulp.dest('./dist/static/css/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/css/'));
});

////sass
//gulp.task('sass', function () {
//    return gulp.src('./src/sass/*.scss')
//        .pipe(sass().on('error', sass.logError))
//        .pipe(concat('config.css'))
//        .pipe(gulp.dest('./src/static/css/'));
//});


// html
gulp.task('htmlMinDev', function () {
    var options= {
       // removeComments: true,//清除HTML注释
        //collapseWhitespace: true,//压缩HTML
        //省略布尔属性的值 <input checked="true"/> ==> <input />
        //collapseBooleanAttributes: true,
        //删除所有空格作属性值 <input id="" /> ==> <input />
        //removeEmptyAttributes: true,
        //删除<script>的type="text/javascript"
        //removeScriptTypeAttributes: true,
        //删除<style>和<link>的type="text/css"
        //removeStyleLinkTypeAttributes: true,
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };

    gulp.src(paths.minHtml)
        .pipe(revCollector({
            //replaceReved: true,
            //dirReplacements: { //替换页面中的路径
            //    'css': 'css',
            //    'js': 'js'
            //}
        })) //修改文件中连接版本名

        .pipe(htmlmin(options))
        .pipe(gulp.dest('./dist/'));

});


/**
 * dev pro test
 * **/
//多环境文件移动
gulp.task('devDist', function () {
    gulp.src(paths.devConfig)
        .pipe(rename('config.js'))
        .pipe(gulp.dest('./dist'));
});
gulp.task('testDist', function () {
    gulp.src(paths.testConfig)
        .pipe(rename('config.js'))
        .pipe(gulp.dest('./dist'));
});
gulp.task('preDist', function () {
    gulp.src(paths.preConfig)
        .pipe(rename('config.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('productDist', function () {
    gulp.src(paths.proConfig)
        .pipe(rename('config.js'))
        .pipe(gulp.dest('./dist'));
});



//callback //5s等待映射文件生成;可使用监听后回调，但影响性能不建议!
function done(){
    console.log('waiting...')
    setTimeout(function(){
        runSequence('htmlMinDev');
        console.log("finished!")
    },5000)
}


//// gulp sass
//gulp.task('sasscss', function () {
//    gulp.watch('./src/sass/*.scss', ['sass']);
//});


// clean
gulp.task('clean', function() {
    return gulp.src(['./dist/'], {read: false})
        .pipe(clean({force: true}));
});

// run default (dev)
gulp.task('default', ['clean'],function() {
    runSequence('buildMov','stylesheets','script','devDist',done)
});

// run check (dev)
gulp.task('check', ['clean'],function() {
    runSequence('buildMov','lintJs','lintCss','stylesheets','script','devDist',done)
});

// run test
gulp.task('test',['clean'], function() {
    runSequence('buildMov','stylesheets','script','testDist',done)
});

// run pre
gulp.task('pre',['clean'], function() {
    runSequence('buildMov','stylesheets','script','preDist',done)
});

// run pro
gulp.task('pro',['clean'], function() {
    runSequence('buildMov','stylesheets','script','productDist',done);//中括号为并行执行
});

