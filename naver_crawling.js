var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

/////naver 는 title 만 구현 하기로 함.
var period = 300000;
var url = 'http://music.naver.com/listen/top100.nhn?domain=TOTAL&duration=1h';


setInterval( function(){

var jbAry = new Array([]);
var jbAry2 = new Array([]);
var jbAry3 = new Array([]);

  request.get(url, function(err, response, body){

   var $ = cheerio.load(body);

   var postElements=$("td.name span.ellipsis");
//   var postElements2=$("td[class~='_artist'] span.ellipsis");
//   var postElements3=$("span.m_ell a._interest");

   postElements.each(function() {
       var postTitle = $(this).text()+'\r\n';
       jbAry += postTitle;
   });
  //  postElements2.each(function() {
  //      var postTitle2 = $(this).text()+'\r';
  //      jbAry2 += postTitle2;
  //  });
  //  postElements3.each(function() {
  //      var postTitle3 = $(this).text()+'\r\n';
  //      jbAry3 += postTitle3;
  //  });

   fs.writeFile('naver_title.txt', jbAry, 'utf-8', function(error) {
         console.log('writeFile completed');
   });
  //  fs.writeFile('naver_artist.txt', jbAry2, 'utf-8', function(error) {
  //        console.log('writeFile completed');
  //  });
  //  fs.writeFile('naver_album.txt', jbAry3, 'utf-8', function(error) {
  //        console.log('writeFile completed');
  //  });

  });

}, period);
