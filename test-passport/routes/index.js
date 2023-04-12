const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

const NodeCache = require( "node-cache" );
const cache = new NodeCache();

const Project = require('../models/Project');
const Requirements = require('../models/Requirements');

Requirements.watch().on('change', async () => {
	console.log('Requirement collection has changed, invalidating cache...');
	await cache.del('requirements');
	requirements = await Requirements.find({}).exec();
	console.log(requirements);
	await cache.set("requirements", requirements);
  });

Project.watch().on('change', async () => {
	console.log('Projects collection has changed, invalidating cache...');
	await cache.del('projects');
	projects = await Project.find({}).exec();
	console.log(projects);
	await cache.set("projects", projects);
  });

router.get('/project/:projectname', ensureAuthenticated, async (req, res) => {
	try {
		let requirements = await cache.get("requirements");
		let projects = await cache.get("projects");

		if (requirements == undefined) {
			requirements = await Requirements.find({}).exec();
			await cache.set("requirements", requirements);
		}

		if (projects == undefined) {
			projects = await Project.find({}).exec();
			await cache.set("projects", projects);
		}

		let project = await cache.get(`projects-${req.params.projectname}`);
		if (!project) {
			console.log("no project found");
			project = await Project.findOne({ projectname: req.params.projectname }).populate('project.testcases').exec();
			if (project) {
				await cache.set(`project-${req.params.projectname}`, project);
			}
		}
		else {
			console.log("Project found! " + project);
		}

		if (project) {
			console.log("Testcases: " + "\n" + project.testcases);
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
	} catch (error) {
		console.log(error);
	}
});

router.get('/requirements/:requirementname', ensureAuthenticated, async (req, res) => {
	try {
	const projects = await cache.get("projects");
	const requirements = await cache.get("requirements");
	
	if (!requirements) {
		const requirements = await Requirements.find({}).exec();
		await cache.set("requirements", requirements);
	}

	if (!projects) {
		const projects = await Project.find({}).exec();
		await cache.set("projects", projects);
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
		console.log("Error: could not load " + req.params.requirementname);
	}
	} catch (error) {
		console.log(error);
	}
});


router.get('/project/:projectname/:testcasename', ensureAuthenticated, async (req, res) => {
	try {
	const requirements = await cache.get("requirements");
	const projects = await cache.get("projects");

	if (!requirements) {
		const requirements = await Requirements.find({}).exec();
		await cache.set("requirements", requirements);
	}

	if (!projects) {
		const projects = await Project.find({}).exec();
		await cache.set("projects", projects);
	}

	
	let project = await cache.get(`projects-${req.params.projectname}`);
	if (!project) {
		project = await Project.findOne({ projectname: req.params.projectname }).populate('project.testcases.linkedrequirements').exec();
		if (project) {
			await cache.set(`project-${req.params.projectname}`, project);
		}
	}

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
		let requirements = await cache.get("requirements");
		let projects = await cache.get("projects");

		if (requirements == undefined) {
			requirements = await Requirements.find({}).exec();
			await cache.set("requirements", requirements);
		}

		if (projects == undefined) {
			projects = await Project.find({}).exec();
			await cache.set("projects", projects);
		}

		res.render('dashboard', {
			name: req.user.name,
			projects: projects,
			requirements: requirements,
			req: req
		});
	} catch (error) {
		console.log(error);
	}
});

router.get('/', function(req, res) {
	res.redirect('/users/login');
});

module.exports = router;