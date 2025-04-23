var express = require('express');
var router = express.Router();
var User = require('../Modules/user');
var Job = require('../Modules/jobs')
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
router.post('/register/user', async function(req,res){
  
  console.log("User register route");
    console.log(req.body)
    var {name,email,password} = req.body;

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
router.post('/user/login', async function (req, res) {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", email, password);

    const foundUser = await User.findOne({ email }).exec();

    if (!foundUser) {
      return res.status(400).json({ msg: "Invalid email, user not found" });
    }

    const isMatched = await bycrpt.compare(password, foundUser.password);

    if (!isMatched) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    const token = jwt.sign({ email: foundUser.email }, 'webtoken', {
      expiresIn: '1d',
    });

    res.cookie('Token', token, {
      httpOnly: true,
      sameSite: 'Lax',
      secure: false 
    });

    res.status(200).json({ msg: "Login successful" });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});



//profile
router.post('/user/profile',authenticateToken,async function(req,res){
  const loggedinuser = await User.findOne({email:req.user.email}).exec()
  console.log(loggedinuser);
  return res.status(200).json({msg:"logged in user",loggedinuser})
})


//logout
router.post('/logout',function(req,res){
  try {
    res.clearCookie("Token", {
      httpOnly: true,
      sameSite: 'Lax',
      secure: false,
    });
    console.log("user logged out");
    return res.status(200).json({ msg: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Logout failed" });
  }
})


router.post('/user/apply/:jobid', async (req, res) => {
  
  console.log(req.params.jobid)
  console.log(req.body.userId)

  const { jobid } = req.params;
  const { userId } = req.body;

  try {
    const currentjob = await Job.findById(jobid);
    if (!currentjob) return res.status(404).json({ message: 'Job not found' });

    if (currentjob.applicants.includes(userId)) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    currentjob.applicants.push(userId);
    await currentjob.save();

    return res.status(200).json({ message: 'Application successful', currentjob });
  } catch (err) {
    console.error('Error applying to job:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


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
