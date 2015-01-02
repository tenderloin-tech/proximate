// Karma configuration
// Generated on Fri Dec 19 2014 18:49:01 GMT-0800 (PST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'sinon'],


    // list of files / patterns to load in the browser
    files: [
      /* add files here */
      /* Ionic dependencies */
      './mobile/www/lib/ionic/js/angular/angular.js'
      , './mobile/www/lib/ionic/js/angular/angular-animate.js'
      , './mobile/www/lib/ionic/js/angular/angular-resource.js'
      , './mobile/www/lib/ionic/js/angular/angular-sanitize.js'
      , './mobile/www/lib/ionic/js/angular-ui/angular-ui-router.js'
      , './mobile/www/lib/pubnub/pubnub.min.js'
      , './mobile/www/lib/ionic/js/ionic.js'
      , './mobile/www/lib/ionic/js/ionic-angular.js'
      , './node_modules/angular-mocks/angular-mocks.js'
      /* Cordova plugins */
      , './mobile/platforms/ios/platform_www/cordova.js'
      /*, './mobile/plugins/com.unarin.cordova.beacon/www/Delegate.js'
      , './mobile/plugins/com.unarin.cordova.beacon/www/LocationManager.js'
      , './mobile/plugins/com.unarin.cordova.beacon/www/Regions.js'
      , './mobile/plugins/com.jcesarmobile.IDFVPlugin/www/IDFVPlugin.js' */
      /* Actual mobile files */
      , './mobile/www/js/*.js'
      , './mobile/www/js/services/localstorageFactory.js'
      , './mobile/www/js/services/*.js'
      /* Test suites */
      , './test/spec/**/*.js'
      , './test/mobile/**/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      /*'./mobile/plugins/com.unarin.cordova.beacon/www/*.js': ['commonjs'] */
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],

    plugins: [
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'karma-commonjs',
      'karma-sinon'
    ],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
