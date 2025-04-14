var mongoose = require('mongoose');

var jobModel = mongoose.Schema({
   jobname:{
    type: String,
    required:[true,"Job Name se required"]
   },
   jd:{
    type: String,
    required:[true,"jd se required"]
   },
   isActive:{
    type:Boolean,
    default: true
   },
   applicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:'User'
  }]
})

module.exports = mongoose.model('Job',jobModel);