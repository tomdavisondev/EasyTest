const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
	projectname: {
		type: String,
		required: true
	},
	testcases: [
		{
			name: {
				type: String,	
				required: true
			},
			teststeps: [ 
				{
					stepnumber: {
					type: Number,
					},
					stepmethod: {
						type: String,
					},
					stepexpected: {
						type: String,
					},
					stepactual: {
						type: String,
					},
				}
			],
		}
	],
});

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;