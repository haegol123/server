var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

var period = 300000;
var url = 'http://www.genie.co.kr/chart/top100?ditc=D&rtm=Y';


setInterval( function(){

var jbAry = new Array([]);
var jbAry2 = new Array([]);
var jbAry3 = new Array([]);

  request.get(url, function(err, response, body){

   var $ = cheerio.load(body);

   var postElements=$("span.music_area a.title");
   var postElements2=$("span.music_area a.artist");
   var postElements3=$("span.music_area a.albumtitle");

   postElements.each(function() {
       var postTitle = $(this).text()+'\n';
       jbAry += postTitle;
   });
   postElements2.each(function() {
       var postTitle2 = $(this).text()+'\n';
       jbAry2 += postTitle2;
   });
   postElements3.each(function() {
       var postTitle3 = $(this).text()+'\n';
       jbAry3 += postTitle3;
   });

   fs.writeFile('genie_title.txt', jbAry, 'utf-8', function(error) {
         console.log('writeFile completed');
   });
   fs.writeFile('genie_artist.txt', jbAry2, 'utf-8', function(error) {
         console.log('writeFile completed');
   });
   fs.writeFile('genie_album.txt', jbAry3, 'utf-8', function(error) {
         console.log('writeFile completed');
   });

  });

}, period);
