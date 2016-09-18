'use strict';

angular.module('habo')
  .directive("horizMenu", function(){
    return{
      restrict: "E",
      scope: {itemData: "="},
      templateUrl: "views/horiz-menu.html"
    }
  })
  .directive("vertMenu", function(){
    return{
      restrict: "E",
      scope: {itemData: "="},
      templateUrl: "views/vert-menu.html?1"
    }

  })
  .directive("customCard", function(){
      return{
        restrict: "E",
        scope: "=",
        templateUrl: "views/custom-card.html"
      }
  }).factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {
    return $firebaseAuth();
  }
  ]);
