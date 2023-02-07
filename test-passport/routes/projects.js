const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID;

// Project model
const Project = require('../models/Project')
const User = require('../models/User');

router.post('/:projectname/:testcasename/updatetestcasetitle', (req, res) => {
    let projectname = req.params.projectname;
    let testcasename = req.params.testcasename;
    console.log(req.body.title);
    let newTestCaseName = req.body.title;

    //Check if the newTestCaseName is empty
    if (!newTestCaseName) {
        req.flash('error_msg', "New name cannot be empty");
        res.redirect('/project/' + projectname + '/' + testcasename);
        return;
    }
    
    console.log(`Updating name of test case "${testcasename}" in project "${projectname}" to "${newTestCaseName}"`);
    
    Project.findOne({projectname: projectname})
    .then(project => {
      if (project) {
        var testcase = project.testcases.find(obj => {
          return obj.name === testcasename
        });
    
        if (testcase) {
          Project.update(
            {_id: project._id, "testcases._id": testcase._id},
            {$set: {"testcases.$.name": newTestCaseName}}
          )
            .then(project => {
              req.flash('success_msg', "Test name updated");
              res.redirect('/project/' + projectname + '/' + newTestCaseName);
            })
            .catch(error => {
              req.flash('error_msg', "Error updating test name");
              res.redirect('/project/' + projectname + '/' + testcasename);
            });
        } else {
          req.flash('error_msg', "Test case not found");
          res.redirect('/projects');
        }
      } else {
        req.flash('error_msg', "Project not found");
        res.redirect('/projects');
      }
    })
    .catch(error => {
      req.flash('error_msg', "Error finding project");
      res.redirect('/projects');
    });
});

router.post('/:projectname/:testcasename/updatedescription', (req, res) => {
    let projectname = req.params.projectname;
    let testcasename = req.params.testcasename;
    let description = req.body.description;
    
    //Check if the description is empty
    if (!description) {
        req.flash('error_msg', "Description cannot be empty");
        res.redirect('/project/' + projectname + '/' + testcasename);
        return;
    }
    // Your logic to update the description of a test case in the database
  
    console.log(`Updating description of test case "${testcasename}" in project "${projectname}" to "${description}"`);

    Project.findOne({projectname: projectname})
    .then(project => {
      if (project) {
        var testcase = project.testcases.find(obj => {
          return obj.name === testcasename
        });
  
        if (testcase) {
          Project.update(
            {_id: project._id, "testcases._id": testcase._id},
            {$set: {"testcases.$.description": req.body.description}}
          )
            .then(project => {
              req.flash('success_msg', "Test description updated");
              res.redirect('/project/' + projectname + '/' + testcasename);
            })
            .catch(error => {
              req.flash('error_msg', "Error updating test description");
              res.redirect('/project/' + projectname + '/' + testcasename);
            });
        } else {
          req.flash('error_msg', "Test case not found");
          res.redirect('/projects');
        }
      } else {
        req.flash('error_msg', "Project not found");
        res.redirect('/projects');
      }
    })
    .catch(error => {
      req.flash('error_msg', "Error finding project");
      res.redirect('/projects');
    });
});

//New Test Case Handle
router.post('/:projectname/addtestcase', (req, res) => {
    let testcasename = req.body.testcasename;
    let testcasedescription = req.body.testcasedescription;
    console.log(req.body.testcases);
    let errors = [];

    let user = req.user;
    let projectname = req.params.projectname;
    
    if (!testcasename || !testcasedescription || !projectname) {
        errors.push({msg: 'Please fill in all fields'});
    }
    
    Project.find({}).exec(function(err, projects) {
    
    if (errors.length > 0) {
        req.flash('error_msg', "Please fill in all fields");
        res.redirect('/project/' + encodeURIComponent(projectname));
    } else {
        Project.find({}).exec(function(err, projects) {
        Project.findOne({projectname: projectname})
            .then(project => {
                if (project) {
                    let duplicate = false;
                    project.testcases.forEach(testcase => {
                        if (testcase.name === testcasename) {
                            duplicate = true;
                        }
                    });
                    if (duplicate) {
                        req.flash('error_msg', "Test case with the same name already exists");
                        res.redirect('/project/' + projectname);
                    } else {
                        Project.update(
                            { _id: project._id },
                            { $push: 
                                { testcases: 
                                    {
                                        name: testcasename,
                                        description: testcasedescription
                                    } 
                                }
                            })
                        .then(project => {
                            req.flash('success_msg', "Test case added successfully");
                            res.redirect('/project/' + projectname);
                        })
                    }
                } else {
                    req.flash('error_msg', "Something went wrong, test case was not added");
                    res.render('/project/' + projectname, {
                        errors,
                        projects,
                        name: user.name
                    });
                }
            })
        });
    }
});
});

router.post('/:projectname/:testcasename/updateteststep', (req, res) => {
    let projectId = req.body.projectId;
    let testcaseId = req.body.testcaseId;
    let stepId = req.body.stepId;
    
    let errors = [];

    if (!stepId) {
        errors.push({msg: 'Please fill in all fields'});
    }

    if (errors.length > 0) {
        Project.find({}).exec((err, projects) => {
            res.render('dashboard', {
                errors,
                projects,
                name: req.user.name
            });
        });
    } else {
        Project.findOneAndUpdate({
            "_id": ObjectId(projectId),
            "testcases._id": ObjectId(testcaseId),
            "testcases.teststeps._id": ObjectId(stepId)
        },
        {
            $set: {
                "testcases.$[testcase].teststeps.$[teststep].stepmethod": req.body.updatedStepMethodField,
                "testcases.$[testcase].teststeps.$[teststep].stepexpected": req.body.updatedStepExpectedResultsField,
                "testcases.$[testcase].teststeps.$[teststep].stepactual": req.body.updatedStepActualResultsField
            }
        },
        {
            "multi": false,
            "upsert": false,
            "useFindAndModify": true,
            arrayFilters: [
                {
                    "testcase._id": {
                        "$eq": ObjectId(testcaseId)
                    }
                },
                {
                    "teststep._id": {
                        "$eq": ObjectId(stepId)
                    }
                }
            ]
        })
        .then(() => {
            req.flash('success_msg', "Step updated");
            res.redirect('/project/' + req.params.projectname + '/' + req.params.testcasename);
        })
        .catch(err => {
            req.flash('error_msg', "Something went wrong, step was not updated");
            console.log(err);
            Project.find({}).exec((err, projects) => {
                res.render('dashboard', {
                    errors: [{ msg: "Something went wrong, step was not updated" }],
                    projects,
                    name: req.user.name
                });
            });
        });
    }
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
router.post('/addproject', (req, res) => {
    let projectname = req.body.projectname;
    let projectshorthand = req.body.projectshorthand;
    let projects = req.body.projects;
    let user = req.user;
    let name = user.name;

    let errors = [];

    if (!projectname || !projectshorthand) {
        errors.push({msg: 'Please fill in all fields'});
    }

    if (!projects) {
        Project.find({}).exec(function(err, projectlist) {
            let projects = projectlist;
        });
    }

    Project.find({}).exec(function(err, projectlist) {
        projects = projectlist;
        if (errors.length > 0) {
            console.log(errors);
            res.render('dashboard', {
                errors,
                name,
                user,
                projectname,
                projectshorthand,
                projects
            });
        } else {
            Project.findOne({projectname: { $regex: new RegExp("^" + projectname + "$", "i") }})
                .then(project => {
                    if (project) {
                        //Project exists
                        req.flash('error_msg', "Project already exists under that name")
                        res.redirect('../dashboard');
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
});


module.exports = router;