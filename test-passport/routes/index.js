const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

const Project = require('../models/Project');
const Requirements = require('../models/Requirements');
const ProjectCache = require('../config/projectcache');

const projectCache = new ProjectCache();

//Temp
const NodeCache = require("node-cache");
const cache = new NodeCache();

Requirements.watch().on('change', async () => {
	console.log('Requirement collection has changed, invalidating cache...');
	await cache.del('requirements');
	requirements = await Requirements.find({}).exec();
	await cache.set("requirements", requirements);
  });

router.get('/project/:projectname', ensureAuthenticated, async (req, res) => {
	try {
		let requirements = await cache.get("requirements");
		//let projects = await cache.get("projects");
		let projects = await projectCache.getProjectList();

		if (requirements == undefined) {
			requirements = await Requirements.find({}).exec();
			await cache.set("requirements", requirements);
		}

		let project = await projectCache.getProjectByName(req.params.projectname);

		stat = getStatNumber(project);

		if (project) {
			res.render('project', {
				req: req,
				name: req.user.name,
				project: project,
				testcases: project.testcases,
				teststeps: project.testcases.teststeps,
				projects: projects,
				stat,
				requirements: requirements
			})
		} else {
			//TODO: Proper validation when a project is not found
			// this shouldn't ever happen but eh, worth doing
			console.log("Error: project not found error");
			console.log(req.projectName);
			console.log(req.params);
		}
	} catch (error) {
		console.log(error);
	}
});

router.get('/requirements/:requirementname', ensureAuthenticated, async (req, res) => {
	try {
	let projects = await projectCache.getProjectList();
	let requirements = await cache.get("requirements");
	
	if (requirements == undefined) {
		requirements = await Requirements.find({}).exec();
		await cache.set("requirements", requirements);
	}
	const requirement = await Requirements.findOne({requirementname: req.params.requirementname});

	if (requirement) {
		res.render('requirement', {
			req: req,
			name: req.user.name,
			requirement: requirement,
			requirementid: requirement.requirementid,
			requirements: requirements,
			projects: projects
		});
	} else {
		//TODO: Proper validation when a requirement is not found
		// this shouldn't ever happen but worth doing
		console.log("Error: could not load requirementname" + req.params.requirementname);
	}
	} catch (error) {
		console.log(error);
	}
});

router.get('/project/:projectname/:testcasename/edit', ensureAuthenticated, async (req, res) => {
	try {
		const requirements = await cache.get("requirements");
		let projects = await projectCache.getProjectList();

		if (!requirements) {
			const requirements = await Requirements.find({}).exec();
			await cache.set("requirements", requirements);
		}

		let project = await projectCache.getProjectByName(req.params.projectname);

		if (project && projects) {
			const testcase = project.testcases.find(obj => {
				return obj.name === req.params.testcasename;
			});

			res.render('editmode', {
				req: req,
				name: req.user.name,
				project: project,
				testcase,
				testcases: project.testcases,
				testcasename: req.params.testcasename,
				projectname: project.projectname,
				teststeps: testcase.teststeps,
				projects: projects,
				requirements: requirements,
			});
		} else {
			//TODO: Proper validation when a project is not found
			// this shouldn't ever happen but worth doing
			console.log("Error: project not found error");
			console.log(req.params);
		}
	} catch (error) {
		console.log(error);
	}
});


router.get('/project/:projectname/:testcasename', ensureAuthenticated, async (req, res) => {
	try {
		const requirements = await cache.get("requirements");
		let projects = await projectCache.getProjectList();

		if (!requirements) {
			const requirements = await Requirements.find({}).exec();
			await cache.set("requirements", requirements);
		}

		let project = await projectCache.getProjectByName(req.params.projectname);

		console.log("Project " + project);
		console.log("testcases " + project.testcases);

		if (project) {
		  const testcase = project.testcases.find(obj => {
			return obj.name === req.params.testcasename;
		  });

			res.render('testcase', {
				req: req,
				name: req.user.name,
				project: project,
				testcase,
				testcases: project.testcases,
				testcasename: req.params.testcasename,
				projectname: project.projectname,
				teststeps: testcase.teststeps,
				projects: projects,
				requirements: requirements,
			});
		} else {
			//TODO: Proper validation when a project is not found
			// this shouldn't ever happen but worth doing
			console.log("Error: project not found error");
			console.log(req.params);
		}
	} catch (error) {
		console.log(error);
	}
});

router.get('/dashboard', ensureAuthenticated, async (req, res) => {
	try {
		const selectedTarget = req.query.selectedTarget || 'projects';
		let requirements = await cache.get("requirements");
		let projects = await projectCache.getProjectList();

		if (requirements == undefined) {
			requirements = await Requirements.find({}).exec();
			await cache.set("requirements", requirements);
		}

		res.render('dashboard', {
			getColor,
			name: req.user.name,
			projects: projects,
			requirements: requirements,
			selectedTarget,
			req: req
		});
	} catch (error) {
		console.log(error);
	}
});

router.get('/', function(req, res) {
	res.redirect('/users/login');
});

// Define the getColor function for cards
function getColor(value) {
	// value from 0 to 1
	var hue = ((1 - value) * 120).toString(10);
	return ["hsl(", hue, ",50%,50%)"].join("");
  }

function getStatNumber(project) {
	
	const uniqueLinkedRequirements = new Set();
	let totalLinkedRequirements = 0;
	
	project.testcases.forEach(testcase => {
	  testcase.linkedrequirements.forEach(requirement => {
		uniqueLinkedRequirements.add(requirement.id);
		totalLinkedRequirements++;
	  });
	});
	
	const numUniqueLinkedRequirements = uniqueLinkedRequirements.size;
	
	return totalLinkedRequirements / numUniqueLinkedRequirements;
  }

module.exports = router;