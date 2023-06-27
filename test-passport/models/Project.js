const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
	projectname: {
		type: String,
		required: true,
	},
	projectshorthand: {
		type: String,
		required: false,
	},
	projectImage: {
		data: Buffer,
		contentType: String,
	},
	testcases: [
		{
			name: {
				type: String,
				required: true,
			},
			description: {
				type: String,
				required: true,
			},
			testcaseImage: {
				data: Buffer,
				contentType: String,
			},
			linkedrequirements: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Requirements',
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
},	{versionKey: false});;

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;