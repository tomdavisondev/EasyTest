const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
	projectname: {
		type: String,
		required: true
	},
	projectshorthand: {
		type: String,
		required: false
	},
	testcases: [
		{
			name: {
				type: String,	
				required: true
			},
			description: {
				type: String,
				required: true
			},
			linkedrequirements: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Requirements'
				},
			],
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