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
  res.render('board', { title: 'board' });
});

router.get('/getList/:s_id/:m_id',function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
      console.log("시작");
      var sql, inserts;
        sql = 'SELECT board_view.b_id, board_view.b_content, board_view.b_time, board_view.name, board_view.bg_img1, board_view.img, board_view.m_id, board_view.nickname, board_view.profile_img, COUNT(Comment.c_id) c_count, board_view.like_count, board_view.dislike_count, (select B_Like.is_like from B_Like B_Like where B_Like.b_id=board_view.b_id and B_Like.m_id=?) is_like  FROM board_view left join Comment on board_view.b_id = Comment.b_id where board_view.s_id=? group by board_view.b_id order by board_view.b_time desc';
        inserts = [req.params.m_id,req.params.s_id];


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

router.post('/addBoard', upload.single('img') , function(req, res, next) {
  pool.getConnection(function(error, connection){
    console.log("1");
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }

    else{
      var sql, inserts;
      console.log("2");
      console.log(req.file);
      if(req.file){
        sql = 'insert into Board(s_id, m_id, b_content, b_time, img) values(?,?,?,?,?)';
        inserts = [req.body.s_id, req.body.m_id, req.body.b_content, req.body.b_time, req.file.location];
      }
      else{
        sql = 'insert into Board(s_id, m_id, b_content, b_time, img) values(?,?,?,?,?)';
        inserts = [req.body.s_id, req.body.m_id, req.body.b_content, req.body.b_time, ' '];
      }

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

router.get('/deleteBoard/:b_id', function(req, res, next) {
  pool.getConnection(function(error, connection){
    console.log("1");
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
        connection.query('delete from Board where b_id=?', [req.params.b_id], function(error, rows){
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

router.get('/updateBoard/:b_id', function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
        connection.query('update Board set b_content=? where b_id=?', [req.params.b_id], function(error, rows){
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

router.post('/like_status', function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
      var insert;
      var sql1, sql2, sql3;
      insert1 = [req.body.b_id, req.body.m_id];
      insert2 = [req.body.b_id, req.body.m_id, req.body.is_like];
      sql1 = 'select * from B_Like where b_id=? and m_id=?';
      sql2 = 'delete from B_Like where b_id=? and m_id=?';
      sql3 = 'insert into B_Like(b_id, m_id, is_like) values(?,?,?)';

      connection.query(sql1, insert1, function(error, rows){
        if (error){
          console.log("connection error" + error);
          connection.release();
        }
        else {
          console.log(rows);
          if(!rows.length) {
            connection.query(sql3, insert2, function(error, rows){
              if (error){
                console.log("connection error" + error);
                connection.release();
              }
              else {
                  res.status(200).send({result : 'insert complete'});
                  connection.release();
              }
            });
          }
          else {
            connection.query(sql2, insert1, function(error, rows){
              if (error){
                console.log("connection error" + error);
                connection.release();
              }
              else {
                console.log(req.body.b_id);
                console.log(req.body.m_id);
                console.log(req.body.is_like);
                  res.status(200).send({result : 'delete complete'});
                  connection.release();
              }
            });
          }
        }
      });
    }
  });
});



module.exports = router;
