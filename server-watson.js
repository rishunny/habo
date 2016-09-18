'use strict';

var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser')
var http = require('http');
var fs = require('fs')
var watson = require('watson-developer-cloud');

var conversation = watson.conversation({
  username: '6af01fbb-089e-4084-b4c9-1e8276f104da',
  password: 'Zvcl54e1bPYX',
  version: 'v1',
  version_date: '2016-07-11'
});

app.use('/bower_components',  express.static('bower_components'));
app.use(express.static('public', {maxAge: 0, etag:false}));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// app.get('/',function(req,res){
//   res.sendFile(path.join(__dirname+'/public/login.html'));
//
// });

app.listen(8081)

// Replace with the context obtained from the initial request
var context = {};

app.post("/input_sentance", function (req, res) {
  console.log("server got data: " + req.body.data)

  conversation.message({
    workspace_id: '184ea6de-dfb8-4229-9777-7e2c425f41c0',
    input: {'text': req.body.data},
    context: context
  },  function(err, response) {
    if (err){
      console.log('error:', err);
    }
    else{
      var obj = JSON.parse(JSON.stringify(response))
      console.log(JSON.stringify(response, null, 2));
      var action = "";
      var entityElem = ""
      var menuDir = "";
      var additionalInp = "";
      if(obj.intents){
        action = obj.intents[0].intent;
      }
      if(obj.entities){
        for(var i = 0; i< obj.entities.length; i++){
          if(obj.entities[i].entity === "menunavSpecific"){
            menuDir = " " + obj.entities[i].value
          }
          else if(obj.entities[i].entity === "Element"){
            entityElem = obj.entities[i].value

          }
        }
      }
      var response_text = ""
      if(obj.output.text.length != 0){
        response_text = obj.output.text[0]
      }
      var result = "";
      result = {type: action, data: entityElem + menuDir, response: response_text}
      console.log(result)
      res.send(result)
    }
  });


});
