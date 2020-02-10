const jwt = require('jsonwebtoken');
var {User} = require('../models/user');

module.exports = (req,res,next) => {
  var token = req.header('Authorization');
  try{
  var decoded = jwt.verify(token,'secretabc!123');
  User.find({_id: decoded.id}).then((user) => {
    if(user.length >= 1)
    {req.user = user[0];
      console.log(req.user);
      next();
    }
    else {
      return res.status(401).json({
        message : "invalid user"
      })
    }
  }).catch(e => {
    console.log(e);
    return res.status(401).json({
      message : "auth unsuccessful"
    })
  });
}
catch(e){
  return res.status(401).json({
    message: 'auth unsuccessful'
  });
}
}
