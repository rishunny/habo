
  // input - input sentance
  // menu_items - array of items (menu), JSON objects
  // selectedElem - selected element for action
  // img_cards - array of image cards, JSON object
  // localStorage - session storage information
  function Parser(inputD, menu_items, selectedElem, img_cards, localStorage, free_text){
    this.inputD = inputD;
    this.menu_items = menu_items;
    this.selectedElem = selectedElem;
    this.img_cards = img_cards;
    this.localStorage = localStorage;
    this.free_text = free_text;
  }

// function for select action
// returns: selectedElem, localStorage
Parser.prototype.selectAction = function(isDelete){
  // var splitData = this.inputD.data.split(" ")
  // split for the first occurence of space
  // var splitData = [this.inputD.data.substr(0, this.inputD.data.indexOf(" ")), this.inputD.data.substr(this.inputD.data.indexOf(" ") + 1)]
  var tempData = this.inputD.data;
  tempData = tempData.toLowerCase();

  if(tempData && !this.free_text){
    this.selectedElem.type = tempData;
    this.selectedElem.element = "";
    // select specific element within menunav || card
    if(tempData === "item"){
      this.free_text = "select text"
      this.selectedElem.type = "menunav"
    }
    else if(tempData === "card"){
      this.free_text = "select text"
      this.selectedElem.type = "card"
    }
    console.log("free text: " + this.free_text)
  }
  else if(tempData && this.free_text){
    this.selectedElem.element = tempData;
    this.selectedElem.element = this.selectedElem.element.trim()
    console.log("log this : " + this.selectedElem.element)

    if(typeof this.selectedElem.element === "string" && this.selectedElem.type === 'card'){
      console.log("in title search")
      var index = searchCard(this.img_cards, this.selectedElem.element)
      console.log("search index: " + index)
      this.selectedElem.element = index;
    }

    // if delete
    if(isDelete === "delete"){
      this.deleteFunc();
    }

    // once free text input is executed reset it
    this.free_text = ""
  }

  // Session storage
  this.localStorage.selectedElem = this.selectedElem;
  this.localStorage.free_text = this.free_text
  this.localStorage.img_cards = this.img_cards;
  this.localStorage.menu_items = this.menu_items

  var res = {elem: this.selectedElem, img_cards: this.img_cards, menu_items: this.menu_items,free_text: this.free_text ,localStorage: this.localStorage}
  return res;
}

Parser.prototype.deleteFunc = function(){
  if(this.selectedElem.type === "menunav"){
    // console.log("in item")
    this.menu_items.splice(searchDeleteItem(this.menu_items, this.selectedElem.element), 1)
  }
  else if(this.selectedElem.type === "card"){
    this.img_cards.splice(this.selectedElem.element, 1)
  }
}

// menu model creation (name: menunav)
// returns: selectedElem, menu_type, localStorage
Parser.prototype.menuCreation = function(data){
  this.selectedElem.type = "menunav";
  this.selectedElem.element = "";
  // Session storage
  this.localStorage.menu_type = data;
  this.localStorage.selectedElem = this.selectedElem;
  var res = {elem: this.selectedElem, menu_type: data, localStorage: this.localStorage};
  return res;
}

Parser.prototype.containerCreation = function(){
  this.selectedElem.type = "container";
  this.selectedElem.element = "";

  // Session storage
  this.localStorage.ifcontainer = "container"
  this.localStorage.selectedElem = this.selectedElem;
  var res = {elem: this.selectedElem, ifcontainer: "container" , localStorage: this.localStorage};
  return res;
}

Parser.prototype.cardCreation = function(){

  if(this.inputD.data === "card"){ // create a new card

      this.img_cards.push({}) // add an empty card
      this.selectedElem.type = "card"
      this.selectedElem.element = (this.img_cards.length - 1)

      this.localStorage.selectedElem = this.selectedElem;
      this.localStorage.img_cards = this.img_cards;

  }
  res = {elem: this.selectedElem, img_cards: this.img_cards, localStorage: this.localStorage};
  return res;
}

// function for handling menu element actions
Parser.prototype.menuAction = function(){

  if(this.inputD.data === "item" && !this.free_text){
    this.free_text = "item"
  }
  else if(this.free_text === "item"){

      var newItem = { "name": this.inputD.data.toLowerCase().trim(),
                      "class": "link",
                      array: []
                    }

      if(this.selectedElem.element){
        newItem.level = 'child';
        newItem.offset = {x: 90, y: 0}
        search(this.menu_items, this.selectedElem.element, newItem);
        console.log(JSON.stringify(this.menu_items))
        // Session storage
        this.localStorage.menu_items = this.menu_items;
      }
      else{
        newItem.level = 'root';
        newItem.offset = {x: 0, y: 60}
        console.log(this.menu_items.length)
        this.menu_items.push(newItem)
        // Session storage
        this.localStorage.menu_items = this.menu_items;
      }
      // once free text input is executed reset it
      this.free_text = "";
    }
    this.localStorage.free_text = this.free_text

    var res = {menu_items: this.menu_items, free_text: this.free_text , localStorage: this.localStorage}
    return res;
  }

  Parser.prototype.cardAction = function(actionType){

    var curdata = this.inputD.data;

    // setting the type of input data for the free text
    if(!this.free_text){
      if(curdata === "image"){
        this.free_text = "image"
      }
      else if(curdata === "title"){
        this.free_text = "title"
      }
      else if(curdata === "content"){
        this.free_text = "content"
      }
      else if(curdata === "button"){
        this.free_text = "button";
      }
      else if(curdata === "video"){
        this.free_text = "video";
      }
    }
    else{
    var index = this.selectedElem.element;
    // setting the free text based on the type of input
    if(this.free_text === "image"){
      if(this.img_cards.length > index){
        var cardItem = this.img_cards[index];
        cardItem.img = curdata;
        this.img_cards[index] = cardItem
      }
    }
    else if(this.free_text === "title"){
      curdata = curdata.toLowerCase()
      if(this.img_cards.length > index){
        var cardItem = this.img_cards[index];
        if(actionType === "insert"){
          cardItem.title = curdata;
        }
        else if(actionType === "append"){
          cardItem.title = cardItem.title + " " + curdata;
        }
        this.img_cards[index] = cardItem
      }

    }
    else if(this.free_text === "content"){
      curdata = curdata.toLowerCase()
      if(this.img_cards.length > index){
        var cardItem = this.img_cards[index];
        if(actionType === "insert"){
          cardItem.content = curdata;
        }
        else if(actionType === "append"){
          cardItem.content = cardItem.content + " " + curdata;
        }
        this.img_cards[index] = cardItem
      }
    }
    else if(this.free_text === "button"){
      curdata = curdata.toLowerCase()
      if(this.img_cards.length > index){
        var cardItem = this.img_cards[index];
        if(cardItem.buttons){
          cardItem.buttons.push({name: curdata});
        }
        else{
          cardItem.buttons = []
          cardItem.buttons.push({name: curdata});
        }
        this.img_cards[index] = cardItem
      }
    }
    // once free text input is executed reset it
    this.free_text = ""
  }

    console.log("Card Action: ")
    console.log("Card array length: " + this.img_cards.length)
    console.log("Current modified card: " + JSON.stringify(this.img_cards[index]))

    // setting the locale storage variable
    this.localStorage.img_cards = this.img_cards
    this.localStorage.free_text = this.free_text

    var res = {img_cards: this.img_cards, elem: this.selectedElem ,free_text: this.free_text, localStorage: this.localStorage}
    return res;
  }

  Parser.prototype.reset = function(){
    delete this.localStorage.menu_items;
    delete this.localStorage.selectedElem;
    delete this.localStorage.menu_type;
    delete this.localStorage.inputDataArr;
    delete this.localStorage.img_cards;
    delete this.localStorage.free_text;
    delete this.localStorage.mainTitle;
    delete this.localStorage.mainImage;

    res = {localStorage: this.localStorage}
    return res;
  }

  function search(jsonArray, searchStr, newElem) {

    // if (jsonArray.length !== 0) {
      jsonArray.forEach(function(obj) {
        if (obj["name"] === searchStr) {
          obj["array"].push(newElem);
          obj["class"] = 'menu'
        } else {
          //try to update children
          if(obj.array){
            search(obj.array, searchStr, newElem);
          }
        }
      });
    // }
  };

  var searchDeleteItem = function(jsonArray, searchStr) {

    if (jsonArray.length !== 0) {
      jsonArray.forEach(function(obj, index) {
        if (obj["name"] === searchStr) {
          console.log("found item index: " + index)
          return index;
        } else {
          //try to update children
          search(obj.array, searchStr);
        }
      });
    }
  };

var searchCard = function(jsonArray, searchStr) {

    if (jsonArray.length != 0) {
        for(var i=0; i<jsonArray.length; i++) {

          if (jsonArray[i].title && jsonArray[i].title.trim() === searchStr) {
            return i;
          }
        }
    }
  };
