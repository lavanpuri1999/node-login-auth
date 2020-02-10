const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');
const ObjectID = require('mongodb');
const bcrypt = require('bcryptjs');
const mongoose=require('mongoose');
const jwt = require('jsonwebtoken');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/LoginSystem',{useMongoClient:true},(err,res)=>{
  if(err)
    console.log("error connecting to mongodb");
  else
    console.log("connected to mongodb");
});


var cors = require('cors');
var {User} = require('../models/user');
var {Notes} = require('../models/notes');
var middleware = require('../middleware/auth.js');
var app = express();

app.use(bodyParser.json());

app.use(function(req,res,next){
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Headers","Origin,X-Requested-With,Content-Type,Accept");
  next();
});
app.use(cors());


app.post('/signup',(req,res) => {
   User.find({email: req.body.email}).then(user => {if(user.length >= 1){
     return res.status(409).json({
       message : "mail exists"
     });
   }
   else{
     bcrypt.hash(req.body.password,10,(err,hash) => {
       if(err){
         return res.status(500).json({
           error : err
         });
       } else {
         const user = new User({
           _id: new mongoose.Types.ObjectId(),
           email: req.body.email,
           password: hash
         });
         user.save().then(result => {
           console.log(result);
           res.status(201).json({
           message: "User Created"
         });
       })
       .catch(e => {
         console.log(e);
         res.status(500).json({
           error : e
         });
       });
       }
     });
   }
   });
});

app.post('/login',(req,res) => {
    User.find({ email: req.body.email }).then(user => {
      if(user.length < 1)
      {
        return res.status(401).json({
          message : "Auth failed"
        });
      }
      bcrypt.compare(req.body.password,user[0].password,(err,result) => {
        if(err)
        {
          return res.status(401).json({
            message : "Auth failed"
          });
        }
        if(result)
        {
          const token = jwt.sign(
            {
            id : user[0]._id
            },
            'secretabc!123'
          );
          return res.status(200).json({
            message: "Auth successful",
            token: token
          })
        }
        res.status(401).json({
          message : "Auth failed",
        });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error : err
      });
    });
});

app.post('/notecreate',middleware,(req,res) =>{
    var note = new Notes({
      text : req.body.text,
    _creator : req.user._id,
    });
    note.save().then((doc) => res.status(200).json({
      notesaved : doc
    })
  ).catch(e => {
    res.status(500).json({
      error : e
    });
  })
});

app.get('/viewnotes',middleware,(req,res) => {
    Notes.find({_creator : req.user._id}).then(note => {
      return res.status(200).json({
        notes : note,
      });
    }).catch(e => {
      return res.status(404).json({
        message : e,
      })
    })
})

app.listen(3000, () => {
  console.log(`Started up at port 3000`);
});
