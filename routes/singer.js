var express = require('express');
var mysql = require('mysql');
var aws = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');
var db_config = require('../config/db_config.json');
var router = express.Router();

aws.config.loadFromPath('./config/aws_config.json');

var s3 = new aws.S3();

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'sopt-ch',
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, Date.now() + '.' + file.originalname.split('.').pop());
    }
  })
});


var pool = mysql.createPool({
  host : db_config.host,
  port : db_config.port,
  user : db_config.user,
  password : db_config.password,
  database : db_config.database,
  connectionLimit : db_config.connectionLimit
});

router.get('/', function(req, res, next) {
  res.render('singer', { title: 'singer' });
});



router.get('/singerInfo/:s_id', function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
      connection.query('select album_name, title_song, main_img, bg_img1, name from Singer where s_id = ?',
       [req.params.s_id], function(error, rows){
        if (error){
          console.log("Connection Error" + error);
          res.sendStatus(500);
          connection.release();
        }
        else {
          res.status(200).send({result : rows[0]});
          connection.release();
        }
      });
    }
  });
});

router.get('/mpInfo/:s_id/:m_id', function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
      connection.query('select Music_program.mp_name, Music_program.favorite_vote, Music_program.sms_vote, Music_program.call_vote, Music_program.online_vote, Music_program.mp_time, Music_program.fav_period, Music_program.vote_method, Music_program.mp_img, Music_program.what_week, Appear.fav_complete, Appear.cur_complete from Appear, Music_program where Appear.s_id = ? and Appear.m_id=? and Appear.mp_name = Music_program.mp_name',
       [req.params.s_id,req.params.m_id], function(error, rows){
        if (error){
          console.log("Connection Error" + error);
          res.sendStatus(500);
          connection.release();
        }
        else {
          res.status(200).send({result : rows});
          connection.release();
        }
      });
    }
  });
});

router.get('/singer_allview', function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
      connection.query('select * from Singer order by count desc', function(error, rows){
        if (error){
          console.log("Connection Error" + error);
          res.sendStatus(500);
          connection.release();
        }
        else {
          res.status(200).send({result : rows});
          connection.release();
        }
      });
    }
  });
});

router.get('/singer_search/:s_id', function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
      connection.query('select * from Singer where s_id = ?', [req.params.s_id], function(error, rows){
        if (error){
          console.log("Connection Error" + error);
          res.sendStatus(500);
          connection.release();
        }
        else {
          res.status(200).send({result : rows[0]});
          connection.release();
        }
      });
    }
  });
});

module.exports = router;
