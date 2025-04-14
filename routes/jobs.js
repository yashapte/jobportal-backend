var express = require('express');
var router = express.Router();
var Job = require('../Modules/jobs')


router.get('/admin/alljobs', async function(req,res){
    const alljobs = await Job.find().exec()
    res.json({msg:"this is all jobs",alljobs})
})

router.post('/admin/createjob',function(req,res){
    const {jobname,jd} = req.body
    const newjob = new Job({
        jobname,jd
    })
    Job.create(newjob)
    .then(function(createdjob){
        res.status(200).json({msg:"new job",createdjob})
    })
})

router.post('/admin/deletejob/:_id', async function(req,res){
    const deletejob = await Job.findByIdAndDelete(req.params._id).exec()
    res.json({msg:"this is deleted job",deletejob})
})
module.exports = router;