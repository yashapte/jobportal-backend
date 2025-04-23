var express = require('express');
var router = express.Router();
var Job = require('../Modules/jobs')
var User = require('../Modules/user')
const jwt = require('jsonwebtoken');
const authenticateToken = require('../Middleware/auth.js');
var { changepassword } = require('../Modules/changepasswords')
const bcrypt = require('bcryptjs');



router.post('/register/rc', async function (req, res) {

    console.log("Admin register route");
    console.log(req.body)
    var { name, email, password, isAdmin } = req.body;

    const founduser = await User.findOne({ email: req.body.email }).exec();

    if (founduser) {
        res.json({ "msg": "Admin already registered with the mail" });
    } else {
        var newuser = new User({

            isAdmin: "true",
            name,
            email,
            password: changepassword(password)
        });
        newuser.save();
        res.status(200).json(newuser);
    }

})

router.post('/login/rc', async function (req, res) {
    try {

        const { email, password } = req.body
        console.log("Login attempt:", email, password)
        const founduser = await User.findOne({ email: req.body.email }).exec();
        console.log("first", founduser)
        if (!founduser) {
            return res.json({ "msg": "Invalid email user not found" })
        }

        const ismatched = await bcrypt.compare(password, founduser.password)
        if (!ismatched) {
            return res.status(400).json({ msg: "Invalid email user not found" });
        } else {

            const token = jwt.sign({ email: founduser.email }, 'webtoken', { expiresIn: "1d" })
            res.cookie('Token', token, {
                httpOnly: true,
                sameSite: 'Lax',
                secure: false
            })
            console.log("this is login router")
            res.status(200).json({ msg: "Login successful" });
        }
    } catch (error) {
        return res.json(error.msg)
        return res.status(500).json({ msg: "Internal server error" });
    }
})

router.post('/profile/rc', authenticateToken, async function (req, res) {
    const loggedinuser = await User.findOne({ email: req.user.email }).exec()
    console.log(loggedinuser);
    return res.status(200).json({ msg: "logged in user", loggedinuser })
})



router.get('/alljobs', async function (req, res) {
    const alljobs = await Job.find().exec()
    res.json({ msg: "this is all jobs", alljobs })
})

router.post('/createjob', async function (req, res) {
    try {
        const { jobname, jd } = req.body;
    
        if (!jobname || !jd) {
          return res.status(400).json({ msg: 'Job name and description are required' });
        }
    
        const newJob = new Job({
          jobname,
          jd,
        });
    
        await newJob.save();
    
        return res.status(201).json({ msg: 'Job created successfully', job: newJob });
      } catch (error) {
        console.error('Error creating job:', error);
        return res.status(500).json({ msg: 'Server error' });
      }
})


router.put('/updatejob/:id', async (req, res) => {
    const { id } = req.params;
    const { jobname, jd } = req.body;
  
    try {
      const updatedJob = await Job.findByIdAndUpdate(
        id,
        { name: jobname, jd },
        { new: true }
      );
  
      if (!updatedJob) {
        return res.status(404).json({ error: 'Job not found' });
      }
  
      res.status(200).json({ message: 'Job updated successfully', job: updatedJob });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error while updating job' });
    }
  });


router.delete('/job/delete/:id', authenticateToken, async (req, res) => {
    try {
      const jobId = req.params.id;
  
      const deletedJob = await Job.findByIdAndDelete(jobId);
  
      if (!deletedJob) {
        return res.status(404).json({ msg: 'Job not found' });
      }
  
      res.json({ msg: 'Job deleted successfully' });
    } catch (error) {
      console.error('Error deleting job:', error);
      res.status(500).json({ msg: 'Server error' });
    }
  });
module.exports = router;