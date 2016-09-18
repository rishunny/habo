'use strict';

angular.module('habo')
  .controller("adminCtrl", function($scope, $mdSidenav, $localStorage, $http, $mdDialog, $firebaseObject ,Auth){

    // Implementing Menu functionalities !
    // TODO: Redo it in directive make more modular

    // Firabase get user info
    var firebaseUser = Auth.$getAuth();
    if(firebaseUser){
      console.log("user email: " + firebaseUser.uid)
    }
    var ref = firebase.database().ref().child("Users/" + firebaseUser.uid);
    var obj = $firebaseObject(ref);
    $scope.fireData = obj;

    // Global variables ==========================================================
    $scope.userI = ""

    $scope.inputDataArr = [];
    $scope.waitForTitle = false;
    $scope.mainTitle = ""
    var prevdata = {type: "", data: ""}

    // JSON objects for each menu item
    $scope.menu_items = [];
    $scope.selectedElem = {type: "rootcontainer", element:""};
    $scope.userInput = "";

    $scope.ifcontainer = ""
    $scope.img_cards = [];

    $scope.free_text = ""

    // session restoration

      $scope.fireData.$loaded().then(function(data){
          if(data.menu_items){
            $localStorage.menu_items = data.menu_items
            $scope.menu_items = $localStorage.menu_items
            console.log($scope.menu_items)
            console.log("firebase menu items: " + data.menu_items)

          }
          if(data.menu_type){
            $localStorage.menu_type = data.menu_type
            $scope.menu_type = $localStorage.menu_type

          }
          if(data.selectedElem){
            $localStorage.selectedElem = data.selectedElem
            $scope.selectedElem = $localStorage.selectedElem

          }
          if(data.img_cards){
            $localStorage.img_cards = data.img_cards
            $scope.img_cards = $localStorage.img_cards

          }
          if(data.mainTitle){
            $localStorage.mainTitle = data.mainTitle
            $scope.mainTitle = $localStorage.mainTitle
          }
          if(data.mainImage){
            $localStorage.mainImage = data.mainImage
            $scope.mainImage = $localStorage.mainImage
          }
      }).catch(function(error){
        console.error("Error:", error);
      })


    // Input parsing functions ===================================================

  // temporary keyword parsing TODO: redo this implementation
  $scope.submitInput = function(currData){
    initialProcess(currData)
  }
  function initialProcess(currData){
      console.log("free text: " + $scope.free_text)
      if($scope.free_text){
        // if free text is to be proccessed get last action type
        currData.type = prevdata.type
        console.log("previous action: " + currData.type)
        // currData.data = currData.data
        parseInput(currData);
      }
      else{
        sendDataToServer(currData.data)
      }
    }

    function parseInput(currData){
      console.log($scope.selectedElem)
      prevdata = {type: currData.type, data: currData.data}
      $scope.inputDataArr.push({data: currData.type + " " + currData.data, class: "user"}); // track of all user input sentances
      if(currData.response){
        $scope.inputDataArr.push({data: currData.response, class: "bot"});
      }
      // Session storage
      $localStorage.inputDataArr = $scope.inputDataArr;
      var cparser = new Parser(currData, $scope.menu_items, $scope.selectedElem, $scope.img_cards, $localStorage, $scope.free_text)

      // Action Parser
      if(currData.type.toLowerCase() === "insert"){ // insert action
        if($scope.selectedElem.type.toLowerCase() === "menunav"){

          var res = cparser.menuAction();
          $scope.menu_items = angular.copy(res.menu_items)
          $scope.free_text = res.free_text;
          $localStorage = res.localStorage
          saveData();
        }
        else if($scope.selectedElem.type.toLowerCase() === "card"){
            var res = cparser.cardAction("insert");
            $scope.img_cards = angular.copy(res.img_cards)
            $scope.free_text = res.free_text;
            $localStorage = res.localStorage
            $scope.selectedElem = res.elem;
            saveData();
        }
        else if($scope.selectedElem.type.toLowerCase() === "rootcontainer"){
          var splitData = currData.data.toLowerCase().split(" ")

          if(splitData.length >= 2 && splitData[0] === "menunav"){
            var res = cparser.menuCreation(splitData[1])
            $scope.selectedElem = res.elem;
            $scope.menu_type = res.menu_type;
            $localStorage = res.localStorage;
            console.log($scope.selectedElem)
            console.log("menu type: " + $scope.menu_type)
            saveData();
          }
          else if(splitData[0] === "card"){
            var res = cparser.cardCreation();
            $scope.img_cards = angular.copy(res.img_cards)
            $scope.selectedElem = res.elem;
            $localStorage = res.localStorage;
            saveData();
          }
          else if(currData.data === "main title"){
            $scope.free_text = "main title";
            console.log("main title: " + $scope.free_text)
          }
          else if(currData.data === "main image"){
            $scope.free_text = "main image";
          }
          else if($scope.free_text === "main image"){
            $scope.free_text = "";
            $scope.mainImage = currData.data;
            $localStorage.mainImage = $scope.mainImage;
            saveData();
          }
          else if($scope.free_text === "main title"){
            $scope.mainTitle = currData.data;
            $scope.free_text = "";
            $localStorage.mainTitle = $scope.mainTitle;
            saveData();
          }
        }
      }
      else if(currData.type.toLowerCase() === "select" || currData.type.toLowerCase() === "delete"){ // select action
        var res = cparser.selectAction(currData.type.toLowerCase())
        $scope.selectedElem = res.elem;
        $scope.menu_items = res.menu_items
        $scope.img_cards = res.img_cards
        $localStorage = res.localStorage;
        $scope.free_text = res.free_text;
        saveData();
      }
      else if(currData.type.toLowerCase() === "reset"){ // reset session data
        var res = cparser.reset()
        $localStorage = res.localStorage;
        delete $localStorage.mainTitle;
        $scope.free_text = ""
        location.reload();
      }
      else if(currData.type.toLowerCase() === "append"){

        if($scope.selectedElem.type.toLowerCase() === "card"){
            var res = cparser.cardAction("append");
            $scope.img_cards = angular.copy(res.img_cards)
            $scope.free_text = res.free_text;
            $localStorage = res.localStorage
            $scope.selectedElem = res.elem;
            saveData();
        }
      }
      else if(currData.type.toLowerCase() === "publish"){
        var ref = firebase.database().ref().child("live/page1/");
        var obj = $firebaseObject(ref);
        $scope.liveObj = obj;
        if($localStorage.menu_items){
        $scope.liveObj.menu_items = $localStorage.menu_items
        }
        if($localStorage.menu_type){
        $scope.liveObj.menu_type = $localStorage.menu_type;
        }
        if($localStorage.img_cards){
          $scope.liveObj.img_cards = $localStorage.img_cards;
        }
        if($localStorage.mainTitle){
        $scope.liveObj.mainTitle = $localStorage.mainTitle;
        }
        if($localStorage.mainImage){
          $scope.liveObj.mainImage = $localStorage.mainImage;
        }

        $scope.liveObj.$save().then(function(ref) {
          console.log("your data has been published")
        }, function(error) {
          console.log("Error:", error);
        });

      }
    }

    // save data to firebase
    function saveData(){
      if($localStorage.menu_items){
        $scope.fireData.menu_items = $localStorage.menu_items
      }
      if($localStorage.menu_type){
        $scope.fireData.menu_type = $localStorage.menu_type;
      }
      if($localStorage.img_cards){
        $scope.fireData.img_cards = $localStorage.img_cards;
      }
      if($localStorage.mainTitle){
        $scope.fireData.mainTitle = $localStorage.mainTitle;
      }
      if($localStorage.mainImage){
        $scope.fireData.mainImage = $localStorage.mainImage;
      }
      if($localStorage.selectedElem){
        $scope.fireData.selectedElem = $localStorage.selectedElem;
      }

      $scope.fireData.$save().then(function(ref) {
        console.log("your data has been saved")
      }, function(error) {
        console.log("Error:", error);
      });

    }

    // Voice stream functions ====================================================

    var recordRTC;
    $scope.togglePulse = false;
    var recognition = new webkitSpeechRecognition();

    recognition.onend = function(){
      $scope.$apply(function(){
        $scope.togglePulse = false;
      })
    }

    recognition.onresult = function(event) {
      var final_transcript = " "
      for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript;
        }
      }
      console.log("Voice transcript: " + final_transcript)
      initialProcess({data: final_transcript})

    };


    function sendDataToServer(final_transcript){
      $http.post("http://localhost:8081/input_sentance", {data: final_transcript}).success(function(data){
        data = JSON.parse(JSON.stringify(data))
         console.log("success: " + JSON.stringify(data))
         parseInput(data)
       }).error(function(data){
         console.log("error")
       })
    }

    $scope.RecordVoice = function(){
      $scope.togglePulse = true;
      recognition.start();
    }


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

    // FAB button
    $scope.isOpen = false; // FAB icon setting

  });
