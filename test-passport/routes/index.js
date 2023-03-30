const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

const Project = require('../models/Project');
const Requirements = require('../models/Requirements');

router.get('/project/:projectname', ensureAuthenticated, (req, res) => {
	Requirements.find({}).exec(function(err, requirements) {
	Project.find({}).exec(function(err, projects) {
		Project.findOne({projectname: req.params.projectname})
			.then(project => {
				if (project) {
					res.render('project', {
						req: req,
						name: req.user.name,
						project: project,
						testcases: project.testcases,
						teststeps: project.testcases.teststeps,
						projects: projects,
						requirements: requirements
					})
				} else {
					//TODO: Proper validation when a project is not found
					// this shouldn't ever happen but eh, worth doing
					console.log("Error: project not found error");
					console.log(req.projectName);
					console.log(req.params);
				}
			});
	});
});
});

router.get('/requirements/:requirementname', ensureAuthenticated, (req, res) => {
	Project.find({}).exec(function(err, projects) {
	Requirements.find({}).exec(function(err, requirements) {
		Requirements.findOne({requirementname: req.params.requirementname})
			.then(requirement => {
				if (requirement) {
					res.render('requirement', {
						req: req,
						name: req.user.name,
						requirement: requirement,
						requirementid: requirement.requirementid,
						requirements: requirements,
						projects: projects
					})
				} else {
					//TODO: Proper validation when a project is not found
					// this shouldn't ever happen but eh, worth doing
					console.log("Error: could not load " + requirementname);
					console.log(req.requirementname);
					console.log(req.params);
				}
			});
	});
});
});

router.get('/project/:projectname/:testcasename', ensureAuthenticated, (req, res) => {
	Requirements.find({}).exec(function(err, requirements){
	Project.find({}).exec(function(err, projects) {
		Project.findOne({projectname: req.params.projectname})
			.then(project => {
				if (project) {
					var testcase = project.testcases.find(obj => {
						return obj.name === req.params.testcasename
					});
					//console.log(testcase);
					res.render('testcase', {
						req: req,
						name: req.user.name,
						project: project,
						testcase,
						testcases: project.testcases,
						testcasename: req.params.testcasename,
						projectname: project.projectname,
						teststeps: project.testcases.teststeps,
						projects: projects,
						requirements: requirements,
					})
				} else {
					//TODO: Proper validation when a project is not found
					// this shouldn't ever happen but eh, worth doing
					console.log("Error: project not found error");
					console.log(req.projectName);
					console.log(req.params);
				}
			});
	});
});
});

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
	Requirements.find({}).exec(function(err, requirements){
		Project.find({}).exec(function(err, projects) {
			if (err) throw err;
			res.render('dashboard', {
				name: req.user.name,
				projects: projects,
				requirements: requirements,
				req: req
			});
		});
	})
);


router.get('/', function(req, res) {
	res.redirect('/users/login');
});

module.exports = router;