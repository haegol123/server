var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

var period = 300000;
var url = 'http://www.melon.com/chart/';


setInterval( function(){

var jbAry = new Array([]);
var jbAry2 = new Array([]);
var jbAry3 = new Array([]);

  request.get(url, function(err, response, body){

   var $ = cheerio.load(body);

   var postElements=$("div.wrap_song_info div span strong");
   var postElements2=$("div.wrap_song_info div div span.checkEllipsis a.play_artist span");
   var postElements3=$("div.wrap_song_info div div a.fc_mgray");

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

   fs.writeFile('melon_title.txt', jbAry, 'utf-8', function(error) {
         console.log('writeFile completed');
   });
   fs.writeFile('melon_artist.txt', jbAry2, 'utf-8', function(error) {
         console.log('writeFile completed');
   });
   fs.writeFile('melon_album.txt', jbAry3, 'utf-8', function(error) {
         console.log('writeFile completed');
   });

  });

}, period);
