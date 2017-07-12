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
  res.render('member', { title: 'member' });
});

router.post('/ch_notice', function(req, res, next){
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else {
	console.log(req.params.m_id);
      var inserts;
      inserts = [req.body.notice, req.body.m_id, req.body.name, req.body.mp_name];

      connection.query('update Appear set Appear.notice=? where Appear.m_id=? and Appear.s_id=(select Singer.s_id from Singer where Singer.name=?) and Appear.mp_name=?',
      inserts, function(error,rows){
        if(error){
          console.log("Connection Error" + error);
          res.sendStatus(500);
        }
        else{
		console.log(req.body.m_id);
		console.log(req.body.name);
		console.log(req.body.mp_name);
		console.log(req.body.notice);
          res.status(200).send({result : 'true'});
        }
        connection.release();
      });
    }
  });
});

router.get('/getNotice/:m_id', function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
      connection.query('select Singer.name, Appear.mp_name, Appear.notice from Appear, Singer where Appear.s_id=Singer.s_id and Appear.m_id=?',
	[req.params.m_id], function(error, rows){
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

router.get('/myList_output/:m_id', function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
      connection.query('select myList.is_most, Singer.name, Singer.main_img from Member,myList,Singer where Member.m_id=? and Member.m_id=myList.m_id and Singer.s_id=myList.s_id',
	[req.params.m_id], function(error, rows){
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

router.post('/member_input', upload.single('profile_img') ,function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
      var sql1, sql2, inserts1, inserts2;
        sql1 = 'insert into Member(email, nickname, profile_img, kind_sns) values(?,?,?,?)';
        sql2 = 'insert into myList(m_id, s_id, is_most) values((select m_id from Member where email=?),?,?)';
        if(req.file){
          inserts1 = [req.body.email, req.body.nickname, req.file.location, req.body.kind_sns];
        }
        else{
          inserts1 = [req.body.email, req.body.nickname, ' ', req.body.kind_sns];
        }

        inserts2 = [req.body.email, req.body.s_id, 't'];
        connection.query(sql1, inserts1, function(error, rows){
        if (error){
          console.log("Connection Error" + error);
          res.sendStatus(500).send({result : 'false'});
          connection.release();
        }
        else {
          connection.query(sql2, inserts2, function(error, rows){
            if (error){
              console.log("Connection Error" + error);
              res.sendStatus(500).send({result : 'false'});
              connection.release();
            }
            else {
              connection.query('insert into Appear(s_id, m_id, mp_name) values(?,(select m_id from Member where email=?),?)', [req.body.s_id, req.body.email, '인기가요'], function(error, rows){
                if (error){
                  console.log("search myList : Connection Error" + error);
                  connection.release();
                }
                else {

              console.log("else문 가자!!");
              //Member 테이블에 정보를 입력했다면 member에 대한 정보들을 반환해준다.
              connection.query('select * from Member where email = ? and kind_sns = ?', [req.body.email, req.body.kind_sns], function(error, rows_1){
                if (error){
                  console.log("Connection Error" + error);
                  res.sendStatus(500).send({result : 'false'});
                  connection.release();
                }
                else {
                  console.log("else문 가자222");
			            console.log(req.body);
                  //member 의 최애가수와 차애가수의 리스트를 rows_2에 담아둔다.
                  connection.query('select Singer.s_id, Singer.name, Singer.bg_img1, A.is_most from (select myList.is_most, myList.s_id, myList.m_id from myList where myList.m_id=(select Member.m_id from Member where Member.email=?)) as A, Singer where A.s_id=Singer.s_id', [req.body.email], function(error, rows_2){
                    if (error){
                      console.log("Connection Error" + error);
                      res.sendStatus(500).send({result : 'false'});
                      connection.release();
                    }
                    else {
                      res.status(201).send({member : rows_1, list : rows_2});
                      connection.release();
                    }
                  });
                }
              });
            }
          });
            }
          });
        }
      });
    }
  });
});

router.post('/find_member', function(req, res, next) {
  pool.getConnection(function(error, connection){
	console.log("빠밤");
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
      connection.query('select * from Member where email = ? and kind_sns = ?', [req.body.email, req.body.kind_sns], function(error, rows_1){
	       console.log("시작");
         console.log(req.body);
        if (error){
          console.log("search email : Connection Error" + error);
          connection.release();
        }
        else {
          if(!rows_1.length)
          {
	           console.log("0");
              res.status(200).send({result : 'false'});
	             connection.release();
          }
          else {
            console.log("1");
            connection.query('select Singer.s_id, Singer.name,Singer.title_song, Singer.bg_img1, `A`.is_most from (select myList.is_most, myList.s_id, myList.m_id from myList where myList.m_id=(select Member.m_id from Member where Member.email=?)) as A, Singer where A.s_id=Singer.s_id', [req.body.email], function(error, rows_2){
              if (error){
                console.log("Connection Error" + error);
                res.sendStatus(500);
                connection.release();
              }
              else {
                res.status(201).send({member : rows_1, list : rows_2});
                connection.release();
              }
            });
          }
        }
      });
    }
  });
});


router.get('/n_check/:nickname', function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);

    }
    else{
      connection.query('select nickname from Member where nickname=? ',
	[req.params.nickname], function(error, rows){
        if (error){
          console.log("Connection Error" + error);
          res.sendStatus(500);
          connection.release();
        }

        else {

          if(rows.length===0)
          {
              res.status(200).send({result : 'false'});

          }
          else {
            res.status(200).send({result : 'true'});

          }
          connection.release();
        }

      });

    }
  });
});

router.get('/ch_singer/:m_id/:s_id', function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);

    }
    else{
	     console.log(req.params);
       var sql1, sql2, insert1, insert2;
       sql1 = 'update Singer set count = count + 1 where s_id = ?';
       insert1 = [req.params.s_id];
       //먼저 최애가수였던 가수를 차애가수로 변경한다.
       connection.query('update myList set is_most=? where m_id = ? and is_most=?',
	     ['f', req.params.m_id, 't'], function(error, rows){
         if (error){
          console.log("Connection Error" + error);
          res.sendStatus(500);
          connection.release();
        }
        else {
	         console.log("첫번째");
             connection.query('update myList set myList.is_most=? where myList.m_id = ? and myList.s_id = ?',
             ['t', req.params.m_id, req.params.s_id], function(error, rows){
             if (error){
               console.log("search email : Connection Error" + error);
               connection.release();
             }
             else {
    	            console.log("1");
                  connection.query(sql1, insert1, function(error, rows){
                    if(error)
                    {
                      console.log("Connection Error" + error);
                      connection.release();
                    }
                    else {
                      res.status(201).send({result : 'change'});
                       connection.release();

                    }
                  }

                );

            }
          });
      }});
    }
  });
});


router.post('/myList_input',function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }

    else{
      var sql, inserts;
        sql = 'insert into myList(m_id, s_id, is_most) values(?,?,?)';
        inserts = [req.body.m_id, req.body.s_id, req.body.is_most];

        connection.query(sql, inserts, function(error, rows){
          console.log(req.body);

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

router.post('/find_myList', function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
      connection.query('select * from myList where m_id=?', [req.body.m_id], function(error, rows){
        if (error){
          console.log("search myList : Connection Error" + error);
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

/*
router.get('/find_member', function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
      connection.query('select * from Member where eamil = ? and kind_sns=?', [req.params.email, req.params.kind_sns], function(error, rows){
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
*/
module.exports = router;
