// Uso del modo estricto
'use strict';

// importación de los modulos necesarios.
import gulp from "gulp";
import sass from "gulp-sass";
import autoprefixer  from "gulp-autoprefixer";
import pug from "gulp-pug";
import babel from "gulp-babel";
import browserSync from "browser-sync";
// instanciamos la funcion create de browserSync y re asignamos en la misma variable.
browserSync = browserSync.create();

// Variable que nos ayudara a definira si le pasamos a la linea de comandos si compilamos en modo producción.
let IsProduction = getArg("--env") === "production";

// Directorios con los que vamos a trabajar.
let dir = {
    src : './src',
    build : './build'
},

// Definimos las opciones de cada modulo
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

// Tarea encargada de preprocesar PUG
gulp.task('pug',() =>{
    gulp.src(`${dir.src}/pug/*.pug`)
        .pipe(pug(options.pug))
        .pipe(gulp.dest(`${dir.build}/`));
});

// Tarea encargada de preprosesar sass utilisando la extension scss.
gulp.task('sass', ()=>{
    gulp.src(`${dir.src}/sass/*.scss`)
        .pipe(sass(options.sass).on('error', sass.logError))
        .pipe(autoprefixer(options.autoprefixer))
        .pipe(gulp.dest(`${dir.build}/css/`))
        // injectar css en BrowserSync
        .pipe(browserSync.stream());
});

// Tarea encargada de preprocesar JavaScript a ES5
gulp.task('es6', ()=>{
    gulp.src(`${dir.src}/es6/*.js`)
        .pipe(babel(options.babel))
        .pipe(gulp.dest(`${dir.build}/js/`));
});

// Tarea encargada de crear e servidor de browserSync y preprocesar por si hubo un cambio previo
gulp.task('serve', ['pug', 'sass', 'es6'], ()=> {
    browserSync.init(options.browsersync);
});

// Tarea por defecto de gulp encargada de ejecutar nuestras configuracines.
// se puede pasar el parametro --env production de la siguiente manera
// gulp --env production
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

// funcion encargada de recargar el navegador.
function reload(){
    return browserSync.reload();
}

// funcion encargada de decirnos donde se realizo el cambio.
function change(e){
    console.log('File ' + e.path + ' was ' + e.type + ', running tasks...');
}

// Funcion encargada de obtener el valor la linea de comandos si para saber si tiene que compilar en modo producción
function getArg(key) {
    var index = process.argv.indexOf(key);
    var next = process.argv[index + 1];
    return (index < 0) ? null : (!next || next[0] === "-") ? true : next;
}