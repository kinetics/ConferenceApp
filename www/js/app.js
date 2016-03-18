// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'monospaced.qrcode', 'twitterLib', 'templates',  'starter.controllers', 'directives.dropdown', 'twitterFeed.filters', 'starter.services', 'ngCordova', 'ngResource','twitter.services', 'ionic', 'twitter.controllers'])

  .run(function($ionicPlatform) {

  $ionicPlatform.ready(function() {

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $compileProvider, $httpProvider, $sceDelegateProvider, $ionicConfigProvider) {
    $ionicConfigProvider.views.maxCache(1);
    $ionicConfigProvider.views.transition('none');
    $ionicConfigProvider.tabs.position('bottom');

    $compileProvider.directive('compile', function ($compile) {
      // directive factory creates a link function
      return function (scope, element, attrs) {
        scope.$watch(
          function (scope) {
            // watch the 'compile' expression for changes
            return scope.$eval(attrs.compile);
          },
          function (value) {
            // when the 'compile' expression changes
            // assign it into the current DOM
            element.html(value);

            // compile the new DOM and link it to the current
            // scope.
            // NOTE: we only compile .childNodes so that
            // we don't get into infinite loop compiling ourselves
            $compile(element.contents())(scope);
          }
        );
      };
    });

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive

    .state('splash', {
      url: '/splash',
      templateUrl: 'intro.html',
      controller: 'SplashCtrl'
    })

    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'tabs.html',
    controller: 'AppCtrl'
  })

  // Each tab has its own nav history stack:

    .state('tab.updates', {
      url: '/updates',
      views: {
        'menuContent': {
          templateUrl: 'updates_and_settings.html',
          controller: 'UpdateCtrl'
        }
      }
    })

    .state('tab.networking', {
      url: '/networking',
      views: {
        'menuContent': {
          templateUrl: 'networking.html',
          controller: 'NetworkingCtrl'
        }
      }
    })

  .state('tab.dash', {
    url: '/dash',
    views: {
      'menuContent': {
        templateUrl: 'tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

    .state('tab.sessionDetail', {
      url: '/schedule/:sessionid',
      views: {
        'menuContent' : {
          templateUrl: 'tab-sessiondetail.html',
          controller: 'SessionDetailCtrl'
        }
      }
    })

    .state('tab.schedule', {
      url: '/schedule',
      views: {
        'menuContent' : {
          templateUrl: 'tab-schedule.html',
          controller: 'ScheduleCtrl'
        }
      }
    })

    .state('tab.speakers', {
      url: '/speakers',
      views: {
        'menuContent' : {
          templateUrl: 'tab-speakers.html',
          controller: 'SpeakerCtrl'
        }
      }
    })

    .state('tab.speakerDetail', {
      url: '/speakers/:speakerid',
      views: {
        'menuContent': {
          templateUrl: 'tab-speakers-detail.html',
          controller: 'SpeakerDetailCtrl'
        }
      }
    })

    .state('tab.twitter', {
      url: '/twitter',
      views: {
        'menuContent' : {
          templateUrl: 'tab-twitter.html',
          controller: 'TwitterCtrl'
        }
      }
    })

  .state('tab.chats', {
      url: '/chats',
      views: {
        'menuContent': {
          templateUrl: 'tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'menuContent': {
          templateUrl: 'chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

    .state('tab.sponsors', {
      url: '/sponsors',
      views: {
          'menuContent' : {
            templateUrl : 'tab-sponsors.html',
            controller: 'SponsorsCtrl'
          }
      }
    })

  .state('tab.alerts', {
    url: '/alerts',
    views: {
      'menuContent' : {
        templateUrl : 'tab-alerts.html',
        controller: 'AlertsCtrl'
      }
    }
  })

  .state('tab.general', {
    url: '/general',
    views : {
      'menuContent' : {
        templateUrl : 'tab-general.html',
        controller: 'GeneralCtrl'
      }
    }
  })

  .state('tab.map', {
    url: '/map',
    views: {
      'menuContent' : {
        templateUrl : 'tab-map.html',
        controller: 'MapCtrl'
      }
    }
  })
  .state('tab.account', {
    url: '/account',
    views: {
      'menuContent': {
        templateUrl: 'tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });
  $httpProvider.interceptors.push('authInterceptor');
  $httpProvider.interceptors.push(function ($q) {
      return {
        request: function(config) {
          if (config.url.split('/')[0] === 'api'){
            config.url = 'http://conjs.cloudapp.net:80/' + config.url;
            console.log(config.url);
          }
          return config || $q.when(config);
        }
      };
    });

    $sceDelegateProvider.resourceUrlWhitelist(['self', 'http://conjs.cloudapp.net' ]);
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/dash');

});
