const mongoose = require('mongoose');

const RequirementsSchema = new mongoose.Schema({
  requirementname: {
    type: String,
    required: true  
  },
  requirementid: {
    type: String, 
    required: false
  },
  linkedprojects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }
  ],
  requirementImage: {
		data: Buffer,
		contentType: String 
	  },
  description: {
    type: String,
    required: false
  },
  documentLink: {
    type: String,
    required: false
  }
});


const Requirement = mongoose.model('Requirement', RequirementsSchema);

module.exports = Requirement;