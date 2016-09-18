'use strict';

angular.module('habo')
  .controller('loginCtrl', function ($scope, $state, $firebaseAuth) {

    var auth = $firebaseAuth();

    // login with type
    $scope.login = function(type){
      auth.$signInWithPopup(type).then(function(firebaseUser) {
        console.log("Signed in as:", firebaseUser.uid);
        $state.go('admin');
      }).catch(function(error) {
        console.log("Authentication failed:", error);
      });
    }

    $scope.logout = function(){
      auth.$signOut()
      console.log("you signed out")
    }



  });
