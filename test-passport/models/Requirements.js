const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    requirementname: {
      type: String,
      required: true  
    },
    documentreference: {
        type: String, 
        required: false
    },
    testcaselinks: [
		{
			testcaseid: {
				type: String,	
				required: true
			},
			testcasename: {
				type: String,
				required: true
			}
		}
	],
});

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;