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
  res.render('comment', { title: 'comment' });
});

router.get('/getList/:b_id',function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
      console.log("시작");
      var sql, inserts;
        sql = 'select Member.nickname, Comment.c_content, Comment.time from Comment, Member where Comment.m_id=Member.m_id and b_id=?';
        inserts = [req.params.b_id];


        connection.query(sql, inserts, function(error, rows){
        if (error){
          console.log("Connection Error" + error);
          res.sendStatus(500);
          connection.release();
        }
        else {
          res.status(201).send({board : rows});
          connection.release();
        }
      });
    }
  });
});

router.post('/addComment', function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }

    else{
      var sql, inserts;
        sql = 'insert into Comment(b_id, m_id, c_content, time) values(?,?,?,?)';
        inserts = [req.body.b_id, req.body.m_id, req.body.c_content, req.body.time];

        connection.query(sql, inserts, function(error, rows){
          console.log(req.body);

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

router.get('/updateComment/:c_id', function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
        connection.query('update Board set b_content=? where c_id=?', [req.params.c_id], function(error, rows){
        if (error){
          console.log("Connection Error" + error);
          res.sendStatus(500);
          connection.release();
        }
        else {
          res.status(201).send({result : 'update'});
          connection.release();
        }
      });
    }
  });
});


router.get('/deleteComment/:c_id', function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }

    else{

        connection.query('delete from Comment where c_id=?', [req.params.c_id], function(error, rows){
        if (error){
          console.log("Connection Error" + error);
          res.sendStatus(500);
          connection.release();
        }
        else {
          res.status(201).send({result : 'delete'});
          connection.release();
        }

      });
    }
  });
});

module.exports = router;
