'use strict';
const gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    pug = require('gulp-pug'),
    babel = require('gulp-babel'),
    browserSync = require('browser-sync').create();
var IsProduction = getArg("--env") === "production";

let dir = {
    src : './src',
    build : './build'
},
options = {    
    pug : {
        pretty: IsProduction ? false : true,
        locals: {
            title: 'Trabajando con Gulp + BrowserSync'
        }
    },
    sass : {
        /*
            # Type: String
            # Default: nested
            # Values: nested, expanded, compact, compressed
        */
        outputStyle: IsProduction ? 'nested' : 'compressed'
        /* 
        sourceComments: True
            # Type: Boolean
            # Default: false */
    },
    autoprefixer : {
        /* soporte de versiones. */
        browsers: ['last 3 versions'],
        /* cascade: true */
    },
    babel : {
        presets: ['env', 'stage-0'],
        /* default.
        comments: true
        */
        compact: IsProduction ? true : false
    },
    browsersync: {
        server: {
            baseDir: dir.build
        }
        /*
            Type: Number
            Default: 3000
            port: 3000 
        */
    }
};

gulp.task('pug',() =>{
    gulp.src(`${dir.src}/pug/*.pug`)
        .pipe(pug(options.pug))
        .pipe(gulp.dest(`${dir.build}/`));
});

gulp.task('sass', ()=>{
    gulp.src(`${dir.src}/sass/*.scss`)
        .pipe(sass(options.sass).on('error', sass.logError))
        .pipe(autoprefixer(options.autoprefixer))
        .pipe(gulp.dest(`${dir.build}/css/`))
        // injectar css en BrowserSync
        .pipe(browserSync.stream());
});

gulp.task('es6', ()=>{
    gulp.src(`${dir.src}/es6/*.js`)
        .pipe(babel(options.babel))
        .pipe(gulp.dest(`${dir.build}/js/`));
});

gulp.task('serve', ['pug', 'sass', 'es6'], ()=> {
    browserSync.init(options.browsersync);
});

gulp.task('default', ()=> {
        gulp.start('serve');
    if (!IsProduction){
        // escuchar cambios en pug
        gulp.watch(`${dir.src}/pug/**/*.pug`, ['pug'])
            .on('change', change);
        // escuchar cambios en html y recargar el navegador
        gulp.watch(`${dir.build}/**/*.html`).on('change', reload);

        // escuchar cambios en sass
        gulp.watch(`${dir.src}/sass/**/*.scss`, ['sass']).on('change', change);

        // escucha cambios en archivos de desarrollo .js
        gulp.watch(`${dir.src}/es6/**/*.js`, ['es6']).on('change', change);
        // escucha cambios en archivos de produccion .js y recarga el navegador.
        gulp.watch(`${dir.build}/js/**/*.js`).on('change', reload);
    }
});

function reload(){
    return browserSync.reload();
}

function change(e){
    console.log('File ' + e.path + ' was ' + e.type + ', running tasks...');
}

function getArg(key) {
    var index = process.argv.indexOf(key);
    var next = process.argv[index + 1];
    return (index < 0) ? null : (!next || next[0] === "-") ? true : next;
}