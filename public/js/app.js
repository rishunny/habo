'use strict';

angular
  .module('habo', [
      'ngMaterial',
      'ngAnimate',
      'ngStorage',
      'ui.router',
      'ngRoute',
      'firebase'])

  .config(function($stateProvider, $urlRouterProvider, $mdThemingProvider) {

    $stateProvider
        .state("login", {
          url: "/login",
          controller: "loginCtrl",
          templateUrl: "views/login.html",
          resolve: {
            // controller will not be loaded until $waitForSignIn resolves
            // Auth refers to our $firebaseAuth wrapper in the factory below
            "currentAuth": ["Auth", function(Auth) {
              // $waitForSignIn returns a promise so the resolve waits for it to complete
              return Auth.$waitForSignIn();
            }]
          }
        })
        .state("admin", {
          url: "/admin",
          controller: "adminCtrl",
          templateUrl: "views/admin.html",
          resolve: {
             // controller will not be loaded until $requireSignIn resolves
             // Auth refers to our $firebaseAuth wrapper in the factory below
             "currentAuth": ["Auth", function(Auth) {
               // $requireSignIn returns a promise so the resolve waits for it to complete
               // If the promise is rejected, it will throw a $stateChangeError (see above)
               return Auth.$requireSignIn();
             }]
           }
        })
        .state("live", {
          url: "/live/:pageId",
          controller: "liveCtrl",
          templateUrl: "views/live.html"
        });

        $urlRouterProvider.otherwise('/login');


      // Theme config ================================================================
      $mdThemingProvider.theme('theme1')
        .primaryPalette('indigo')
        .accentPalette('orange');

      $mdThemingProvider.theme('theme2')
        .primaryPalette('teal')
        .accentPalette('lime');

      $mdThemingProvider.theme('theme3')
        .primaryPalette('purple')
        .accentPalette('red');

      $mdThemingProvider.theme('theme4')
        .primaryPalette('cyan')
        .accentPalette('deep-orange');

      $mdThemingProvider.theme('theme5')
        .primaryPalette('blue-grey')
        .accentPalette('pink');

        $mdThemingProvider.theme('docs-dark', 'default')
          .primaryPalette('yellow')
          .dark();

    })

    .run(function($rootScope, $state) {

    $rootScope.$on('$stateChangeError', function (event, toState, toParams, error) {

      if (error === "AUTH_REQUIRED") {
        $state.go("login");
      }
      // event.preventDefault()
      // alert(JSON.stringify(error))
      // if (error) {
      //   console.log("error")
      //   alert("no user in error")
      //   $state.go('login');
      // }
    });

  });
