var fs = require('fs');
var express = require('express');
var router = express.Router();

var period = 3000;

setInterval(function(){

fs.readFile('genie_title.txt', 'utf8', function(error, data) {
  if(error) {
    console.log(error);
  }
  else {
    genie_title = data.toString().split("\n");
   // for(i in genie_title){
   //   console.log(genie_title[i]);
   // }
  }
});

fs.readFile('genie_artist.txt', 'utf8', function(error, data) {
  if(error) {
    console.log(error);
  }
  else {
    genie_artist = data.toString().split("\n");
   // for(i in genie_artist){
   //   console.log(genie_artist[i]);
   // }
  }
});

fs.readFile('genie_album.txt', 'utf8', function(error, data) {
  if(error) {
    console.log(error);
  }
  else {
    genie_album = data.toString().split("\n");
   // for(i in genie_album){
   //   console.log(genie_album[i]);
   // }
  }
});

fs.readFile('melon_title.txt', 'utf8', function(error, data) {
  if(error) {
    console.log(error);
  }
  else {
    melon_title = data.toString().split("\n");
  //  for(i in melon_title){
  //    console.log(melon_title[i]);
  //  }
  }
});

fs.readFile('melon_artist.txt', 'utf8', function(error, data) {
  if(error) {
    console.log(error);
  }
  else {
    melon_artist = data.toString().split("\n");
   // for(i in melon_artist){
   //   console.log(melon_artist[i]);
   // }
  }
});

fs.readFile('melon_album.txt', 'utf8', function(error, data) {
  if(error) {
    console.log(error);
  }
  else {
    melon_album = data.toString().split("\n");
   // for(i in melon_album){
   //   console.log(melon_album[i]);
   // }
  }
});

fs.readFile('mnet_title.txt', 'utf8', function(error, data) {
  if(error) {
    console.log(error);
  }
  else {
    mnet_title = data.toString().split("\n");
   // for(i in mnet_title){
   //   console.log(mnet_title[i]);
   // }
  }
});

fs.readFile('mnet_artist.txt', 'utf8', function(error, data) {
  if(error) {
    console.log(error);
  }
  else {
    mnet_artist = data.toString().split("\n");
   // for(i in mnet_artist){
   //   console.log(mnet_artist[i]);
   // }
  }
});

fs.readFile('mnet_album.txt', 'utf8', function(error, data) {
  if(error) {
    console.log(error);
  }
  else {
    mnet_album = data.toString().split("\n");
   // for(i in mnet_album){
   //   console.log(mnet_album[i]);
   // }
  }
});

fs.readFile('bugs_title.txt', 'utf8', function(error, data) {
  if(error) {
    console.log(error);
  }
  else {
    bugs_title = data.toString().split("\n");
   // for(i in mnet_album){
   //   console.log(mnet_album[i]);
   // }
  }
});

fs.readFile('naver_title.txt', 'utf8', function(error, data) {
  if(error) {
    console.log(error);
  }
  else {
    naver_title = data.toString().split("\n");
   // for(i in mnet_album){
   //   console.log(mnet_album[i]);
   // }
  }
});

router.get('/genie', function(req, res, next){
  var result1 = [];
//  var result2 = [];
//  var result3 = [];
  for (var i in genie_title){
    result1.push({title : genie_title[i]});
  }
//  for (var i in genie_artist){
//    result2.push({artist : genie_artist[i]});
//  }
//  for (var i in genie_artist){
//    result3.push({album : genie_album[i]});
//  }
  res.status(200).send({title : result1});
});

router.get('/melon', function(req, res, next){
  var result1 = [];
//  var result2 = [];
//  var result3 = [];
  for (var i in melon_title){
    result1.push({title : melon_title[i]});
  }
//  for (var i in melon_artist){
//    result2.push({artist : melon_artist[i]});
//  }
//  for (var i in melon_artist){
 //   result3.push({album : melon_album[i]});
 // }
  res.status(200).send({title : result1});
});

router.get('/mnet', function(req, res, next){
  var result1 = [];
//  var result2 = [];
//  var result3 = [];
  for (var i in mnet_title){
    result1.push({title : mnet_title[i]});
  }
//  for (var i in mnet_artist){
//    result2.push({artist : mnet_artist[i]});
//  }
//  for (var i in mnet_artist){
//    result3.push({album : mnet_album[i]});
//  }
  res.status(200).send({title : result1});
});

router.get('/bugs', function(req, res, next){
  var result1 = [];

  for (var i in bugs_title){
    result1.push({title : bugs_title[i]});
  }

  res.status(200).send({title : result1});
});

router.get('/naver', function(req, res, next){
  var result1 = [];

  for (var i in naver_title){
    result1.push({title : naver_title[i]});
  }

  res.status(200).send({title : result1});
});

}, period);

module.exports = router;
