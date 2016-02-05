var
  gulp = require('gulp'),
  run = require('gulp-run'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  request = require('request'),
  path = require('path'),
  fs = require('fs'),
  gutil = require('gulp-util'),
  chalk = require('chalk');


/**
 * Configuration supplied by pom.xml
 */
var
  parser = require('xml2json'),
  xml = fs.readFileSync('pom.xml', 'utf8'),
  pom = parser.toJson(xml, {object: true});

var config = {
  project       : pom.project.artifactId,
  username      : pom.project.properties['crx.username'],
  password      : pom.project.properties['crx.password'],
  host          : pom.project.properties['crx.host'],
  port          : pom.project.properties['crx.port'],
  jcrRoot       : 'content/src/main/content/jcr_root/'
};

config.fileLocations = config.jcrRoot + '**/*{.css,.less,.js,.jsp,.jpg,.png,.txt}';

config.localUrl = [
  'http://',
  config.username,
  ':',
  config.password,
  '@',
  config.host,
  ':',
  config.port,
  '/'
].join('');

config.devUrl = [
  'http://admin:admin@author-',
  config.project,
  '-aem.meltdemo.com/'
].join('');


/**
 * Colors
 **/
var
  errorbold = chalk.bold.red,
  error = chalk.bold.red,
  allgood = chalk.green,
  allgoodbold = chalk.bold.green,
  gray = chalk.gray;


/** Tasks **/

/**
 * Watch for changes and upload to local server
 **/
gulp.task('local', ['sass:watch'], function () {
  gulp.watch(config.fileLocations, function (e) {
    postToSling(e.path, config.localUrl);
  });
});


/**
 * Watch for changes and upload to meltdemo server
 **/
gulp.task('dev', ['sass:watch'], function () {
  gulp.watch(config.fileLocations, function (e) {
    postToSling(e.path, config.devUrl);
  });
});


/**
 * Compile / push to local server
 **/
gulp.task('compile', ['sass'], function () {
  run('mvn -PautoInstallPackage clean install').exec();
});


/**
 * Compile sass with sourcemaps
 **/
gulp.task('sass', function () {
  var dest = '/etc/designs/' + config.project + '/clientlibs/css/';

  gulp.src('./sass/all.scss')
    .pipe(sourcemaps.init())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(sourcemaps.write('./maps', {
        sourceMappingURLPrefix : dest
      }))
    .pipe(gulp.dest(config.jcrRoot + dest));
});


/**
 * Watch sass files for changes
 */
gulp.task('sass:watch', function () {
  gulp.watch('./sass/**/*.scss', ['sass']);
});


/**
 * Install to dev server
 **/
gulp.task('install', ['sass'], function () {
  var server = 'author-' + config.project + '-aem.meltdemo.com';
  run('mvn -PautoInstallPackage clean install -Dcrx.host=' + server + ' -Dcrx.port=80').exec();
});


/**
 * Send POST to sling with our changed file
 **/
function postToSling(src, url) {
  var
    dest = src,
    result, status, message, location;

  if (path.dirname(dest).indexOf('jcr_root/') !== -1) {
    dest = dest.substring(path.dirname(dest).indexOf('jcr_root/') + 9);
  }

  var req = request.post(url + path.dirname(dest), function (err, resp, body) {
    if (err) {
      gutil.log(errorbold(err));
    } else {
      if (body.length) {
        result = JSON.parse(body);
        status = result['status.code'];
        message = result['status.message'];
        location = result.location;

        if (status === 200 || status === 201) {
          gutil.log(allgoodbold('File Upload Successful: ') +
            allgood(status) + ' - ' + allgood(message));
          gutil.log(allgoodbold('Uploaded To: ') + allgoodbold(location));
        } else {
          gutil.log(errorbold('File Upload Failed: ') +
            error(status) + ' - ' + error(message));
        }
      }
    }
  });

  req.setHeader('Accept', 'application/json');
  var form = req.form();
  form.append('*', fs.createReadStream(src), {
    "@TypeHint" : "nt:file"
  });
}
