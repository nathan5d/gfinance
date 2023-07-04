const gulp = require('gulp');
const webserver = require('gulp-webserver');
const browserSync = require('browser-sync').create();

// Tarefa para iniciar o servidor local com o Gulp
gulp.task('serve', () => {
  gulp.src('./')
    .pipe(webserver({
      livereload: true,
      directoryListing: false,
      open: true
    }));
});

// Tarefa para iniciar o BrowserSync
gulp.task('browser-sync', () => {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });

  // Monitorar os arquivos HTML para recarregar o navegador quando houver alterações
  gulp.watch('./*.html').on('change', browserSync.reload);
});

// Tarefa padrão do Gulp
gulp.task('default', gulp.parallel('serve', 'browser-sync'));
