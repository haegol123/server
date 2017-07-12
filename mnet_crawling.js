var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

var period = 300000;
var url = 'http://www.mnet.com/chart/TOP100';


setInterval( function(){

var jbAry = new Array([]);
var jbAry2 = new Array([]);
var jbAry3 = new Array([]);

  request.get(url, function(err, response, body){

   var $ = cheerio.load(body);

   var postElements=$("a.MMLI_Song");
   var postElements2=$("a.MMLIInfo_Artist");
   var postElements3=$("a.MMLIInfo_Album");

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

   fs.writeFile('mnet_title.txt', jbAry, 'utf-8', function(error) {
         console.log('writeFile completed');
   });
   fs.writeFile('mnet_artist.txt', jbAry2, 'utf-8', function(error) {
         console.log('writeFile completed');
   });
   fs.writeFile('mnet_album.txt', jbAry3, 'utf-8', function(error) {
         console.log('writeFile completed');
   });

  });

}, period);
