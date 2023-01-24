const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Project model
const Project = require('../models/Project')
const User = require('../models/User');

//New Test Case Handle
router.post('/:projectname/addtestcase', (req, res) => {
    console.log('Running test case');
    const {testcasename} = req.body;
    let errors = [];

    let user = req.user;
	let projectname = req.params.projectname;

    if (!projectname) {
        errors.push({msg: 'Please fill in all fields'});
    }

    Project.find({}).exec(function(err, projects) {

    if (errors.length > 0) {
        res.render('dashboard', {
            errors,
            projectname,
            projects,
            testcases,
            name: user.name,
        });
    } else {
        Project.find({}).exec(function(err, projects) {
        Project.findOne({projectname: projectname})
            .then(project => {
                if (project) {
                    Project.update(
                        { _id: project._id },
                        { $push: 
                            { testcases: 
                                {
                                    name: testcasename
                                } 
                            }
                        })
                    .then(project => {
                        req.flash('error_msg', "Case added")
                        res.redirect('/project/' + projectname);
                    })
                } else {
                    req.flash('error_msg', "Something went wrong, test case was not added");
                    res.render('dashboard', {
                        errors,
                        projects,
                        testcases,
                        name: user.name
                    });
                }
            })
        });
    }
});
});

//New Test Case Step Handle
router.post('/:projectname/:testcasename/addteststep', (req, res) => {
    console.log('Debug Log: Adding test step');
    let errors = [];
    console.log(req)

    let testcasename = req.params.testcasename;
    let user = req.user;
    let projectname = req.params.projectname;

    console.log('Debug Log: user = ' + user + " projectname = " + projectname + " testcasename = " + testcasename );

    if (!projectname) {
        errors.push({msg: 'Please fill in all fields'});
    }

    Project.find({}).exec(function(err, projects) {

    if (errors.length > 0) {
        res.render('dashboard', {
            errors,
            projectname,
            projects,
            testcases,
            name: user.name,
        });
    } else {
        Project.find({}).exec(function(err, projects) 
        {
        Project.findOne({projectname: projectname})
        .then(project => 
        {
            if (project) 
            {
                var testcase = project.testcases.find(obj => {
                    return obj.name === testcasename
                })

                    if(testcase)
                    {
                        let stepnumber = project.testcases.length + 1;
                        Project.update(
                            { _id : project._id, "testcases._id": testcase._id},
                            {$push:{"testcases.$.teststeps":{"stepnumber":stepnumber, "stepmethod":req.body.newStepMethodField, "stepexpected": req.body.newStepExpectedResultsField, "stepactual": req.body.newStepActualResultsField}}}
                        )
                    .then(project => 
                    {
                        req.flash('error_msg', "Step added")
                        res.redirect('/project/' + projectname + '/' + testcasename);
                    })
                    }
            } else 
            {
                req.flash('error_msg', "Something went wrong, test case was not added");
                res.render('dashboard', 
                {
                    errors,
                    projects,
                    testcases,
                    name: user.name
                });
            }
        })
    });
}
});
});

//New Project Handle
router.post('/register', (req, res) => {
    let projectname = req.body.projectname;
    let projectshorthand = req.body.projectshorthand;
    let projects = req.body.projects;
    let user = req.user;
    let name = user.name;

    let errors = [];

    if (!projectname) {
        errors.push({msg: 'Please fill in all fields'});
    }

    if (errors.length > 0) {
        res.render('dashboard', {
            errors,
            name,
            user,
            projectname,
            projectshorthand,
            projects
        });
    } else {
        Project.findOne({projectname: projectname})
            .then(project => {
                if (project) {
                    //Project exists
                    req.flash('error_msg', "Project already exists under that name")
                    res.render('dashboard', {
                        errors,
                        name,
                        user,
                        projectname,
                        projectshorthand,
                        projects,
                    });
                } else {
                    const newProject = new Project({
                        projectname,
                        projectshorthand,
                    });
                    newProject.save()
                        .then(project => {
                            req.flash('success_msg', "New project created");
                            res.redirect('../dashboard');
                        })
                        .catch(err => console.log(err));
                }
            })
    }
});

module.exports = router;