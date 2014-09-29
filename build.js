var extname = require('path').extname;
var Metalsmith = require('metalsmith');

var markdown = require('metalsmith-markdown');
var permalinks = require('metalsmith-permalinks');
var templates = require('metalsmith-templates');
var drafts = require('metalsmith-drafts');
var watch = require('metalsmith-watch');
var branch = require('metalsmith-branch');
var collections = require('metalsmith-collections');
var title = require('metalsmith-title');
var ignore = require('metalsmith-ignore');
var excerpts = require('metalsmith-excerpts');
var asset = require('metalsmith-static');
var debug = require('metalsmith-debug');
var beautify = require('metalsmith-beautify');
var metadata = require('metalsmith-metadata');
var autoprefixer = require('metalsmith-autoprefixer');

// metalsmith-clean-css
// metalsmith-uglify

/**
 * Build.
 */

var metalsmith = Metalsmith(__dirname);

metalsmith
  .source("./content")
  .destination("./deploy")

  .clean(true)

  //set global metadata
  .metadata({
    "author": {
      "name": "Mayo Jordanov",
      "email": "mayo@oyam.ca",
      "twitter": "@oyam"
    },

    "site": {
      "description": "Mayo Jordanov; software developer, photographer, climber, runner, hiker, adventurer, explorer",
      "keywords": "mayo jordanov software development photography adventure explore climbing running hiking consulting tech javascript design",
    },

    "now": new Date(),

    "production": process.env.PRODUCTION == 1
  })

  .use(asset([
    //load normalize.css from module to keep it up to date more easily
    {
      "src": "node_modules/normalize.css/normalize.css",
      "dest": "media/css/normalize.css"
    },
    //microevent for slideshow
    {
      "src": "node_modules/microevent/microevent.js",
      "dest": "media/js/microevent.js"
    }
  ]))

  //ignore temp files
  .use(ignore([
    '**/.*.swp',
    '**/.DS_Store',
  ]))

  .use(metadata({
    "slides": "slides.json"
  }))

  .use(title())

  .use(drafts())

  .use(markdown())

  .use(branch("blog/*/**")

    .use(setMetadata({ 'template': 'blog/article.html' }))

    .use(excerpts())

    .use(permalinks({
      'relative': false
    }))
  )

  .use(collections({
    "articles": {
      "pattern": "blog/*/**",
      "sortBy": 'created',
      reverse: true
    }
  }))

  .use(templates({
    "engine": "swig",
    "directory": "templates",

    "autoescape": false,

    "extendsPattern": '{% extends "%s" %}',
    "blockPattern": [ '{% block %s %}', '{% endblock %}' ]
  }))

  .use(autoprefixer())

  .use(beautify({
    "indent_size": 2,
    "indent_char": " "
  }))

  .use(debug())
  ;

if (process.env.WATCH) {
  metalsmith
    .use(watch({
      livereload: false
    }));
}


metalsmith
  .build(function(err){
    if (err) throw err;
  });

function setMetadata(options) {
  /**
   * Set Metadata plugin.
   *
   * @param {Object} files
   * @param {Metalsmith} metalsmith
   * @param {Function} done
   */
  return function(files, metalsmith, done){
    Object.keys(files).forEach(function(file) {
      Object.keys(options).forEach(function(key) {
        files[file][key] = options[key];
      })
    })

    done();
  }
}

