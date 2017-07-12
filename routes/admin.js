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
  res.render('admin', { title: 'admin' });
});


router.post('/mp_input', upload.single('mp_img') ,function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
      var sql, inserts;
        sql = 'update Music_program set mp_img = ? where mp_name = ?';
        inserts = [req.file.location, req.body.mp_name];

        connection.query(sql, inserts, function(error, rows){
        if (error){
          console.log("Connection Error" + error);
          res.sendStatus(500);
          connection.release();
        }
        else {
            res.status(201).send({result : 'success'});
            connection.release();
        }
      });
    }
  });
});

router.post('/pushcheck', function(req, res, next){
  pool.getConnection(function(error, connection){

    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }

    else {
      connection.query('select Appear.mp_name, myList.m_id from Appear, myList where myList.m_id=Appear.m_id and Appear.s_id=myList.s_id and Appear.notice = ? and myList.s_id= ?' , ['t',req.body.s_id], function(error,rows){
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

router.post('/input_musicpro',function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
      var sql, inserts;
        sql = 'insert into Music_program(mp_name, favorite_vote, sms_vote, call_vote, online_vote, mp_time, fav_period, vote_method, mp_img, what_week) values(?,?,?,?,?,?,?,?,?,?)';
        inserts = [req.body.mp_name, req.body.favorite_vote, req.body.sms_vote, req.body.call_vote, req.body.online_vote, req.body.mp_time, req.body.fav_period, req.body.vote_method, req.file.location, req.body.what_week];

        connection.query(sql, inserts, function(error, rows){
        if (error){
          console.log("Connection Error" + error);
          res.sendStatus(500);
          connection.release();
        }
        else {
          res.status(201).send({result : 'create'});
          connection.release();
        }
      });
    }
  });
});

var cpUpload1 = upload.fields([{ name: 'main_img', maxCount: 1 }, { name: 'bg_img1', maxCount: 1 }, { name: 'bg_img2', maxCount: 1 }])
router.post('/singer_input', cpUpload1 ,function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
      var sql, inserts;
        sql = 'insert into Singer(name, album_name, title_song, main_img, bg_img1, bg_img2) values(?,?,?,?,?,?)';
        inserts = [req.body.name, req.body.album_name, req.body.title_song, req.files['main_img'][0].location, req.files['bg_img1'][0].location, req.files['bg_img2'][0].location];

        connection.query(sql, inserts, function(error, rows){
        if (error){
          console.log("Connection Error" + error);
          res.sendStatus(500);
          connection.release();
        }
        else {
          res.status(201).send({result : 'create'});
          connection.release();
        }
      });
    }
  });
});


var cpUpload2 = upload.fields([{ name: 'main_img', maxCount: 1 }, { name: 'bg_img1', maxCount: 1 }])
router.post('/singer_imgupdate', cpUpload2 ,function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
      var sql, inserts;
        sql = 'update Singer set main_img = ?, bg_img1 = ? where name = ?';
        inserts = [req.files['main_img'][0].location, req.files['bg_img1'][0].location, req.body.name];

        connection.query(sql, inserts, function(error, rows){
        if (error){
          console.log("Connection Error" + error);
          res.sendStatus(500);
          connection.release();
        }
        else {
            res.status(201).send({result : 'success'});
            connection.release();
        }
      });
    }
  });
});


module.exports = router;
