'use strict';

angular.module('habo')
  .controller('liveCtrl', function ($scope, $stateParams ,$firebaseObject) {

    // session restoration
    console.log("page id: " + $stateParams.pageId)
    var ref = firebase.database().ref().child("live/" + $stateParams.pageId);
    var obj = $firebaseObject(ref);
    $scope.fireData = obj;


    $scope.fireData.$loaded().then(function(data){
        if(data.menu_items){
          $scope.menu_items = data.menu_items
          console.log($scope.menu_items)
          console.log("firebase menu items: " + data.menu_items)

        }
        if(data.menu_type){
          $scope.menu_type = data.menu_type

        }
        if(data.img_cards){
          $scope.img_cards = data.img_cards

        }
        if(data.mainTitle){
          $scope.mainTitle = data.mainTitle
        }
        if(data.mainImage){
          $scope.mainImage = data.mainImage
        }
    }).catch(function(error){
      console.error("Error:", error);
    })

    // vertical menu functions ===================================================
    $scope.toggleLeft = buildToggler('left');
    $scope.toggleRight = buildToggler('right');

    function buildToggler(componentId) {
      return function() {
        $mdSidenav(componentId).toggle();
      }
    }
    $scope.hideit = false;
    $scope.toggleInput = function(){
      $scope.hideit = !$scope.hideit;
    }

  });
