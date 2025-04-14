var express = require('express');
var router = express.Router();
var User = require('../Modules/user');
var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bycrpt = require('bcryptjs');
const authenticateToken = require('../Middleware/auth.js');
var { changepassword } = require('../Modules/changepasswords')

/* GET home page. */

mongoose.connect('mongodb://127.0.0.1:27017/porataldb')
  .then(()=> console.log("Connected"))
  .catch(()=> console.log("Not connected"))


router.post('/', function(req, res, next) {
  res.send({"mesage":"this is / page"})
});


//user register
router.post('/register', async function(req,res){
  
  console.log(req.body)
  var {name,email,password}=req.body;
  

  const founduser = await User.findOne({email:req.body.email}).exec();

  if(founduser){
    res.json({"msg":"User already registered with the mail"});
  }  else{
  var newuser = new User({
    name,
    email,
    password:changepassword(password)
  });
  newuser.save();
  res.status(200).json(newuser);
  }
})


//user login
router.post('/login',async function(req,res){
  try {
    
  const { email, password } = req.body
   const founduser = await User.findOne({email:req.body.email}).exec();
  if(!founduser){
    res.json({"msg":"Invalid email user not found"})
  }else{

  const ismatched = await bycrpt.compare(password,founduser.password)
  if(!ismatched){
    res.json({"msg":"Invalid password"})
  }else{
  const token = jwt.sign({email:founduser.email},'webtoken',{expiresIn: "1d"})

  res.cookie("Token",token,{
    httpOnly:"true"
  })
  console.log("this is login router")
  }
  
  return res.json({ msg: "Login successful"});
  console.log(email,password) 
}
} catch (error) {
  return res.json(error.msg)
}
})


//profile
router.post('/profile',authenticateToken, async function(req,res){
  const loggedinuser = await User.findOne({email:req.user.email}).exec()
  console.log(loggedinuser);
  res.status(200).json({msg:"logged in user",loggedinuser})
})


//logout
router.post('/logout',function(req,res){
  try {
    res.clearCookie("Token");
    console.log("user logged out")
    res.redirect('/');

} catch (error) {
    console.log(err);
    res.send(err);
}
})

router.post('/allusers',function(req,res){
  User.find()
  .then(function(allusers){
    res.send(allusers)
  })
  .catch(function(err){
    res.send(err.message)
  })
})

router.post('/apply/:currentuserid',function(req,res){
  
})

module.exports = router;
