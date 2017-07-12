var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

var period = 300000;
var url = 'http://music.bugs.co.kr/chart/track/realtime/total';


setInterval( function(){

var jbAry = new Array([]);

  request.get(url, function(err, response, body){

   var $ = cheerio.load(body);

   var postElements=$("th p.title a");

   postElements.each(function() {
       var postTitle = $(this).text()+'\r\n';
       jbAry += postTitle;
   });

   fs.writeFile('bugs_title.txt', jbAry, 'utf-8', function(error) {
         console.log('writeFile completed');
   });

  });

}, period);
